import { COLORS, CANVAS_HEIGHT, CANVAS_WIDTH, MAX_AMMO } from '../constants';
import type { GameStats, Player } from '../types';

export function createInitialPlayer(): Player {
  return {
    id: 'player',
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    color: COLORS.accent,
    hp: 100,
    maxHp: 100,
    invulnerable: 0,
    weaponLevel: 1,
    speedBuff: 0,
    shield: 0,
    ammo: MAX_AMMO,
    maxAmmo: MAX_AMMO,
    isReloading: false,
    reloadTimer: 0,
    specialCharge: 0,
  };
}

export function createInitialGameStats(lastLog = ''): GameStats {
  return {
    score: 0,
    bugsFixed: 0,
    linesOfCode: 0,
    wave: 1,
    fps: 60,
    lastLog,
    levelProgress: 0,
    levelTarget: 15,
    bossActive: false,
    combo: 0,
    comboTimer: 0,
    maxCombo: 0,
    weaponLevel: 1,
    ammo: MAX_AMMO,
    maxAmmo: MAX_AMMO,
    specialCharge: 0,
    shieldActive: false,
    pendingUpgrades: [],
  };
}
