interface ToolbarProps {
    startCamera: () => void;
    stopCamera: () => void;
    cameraRunning: boolean;
    mouseMode: boolean;
    setMouseMode: (mode: boolean) => void;
    running: boolean;
    setRunning: (running: boolean) => void;
    resetGame: () => void;
    status: string;
    onHowTo: () => void;
};

const Toolbar = ({
  startCamera,
  stopCamera,
  cameraRunning,
  mouseMode,
  setMouseMode,
  running,
  setRunning,
  resetGame,
  status,
  onHowTo
}: ToolbarProps) => {
    const dotClass = cameraRunning
        ? 'status-pill__dot status-pill__dot--live'
        : running
        ? 'status-pill__dot status-pill__dot--idle'
        : 'status-pill__dot';

    return (
        <div className="toolbar">
            <button
                className="btn btn--primary"
                onClick={startCamera}
                disabled={cameraRunning}
            >
                <span className="btn__icon" aria-hidden="true">🎥</span>
                <span>Start camera</span>
            </button>

            <button
                className="btn btn--danger"
                onClick={stopCamera}
                disabled={!cameraRunning}
            >
                <span className="btn__icon" aria-hidden="true">⏹</span>
                <span>Stop</span>
            </button>

            <button
                className="btn"
                aria-pressed={mouseMode}
                onClick={() => setMouseMode(!mouseMode)}
            >
                <span className="btn__icon" aria-hidden="true">🖱️</span>
                <span>Mouse mode</span>
            </button>

            <button
                className="btn"
                aria-pressed={!running}
                onClick={() => setRunning(!running)}
            >
                <span className="btn__icon" aria-hidden="true">{running ? '⏸' : '▶'}</span>
                <span>{running ? 'Pause' : 'Resume'}</span>
            </button>

            <button className="btn btn--ghost" onClick={resetGame}>
                <span className="btn__icon" aria-hidden="true">↺</span>
                <span>Reset</span>
            </button>

            <button className="btn btn--ghost" onClick={onHowTo} aria-label="How to play">
                <span className="btn__icon" aria-hidden="true">?</span>
            </button>

            <span className="toolbar__spacer" />

            <span className="status-pill">
                <span className={dotClass} />
                {status}
            </span>
        </div>
    );
};

export default Toolbar;
