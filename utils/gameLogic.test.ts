import { describe, expect, it } from 'vitest';
import {
  FRAME_DURATION,
  MAX_FRAME_SCALE,
  applyDamage,
  crossedFrameInterval,
  getFrameScale,
  regenerateAmmo,
  shouldTogglePause,
} from './gameLogic';

describe('game timing', () => {
  it('normalizes movement to a 60 FPS baseline', () => {
    expect(getFrameScale(FRAME_DURATION)).toBeCloseTo(1);
    expect(getFrameScale(FRAME_DURATION / 2)).toBeCloseTo(0.5);
    expect(getFrameScale(FRAME_DURATION * 10)).toBe(MAX_FRAME_SCALE);
  });

  it('detects crossed frame intervals', () => {
    expect(crossedFrameInterval(59, 60, 60)).toBe(true);
    expect(crossedFrameInterval(60, 61, 60)).toBe(false);
    expect(crossedFrameInterval(0, 1, 0)).toBe(false);
  });
});

describe('combat and resources', () => {
  it('regenerates the same ammo over equal real time at different refresh rates', () => {
    const at60Hz = regenerateAmmo(10, 40, 0.4, 1);
    const at120HzAfterTwoFrames = regenerateAmmo(
      regenerateAmmo(10, 40, 0.4, 0.5),
      40,
      0.4,
      0.5,
    );

    expect(at120HzAfterTwoFrames).toBeCloseTo(at60Hz);
    expect(regenerateAmmo(39.9, 40, 0.4, 1)).toBe(40);
  });

  it('applies bounded damage without forcing a surviving enemy to zero', () => {
    expect(applyDamage(35, 10)).toBe(25);
    expect(applyDamage(5, 10)).toBe(0);
    expect(applyDamage(35, -10)).toBe(35);
  });
});

describe('pause input', () => {
  it('ignores key-repeat toggles', () => {
    expect(shouldTogglePause('KeyP', false)).toBe(true);
    expect(shouldTogglePause('Escape', false)).toBe(true);
    expect(shouldTogglePause('KeyP', true)).toBe(false);
    expect(shouldTogglePause('Space', false)).toBe(false);
  });
});
