import { describe, expect, it, vi } from 'vitest';
import type {
  Enemy,
  EnemyProjectile,
  PowerUp,
  Projectile,
} from '../types';
import { createInitialGameStats, createInitialPlayer } from '../utils/gameState';
import { resolveCombat } from './combat';

const createEnemy = (overrides: Partial<Enemy> = {}): Enemy => ({
  id: 'enemy',
  x: 100,
  y: 100,
  width: 30,
  height: 20,
  vx: 0,
  vy: 0,
  color: '#fff',
  hp: 10,
  maxHp: 10,
  type: 'BUG',
  text: 'bug',
  scoreValue: 100,
  age: 0,
  flashTimer: 0,
  ...overrides,
});

const createProjectile = (overrides: Partial<Projectile> = {}): Projectile => ({
  id: 'projectile',
  x: 100,
  y: 100,
  width: 4,
  height: 12,
  vx: 0,
  vy: 0,
  color: '#fff',
  damage: 10,
  type: 'DEFAULT',
  ...overrides,
});

const createEnemyProjectile = (
  overrides: Partial<EnemyProjectile> = {},
): EnemyProjectile => ({
  id: 'enemy-projectile',
  x: 100,
  y: 100,
  width: 8,
  height: 8,
  vx: 0,
  vy: 0,
  color: '#fff',
  damage: 15,
  label: '!',
  ...overrides,
});

const createPowerUp = (overrides: Partial<PowerUp> = {}): PowerUp => ({
  id: 'power-up',
  x: 100,
  y: 98,
  width: 24,
  height: 24,
  vx: 0,
  vy: 2,
  color: '#fff',
  type: 'HOTFIX',
  icon: '+',
  ...overrides,
});

const createContext = () => ({
  frameScale: 1,
  player: createInitialPlayer(),
  stats: createInitialGameStats(),
  enemies: [] as Enemy[],
  projectiles: [] as Projectile[],
  enemyProjectiles: [] as EnemyProjectile[],
  powerUps: [] as PowerUp[],
  addFloatingText: vi.fn(),
  createExplosion: vi.fn(),
  handleEnemyDefeat: vi.fn(),
  triggerGameOver: vi.fn(),
});

describe('combat resolution', () => {
  it('applies projectile damage and removes defeated enemies', () => {
    const context = createContext();
    context.player.x = 500;
    context.player.y = 500;
    context.enemies = [createEnemy({ hp: 5, maxHp: 5 })];
    context.projectiles = [createProjectile()];

    const result = resolveCombat(context);

    expect(context.handleEnemyDefeat).toHaveBeenCalledWith(context.enemies[0]);
    expect(result.enemies).toHaveLength(0);
    expect(result.projectiles).toHaveLength(0);
  });

  it('lets a shield damage a colliding enemy without hurting the player', () => {
    const context = createContext();
    context.player.x = 100;
    context.player.y = 100;
    context.player.shield = 1;
    context.enemies = [createEnemy({ hp: 5, maxHp: 5 })];

    const result = resolveCombat(context);

    expect(context.player.hp).toBe(context.player.maxHp);
    expect(context.handleEnemyDefeat).toHaveBeenCalledOnce();
    expect(result.shake).toBe(0);
  });

  it('damages the player and consumes an enemy projectile', () => {
    const context = createContext();
    context.player.x = 100;
    context.player.y = 100;
    context.enemyProjectiles = [createEnemyProjectile()];

    const result = resolveCombat(context);

    expect(context.player.hp).toBe(85);
    expect(context.player.invulnerable).toBe(40);
    expect(context.enemyProjectiles[0].y).toBeGreaterThan(600);
    expect(result.shake).toBe(15);
  });

  it('moves and applies a collected healing power-up using frame scale', () => {
    const context = createContext();
    context.frameScale = 2;
    context.player.x = 100;
    context.player.y = 100;
    context.player.hp = 50;
    context.powerUps = [createPowerUp({ y: 96 })];

    const result = resolveCombat(context);

    expect(context.player.hp).toBe(80);
    expect(result.powerUps).toHaveLength(0);
  });
});
