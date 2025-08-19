# HandPong

Classical Pong game with hand controls based on Google's MediaPipe

## Overview

HandPong is an interactive version of the classic Pong arcade game that uses computer vision to detect hand movements for controlling the paddles. Instead of using keyboard inputs, players can move their hands in front of a webcam to control the game, creating a more immersive and physically engaging experience.

## Features

- Real-time hand tracking for paddle control powered by MediaPipe
- Single-player match against a built-in AI opponent with score tracking
- Adjustable control region, smoothing and sensitivity values
- Optional preview overlay with mirroring to help position your hand
- Fallback mouse and keyboard controls in case camera access fails
- Pause, resume or reset the match at any time

## Technologies Used

- [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for fast development and building
- [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) for gesture detection
- ESLint for linting and code quality

## Setup

1. Install [Node.js](https://nodejs.org/) (version 18 or newer recommended)
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open the provided local URL in your browser and allow camera access

## Requirements

- Webcam
- Modern web browser with JavaScript enabled (Chrome recommended)
- Sufficient lighting for hand detection

## How to Play

Move your hand up and down in front of the webcam to control the left paddle. Keep the ball from passing your paddle while trying to get it past the AI opponent on the right side. Use the on-screen toolbar to pause, resume, reset or switch to mouse mode if needed.

## Development

If you want to contribute to the development of HandPong:

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin new-feature`
5. Submit a pull request

## Troubleshooting

- **Hand detection issues**: Ensure you have adequate lighting and a plain background
- **Performance problems**: Close other resource-intensive applications and tabs
- **Camera not working**: Check browser permissions and ensure no other application is using the camera

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the classic Pong game
- Hand tracking technology by MediaPipe
