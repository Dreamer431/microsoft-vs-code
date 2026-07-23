export const FRAME_DURATION = 1000 / 60;
export const MAX_FRAME_SCALE = 2.5;

export function getFrameScale(deltaTime: number): number {
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) return 1;
  return Math.min(MAX_FRAME_SCALE, deltaTime / FRAME_DURATION);
}

export function crossedFrameInterval(
  previousAge: number,
  currentAge: number,
  interval: number,
): boolean {
  if (interval <= 0) return false;
  return Math.floor(previousAge / interval) !== Math.floor(currentAge / interval);
}

export function regenerateAmmo(
  currentAmmo: number,
  maxAmmo: number,
  regenPerFrame: number,
  frameScale: number,
): number {
  const safeScale = Number.isFinite(frameScale) ? Math.max(0, frameScale) : 0;
  return Math.min(maxAmmo, currentAmmo + regenPerFrame * safeScale);
}

export function applyDamage(currentHp: number, damage: number): number {
  return Math.max(0, currentHp - Math.max(0, damage));
}

export function shouldTogglePause(code: string, repeat: boolean): boolean {
  return !repeat && (code === 'Escape' || code === 'KeyP');
}
