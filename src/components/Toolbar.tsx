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
  status
}: ToolbarProps) => {
    return (
        <div className="toolbar" style={{ marginTop: 12 }}>
            <button className="btn" onClick={startCamera}>
                🎥 Start Camera
            </button>

            <button className="btn" onClick={stopCamera} disabled={!cameraRunning}>
                🛑 Stop Camera
            </button>

            <button
                className="btn"
                aria-pressed={mouseMode}
                onClick={() => setMouseMode(!mouseMode)}
            >
                🖱️ Mouse Mode{mouseMode ? ': ON' : ''}
            </button>

            <button
                className="btn"
                aria-pressed={!running}
                onClick={() => setRunning(!running)}
            >
                {running ? '⏸️ Pause' : '▶️ Resume'}
            </button>

            <button className="btn" onClick={resetGame}>
                🔄 Reset
            </button>

            <span className="pill">{status}</span>
        </div>
    );
};

export default Toolbar;
