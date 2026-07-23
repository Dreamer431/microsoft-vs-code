import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from '../constants';
import type { Player, UpgradeId } from '../types';
import { t } from '../utils/i18n';

export interface RunModifiers {
  fastGc: boolean;
  overclock: boolean;
}

type AddFloatingText = (
  x: number,
  y: number,
  text: string,
  color: string,
  vy?: number,
) => void;

export function applyUpgrade(
  upgrade: UpgradeId,
  player: Player,
  modifiers: RunModifiers,
  addFloatingText: AddFloatingText,
): RunModifiers {
  const nextModifiers = { ...modifiers };
  const x = CANVAS_WIDTH / 2;
  const y = CANVAS_HEIGHT / 2;

  switch (upgrade) {
    case 'WEAPON':
      player.weaponLevel = Math.min(5, player.weaponLevel + 1);
      addFloatingText(x, y, t('compilerUpgraded'), COLORS.class);
      break;
    case 'MAX_HP':
      player.maxHp += 25;
      player.hp = player.maxHp;
      addFloatingText(x, y, t('heapExpanded'), COLORS.gitAdded);
      break;
    case 'MAX_AMMO':
      player.maxAmmo += 10;
      player.ammo = player.maxAmmo;
      addFloatingText(x, y, t('bufferOverflow'), COLORS.keyword);
      break;
    case 'RELOAD':
      nextModifiers.fastGc = true;
      addFloatingText(x, y, t('fastGcEnabled'), COLORS.function);
      break;
    case 'OVERCLOCK':
      nextModifiers.overclock = true;
      addFloatingText(x, y, t('overclocked'), COLORS.warning);
      break;
  }

  return nextModifiers;
}
