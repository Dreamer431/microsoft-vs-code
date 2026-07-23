import {
  AMMO_REGEN,
  CANVAS_HEIGHT,
  COLORS,
  MAX_SPECIAL_CHARGE,
  PLAYFIELD_WIDTH,
  PLAYER_BOOST_SPEED,
  PLAYER_SPEED,
  RELOAD_TIME,
} from '../constants';
import type { GameStats, Player, Projectile } from '../types';
import { sfxShoot } from '../utils/audio';
import { regenerateAmmo } from '../utils/gameLogic';
import { t } from '../utils/i18n';
import { createPlayerProjectiles } from './entityFactory';

interface PlayerSystemContext {
  player: Player;
  stats: GameStats;
  keys: ReadonlySet<string>;
  frameScale: number;
  timestamp: number;
  lastFireTime: number;
  movementSensitivity: number;
  fastGc: boolean;
  overclock: boolean;
  addFloatingText: (
    x: number,
    y: number,
    text: string,
    color: string,
    vy?: number,
  ) => void;
  triggerUltimate: () => void;
}

export interface PlayerSystemResult {
  lastFireTime: number;
  projectiles: Projectile[];
}

export function updatePlayerSystem({
  player,
  stats,
  keys,
  frameScale,
  timestamp,
  lastFireTime,
  movementSensitivity,
  fastGc,
  overclock,
  addFloatingText,
  triggerUltimate,
}: PlayerSystemContext): PlayerSystemResult {
  const sensitivity = Math.max(0.5, Math.min(2, movementSensitivity || 1));
  const currentSpeed = (
    player.speedBuff > 0 ? PLAYER_BOOST_SPEED : PLAYER_SPEED
  ) * sensitivity;

  player.speedBuff = Math.max(0, player.speedBuff - frameScale);
  player.shield = Math.max(0, player.shield - frameScale);
  player.invulnerable = Math.max(0, player.invulnerable - frameScale);

  if (stats.combo > 0) {
    stats.comboTimer = Math.max(0, stats.comboTimer - frameScale);
    if (stats.comboTimer <= 0) {
      stats.combo = 0;
      stats.lastLog = t('logComboBreak');
    }
  }

  if (
    (keys.has('KeyR') || keys.has('ShiftLeft'))
    && player.specialCharge >= MAX_SPECIAL_CHARGE
  ) {
    triggerUltimate();
  }

  if (keys.has('ArrowLeft') || keys.has('KeyA')) {
    player.x -= currentSpeed * frameScale;
  }
  if (keys.has('ArrowRight') || keys.has('KeyD')) {
    player.x += currentSpeed * frameScale;
  }
  if (keys.has('ArrowUp') || keys.has('KeyW')) {
    player.y -= currentSpeed * frameScale;
  }
  if (keys.has('ArrowDown') || keys.has('KeyS')) {
    player.y += currentSpeed * frameScale;
  }

  player.x = Math.max(0, Math.min(PLAYFIELD_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));

  const reloadDuration = fastGc ? RELOAD_TIME * 0.7 : RELOAD_TIME;
  if (player.isReloading) {
    player.reloadTimer -= frameScale;
    if (player.reloadTimer <= 0) {
      player.isReloading = false;
      player.ammo = player.maxAmmo;
      addFloatingText(player.x, player.y - 20, t('gcComplete'), COLORS.class);
    }
  } else if (!keys.has('Space') && player.ammo < player.maxAmmo) {
    player.ammo = regenerateAmmo(
      player.ammo,
      player.maxAmmo,
      AMMO_REGEN,
      frameScale,
    );
  }

  const fireRate = overclock ? 80 : (player.weaponLevel >= 3 ? 100 : 150);
  const canShoot = !player.isReloading && player.ammo >= 1;
  const shouldShoot = keys.has('Space') && timestamp - lastFireTime > fireRate;

  if (!shouldShoot || !canShoot) {
    return { lastFireTime, projectiles: [] };
  }

  player.ammo -= 1;
  if (player.ammo <= 0) {
    player.isReloading = true;
    player.reloadTimer = reloadDuration;
    stats.lastLog = t('logGcPause');
    addFloatingText(player.x, player.y - 40, t('gcPause'), COLORS.warning);
  }

  stats.linesOfCode++;
  sfxShoot();

  return {
    lastFireTime: timestamp,
    projectiles: createPlayerProjectiles(player),
  };
}
