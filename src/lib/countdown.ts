/** Delivery window: 48 hours after payment confirmation. */
export const DEADLINE_MS = 48 * 3600 * 1000;

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const pad2 = (n: number) => n.toString().padStart(2, "0");
