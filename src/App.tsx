import './App.css';

import HandPong from './HandPong';

const App = () => {
    return (
        <div className="wrap">
            <header className="header">
                <h1>🕹️ Hand-Pong — webcam or mouse</h1>
            </header>
            <HandPong />
            <footer className="footnote">
                Tip: to allow webcam, run via https:// or http://localhost and click Allow.
            </footer>
        </div>
    );
};

export default App;
