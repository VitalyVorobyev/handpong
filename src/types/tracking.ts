export interface HandLandmark {
    x: number;
    y: number;
    z: number;
};

export interface HandTrackingOptions {
    mirror: boolean;
    showPreview: boolean;
    top: number;
    bottom: number;
    minSpan: number;
    onHandUpdate: (yNorm: number, handSeen: boolean) => void;
    onStatusChange: (status: string) => void;
    onFpsUpdate: (fps: number) => void;
};

export interface MediaPipeResults {
    image: HTMLVideoElement;
    multiHandLandmarks?: HandLandmark[][];
};
