import { COLORS, PLAYFIELD_WIDTH } from '../constants';
import type { Enemy, EnemyProjectile, EnemyType, Player } from '../types';
import { crossedFrameInterval } from '../utils/gameLogic';

interface EnemyUpdateContext {
  player: Player;
  frameScale: number;
  enemyProjectiles: EnemyProjectile[];
  spawnEnemy: (type: EnemyType, x?: number, y?: number) => void;
  createExplosion: (x: number, y: number, color: string, count: number) => void;
  random?: () => number;
}

function clampEnemyToPlayfield(enemy: Enemy): void {
  const maxX = Math.max(0, PLAYFIELD_WIDTH - enemy.width);
  enemy.x = Math.max(0, Math.min(maxX, enemy.x));
}

export function updateEnemy(enemy: Enemy, context: EnemyUpdateContext): void {
  const {
    player,
    frameScale,
    enemyProjectiles,
    spawnEnemy,
    createExplosion,
    random = Math.random,
  } = context;
  const previousAge = enemy.age;
  enemy.age += frameScale;
  if (enemy.flashTimer > 0) {
    enemy.flashTimer = Math.max(0, enemy.flashTimer - frameScale);
  }

  if (enemy.type === 'INFINITE_LOOP') {
    enemy.x += Math.cos(enemy.age * 0.1) * 3 * frameScale;
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.type === 'RACE_CONDITION') {
    enemy.y += enemy.vy * frameScale;
    if (crossedFrameInterval(previousAge, enemy.age, 60) && random() > 0.5) {
      createExplosion(enemy.x + enemy.width / 2, enemy.y, enemy.color, 3);
      enemy.x = random() * (PLAYFIELD_WIDTH - enemy.width);
    }
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.type === 'MERGE_CONFLICT') {
    enemy.x += Math.sin(enemy.age * 0.05) * frameScale;
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.type === 'MEMORY_LEAK') {
    if (crossedFrameInterval(previousAge, enemy.age, 40)) {
      enemy.width += 2;
      enemy.height += 1;
      enemy.x -= 1;
    }
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.type === 'SPAGHETTI') {
    enemy.x += Math.sin(enemy.age * 0.1) * 2 * frameScale;
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.type !== 'MONOLITH') {
    enemy.x += enemy.vx * frameScale;
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  if (enemy.y < 60) {
    enemy.y += enemy.vy * frameScale;
    clampEnemyToPlayfield(enemy);
    return;
  }

  const isRage = enemy.hp < enemy.maxHp * 0.5;
  const hoverSpeed = isRage ? 0.06 : 0.02;
  const moveSpeed = isRage ? 3 : 1;

  enemy.y = 60 + Math.sin(enemy.age * hoverSpeed) * 20;
  const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
  if (dx > 20) enemy.x += moveSpeed * 0.5 * frameScale;
  if (dx < -20) enemy.x -= moveSpeed * 0.5 * frameScale;
  clampEnemyToPlayfield(enemy);

  if (isRage && crossedFrameInterval(previousAge, enemy.age, 10)) {
    enemy.color = enemy.color === COLORS.error ? COLORS.keyword : COLORS.error;
  }

  if (crossedFrameInterval(previousAge, enemy.age, isRage ? 40 : 90)) {
    enemyProjectiles.push({
      id: `p-${random()}`,
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height,
      width: 20,
      height: 20,
      vx: (player.x - (enemy.x + enemy.width / 2)) * 0.02,
      vy: 5,
      color: COLORS.warning,
      damage: 15,
      label: '⚠',
    });
  }

  if (isRage && crossedFrameInterval(previousAge, enemy.age, 70)) {
    const centerX = enemy.x + enemy.width / 2;
    const centerY = enemy.y + enemy.height;
    [-3, 0, 3].forEach(vx => {
      enemyProjectiles.push({
        id: `sp-${random()}`,
        x: centerX,
        y: centerY,
        width: 14,
        height: 14,
        vx,
        vy: 6,
        color: COLORS.error,
        damage: 10,
        label: '✖',
      });
    });
  }

  if (crossedFrameInterval(previousAge, enemy.age, isRage ? 150 : 300)) {
    spawnEnemy('BUG', enemy.x, enemy.y + 80);
    spawnEnemy('SYNTAX_ERROR', enemy.x + enemy.width, enemy.y + 80);
  }
}
