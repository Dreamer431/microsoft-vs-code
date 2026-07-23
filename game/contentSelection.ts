import { ENEMY_TYPES, POWER_UPS, UPGRADE_OPTIONS } from '../constants';
import type { EnemyType, UpgradeOption } from '../types';

type RandomSource = () => number;
export type EnemySpawnType = EnemyType | 'RANDOM';

export function pickUpgradeChoices(
  count = 3,
  random: RandomSource = Math.random,
): UpgradeOption[] {
  const pool: UpgradeOption[] = UPGRADE_OPTIONS.map(option => ({ ...option }));
  const result: UpgradeOption[] = [];

  while (result.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}

export function selectEnemyDefinition(
  type: EnemySpawnType,
  wave: number,
  random: RandomSource = Math.random,
): typeof ENEMY_TYPES[number] {
  if (type !== 'RANDOM') {
    return ENEMY_TYPES.find(enemy => enemy.type === type) ?? ENEMY_TYPES[0];
  }

  const roll = random();
  if (wave === 1) {
    return roll > 0.8 ? ENEMY_TYPES[1] : ENEMY_TYPES[0];
  }

  if (wave === 2) {
    if (roll > 0.9) return ENEMY_TYPES[1];
    if (roll > 0.6) return ENEMY_TYPES[2];
    return ENEMY_TYPES[0];
  }

  if (roll > 0.92) return ENEMY_TYPES[5];
  if (roll > 0.84) return ENEMY_TYPES[4];
  if (roll > 0.74) return ENEMY_TYPES[3];
  if (roll > 0.60) return ENEMY_TYPES[6];
  if (roll > 0.45) return ENEMY_TYPES[7];
  if (roll > 0.30) return ENEMY_TYPES[2];
  return ENEMY_TYPES[0];
}

export function selectPowerUpDefinition(
  random: RandomSource = Math.random,
): typeof POWER_UPS[number] {
  const totalWeight = POWER_UPS.reduce((sum, powerUp) => sum + powerUp.chance, 0);
  let roll = random() * totalWeight;

  for (const powerUp of POWER_UPS) {
    roll -= powerUp.chance;
    if (roll <= 0) return powerUp;
  }

  return POWER_UPS[POWER_UPS.length - 1];
}
