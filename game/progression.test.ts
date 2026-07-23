import { describe, expect, it, vi } from 'vitest';
import type { Enemy } from '../types';
import { createInitialGameStats, createInitialPlayer } from '../utils/gameState';
import { resolveEnemyDefeat } from './progression';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => ({
  id: 'enemy',
  x: 100,
  y: 100,
  width: 30,
  height: 20,
  vx: 0,
  vy: 0,
  color: '#fff',
  hp: 0,
  maxHp: 10,
  type: 'BUG',
  text: 'bug',
  scoreValue: 100,
  age: 0,
  flashTimer: 0,
  ...overrides,
});

const createContext = () => ({
  player: createInitialPlayer(),
  stats: createInitialGameStats(),
  spawnEnemy: vi.fn(),
  createExplosion: vi.fn(),
  addFloatingText: vi.fn(),
  random: () => 0.9,
});

describe('enemy defeat progression', () => {
  it('ignores an enemy that still has health', () => {
    const context = createContext();
    const result = resolveEnemyDefeat(createEnemy({ hp: 1 }), context);

    expect(result.defeated).toBe(false);
    expect(context.stats.bugsFixed).toBe(0);
  });

  it('awards score, combo, charge, and level progress', () => {
    const context = createContext();
    context.stats.combo = 2;

    const result = resolveEnemyDefeat(createEnemy(), context);

    expect(result.defeated).toBe(true);
    expect(context.stats.score).toBe(120);
    expect(context.stats.combo).toBe(3);
    expect(context.stats.levelProgress).toBe(1);
    expect(context.player.specialCharge).toBe(5);
  });

  it('splits a merge conflict into two smaller bugs', () => {
    const context = createContext();

    resolveEnemyDefeat(createEnemy({ type: 'MERGE_CONFLICT' }), context);

    expect(context.spawnEnemy).toHaveBeenNthCalledWith(1, 'BUG', 80, 100, 0.5);
    expect(context.spawnEnemy).toHaveBeenNthCalledWith(2, 'BUG', 120, 100, 0.5);
  });

  it('advances the wave and prepares upgrades after a boss defeat', () => {
    const context = createContext();
    context.stats.bossActive = true;
    context.player.hp = 10;
    context.player.ammo = 1;

    const result = resolveEnemyDefeat(
      createEnemy({ type: 'MONOLITH', scoreValue: 5000 }),
      context,
    );

    expect(context.stats.wave).toBe(2);
    expect(context.stats.bossActive).toBe(false);
    expect(context.player.hp).toBe(context.player.maxHp);
    expect(context.player.ammo).toBe(context.player.maxAmmo);
    expect(result.clearEnemyProjectiles).toBe(true);
    expect(result.upgradeChoices).toHaveLength(3);
    expect(result.shake).toBe(20);
  });

  it('returns a power-up when the drop roll succeeds', () => {
    const context = createContext();
    context.random = () => 0;

    const result = resolveEnemyDefeat(createEnemy(), context);

    expect(result.droppedPowerUp?.type).toBe('COFFEE');
  });
});
