export const clamp = (v: number, lo: number, hi: number): number => {
    return Math.max(lo, Math.min(hi, v));
};

export const randomDirection = (): number => {
    return Math.random() < 0.5 ? -1 : 1;
};

export const randomAngle = (): number => {
    return (Math.random() * 0.6 - 0.3);
};
