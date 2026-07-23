import {
  CANVAS_HEIGHT,
  MINIMAP_WIDTH,
  PLAYFIELD_WIDTH,
  COLORS,
} from '../constants';
import type { Enemy, Player } from '../types';

const MINIMAP_PADDING = 5;

interface WorldMarker {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MinimapPoint {
  x: number;
  y: number;
}

export function projectToMinimap(marker: WorldMarker): MinimapPoint {
  const normalizedX = Math.max(
    0,
    Math.min(1, (marker.x + marker.width / 2) / PLAYFIELD_WIDTH),
  );
  const normalizedY = Math.max(
    0,
    Math.min(1, (marker.y + marker.height / 2) / CANVAS_HEIGHT),
  );
  const contentWidth = MINIMAP_WIDTH - MINIMAP_PADDING * 2;
  const contentHeight = CANVAS_HEIGHT - MINIMAP_PADDING * 2;

  return {
    x: PLAYFIELD_WIDTH + MINIMAP_PADDING + normalizedX * contentWidth,
    y: MINIMAP_PADDING + normalizedY * contentHeight,
  };
}

export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  player: Player,
  enemies: readonly Enemy[],
): void {
  ctx.save();
  ctx.fillStyle = '#252526';
  ctx.fillRect(PLAYFIELD_WIDTH, 0, MINIMAP_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = '#454545';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PLAYFIELD_WIDTH + 0.5, 0);
  ctx.lineTo(PLAYFIELD_WIDTH + 0.5, CANVAS_HEIGHT);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(133,133,133,0.16)';
  for (let y = 100; y < CANVAS_HEIGHT; y += 100) {
    ctx.beginPath();
    ctx.moveTo(PLAYFIELD_WIDTH + 6, y + 0.5);
    ctx.lineTo(PLAYFIELD_WIDTH + MINIMAP_WIDTH - 6, y + 0.5);
    ctx.stroke();
  }

  enemies.forEach((enemy) => {
    const point = projectToMinimap(enemy);
    const markerWidth = enemy.type === 'MONOLITH' ? 8 : 4;
    const markerHeight = enemy.type === 'MONOLITH' ? 5 : 4;
    ctx.fillStyle = enemy.type === 'MONOLITH' ? COLORS.error : COLORS.warning;
    ctx.fillRect(
      Math.round(point.x - markerWidth / 2),
      Math.round(point.y - markerHeight / 2),
      markerWidth,
      markerHeight,
    );
  });

  const playerPoint = projectToMinimap(player);
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(Math.round(playerPoint.x - 4), Math.round(playerPoint.y - 4), 8, 8);
  ctx.fillStyle = COLORS.statusBar;
  ctx.fillRect(Math.round(playerPoint.x - 2), Math.round(playerPoint.y - 2), 5, 5);
  ctx.restore();
}
