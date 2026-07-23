import { describe, expect, it, vi } from 'vitest';
import { MAX_SPECIAL_CHARGE } from '../constants';
import { createInitialGameStats, createInitialPlayer } from '../utils/gameState';
import { updatePlayerSystem } from './playerSystem';

const createContext = () => ({
  player: createInitialPlayer(),
  stats: createInitialGameStats(),
  keys: new Set<string>(),
  frameScale: 1,
  timestamp: 200,
  lastFireTime: 0,
  movementSensitivity: 1,
  fastGc: false,
  overclock: false,
  addFloatingText: vi.fn(),
  triggerUltimate: vi.fn(),
});

describe('player system', () => {
  it('moves the player using the active speed before timers decay', () => {
    const context = createContext();
    context.keys.add('KeyA');
    context.keys.add('KeyW');
    context.player.speedBuff = 10;
    const startX = context.player.x;
    const startY = context.player.y;

    updatePlayerSystem(context);

    expect(context.player.x).toBe(startX - 9);
    expect(context.player.y).toBe(startY - 9);
    expect(context.player.speedBuff).toBe(9);
  });

  it('fires the projectile pattern and updates ammo statistics', () => {
    const context = createContext();
    context.keys.add('Space');
    context.player.weaponLevel = 4;

    const result = updatePlayerSystem(context);

    expect(result.projectiles).toHaveLength(5);
    expect(result.lastFireTime).toBe(context.timestamp);
    expect(context.player.ammo).toBe(context.player.maxAmmo - 1);
    expect(context.stats.linesOfCode).toBe(1);
  });

  it('starts the shortened reload after firing the final round', () => {
    const context = createContext();
    context.keys.add('Space');
    context.fastGc = true;
    context.player.ammo = 1;

    updatePlayerSystem(context);

    expect(context.player.isReloading).toBe(true);
    expect(context.player.reloadTimer).toBe(105);
  });

  it('expires a combo and requests the ultimate when charged', () => {
    const context = createContext();
    context.keys.add('KeyR');
    context.player.specialCharge = MAX_SPECIAL_CHARGE;
    context.stats.combo = 3;
    context.stats.comboTimer = 1;

    updatePlayerSystem(context);

    expect(context.stats.combo).toBe(0);
    expect(context.triggerUltimate).toHaveBeenCalledOnce();
  });
});
