import { describe, expect, it } from 'vitest';
import { PLAYFIELD_WIDTH } from '../constants';
import { createInitialPlayer } from '../utils/gameState';
import {
  createBoss,
  createEnemy,
  createExplosionParticles,
  createPlayerProjectiles,
} from './entityFactory';

describe('entity factories', () => {
  it('creates a wave-scaled enemy at the requested position', () => {
    const enemy = createEnemy(
      'BUG',
      2,
      { x: 40, y: 50, hpScale: 0.5 },
      () => 0.5,
    );

    expect(enemy.x).toBe(40);
    expect(enemy.y).toBe(50);
    expect(enemy.hp).toBe(7);
    expect(enemy.maxHp).toBe(7);
    expect(enemy.vy).toBe(1.7);
  });

  it('spawns random enemies inside the playable area', () => {
    const enemy = createEnemy('BUG', 1, {}, () => 0.999);

    expect(enemy.x + enemy.width).toBeLessThanOrEqual(PLAYFIELD_WIDTH);
  });

  it('creates a centered boss with boss-specific health scaling', () => {
    const boss = createBoss(2, () => 0.25);

    expect(boss.type).toBe('MONOLITH');
    expect(boss.x).toBe(PLAYFIELD_WIDTH / 2 - boss.width / 2);
    expect(boss.hp).toBe(1200);
    expect(boss.height).toBe(60);
  });

  it('creates the projectile pattern for each weapon tier', () => {
    const player = createInitialPlayer();

    expect(createPlayerProjectiles(player, () => 0.1)).toHaveLength(1);

    player.weaponLevel = 2;
    expect(createPlayerProjectiles(player, () => 0.1).map(({ type }) => type))
      .toEqual(['DEFAULT', 'TS_BEAM', 'TS_BEAM']);

    player.weaponLevel = 4;
    expect(createPlayerProjectiles(player, () => 0.1).map(({ type }) => type))
      .toEqual(['DEFAULT', 'TS_BEAM', 'TS_BEAM', 'SUDO_BLAST', 'SUDO_BLAST']);
  });

  it('creates the requested number of explosion particles', () => {
    const particles = createExplosionParticles(10, 20, '#fff', 3, () => 0.25);

    expect(particles).toHaveLength(3);
    expect(particles.every(({ x, y, life }) => x === 10 && y === 20 && life === 1))
      .toBe(true);
  });
});
