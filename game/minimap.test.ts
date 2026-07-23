import { describe, expect, it } from 'vitest';
import {
  CANVAS_HEIGHT,
  MINIMAP_WIDTH,
  PLAYFIELD_WIDTH,
} from '../constants';
import { projectToMinimap } from './minimap';

describe('minimap projection', () => {
  it('uses the complete vertical minimap height', () => {
    const top = projectToMinimap({ x: 0, y: 0, width: 0, height: 0 });
    const bottom = projectToMinimap({
      x: 0,
      y: CANVAS_HEIGHT,
      width: 0,
      height: 0,
    });

    expect(top.y).toBe(5);
    expect(bottom.y).toBe(CANVAS_HEIGHT - 5);
  });

  it('maps the playable width inside the minimap rail', () => {
    const left = projectToMinimap({ x: 0, y: 0, width: 0, height: 0 });
    const right = projectToMinimap({
      x: PLAYFIELD_WIDTH,
      y: 0,
      width: 0,
      height: 0,
    });

    expect(left.x).toBe(PLAYFIELD_WIDTH + 5);
    expect(right.x).toBe(PLAYFIELD_WIDTH + MINIMAP_WIDTH - 5);
  });

  it('clamps entities that are entering from outside the world', () => {
    const point = projectToMinimap({
      x: -100,
      y: -100,
      width: 20,
      height: 20,
    });

    expect(point).toEqual({ x: PLAYFIELD_WIDTH + 5, y: 5 });
  });
});
