import { useState, useRef, useEffect, useCallback } from 'react';
import { type HandTrackingOptions, type MediaPipeResults } from '../types/tracking';
import { loadScripts } from '../utils/loadScripts';
import { clamp } from '../utils/mathUtils';

const useHandTracking = (options: HandTrackingOptions) => {
    const {
        mirror = true,
        showPreview = true,
        top = 0.05,
        bottom = 0.95,
        minSpan = 0.08,
        onHandUpdate,
        onStatusChange,
        onFpsUpdate
    } = options;

    const videoRef = useRef<HTMLVideoElement>(null);
    const debugRef = useRef<HTMLCanvasElement>(null);
    const [handSeen, setHandSeen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const lastYNormRef = useRef(0.5);

    // Map normalized Y coordinate to game coordinate
    const mapY = useCallback((yNorm: number) => {
        const span = Math.max(minSpan, bottom - top);
        return clamp((yNorm - top) / span, 0, 1);
    }, [top, bottom, minSpan]);

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
            const hands = new window.Hands({
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
                    onHandUpdate(yNorm, true);
                    setHandSeen(true);
                } else {
                    setHandSeen(false);
                    onHandUpdate(lastYNormRef.current, false);
                }
            });

            // Start camera
            const camera = new window.Camera(videoRef.current!, {
                onFrame: async () => {
                    await hands.send({ image: videoRef.current! });
                },
                width: 640,
                height: 480
            });

            await camera.start();
            onStatusChange('Camera running');
            setIsRunning(true);
        } catch (e: unknown) {
            console.error(e);
            onStatusChange(`Camera blocked — ${e instanceof Error ? e.name : 'Error'}`);
            throw e;
        }
    }, [isRunning, onHandUpdate, onStatusChange, onFpsUpdate, top, bottom, mapY]);

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

        if (showPreview && results.image) {
            // Draw camera feed
            dctx.drawImage(results.image, 0, 0, dbg.width, dbg.height);

            // Draw control band
            const tpx = top * dbg.height;
            const bpx = bottom * dbg.height;

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
        if (lms && lms.length > 0 && showPreview) {
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
    }, [showPreview, top, bottom]);

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
        lastYNormRef
    };
};


export default useHandTracking;
