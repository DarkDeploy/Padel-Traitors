import { COURT_DARES, FAITHFUL_MISSIONS, getDare, pickMission, SIDE_DARES } from './missions';
import { seededRandomInt } from './test/seeded';

describe('missions', () => {
  it.each([
    ['Faithful', FAITHFUL_MISSIONS, 20],
    ['court dare', COURT_DARES, 10],
    ['side dare', SIDE_DARES, 10],
  ])('%s list has unique ids and text', (_, pool, min) => {
    expect(new Set(pool.map((m) => m.id)).size).toBe(pool.length);
    expect(pool.length).toBeGreaterThanOrEqual(min);
    for (const m of pool) {
      expect(m.title).toBeTruthy();
      expect(m.text).toBeTruthy();
    }
  });

  it('keeps ids unique across all lists', () => {
    const all = [...FAITHFUL_MISSIONS, ...COURT_DARES, ...SIDE_DARES].map((m) => m.id);
    expect(new Set(all).size).toBe(all.length);
    expect(getDare(COURT_DARES[0].id)).toBe(COURT_DARES[0]);
    expect(getDare(SIDE_DARES[0].id)).toBe(SIDE_DARES[0]);
    expect(getDare(FAITHFUL_MISSIONS[0].id)).toBeUndefined();
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
