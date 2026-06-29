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

const ToggleControl = ({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) => {
    return (
        <div className="field field--check">
            <label className="field__label">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                />
                {label}
            </label>
        </div>
    );
};

const SliderControl = ({
    label,
    min,
    max,
    step,
    value,
    format,
    onChange,
}: {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    format: (value: number) => string;
    onChange: (value: number) => void;
}) => {
    return (
        <div className="field">
            <span className="field__label">{label}</span>
            <input
                className="slider"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
            />
            <span className="badge">{format(value)}</span>
        </div>
    );
};

const LimitControl = ({
    label,
    min,
    max,
    value,
    setValue,
    lastYNormRef,
}: {
    label: string;
    min: number;
    max: number;
    value: number;
    setValue: (value: number) => void;
    lastYNormRef: React.RefObject<number>;
}) => {
    return (
        <div className="field">
            <span className="field__label">{label}</span>
            <input
                className="slider"
                type="range"
                min={min}
                max={max}
                step={0.01}
                value={value}
                onChange={e => setValue(parseFloat(e.target.value))}
            />
            <span className="badge">{Math.round(value * 100)}%</span>
            <button className="set-btn" onClick={() => setValue(lastYNormRef.current!)}>
                Set
            </button>
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
        <aside className="panel">
            <div className="panel__section">
                <h2 className="panel__title">Webcam</h2>
                {children}
                <ToggleControl label="Show preview & overlay" checked={showPreview} onChange={setShowPreview} />
                <ToggleControl label="Mirror controls" checked={mirror} onChange={setMirror} />
            </div>

            <div className="panel__section">
                <h2 className="panel__title">Feel</h2>
                <SliderControl
                    label="Smoothing"
                    min={0} max={0.9} step={0.05}
                    value={alpha}
                    format={v => v.toFixed(2)}
                    onChange={setAlpha}
                />
                <SliderControl
                    label="Sensitivity"
                    min={0.5} max={2.0} step={0.05}
                    value={sensitivity}
                    format={v => `${v.toFixed(2)}×`}
                    onChange={setSensitivity}
                />
            </div>

            <div className="panel__section">
                <h2 className="panel__title">Control band</h2>
                <LimitControl
                    label="Top limit"
                    min={0} max={0.5}
                    value={top} setValue={setTop}
                    lastYNormRef={lastYNormRef}
                />
                <LimitControl
                    label="Bottom limit"
                    min={0.5} max={1.0}
                    value={bottom} setValue={setBottom}
                    lastYNormRef={lastYNormRef}
                />
                <p className="hint">
                    <b>Set</b> snaps a limit to your hand's current height — raise your hand to the
                    top of your comfortable reach, click Set on Top limit, then repeat for Bottom.
                </p>
            </div>

            <div className="panel__section">
                <h2 className="panel__title">Status</h2>
                <div className="kv">
                    <div>Tracking</div>
                    <div className="badge">{handSeen ? 'hand' : 'no hand'}</div>
                    <div>Hand FPS</div>
                    <div className="badge">{handsFPS}</div>
                    <div>Controls</div>
                    <div className="badge">Cam / Mouse / ↑↓</div>
                </div>
                <p className="hint">
                    If the camera is blocked, switch on <b>Mouse mode</b> and allow access in your
                    browser's address bar.
                </p>
            </div>
        </aside>
    );
};

export default ControlPanel;
