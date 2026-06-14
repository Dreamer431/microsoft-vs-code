// Lightweight WebAudio SFX engine — no external deps, no audio files.
// All sounds are synthesised from oscillators & noise.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Call once on the first real user interaction to unlock audio on all browsers. */
export function resumeAudio(): void {
  getCtx();
}

export function setMuted(value: boolean): void {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

// ---- helpers ----

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  gainPeak: number = 0.3,
  freqEnd?: number
): void {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ac.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, ac.currentTime + duration);
  }
  gain.gain.setValueAtTime(gainPeak, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, gainPeak: number = 0.15, filterFreq = 2000): void {
  const ac = getCtx();
  if (!ac) return;

  const bufSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(gainPeak, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  source.start(ac.currentTime);
  source.stop(ac.currentTime + duration);
}

// ---- public SFX API ----

/** Small pew when the player shoots */
export function sfxShoot(): void {
  playTone(880, 0.06, 'square', 0.1, 440);
}

/** Bullet impact on enemy */
export function sfxHit(): void {
  playTone(300, 0.05, 'sawtooth', 0.12, 180);
}

/** Enemy explodes */
export function sfxExplosion(): void {
  playNoise(0.18, 0.25, 800);
  playTone(120, 0.18, 'sawtooth', 0.15, 40);
}

/** Player picks up a power-up */
export function sfxPowerUp(): void {
  playTone(660, 0.08, 'sine', 0.2);
  setTimeout(() => playTone(880, 0.08, 'sine', 0.2), 80);
  setTimeout(() => playTone(1100, 0.12, 'sine', 0.2), 160);
}

/** Heal specifically (slightly different timbre) */
export function sfxHeal(): void {
  playTone(523, 0.1, 'sine', 0.18);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.18), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.18), 200);
}

/** Boss enters the arena */
export function sfxBossAppear(): void {
  playNoise(0.4, 0.3, 400);
  playTone(80, 0.5, 'sawtooth', 0.35, 60);
}

/** Refactor ultimate */
export function sfxUltimate(): void {
  playTone(200, 0.1, 'square', 0.25);
  setTimeout(() => playTone(400, 0.1, 'square', 0.25), 80);
  setTimeout(() => playTone(800, 0.25, 'sawtooth', 0.3, 200), 160);
  playNoise(0.4, 0.2, 1200);
}

/** Player takes damage */
export function sfxPlayerHit(): void {
  playTone(150, 0.15, 'sawtooth', 0.2, 80);
  playNoise(0.1, 0.15, 600);
}

/** Boss defeated / wave clear */
export function sfxWaveClear(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.25), i * 100);
  });
}
