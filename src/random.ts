/** Returns a function giving uniform integers in [0, max). */
export type RandomInt = (max: number) => number;

/** Unbiased random integer in [0, max) from crypto.getRandomValues (rejection sampling). */
export const cryptoRandomInt: RandomInt = (max) => {
  if (!Number.isInteger(max) || max <= 0) throw new RangeError('max must be a positive integer');
  const range = 0x100000000;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0];
  } while (value >= limit);
  return value % max;
};

/** Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(items: readonly T[], randomInt: RandomInt = cryptoRandomInt): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createId(): string {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  return Array.from(buf, (n) => n.toString(36)).join('');
}
