import { describe, expect, it, vi } from 'vitest';
import { createInitialPlayer } from '../utils/gameState';
import { applyUpgrade } from './upgrades';

describe('upgrade application', () => {
  it('applies player stat upgrades and restores the affected resource', () => {
    const player = createInitialPlayer();
    player.hp = 10;
    player.ammo = 1;
    const addFloatingText = vi.fn();

    applyUpgrade('MAX_HP', player, { fastGc: false, overclock: false }, addFloatingText);
    applyUpgrade('MAX_AMMO', player, { fastGc: false, overclock: false }, addFloatingText);

    expect(player.maxHp).toBe(125);
    expect(player.hp).toBe(125);
    expect(player.maxAmmo).toBe(50);
    expect(player.ammo).toBe(50);
    expect(addFloatingText).toHaveBeenCalledTimes(2);
  });

  it('caps the weapon level', () => {
    const player = createInitialPlayer();
    player.weaponLevel = 5;

    applyUpgrade('WEAPON', player, { fastGc: false, overclock: false }, vi.fn());

    expect(player.weaponLevel).toBe(5);
  });

  it('returns updated permanent run modifiers', () => {
    const player = createInitialPlayer();
    const addFloatingText = vi.fn();

    const fastGc = applyUpgrade(
      'RELOAD',
      player,
      { fastGc: false, overclock: false },
      addFloatingText,
    );
    const overclock = applyUpgrade('OVERCLOCK', player, fastGc, addFloatingText);

    expect(overclock).toEqual({ fastGc: true, overclock: true });
  });
});
