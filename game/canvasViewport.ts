import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants';

export interface CanvasViewport {
  cssHeight: number;
  cssWidth: number;
  pixelHeight: number;
  pixelWidth: number;
}

export function calculateCanvasViewport(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio = 1,
): CanvasViewport {
  const availableWidth = containerWidth > 0 ? containerWidth : CANVAS_WIDTH;
  const availableHeight = containerHeight > 0 ? containerHeight : CANVAS_HEIGHT;
  const cssScale = Math.min(
    availableWidth / CANVAS_WIDTH,
    availableHeight / CANVAS_HEIGHT,
    1,
  );
  const cssWidth = Math.max(1, Math.floor(CANVAS_WIDTH * cssScale));
  const cssHeight = Math.max(1, Math.floor(CANVAS_HEIGHT * cssScale));
  const pixelRatio = Math.max(1, Math.min(3, devicePixelRatio || 1));

  return {
    cssWidth,
    cssHeight,
    pixelWidth: Math.round(cssWidth * pixelRatio),
    pixelHeight: Math.round(cssHeight * pixelRatio),
  };
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  devicePixelRatio = window.devicePixelRatio,
): boolean {
  const container = canvas.parentElement?.getBoundingClientRect();
  const viewport = calculateCanvasViewport(
    container?.width ?? CANVAS_WIDTH,
    container?.height ?? CANVAS_HEIGHT,
    devicePixelRatio,
  );

  canvas.style.width = `${viewport.cssWidth}px`;
  canvas.style.height = `${viewport.cssHeight}px`;

  const changed = (
    canvas.width !== viewport.pixelWidth
    || canvas.height !== viewport.pixelHeight
  );
  if (changed) {
    canvas.width = viewport.pixelWidth;
    canvas.height = viewport.pixelHeight;
  }

  return changed;
}

export function prepareGameContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(
    canvas.width / CANVAS_WIDTH,
    0,
    0,
    canvas.height / CANVAS_HEIGHT,
    0,
    0,
  );
  ctx.imageSmoothingEnabled = false;
  return ctx;
}
