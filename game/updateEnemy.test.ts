import { describe, expect, it, vi } from 'vitest';
import type { Enemy, Player } from '../types';
import { createInitialPlayer } from '../utils/gameState';
import { updateEnemy } from './updateEnemy';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => ({
  id: 'enemy',
  x: 10,
  y: 20,
  width: 30,
  height: 20,
  vx: 2,
  vy: 3,
  color: '#fff',
  hp: 20,
  maxHp: 20,
  type: 'BUG',
  text: 'bug',
  scoreValue: 100,
  age: 0,
  flashTimer: 0,
  ...overrides,
});

const update = (enemy: Enemy, player: Player = createInitialPlayer()) => {
  const spawnEnemy = vi.fn();
  const createExplosion = vi.fn();
  const enemyProjectiles: Parameters<typeof updateEnemy>[1]['enemyProjectiles'] = [];

  updateEnemy(enemy, {
    player,
    frameScale: 1,
    enemyProjectiles,
    spawnEnemy,
    createExplosion,
    random: () => 0.75,
  });

  return { spawnEnemy, createExplosion, enemyProjectiles };
};

describe('updateEnemy', () => {
  it('moves a basic enemy using velocity', () => {
    const enemy = createEnemy();
    update(enemy);

    expect(enemy.x).toBe(12);
    expect(enemy.y).toBe(23);
    expect(enemy.age).toBe(1);
  });

  it('grows a memory leak when it crosses its interval', () => {
    const enemy = createEnemy({ type: 'MEMORY_LEAK', age: 39 });
    update(enemy);

    expect(enemy.width).toBe(32);
    expect(enemy.height).toBe(21);
    expect(enemy.x).toBe(9);
  });

  it('teleports a race condition on the configured interval', () => {
    const enemy = createEnemy({ type: 'RACE_CONDITION', age: 59 });
    const { createExplosion } = update(enemy);

    expect(createExplosion).toHaveBeenCalledOnce();
    expect(enemy.x).toBeGreaterThan(10);
  });
});
