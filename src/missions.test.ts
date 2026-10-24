import { getTraitorTask, MISSIONS, selectMission, TRAITOR_TASKS } from './missions';
import { seededRandomInt } from './test/seeded';

describe('missions', () => {
  it('have unique ids, content and a matching Traitor task', () => {
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(MISSIONS.length);
    expect(MISSIONS.length).toBeGreaterThan(1);
    for (const m of MISSIONS) {
      expect(m.title).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(TRAITOR_TASKS[m.id]).toBeTruthy();
    }
    for (const id of Object.keys(TRAITOR_TASKS)) expect(MISSIONS.some((m) => m.id === id)).toBe(true);
  });

  it('never repeats the previous mission when alternatives exist', () => {
    const rng = seededRandomInt(42);
    let previous: string | null = null;
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const mission = selectMission(previous, MISSIONS, rng);
      expect(mission.id).not.toBe(previous);
      seen.add(mission.id);
      previous = mission.id;
    }
    expect(seen.size).toBe(MISSIONS.length);
  });

  it('reuses the only mission when there is no alternative', () => {
    const only = [MISSIONS[0]];
    expect(selectMission(MISSIONS[0].id, only).id).toBe(MISSIONS[0].id);
  });

  it('falls back to a generic Traitor task', () => {
    expect(getTraitorTask('glass-act')).toBe(TRAITOR_TASKS['glass-act']);
    expect(getTraitorTask('unknown')).toBeTruthy();
  });
});
