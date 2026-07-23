import { describe, expect, it } from 'vitest';
import { CANVAS_HEIGHT, CANVAS_WIDTH, MAX_AMMO } from '../constants';
import { createInitialGameStats, createInitialPlayer } from './gameState';

describe('game state factories', () => {
  it('creates a player at the expected starting position', () => {
    const player = createInitialPlayer();

    expect(player.x).toBe(CANVAS_WIDTH / 2);
    expect(player.y).toBe(CANVAS_HEIGHT - 60);
    expect(player.ammo).toBe(MAX_AMMO);
    expect(player.hp).toBe(player.maxHp);
  });

  it('returns independent reset objects', () => {
    const first = createInitialGameStats('first');
    const second = createInitialGameStats('second');

    first.pendingUpgrades.push({ id: 'WEAPON', icon: '⚡' });
    expect(second.pendingUpgrades).toEqual([]);
    expect(second.lastLog).toBe('second');
  });
});
