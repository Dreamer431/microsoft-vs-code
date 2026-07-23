import { describe, expect, it } from 'vitest';
import type { Particle, Projectile } from '../types';
import {
  advanceParticles,
  advancePlayerProjectiles,
} from './advanceEntities';

const createProjectile = (overrides: Partial<Projectile> = {}): Projectile => ({
  id: 'projectile',
  x: 10,
  y: 20,
  width: 4,
  height: 12,
  vx: 2,
  vy: -4,
  color: '#fff',
  damage: 10,
  type: 'DEFAULT',
  ...overrides,
});

const createParticle = (overrides: Partial<Particle> = {}): Particle => ({
  id: 'particle',
  x: 10,
  y: 20,
  width: 10,
  height: 10,
  vx: 2,
  vy: 3,
  color: '#fff',
  life: 1,
  maxLife: 1,
  alpha: 1,
  char: '{}',
  ...overrides,
});

describe('entity advancement', () => {
  it('moves projectiles using frame scale and removes off-screen entries', () => {
    const visible = createProjectile();
    const expired = createProjectile({ id: 'expired', y: -49, vy: -4 });
    const result = advancePlayerProjectiles([visible, expired], 2);

    expect(visible).toMatchObject({ x: 14, y: 12 });
    expect(result).toEqual([visible]);
  });

  it('advances particle motion and lifetime', () => {
    const visible = createParticle();
    const expired = createParticle({ id: 'expired', life: 0.01 });
    const result = advanceParticles([visible, expired], 1);

    expect(visible).toMatchObject({ x: 12, y: 23, life: 0.98, alpha: 0.98 });
    expect(result).toEqual([visible]);
  });
});
