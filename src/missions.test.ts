import { FAITHFUL_MISSIONS, pickMission, TRAITOR_MISSIONS } from './missions';
import { seededRandomInt } from './test/seeded';

describe('missions', () => {
  it.each([
    ['Faithful', FAITHFUL_MISSIONS],
    ['Traitor', TRAITOR_MISSIONS],
  ])('%s missions have unique ids and text', (_, pool) => {
    expect(new Set(pool.map((m) => m.id)).size).toBe(pool.length);
    expect(pool.length).toBeGreaterThanOrEqual(20);
    for (const m of pool) {
      expect(m.title).toBeTruthy();
      expect(m.text).toBeTruthy();
    }
  });

  it('keeps the two lists separate', () => {
    const faithfulIds = new Set(FAITHFUL_MISSIONS.map((m) => m.id));
    expect(TRAITOR_MISSIONS.some((m) => faithfulIds.has(m.id))).toBe(false);
  });

  it('never repeats the previous mission when alternatives exist', () => {
    const rng = seededRandomInt(42);
    let previous: string | null = null;
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const mission = pickMission(FAITHFUL_MISSIONS, previous, rng);
      expect(mission.id).not.toBe(previous);
      seen.add(mission.id);
      previous = mission.id;
    }
    expect(seen.size).toBe(FAITHFUL_MISSIONS.length);
  });

  it('reuses the only mission when there is no alternative', () => {
    const only = [FAITHFUL_MISSIONS[0]];
    expect(pickMission(only, only[0].id).id).toBe(only[0].id);
  });
});
