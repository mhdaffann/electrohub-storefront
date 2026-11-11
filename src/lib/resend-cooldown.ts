// Limits how often one browser can ask for another confirmation email.
// Cloud Auth also rate-limits these emails on the server.
export const RESEND_COOLDOWN_SECONDS = 60;
const key = (email: string) => `electrohub-resend:${email.trim().toLowerCase()}`;

export function secondsLeft(lastSentAt: number | null, now: number, cooldown = RESEND_COOLDOWN_SECONDS) {
  if (!lastSentAt) return 0;
  return Math.max(0, Math.ceil((lastSentAt + cooldown * 1000 - now) / 1000));
}

export function readLastSent(email: string): number | null {
  try { const v = Number(localStorage.getItem(key(email))); return Number.isFinite(v) && v > 0 ? v : null; } catch { return null; }
}

export function markSent(email: string, at = Date.now()) {
  try { localStorage.setItem(key(email), String(at)); } catch { /* storage unavailable */ }
}
