import React, { useEffect } from 'react';

import { type GameState } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN } from '../constants/gameConfig';

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

        // Paddle position helper (left x edge)
        const rightX = GAME_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;

        const drawPaddle = (x: number, centerY: number, from: string, to: string, glow: string) => {
            const y = Math.round(centerY - PADDLE_HEIGHT / 2);
            const grad = ctx.createLinearGradient(0, y, 0, y + PADDLE_HEIGHT);
            grad.addColorStop(0, from);
            grad.addColorStop(1, to);

            ctx.save();
            ctx.shadowColor = glow;
            ctx.shadowBlur = 16;
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
            ctx.fill();
            ctx.restore();
        };

        const render = () => {
            const g = gameState.current;

            // Clear canvas
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

            // Center net
            ctx.save();
            ctx.setLineDash([10, 16]);
            ctx.strokeStyle = 'rgba(91, 157, 255, 0.22)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(GAME_WIDTH / 2, 24);
            ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT - 24);
            ctx.stroke();
            ctx.restore();

            // Scores (left = player/blue, right = AI/amber)
            ctx.font = 'bold 52px ui-sans-serif, system-ui';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#5b9dff';
            ctx.fillText(String(g.scoreL), GAME_WIDTH * 0.25, 70);
            ctx.fillStyle = '#f2a93d';
            ctx.fillText(String(g.scoreR), GAME_WIDTH * 0.75, 70);

            // Paddles
            drawPaddle(PADDLE_MARGIN, g.lY, '#2ad4fd', '#b721ff', 'rgba(91, 157, 255, 0.6)');
            drawPaddle(rightX, g.rY, '#ff8a5b', '#ffd93d', 'rgba(242, 169, 61, 0.5)');

            // Ball
            const ballGrad = ctx.createRadialGradient(g.bx, g.by, 1, g.bx, g.by, g.br);
            ballGrad.addColorStop(0, '#fff89a');
            ballGrad.addColorStop(1, '#ffc83d');
            ctx.save();
            ctx.shadowColor = 'rgba(255, 220, 110, 0.7)';
            ctx.shadowBlur = 18;
            ctx.fillStyle = ballGrad;
            ctx.beginPath();
            ctx.arc(g.bx, g.by, g.br, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Status text
            ctx.font = '14px ui-sans-serif, system-ui';
            ctx.fillStyle = '#9aa3c7';
            ctx.textAlign = 'left';

            const status = running
                ? (handSeen
                ? 'tracking hand'
                : (mouseMode
                ? 'mouse mode'
                : 'no hand — holding last position'))
                : 'paused';

            ctx.fillText(status, 18, 30);

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
