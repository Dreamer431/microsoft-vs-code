import {
  CANVAS_HEIGHT,
  COLORS,
  COMBO_TIMER_MAX,
  MAX_SPECIAL_CHARGE,
  PLAYFIELD_WIDTH,
  SPECIAL_CHARGE_PER_KILL,
} from '../constants';
import type {
  Enemy,
  GameStats,
  Player,
  PowerUp,
  UpgradeOption,
} from '../types';
import { sfxExplosion, sfxWaveClear } from '../utils/audio';
import { t } from '../utils/i18n';
import { pickUpgradeChoices } from './contentSelection';
import { createPowerUpDrop } from './entityFactory';
import type { EnemySpawnType } from './contentSelection';

type RandomSource = () => number;

interface EnemyDefeatContext {
  player: Player;
  stats: GameStats;
  spawnEnemy: (
    type: EnemySpawnType,
    x?: number,
    y?: number,
    hpScale?: number,
  ) => void;
  createExplosion: (x: number, y: number, color: string, count: number) => void;
  addFloatingText: (
    x: number,
    y: number,
    text: string,
    color: string,
    vy?: number,
  ) => void;
  random?: RandomSource;
}

export interface EnemyDefeatResult {
  defeated: boolean;
  clearEnemyProjectiles: boolean;
  droppedPowerUp: PowerUp | null;
  shake: number;
  upgradeChoices: UpgradeOption[];
}

const notDefeated = (): EnemyDefeatResult => ({
  defeated: false,
  clearEnemyProjectiles: false,
  droppedPowerUp: null,
  shake: 0,
  upgradeChoices: [],
});

export function resolveEnemyDefeat(
  enemy: Enemy,
  {
    player,
    stats,
    spawnEnemy,
    createExplosion,
    addFloatingText,
    random = Math.random,
  }: EnemyDefeatContext,
): EnemyDefeatResult {
  if (enemy.hp > 0) return notDefeated();

  enemy.hp = 0;
  createExplosion(
    enemy.x + enemy.width / 2,
    enemy.y + enemy.height / 2,
    enemy.color,
    12,
  );
  sfxExplosion();

  if (enemy.type === 'MERGE_CONFLICT') {
    spawnEnemy('BUG', enemy.x - 20, enemy.y, 0.5);
    spawnEnemy('BUG', enemy.x + 20, enemy.y, 0.5);
    addFloatingText(enemy.x, enemy.y, t('split'), COLORS.gitModified);
  }

  const comboMultiplier = 1 + stats.combo * 0.1;
  stats.score += Math.floor(enemy.scoreValue * comboMultiplier);
  stats.bugsFixed++;
  stats.combo++;
  stats.maxCombo = Math.max(stats.maxCombo, stats.combo);
  stats.comboTimer = COMBO_TIMER_MAX;

  player.specialCharge = Math.min(
    MAX_SPECIAL_CHARGE,
    player.specialCharge + SPECIAL_CHARGE_PER_KILL,
  );

  if (stats.combo > 1 && stats.combo % 5 === 0) {
    addFloatingText(
      player.x,
      player.y - 50,
      t('comboLabel', { n: stats.combo }),
      COLORS.warning,
    );
  }

  let clearEnemyProjectiles = false;
  let shake = 0;
  let upgradeChoices: UpgradeOption[] = [];

  if (enemy.type === 'MONOLITH') {
    stats.bossActive = false;
    stats.wave++;
    stats.levelProgress = 0;
    stats.levelTarget += 5;
    stats.lastLog = t('logBossKilled', { wave: stats.wave - 1 });
    addFloatingText(
      PLAYFIELD_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      t('deploySuccess'),
      COLORS.class,
    );
    player.hp = player.maxHp;
    player.ammo = player.maxAmmo;
    clearEnemyProjectiles = true;
    shake = 20;
    sfxWaveClear();
    upgradeChoices = pickUpgradeChoices(3, random);
  } else if (!stats.bossActive) {
    stats.levelProgress++;
  }

  return {
    defeated: true,
    clearEnemyProjectiles,
    droppedPowerUp: random() < 0.15
      ? createPowerUpDrop(enemy, random)
      : null,
    shake,
    upgradeChoices,
  };
}
