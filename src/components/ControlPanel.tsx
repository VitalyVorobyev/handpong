import React from 'react';

interface ControlPanelProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    mirror: boolean;
    setMirror: (mirror: boolean) => void;
    alpha: number;
    setAlpha: (alpha: number) => void;
    sensitivity: number;
    setSensitivity: (sensitivity: number) => void;
    top: number;
    setTop: (top: number) => void;
    bottom: number;
    setBottom: (bottom: number) => void;
    lastYNormRef: React.RefObject<number>;
    handSeen: boolean;
    handsFPS: number;
    children?: React.ReactNode;
};

interface OverlayControlProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
};

const OverlayControl = ({ showPreview, setShowPreview }: OverlayControlProps) => {
    return (
        <div className="row" style={{ marginTop: 8 }}>
            <label>
                <input
                    type="checkbox"
                    checked={showPreview}
                    onChange={e => setShowPreview(e.target.checked)}
                />
                Show preview/overlay
            </label>
        </div>
    );
};

const MirrorControl = ({ mirror, setMirror }: { mirror: boolean; setMirror: (mirror: boolean) => void }) => {
    return (
        <div className="row">
            <label>
                <input
                    type="checkbox"
                    checked={mirror}
                    onChange={e => setMirror(e.target.checked)}
                />
                Mirror controls
            </label>
        </div>
    );
};

const SmoothingControl = ({ alpha, setAlpha }: { alpha: number; setAlpha: (alpha: number) => void }) => {
    return (
        <div className="row">
            <label>
                Smoothing
            </label>
            <input
                type="range"
                min={0}
                max={0.9}
                step={0.05}
                value={alpha}
                onChange={e => setAlpha(parseFloat(e.target.value))}
            />
            <span className="badge">{alpha.toFixed(2)}</span>
        </div>
    );
};

const SensitivityControls = ({ sensitivity, setSensitivity }: { sensitivity: number; setSensitivity: (sensitivity: number) => void }) => {
    return (
        <div className="row">
            <label>
                Sensitivity
            </label>
            <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={sensitivity}
                onChange={e => setSensitivity(parseFloat(e.target.value))}
            />
            <span className="badge">{sensitivity.toFixed(2)}×</span>
        </div>
    );
};

const TopLimitControls = ({ top, setTop, lastYNormRef }: { top: number; setTop: (top: number) => void; lastYNormRef: React.RefObject<number>; }) => {
    return (
        <div className="row">
            <label>
                Top limit
            </label>
            <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={top}
                onChange={e => setTop(parseFloat(e.target.value))}
            />
            <span className="badge">{Math.round(top * 100)}%</span>
            <button
                className="btn"
                onClick={() => setTop(lastYNormRef.current!)}
            >
                Set top
            </button>
        </div>
    );
};

const BottomLimitControls = ({ bottom, setBottom, lastYNormRef }: { bottom: number; setBottom: (bottom: number) => void; lastYNormRef: React.RefObject<number>; }) => {
    return (
        <div className="row">
            <label>
                Bottom limit
            </label>
            <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.01}
                value={bottom}
                onChange={e => setBottom(parseFloat(e.target.value))}
            />
            <span className="badge">{Math.round(bottom * 100)}%</span>
            <button
                className="btn"
                onClick={() => setBottom(lastYNormRef.current!)}
            >
                Set bottom
            </button>
        </div>
    );
};

const ControlsStatus = ({
    handSeen,
    handsFPS
}: {
    handSeen: boolean;
    handsFPS: number;
}) => {
    return (
        <div className="kv">
            <div>Tracking:</div>
            <div className="badge">{handSeen ? 'hand' : 'no hand'}</div>
            <div>FPS (hands):</div>
            <div className="badge">{handsFPS}</div>
            <div>Controls:</div>
            <div className="badge">Hand (cam) / Mouse / ↑↓</div>
        </div>
    );
};

const ControlPanel = ({
    showPreview, setShowPreview,
    mirror, setMirror,
    alpha, setAlpha,
    sensitivity, setSensitivity,
    top, setTop,
    bottom, setBottom,
    lastYNormRef,
    handSeen,
    handsFPS,
    children
}: ControlPanelProps) => {
    return (
        <aside className="aside">
            <h2>
                Webcam & Tracking
            </h2>
            {children}

            <OverlayControl showPreview={showPreview} setShowPreview={setShowPreview} />
            <MirrorControl mirror={mirror} setMirror={setMirror} />
            <SmoothingControl alpha={alpha} setAlpha={setAlpha} />
            <SensitivityControls sensitivity={sensitivity} setSensitivity={setSensitivity} />
            <TopLimitControls top={top} setTop={setTop} lastYNormRef={lastYNormRef} />
            <BottomLimitControls bottom={bottom} setBottom={setBottom} lastYNormRef={lastYNormRef} />

            <ControlsStatus handSeen={handSeen} handsFPS={handsFPS} />

            <p className="hint">
                If camera is blocked, toggle <b>Mouse Mode</b> and allow access.
            </p>
        </aside>
    );
};

export default ControlPanel;
