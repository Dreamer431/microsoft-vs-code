import { describe, expect, it } from 'vitest';
import { calculateCanvasViewport } from './canvasViewport';

describe('canvas viewport', () => {
  it('uses device pixels without changing the logical CSS size', () => {
    expect(calculateCanvasViewport(1200, 900, 1.5)).toEqual({
      cssWidth: 800,
      cssHeight: 600,
      pixelWidth: 1200,
      pixelHeight: 900,
    });
  });

  it('fits smaller containers while preserving the aspect ratio', () => {
    expect(calculateCanvasViewport(400, 500, 2)).toEqual({
      cssWidth: 400,
      cssHeight: 300,
      pixelWidth: 800,
      pixelHeight: 600,
    });
  });

  it('caps excessive pixel density', () => {
    const viewport = calculateCanvasViewport(800, 600, 5);

    expect(viewport.pixelWidth).toBe(2400);
    expect(viewport.pixelHeight).toBe(1800);
  });
});
