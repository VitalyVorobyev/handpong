import { useEffect, type RefObject } from 'react';
import { GAME_HEIGHT } from '../constants/gameConfig';

const useMouseControls = (
  canvasRef: RefObject<HTMLCanvasElement>,
  updatePosition: (y: number) => void,
  enabled: boolean
) => {
    useEffect(() => {
        if (!enabled) return;

        const setFromPointer = (clientY: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const y = ((clientY - rect.top) / rect.height) * GAME_HEIGHT;
            updatePosition(y);
        };

        const handlePointerDown = (e: PointerEvent) => {
            if (enabled) {
                setFromPointer(e.clientY);
            }
        };

        const handlePointerMove = (e: PointerEvent) => {
            if (enabled && (e.buttons || e.pointerType !== 'mouse')) {
                setFromPointer(e.clientY);
            }
        };

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('pointerdown', handlePointerDown);
            canvas.addEventListener('pointermove', handlePointerMove);
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('pointerdown', handlePointerDown);
                canvas.removeEventListener('pointermove', handlePointerMove);
            }
        };
    }, [canvasRef, updatePosition, enabled]);
};

export default useMouseControls;
