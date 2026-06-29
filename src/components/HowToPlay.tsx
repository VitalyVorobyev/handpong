interface HowToPlayProps {
    onStartCamera: () => void;
    onUseMouse: () => void;
    onClose: () => void;
}

const HowToPlay = ({ onStartCamera, onUseMouse, onClose }: HowToPlayProps) => {
    return (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="How to play HandPong">
            <div className="overlay__card">
                <button className="overlay__close" onClick={onClose} aria-label="Close">
                    ×
                </button>

                <h2 className="overlay__title">How to play</h2>
                <p className="overlay__sub">Control the left paddle and keep the ball away from the AI.</p>

                <ol className="overlay__steps">
                    <li className="step">
                        <span className="step__num">1</span>
                        <span>
                            <b>Start the camera</b> and allow access when your browser asks.
                        </span>
                    </li>
                    <li className="step">
                        <span className="step__num">2</span>
                        <span>
                            <b>Move your hand</b> up and down — your index fingertip drives the paddle.
                        </span>
                    </li>
                    <li className="step">
                        <span className="step__num">3</span>
                        <span>
                            No camera? <b>Use the mouse</b> or the <b>↑ / ↓</b> arrow keys instead.
                        </span>
                    </li>
                </ol>

                <div className="overlay__actions">
                    <button className="btn btn--primary" onClick={onStartCamera}>
                        <span className="btn__icon" aria-hidden="true">🎥</span>
                        <span>Play with camera</span>
                    </button>
                    <button className="btn" onClick={onUseMouse}>
                        <span className="btn__icon" aria-hidden="true">🖱️</span>
                        <span>Play with mouse</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HowToPlay;
