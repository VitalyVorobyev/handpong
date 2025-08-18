import { useEffect } from 'react';

const useKeyboardControls = (updatePosition: (y: number) => void) => {
    useEffect(() => {
        const keys: Record<string, boolean> = {};
        const STEP_SIZE = 6;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                keys[e.key] = true;
                e.preventDefault();
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                keys[e.key] = false;
                e.preventDefault();
            }
        }

        const processKeys = () => {
            let deltaY = 0;
            if (keys['ArrowUp']) deltaY -= STEP_SIZE;
            if (keys['ArrowDown']) deltaY += STEP_SIZE;

            if (deltaY !== 0) {
                updatePosition(deltaY);
            }

            requestAnimationFrame(processKeys);
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const animationId = requestAnimationFrame(processKeys);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationId);
        };
    }, [updatePosition]);
};

export default useKeyboardControls;
