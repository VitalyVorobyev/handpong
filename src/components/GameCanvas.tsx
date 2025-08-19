import React, { useEffect } from 'react';

import { type GameState } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN } from '../constants/gameConfig';
import { type GameState } from '../types/game';

interface GameCanvasProps {
    gameState: React.RefObject<GameState>;
    running: boolean;
    handSeen: boolean;
    mouseMode: boolean;
    canvasRef: React.RefObject<HTMLCanvasElement>;
};

const GameCanvas = ({ gameState, running, handSeen, mouseMode, canvasRef }: GameCanvasProps) => {

    // Game rendering loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d')!;

        const render = () => {
            const g = gameState.current;

            // Clear canvas
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Draw center line
            ctx.save();
            ctx.setLineDash([10, 14]);
            ctx.strokeStyle = '#2a3056';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(GAME_WIDTH / 2, 20);
            ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 20);
            ctx.stroke();
            ctx.restore();

            // Draw scores
            ctx.fillStyle = '#6ea8fe';
            ctx.font = 'bold 48px ui-sans-serif, system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(String(g.scoreL), GAME_WIDTH * 0.25, 64);
            ctx.fillText(String(g.scoreR), GAME_WIDTH * 0.75, 64);

            // Draw elements
            ctx.fillStyle = '#e8ecff';

            // Left paddle
            ctx.fillRect(
                PADDLE_MARGIN,
                Math.round(g.lY - PADDLE_HEIGHT / 2),
                PADDLE_WIDTH,
                PADDLE_HEIGHT
            );

            // Right paddle
            ctx.fillRect(
                GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
                Math.round(g.rY - PADDLE_HEIGHT / 2),
                PADDLE_WIDTH,
                PADDLE_HEIGHT
            );

            // Ball
            ctx.beginPath();
            ctx.arc(g.bx, g.by, g.br, 0, Math.PI * 2);
            ctx.fill();

            // Status text
            ctx.font = '14px ui-sans-serif, system-ui';
            ctx.fillStyle = '#9aa3c7';
            ctx.textAlign = 'left';

            const status = running
                ? (handSeen
                ? 'tracking'
                : (mouseMode
                ? 'mouse mode'
                : 'no hand — using last position'))
                : 'paused';

            ctx.fillText(`Status: ${status}`, 16, 28);

            // Request next frame
            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [gameState, running, handSeen, mouseMode, canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            className="canvas"
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
        />
    );
};

export default GameCanvas;
