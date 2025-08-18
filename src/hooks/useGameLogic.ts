import { useRef } from 'react';
import { type GameState, type GameOptions } from '../types/game';
import { clamp, randomDirection, randomAngle } from '../utils/mathUtils';
import { GAME_WIDTH, GAME_HEIGHT, BALL_RADIUS, INITIAL_BALL_SPEED,
    BALL_ACCELERATION, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN } from '../constants/gameConfig';

const useGameLogic = (options: Partial<GameOptions> = {}) => {
    const {
        width = GAME_WIDTH,
        height = GAME_HEIGHT,
        smoothing = 0.65,
        sensitivity = 1.0
    } = options;

    // Game state
    const gameState = useRef<GameState>({
        scoreL: 0,
        scoreR: 0,
        bx: width / 2,
        by: height / 2,
        br: BALL_RADIUS,
        bvx: INITIAL_BALL_SPEED,
        bvy: INITIAL_BALL_SPEED / 2,
        lY: height / 2,
        rY: height / 2,
        targetLY: height / 2,
        lastT: performance.now(),
    });

    // Reset ball with optional direction
    const resetBall = (dir = randomDirection()) => {
        const g = gameState.current;
        g.bx = width / 2;
        g.by = height / 2;

        const angle = randomAngle();
        const speed = INITIAL_BALL_SPEED + Math.random() * 80;

        g.bvx = Math.cos(angle) * speed * dir;
        g.bvy = Math.sin(angle) * speed;
    };

    // Update game state based on time and input
    const update = (dt: number, running: boolean) => {
        const g = gameState.current;

        if (running) {
            // Follow target (hand/mouse) with smoothing
            g.lY = clamp(smoothing * g.lY + (1 - smoothing) * g.targetLY, PADDLE_HEIGHT/2, height - PADDLE_HEIGHT/2);

            // AI paddle
            const aim = clamp(g.by, PADDLE_HEIGHT/2, height - PADDLE_HEIGHT/2);
            g.rY = clamp(g.rY + (aim - g.rY) * 0.12, PADDLE_HEIGHT/2, height - PADDLE_HEIGHT/2);

            // Move ball
            g.bx += g.bvx * dt;
            g.by += g.bvy * dt;

            // Collision with top/bottom walls
            if (g.by < g.br) {
                g.by = g.br;
                g.bvy = Math.abs(g.bvy);
            }
            if (g.by > height - g.br) {
                g.by = height - g.br;
                g.bvy = -Math.abs(g.bvy);
            }

            // Paddle positions
            const lpX = PADDLE_MARGIN;
            const rpX = width - PADDLE_MARGIN - PADDLE_WIDTH;

            // Collision with left paddle
            const hitLeftY = (g.by + g.br > g.lY - PADDLE_HEIGHT/2) && (g.by - g.br < g.lY + PADDLE_HEIGHT/2);
            if (g.bx - g.br <= lpX + PADDLE_WIDTH && g.bx >= lpX && hitLeftY && g.bvx < 0) {
                g.bx = lpX + PADDLE_WIDTH + g.br;
                g.bvx = Math.abs(g.bvx) * BALL_ACCELERATION;
                const off = (g.by - g.lY) / (PADDLE_HEIGHT/2);
                g.bvy += off * 120;
            }

            // Collision with right paddle
            const hitRightY = (g.by + g.br > g.rY - PADDLE_HEIGHT/2) && (g.by - g.br < g.rY + PADDLE_HEIGHT/2);
            if (g.bx + g.br >= rpX && g.bx <= rpX + PADDLE_WIDTH && hitRightY && g.bvx > 0) {
                g.bx = rpX - g.br;
                g.bvx = -Math.abs(g.bvx) * BALL_ACCELERATION;
                const off = (g.by - g.rY) / (PADDLE_HEIGHT/2);
                g.bvy += off * 120;
            }

            // Scoring
            if (g.bx < -40) {
                g.scoreR++;
                resetBall(1);
            }
            if (g.bx > width + 40) {
                g.scoreL++;
                resetBall(-1);
            }
        }

        // Update last time
        g.lastT = performance.now();

        return g;
    };

    // Update target position (from hand/mouse)
    const updateTargetY = (yPos: number) => {
        const g = gameState.current;
        const desiredY = yPos;
        const delta = (desiredY - g.targetLY) * sensitivity;
        g.targetLY = clamp(g.targetLY + delta, PADDLE_HEIGHT/2, GAME_HEIGHT - PADDLE_HEIGHT/2);
    };

    // Reset scores
    const resetGame = () => {
        const g = gameState.current;
        g.scoreL = 0;
        g.scoreR = 0;
        resetBall();
    };

    return {
        gameState,
        update,
        resetBall,
        updateTargetY,
        resetGame
    };
};

export default useGameLogic;
