import { describe, expect, it } from 'vitest';
import { intersects } from './collision';

const box = (x: number, y: number, width = 10, height = 10) => ({ x, y, width, height });

describe('intersects', () => {
  it('detects overlapping bounds', () => {
    expect(intersects(box(0, 0), box(5, 5))).toBe(true);
  });

  it('does not count edge-touching bounds as overlap', () => {
    expect(intersects(box(0, 0), box(10, 0))).toBe(false);
  });

  it('detects containment in either direction', () => {
    expect(intersects(box(0, 0, 20, 20), box(5, 5, 2, 2))).toBe(true);
    expect(intersects(box(5, 5, 2, 2), box(0, 0, 20, 20))).toBe(true);
  });
});
