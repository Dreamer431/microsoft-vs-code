import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS, MAX_SPECIAL_CHARGE } from '../constants';
import type {
  Enemy,
  EnemyProjectile,
  FloatingText,
  GameStats,
  Particle,
  Player,
  PowerUp,
  Projectile,
} from '../types';
import { t } from '../utils/i18n';

const GAME_FONT = '"Cascadia Code", Consolas, monospace';

export interface BackgroundParticle {
  x: number;
  y: number;
  text: string;
  opacity: number;
  speed: number;
}

interface RenderSceneInput {
  ctx: CanvasRenderingContext2D;
  timestamp: number;
  frameScale: number;
  player: Player;
  stats: GameStats;
  backgroundParticles: readonly BackgroundParticle[];
  enemyProjectiles: readonly EnemyProjectile[];
  enemies: readonly Enemy[];
  projectiles: readonly Projectile[];
  powerUps: readonly PowerUp[];
  particles: readonly Particle[];
  floatingTexts: readonly FloatingText[];
  shake: number;
}

export function renderPausedFrame(ctx: CanvasRenderingContext2D, showPauseMessage: boolean): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (showPauseMessage) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold 40px ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(t('breakpointHit'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = `20px ${GAME_FONT}`;
    ctx.fillStyle = '#cccccc';
    ctx.fillText(t('pressToContinue'), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    ctx.textAlign = 'left';
  }

  ctx.restore();
}

export function renderStartFrame(
  ctx: CanvasRenderingContext2D,
  backgroundParticles: BackgroundParticle[],
  random: () => number = Math.random,
): void {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = '#2e2e2e';
  ctx.font = `14px ${GAME_FONT}`;

  backgroundParticles.forEach(particle => {
    particle.y += particle.speed;
    if (particle.y > CANVAS_HEIGHT) {
      particle.y = -20;
      particle.x = random() * CANVAS_WIDTH;
    }
    ctx.globalAlpha = particle.opacity;
    ctx.fillText(particle.text, particle.x, particle.y);
  });

  ctx.globalAlpha = 1;
}

export function renderScene({
  ctx,
  timestamp,
  frameScale,
  player,
  stats,
  backgroundParticles,
  enemyProjectiles,
  enemies,
  projectiles,
  powerUps,
  particles,
  floatingTexts,
  shake,
}: RenderSceneInput): number {
  let nextShake = shake;

  ctx.save();
  if (nextShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * nextShake,
      (Math.random() - 0.5) * nextShake,
    );
    nextShake *= Math.pow(0.9, frameScale);
    if (nextShake < 0.5) nextShake = 0;
  }

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = `12px ${GAME_FONT}`;
  backgroundParticles.forEach(particle => {
    ctx.fillStyle = '#2e2e2e';
    ctx.globalAlpha = particle.opacity;
    ctx.fillText(particle.text, particle.x, particle.y);
  });
  ctx.globalAlpha = 1;

  if (stats.combo >= 5) {
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold 120px ${GAME_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${stats.combo}x`, 0, 0);
    ctx.restore();
  }

  ctx.strokeStyle = '#2e2e2e';
  ctx.lineWidth = 1;
  for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  if (player.invulnerable <= 0 || Math.floor(Date.now() / 50) % 2 === 0) {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

    if (player.shield > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      ctx.strokeStyle = '#0db7ed';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (player.specialCharge >= MAX_SPECIAL_CHARGE) {
      const pulsate = Math.sin(timestamp * 0.01) * 5;
      ctx.beginPath();
      ctx.arc(0, 0, 40 + pulsate, 0, Math.PI * 2);
      ctx.strokeStyle = COLORS.class;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(15, 15);
    ctx.lineTo(0, 10);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fillStyle = player.speedBuff > 0 ? COLORS.warning : COLORS.statusBar;
    ctx.fill();

    const ammoPct = player.ammo / player.maxAmmo;
    ctx.fillStyle = '#333';
    ctx.fillRect(-20, 25, 40, 4);
    ctx.fillStyle = player.isReloading ? COLORS.error : COLORS.class;
    ctx.fillRect(-20, 25, 40 * ammoPct, 4);
    ctx.restore();
  }

  const hpPct = Math.max(0, player.hp / player.maxHp);
  const hpHudX = 12;
  const hpHudY = 12;
  const hpBarWidth = 92;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = 'rgba(30,30,30,0.72)';
  ctx.fillRect(hpHudX, hpHudY, 148, 18);
  ctx.strokeStyle = '#3c3c3c';
  ctx.strokeRect(hpHudX, hpHudY, 148, 18);
  ctx.fillStyle = '#858585';
  ctx.font = `10px ${GAME_FONT}`;
  ctx.fillText(t('hpLabel'), hpHudX + 6, hpHudY + 12);
  ctx.fillStyle = '#333333';
  ctx.fillRect(hpHudX + 24, hpHudY + 5, hpBarWidth, 8);
  ctx.fillStyle = hpPct > 0.6 ? COLORS.class : hpPct > 0.3 ? COLORS.warning : COLORS.error;
  ctx.fillRect(hpHudX + 24, hpHudY + 5, hpBarWidth * hpPct, 8);
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`${Math.max(0, Math.ceil(player.hp))}/${player.maxHp}`, hpHudX + 120, hpHudY + 12);
  ctx.restore();

  ctx.font = `20px ${GAME_FONT}`;
  enemyProjectiles.forEach(projectile => {
    ctx.fillStyle = projectile.color;
    ctx.fillText(projectile.label, projectile.x - 10, projectile.y);
  });

  enemies.forEach(enemy => {
    ctx.save();
    ctx.fillStyle = enemy.flashTimer > 0 ? '#ffffff' : enemy.color;
    ctx.font = `bold ${enemy.type === 'MONOLITH' ? '24px' : '16px'} ${GAME_FONT}`;
    ctx.fillText(enemy.text, enemy.x, enemy.y + 20);
    ctx.restore();

    const hpRatio = enemy.hp / enemy.maxHp;
    if (hpRatio < 1) {
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, enemy.y - 5, enemy.width, 3);
      ctx.fillStyle = enemy.flashTimer > 0 ? '#ffffff' : enemy.color;
      ctx.fillRect(enemy.x, enemy.y - 5, enemy.width * hpRatio, 3);
    }
  });

  projectiles.forEach(projectile => {
    ctx.fillStyle = projectile.color;
    if (projectile.type === 'SUDO_BLAST') {
      ctx.font = `10px ${GAME_FONT}`;
      ctx.fillText('sudo', projectile.x - 5, projectile.y);
    } else {
      ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
    }
  });

  ctx.font = '20px sans-serif';
  powerUps.forEach(powerUp => ctx.fillText(powerUp.icon, powerUp.x, powerUp.y + 20));

  particles.forEach(particle => {
    if (particle.id === 'shockwave') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, (1 - particle.life) * 600, 0, Math.PI * 2);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 10 * particle.life;
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.fillText(particle.char, particle.x, particle.y);
    }
  });
  ctx.globalAlpha = 1;

  ctx.font = `bold 14px ${GAME_FONT}`;
  floatingTexts.forEach(text => {
    ctx.fillStyle = text.color;
    ctx.fillText(text.text, text.x, text.y);
  });

  const monolith = enemies.find(enemy => enemy.type === 'MONOLITH');
  if (monolith) {
    const barWidth = CANVAS_WIDTH * 0.6;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const hpRatio = Math.max(0, monolith.hp / monolith.maxHp);
    const isRage = monolith.hp < monolith.maxHp * 0.5;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, 20, barWidth, 15);
    ctx.fillStyle = isRage ? COLORS.error : '#f14c4c';
    ctx.fillRect(barX, 20, barWidth * hpRatio, 15);
    ctx.strokeStyle = isRage ? COLORS.warning : '#fff';
    ctx.strokeRect(barX, 20, barWidth, 15);
    ctx.fillStyle = isRage ? COLORS.warning : '#fff';
    ctx.textAlign = 'center';
    ctx.font = `bold 12px ${GAME_FONT}`;
    ctx.fillText(
      isRage
        ? t('bossBarPhase2', { wave: stats.wave })
        : t('bossBar', { wave: stats.wave }),
      CANVAS_WIDTH / 2,
      15,
    );
    ctx.textAlign = 'left';
  }

  if (player.invulnerable > 0 && player.invulnerable % 10 > 5) {
    const gradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT / 3,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_HEIGHT,
    );
    gradient.addColorStop(0, 'rgba(255,0,0,0)');
    gradient.addColorStop(1, 'rgba(255,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }

  const minimapWidth = 60;
  const minimapScale = 0.08;
  const minimapX = CANVAS_WIDTH - minimapWidth;
  ctx.fillStyle = 'rgba(30,30,30,0.8)';
  ctx.fillRect(minimapX, 0, minimapWidth, CANVAS_HEIGHT);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(minimapX, 0);
  ctx.lineTo(minimapX, CANVAS_HEIGHT);
  ctx.stroke();

  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.type === 'MONOLITH' ? COLORS.error : COLORS.warning;
    ctx.fillRect(
      minimapX + enemy.x * minimapScale,
      enemy.y * minimapScale,
      Math.max(2, enemy.width * minimapScale),
      Math.max(2, enemy.height * minimapScale),
    );
  });
  ctx.fillStyle = COLORS.statusBar;
  ctx.fillRect(minimapX + player.x * minimapScale, player.y * minimapScale, 4, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(minimapX, 0, minimapWidth, CANVAS_HEIGHT * minimapScale * 3);

  ctx.restore();
  return nextShake;
}
