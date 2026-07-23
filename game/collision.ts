import type { Entity } from '../types';

type Bounds = Pick<Entity, 'x' | 'y' | 'width' | 'height'>;

export function intersects(first: Bounds, second: Bounds): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}
