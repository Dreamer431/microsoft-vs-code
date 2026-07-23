import {
  CANVAS_HEIGHT,
  COLORS,
  MAX_SPECIAL_CHARGE,
  PLAYFIELD_WIDTH,
} from '../constants';
import type {
  Enemy,
  GameStats,
  Particle,
  Player,
} from '../types';
import { sfxUltimate } from '../utils/audio';
import { t } from '../utils/i18n';

interface RefactorUltimateContext {
  player: Player;
  stats: GameStats;
  enemies: Enemy[];
  createExplosion: (x: number, y: number, color: string, count: number) => void;
  addFloatingText: (
    x: number,
    y: number,
    text: string,
    color: string,
    vy?: number,
  ) => void;
  onActivate: () => void;
  handleEnemyDefeat: (enemy: Enemy) => void;
}

export interface RefactorUltimateResult {
  activated: boolean;
  particle: Particle | null;
}

export function activateRefactorUltimate({
  player,
  stats,
  enemies,
  createExplosion,
  addFloatingText,
  onActivate,
  handleEnemyDefeat,
}: RefactorUltimateContext): RefactorUltimateResult {
  if (player.specialCharge < MAX_SPECIAL_CHARGE) {
    return {
      activated: false,
      particle: null,
    };
  }

  player.specialCharge = 0;
  stats.lastLog = t('logRefactor');
  onActivate();

  // Use a snapshot because defeating MERGE_CONFLICT can append new enemies.
  [...enemies].forEach((enemy) => {
    enemy.hp -= 50;
    enemy.flashTimer = 10;
    createExplosion(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      COLORS.accent,
      5,
    );
    handleEnemyDefeat(enemy);
  });

  addFloatingText(
    PLAYFIELD_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    t('refactorComplete'),
    COLORS.class,
  );
  sfxUltimate();

  return {
    activated: true,
    particle: {
      id: 'shockwave',
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      width: 0,
      height: 0,
      vx: 0,
      vy: 0,
      color: COLORS.accent,
      life: 1,
      maxLife: 1,
      alpha: 0.8,
      char: '',
    },
  };
}
