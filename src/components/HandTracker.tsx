import useHandTracking from '../hooks/useHandTracking';

interface HandTrackerProps {
    onHandUpdate: (yNorm: number, handSeen: boolean) => void;
    onStatusChange: (status: string) => void;
    onFpsUpdate: (fps: number) => void;
    mirror: boolean;
    showPreview: boolean;
    top: number;
    bottom: number;
    startCameraRef?: React.RefObject<(() => Promise<void>) | null>;
};

const HandTracker = ({
    onHandUpdate,
    onStatusChange,
    onFpsUpdate,
    mirror,
    showPreview,
    top,
    bottom,
    startCameraRef
}: HandTrackerProps) => {
    const { videoRef, debugRef, startCamera } = useHandTracking({
        mirror,
        showPreview,
        top,
        bottom,
        onHandUpdate,
        onStatusChange,
        onFpsUpdate
    });

    if (startCameraRef) {
        startCameraRef.current = startCamera;
    };

    return (
        <div className="videoBox">
            <video
                ref={videoRef}
                className={`video ${showPreview ? '' : 'hidden'}`}
                autoPlay
                playsInline
                muted
            />
            <canvas ref={debugRef} className="debug" />
        </div>
    );
};

export default HandTracker;
