import './App.css';

import HandPong from './HandPong';

const REPO_URL = 'https://github.com/VitalyVorobyev/handpong';
const LOGO_URL = `${import.meta.env.BASE_URL}icon.svg`;

const App = () => {
    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">
                    <img className="brand__logo" src={LOGO_URL} alt="" width={44} height={44} />
                    <div className="brand__text">
                        <h1 className="brand__name">HandPong</h1>
                        <p className="brand__tag">Pong, played with your hand · webcam · mouse · keyboard</p>
                    </div>
                </div>

                <div className="topbar__actions">
                    <a
                        className="btn btn--ghost"
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className="btn__icon" aria-hidden="true">★</span>
                        <span>GitHub</span>
                    </a>
                </div>
            </header>

            <HandPong />

            <footer className="footer">
                <span>
                    Hand tracking by{' '}
                    <a
                        className="link"
                        href="https://developers.google.com/mediapipe/solutions/vision/hand_landmarker"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MediaPipe
                    </a>
                </span>
                <span>·</span>
                <span>Camera needs https:// or http://localhost — click Allow when prompted</span>
                <span>·</span>
                <span>
                    <a className="link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                        Source on GitHub
                    </a>
                </span>
            </footer>
        </div>
    );
};

export default App;
