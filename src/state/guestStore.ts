import type { ProgressState } from './progression';

const KEY = 'lq.guestProgress';

/** Safe localStorage wrapper for guest progress. */
export const guestStore = {
  load(): ProgressState | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ProgressState;
    } catch {
      return null;
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
};

export function saveGuestProgress(state: ProgressState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage may be full or unavailable — non-fatal in guest mode
  }
}
