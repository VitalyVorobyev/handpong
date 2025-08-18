export interface GameState {
    scoreL: number;
    scoreR: number;
    bx: number;
    by: number;
    br: number;
    bvx: number;
    bvy: number;
    lY: number;
    rY: number;
    targetLY: number;
    lastT: number;
};

export interface GameOptions {
    width: number;
    height: number;
    smoothing: number;
    sensitivity: number;
};
