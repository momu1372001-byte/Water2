/**
 * Sound feedback hook.
 * Uses Web Audio API to generate brief tones for correct/incorrect feedback.
 * No external audio files needed — tones are synthesized at runtime.
 */
const SOUND_ENABLED_KEY = 'lq.soundEnabled';

function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {
    // ignore
  }
}

export function getSoundEnabled(): boolean {
  return isSoundEnabled();
}

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15, delay = 0): void {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gainNode.gain.value = 0;
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  const start = ctx.currentTime + delay;
  gainNode.gain.setValueAtTime(0, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration);
}

export function playCorrect(): void {
  playTone(523.25, 0.1, 'sine', 0.12, 0);
  playTone(659.25, 0.1, 'sine', 0.12, 0.08);
  playTone(783.99, 0.15, 'sine', 0.12, 0.16);
}

export function playIncorrect(): void {
  playTone(196, 0.15, 'sawtooth', 0.08, 0);
  playTone(185, 0.2, 'sawtooth', 0.06, 0.1);
}

export function playComplete(): void {
  playTone(523.25, 0.12, 'sine', 0.14, 0);
  playTone(659.25, 0.12, 'sine', 0.14, 0.1);
  playTone(783.99, 0.12, 'sine', 0.14, 0.2);
  playTone(1046.5, 0.2, 'sine', 0.14, 0.3);
}

export function playClick(): void {
  playTone(800, 0.04, 'sine', 0.05, 0);
}

export function playUnlock(): void {
  playTone(440, 0.08, 'sine', 0.1, 0);
  playTone(554.37, 0.08, 'sine', 0.1, 0.06);
  playTone(659.25, 0.12, 'sine', 0.1, 0.12);
}
