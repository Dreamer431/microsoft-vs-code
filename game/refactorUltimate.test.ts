import { describe, expect, it, vi } from 'vitest';
import { MAX_SPECIAL_CHARGE } from '../constants';
import type { Enemy } from '../types';
import { createInitialGameStats, createInitialPlayer } from '../utils/gameState';
import { activateRefactorUltimate } from './refactorUltimate';

const createEnemy = (): Enemy => ({
  id: 'enemy',
  x: 100,
  y: 100,
  width: 30,
  height: 20,
  vx: 0,
  vy: 0,
  color: '#fff',
  hp: 60,
  maxHp: 60,
  type: 'BUG',
  text: 'bug',
  scoreValue: 100,
  age: 0,
  flashTimer: 0,
});

const createContext = () => ({
  player: createInitialPlayer(),
  stats: createInitialGameStats(),
  enemies: [createEnemy()],
  createExplosion: vi.fn(),
  addFloatingText: vi.fn(),
  onActivate: vi.fn(),
  handleEnemyDefeat: vi.fn(),
});

describe('refactor ultimate', () => {
  it('does nothing before the charge is full', () => {
    const context = createContext();

    const result = activateRefactorUltimate(context);

    expect(result.activated).toBe(false);
    expect(context.onActivate).not.toHaveBeenCalled();
    expect(context.enemies[0].hp).toBe(60);
  });

  it('damages a snapshot of enemies and creates the shockwave', () => {
    const context = createContext();
    context.player.specialCharge = MAX_SPECIAL_CHARGE;

    const result = activateRefactorUltimate(context);

    expect(context.player.specialCharge).toBe(0);
    expect(context.onActivate).toHaveBeenCalledOnce();
    expect(context.enemies[0]).toMatchObject({ hp: 10, flashTimer: 10 });
    expect(context.handleEnemyDefeat).toHaveBeenCalledWith(context.enemies[0]);
    expect(result.particle).toMatchObject({ id: 'shockwave', life: 1 });
  });
});
