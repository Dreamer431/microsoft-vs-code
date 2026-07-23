import { describe, expect, it } from 'vitest';
import {
  pickUpgradeChoices,
  selectEnemyDefinition,
  selectPowerUpDefinition,
} from './contentSelection';

describe('content selection', () => {
  it('selects wave-specific enemy definitions', () => {
    expect(selectEnemyDefinition('RANDOM', 1, () => 0.1).type).toBe('BUG');
    expect(selectEnemyDefinition('RANDOM', 1, () => 0.9).type).toBe('SYNTAX_ERROR');
    expect(selectEnemyDefinition('RANDOM', 3, () => 0.95).type).toBe('RACE_CONDITION');
  });

  it('returns a requested enemy definition directly', () => {
    expect(selectEnemyDefinition('MEMORY_LEAK', 1).type).toBe('MEMORY_LEAK');
  });

  it('picks distinct upgrades and respects the requested count', () => {
    const choices = pickUpgradeChoices(3, () => 0);
    expect(choices).toHaveLength(3);
    expect(new Set(choices.map(choice => choice.id)).size).toBe(3);
  });

  it('uses configured power-up weights', () => {
    expect(selectPowerUpDefinition(() => 0).type).toBe('COFFEE');
    expect(selectPowerUpDefinition(() => 0.999).type).toBe('HOTFIX');
  });
});
