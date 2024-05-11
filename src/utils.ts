export const randomInt = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1) + a);

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));