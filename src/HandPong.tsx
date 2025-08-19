import { useEffect, useMemo, useRef, useState } from 'react';

import GameCanvas from './components/GameCanvas';
import HandTracker from './components/HandTracker';
import ControlPanel from './components/ControlPanel';
import Toolbar from './components/Toolbar';
import useGameLogic from './hooks/useGameLogic';
import useKeyboardControls from './hooks/useKeyboardControls';
import useMouseControls from './hooks/useMouseControls';

import { GAME_HEIGHT } from './constants/gameConfig';
import { clamp } from './utils/mathUtils';

const HandPong = () => {
    // Game and UI state
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [mouseMode, setMouseMode] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [mirror, setMirror] = useState(true);
    const [alpha, setAlpha] = useState(0.65);
    const [sensitivity, setSensitivity] = useState(1.0);
    const [handsFPS, setHandsFPS] = useState(0);
    const [handSeen, setHandSeen] = useState(false);
    const [cameraRunning, setCameraRunning] = useState(false);

    // Canvas ref
    const canvasRef = useRef<HTMLCanvasElement>(null!) as React.RefObject<HTMLCanvasElement>;

    // Tracking control settings - define these early
    const ctrl = useMemo(() => ({ top: 0.05, bottom: 0.95, minSpan: 0.08 }), []);
    const [top, setTop] = useState(ctrl.top);
    const [bottom, setBottom] = useState(ctrl.bottom);
    const lastYNormRef = useRef(0.5);

    // Game logic hook
    const { gameState, update, updateTargetY, resetGame } = useGameLogic({
        smoothing: alpha,
        sensitivity
    });

    // Map normalized Y coordinate to game coordinate
    const mapY = (yNorm: number) => {
        const span = Math.max(ctrl.minSpan, bottom - top);
        return clamp((yNorm - top) / span, 0, 1);
    };

    // Handle hand position updates
    const handleHandUpdate = (yNorm: number, seen: boolean) => {
        lastYNormRef.current = yNorm;
        const gameY = mapY(yNorm) * GAME_HEIGHT;
        updateTargetY(gameY);
        setHandSeen(seen);
    };

    // Now we can use the tracking hook with the defined handlers
    type StartCameraFn = () => Promise<void>;
    type StopCameraFn = () => void;
    const startCameraRef = useRef<StartCameraFn | null>(null);
    const stopCameraRef = useRef<StopCameraFn | null>(null);

    // Safely set top limit
    const setTopSafe = (v: number) => {
        let t = clamp(v, 0, 0.98);
        if (bottom - t < ctrl.minSpan) t = bottom - ctrl.minSpan;
        setTop(clamp(t, 0, 1));
    };

    // Safely set bottom limit
    const setBottomSafe = (v: number) => {
        let b = clamp(v, 0.02, 1);
        if (b - top < ctrl.minSpan) b = top + ctrl.minSpan;
        setBottom(clamp(b, 0, 1));
    };

    // Camera initialization with error handling
    const handleStartCamera = async () => {
        try {
            if (startCameraRef.current) {
                await startCameraRef.current();
                setCameraRunning(true);
                setMouseMode(false);
            } else {
                throw new Error("Camera not initialized");
            }
        } catch (e) {
            console.error("Camera error:", e);
            setMouseMode(true);
        }
    };

    const handleStopCamera = () => {
        if (stopCameraRef.current) {
            stopCameraRef.current();
        }
        setCameraRunning(false);
        setMouseMode(true);
    };

    // Game update loop
    useEffect(() => {
        let lastTime = performance.now();

        const gameLoop = () => {
            const now = performance.now();
            const dt = Math.min(0.033, (now - lastTime) / 1000);
            lastTime = now;

            update(dt, running);

            rafId = requestAnimationFrame(gameLoop);
        };

        let rafId = requestAnimationFrame(gameLoop);

        return () => cancelAnimationFrame(rafId);
    }, [update, running]);

    // Keyboard controls
    useKeyboardControls((deltaY: number) => {
        const g = gameState.current;
        g.lY = clamp(g.lY + deltaY, 55, GAME_HEIGHT - 55);
        g.targetLY = g.lY;
    });

    // Mouse controls
    useMouseControls(canvasRef as React.RefObject<HTMLCanvasElement>, (y) => {
        updateTargetY(y);
    }, mouseMode);

    return (
        <main>
            <section className="stage">
                <GameCanvas
                    gameState={gameState}
                    running={running}
                    handSeen={handSeen}
                    mouseMode={mouseMode}
                    canvasRef={canvasRef} // Pass the ref to GameCanvas
                />

                <Toolbar
                    startCamera={handleStartCamera}
                    stopCamera={handleStopCamera}
                    cameraRunning={cameraRunning}
                    mouseMode={mouseMode}
                    setMouseMode={setMouseMode}
                    running={running}
                    setRunning={setRunning}
                    resetGame={resetGame}
                    status={status}
                />
            </section>

            <ControlPanel
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                mirror={mirror}
                setMirror={setMirror}
                alpha={alpha}
                setAlpha={setAlpha}
                sensitivity={sensitivity}
                setSensitivity={setSensitivity}
                top={top}
                setTop={setTopSafe}
                bottom={bottom}
                setBottom={setBottomSafe}
                lastYNormRef={lastYNormRef}
                handSeen={handSeen}
                handsFPS={handsFPS}
            >
                <HandTracker
                    onHandUpdate={handleHandUpdate}
                    onStatusChange={setStatus}
                    onFpsUpdate={setHandsFPS}
                    mirror={mirror}
                    showPreview={showPreview}
                    top={top}
                    bottom={bottom}
                    startCameraRef={startCameraRef}
                    stopCameraRef={stopCameraRef}
                />
            </ControlPanel>
        </main>
    );
};

export default HandPong;
