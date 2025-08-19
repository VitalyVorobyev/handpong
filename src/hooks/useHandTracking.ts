import { useState, useRef, useEffect, useCallback } from 'react';
import { type HandTrackingOptions, type MediaPipeResults } from '../types/tracking';
import { loadScripts } from '../utils/loadScripts';

interface MediaPipeHands {
    setOptions: (options: Record<string, unknown>) => void;
    onResults: (cb: (results: MediaPipeResults) => void) => void;
    send: (data: { image: HTMLVideoElement }) => Promise<void>;
}

interface MediaPipeCamera {
    start: () => Promise<void>;
    stop: () => void;
}

interface MediaPipeWindow extends Window {
    Hands: new (config: { locateFile: (f: string) => string }) => MediaPipeHands;
    Camera: new (
        video: HTMLVideoElement,
        config: { onFrame: () => Promise<void>; width: number; height: number }
    ) => MediaPipeCamera;
}

const useHandTracking = (options: HandTrackingOptions) => {
    const {
        mirror = true,
        showPreview = true,
        top = 0.05,
        bottom = 0.95,
        onHandUpdate,
        onStatusChange,
        onFpsUpdate
    } = options;

    const videoRef = useRef<HTMLVideoElement>(null);
    const debugRef = useRef<HTMLCanvasElement>(null);
    const [handSeen, setHandSeen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const lastYNormRef = useRef(0.5);
    const cameraRef = useRef<MediaPipeCamera | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Keep latest control settings in refs for callbacks
    const showPreviewRef = useRef(showPreview);
    const topRef = useRef(top);
    const bottomRef = useRef(bottom);
    const onHandUpdateRef = useRef(onHandUpdate);

    useEffect(() => { showPreviewRef.current = showPreview; }, [showPreview]);
    useEffect(() => { topRef.current = top; }, [top]);
    useEffect(() => { bottomRef.current = bottom; }, [bottom]);
    useEffect(() => { onHandUpdateRef.current = onHandUpdate; }, [onHandUpdate]);

    // Draw debug visualization on canvas
    const drawDebugVisualization = useCallback((results: MediaPipeResults) => {
        const dbg = debugRef.current;
        if (!dbg) return;

        const dctx = dbg.getContext('2d')!;

        // Resize debug canvas to element size
        const rect = dbg.getBoundingClientRect();
        if (dbg.width !== rect.width) {
            dbg.width = rect.width;
            dbg.height = rect.height;
        }

        dctx.clearRect(0, 0, dbg.width, dbg.height);

        const show = showPreviewRef.current;
        const topVal = topRef.current;
        const bottomVal = bottomRef.current;

        if (show && results.image) {
            // Draw camera feed
            dctx.drawImage(results.image, 0, 0, dbg.width, dbg.height);

            // Draw control band
            const tpx = topVal * dbg.height;
            const bpx = bottomVal * dbg.height;

            dctx.save();
            dctx.fillStyle = 'rgba(255,255,255,0.08)';
            dctx.fillRect(0, 0, dbg.width, tpx);
            dctx.fillRect(0, bpx, dbg.width, dbg.height - bpx);

            dctx.strokeStyle = '#6ea8fe';
            dctx.setLineDash([6, 6]);
            dctx.beginPath();
            dctx.moveTo(0, tpx);
            dctx.lineTo(dbg.width, tpx);
            dctx.stroke();

            dctx.beginPath();
            dctx.moveTo(0, bpx);
            dctx.lineTo(dbg.width, bpx);
            dctx.stroke();
            dctx.restore();
        }

        // Draw hand landmarks if present
        const lms = results.multiHandLandmarks;
        if (lms && lms.length > 0 && show) {
            const lm = lms[0];

            // Draw hand connections
            dctx.fillStyle = '#00A0FF';
            dctx.strokeStyle = '#FFFFFF';
            dctx.lineWidth = 2;

            // Draw each landmark
            for (let i = 0; i < lm.length; i++) {
                const point = lm[i];
                const x = point.x * dbg.width;
                const y = point.y * dbg.height;

                dctx.beginPath();
                dctx.arc(x, y, 3, 0, Math.PI * 2);
                dctx.fill();
            }

            // Highlight index fingertip (landmark 8)
            const tip = lm[8];
            dctx.fillStyle = '#FF0000';
            dctx.beginPath();
            dctx.arc(tip.x * dbg.width, tip.y * dbg.height, 6, 0, Math.PI * 2);
            dctx.fill();
            dctx.stroke();
        }
    }, []);

    // Start camera and tracking
    const startCamera = useCallback(async () => {
        if (isRunning) return;

        try {
            onStatusChange('Starting camera…');

            await loadScripts([
                'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
                'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
            ]);

            if (!videoRef.current) {
                throw new Error('Video element not found');
            }

            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('getUserMedia not supported');
            }

            // Preflight prompt
            const testStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = testStream;
                await videoRef.current.play().catch(() => {});
            }

            testStream.getTracks().forEach(t => t.stop());

            // Initialize MediaPipe Hands
            const hands = new (window as MediaPipeWindow).Hands({
                locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 0,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.5
            });

            let count = 0, last = performance.now();

            hands.onResults((results: MediaPipeResults) => {
                // Update FPS counter
                count++;
                const now = performance.now();
                if (now - last > 500) {
                    onFpsUpdate(Math.round((count * 1000) / (now - last)));
                    last = now;
                    count = 0;
                }

                // Draw debug visualization
                drawDebugVisualization(results);

                // Process hand landmarks
                const lms = results.multiHandLandmarks;
                if (lms && lms.length > 0) {
                    const lm = lms[0];
                    const yNorm = lm[8].y; // Index fingertip
                    lastYNormRef.current = yNorm;

                    // Update hand position
                    onHandUpdateRef.current(yNorm, true);
                    setHandSeen(true);
                } else {
                    setHandSeen(false);
                    onHandUpdateRef.current(lastYNormRef.current, false);
                }
            });

            // Start camera
            const camera = new (window as MediaPipeWindow).Camera(videoRef.current!, {
                onFrame: async () => {
                    await hands.send({ image: videoRef.current! });
                },
                width: 640,
                height: 480
            });
            cameraRef.current = camera;

            await camera.start();
            streamRef.current = videoRef.current?.srcObject as MediaStream | null;
            onStatusChange('Camera running');
            setIsRunning(true);
        } catch (e: unknown) {
            console.error(e);
            const err = e as { name?: string };
            onStatusChange(`Camera blocked — ${err?.name || 'Error'}`);
            throw e;
        }
    }, [isRunning, onStatusChange, onFpsUpdate, drawDebugVisualization]);

    // Stop camera and tracking
    const stopCamera = useCallback(() => {
        if (!isRunning) return;

        cameraRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;

        const dbg = debugRef.current;
        if (dbg) {
            const dctx = dbg.getContext('2d');
            dctx?.clearRect(0, 0, dbg.width, dbg.height);
        }

        setIsRunning(false);
        setHandSeen(false);
        onStatusChange('Camera stopped');
    }, [isRunning, onStatusChange]);

    // Apply mirror transform when needed
    useEffect(() => {
        const val = mirror ? 'scaleX(-1)' : 'scaleX(1)';
        if (videoRef.current) videoRef.current.style.transform = val;
        if (debugRef.current) debugRef.current.style.transform = val;
    }, [mirror]);

      // Resize debug canvas on window resize
    useEffect(() => {
        const fit = () => {
            const dbg = debugRef.current;
            if (!dbg) return;
            const rect = dbg.getBoundingClientRect();
            dbg.width = rect.width;
            dbg.height = rect.height;
        };

        window.addEventListener('resize', fit);
        fit();

        return () => window.removeEventListener('resize', fit);
    }, []);

    return {
        videoRef,
        debugRef,
        handSeen,
        isRunning,
        startCamera,
        stopCamera,
        lastYNormRef
    };
};


export default useHandTracking;
