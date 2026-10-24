import { MISSIONS, selectMissions } from './missions';
import { seededRandomInt } from './test/seeded';

describe('missions', () => {
  it('have unique ids and text for both sides', () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    expect(MISSIONS.length).toBeGreaterThanOrEqual(20);
    for (const m of MISSIONS) {
      expect(m.title).toBeTruthy();
      expect(m.faithful).toBeTruthy();
      expect(m.traitor).toBeTruthy();
    }
  });

  it('gives each side a different mission and avoids repeats between rounds', () => {
    const rng = seededRandomInt(42);
    let prevF: string | null = null;
    let prevT: string | null = null;
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const { faithful, traitor } = selectMissions(prevF, prevT, MISSIONS, rng);
      expect(faithful.id).not.toBe(traitor.id);
      expect(faithful.id).not.toBe(prevF);
      expect(traitor.id).not.toBe(prevT);
      seen.add(faithful.id);
      prevF = faithful.id;
      prevT = traitor.id;
    }
    expect(seen.size).toBe(MISSIONS.length);
  });

  it('still works with only two missions', () => {
    const two = MISSIONS.slice(0, 2);
    const { faithful, traitor } = selectMissions(two[0].id, two[1].id, two);
    expect(faithful.id).toBe(two[1].id);
    expect(traitor.id).toBe(two[0].id);
  });

  it('needs at least two missions', () => {
    expect(() => selectMissions(null, null, MISSIONS.slice(0, 1))).toThrow();
  });
});
