import { describe, it, expect, beforeEach, vi } from 'vitest';

function makeStorage() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => { m.set(k, String(v)); },
    removeItem: (k: string) => { m.delete(k); },
    clear: () => m.clear(),
  };
}

beforeEach(() => {
  (globalThis as any).window = { __NK_SCOPE__: 'userP' };
  (globalThis as any).localStorage = makeStorage();
  vi.resetModules();
});

describe('people — 사람/업체 저장소', () => {
  it('savePerson 저장 후 loadPeople 로 조회', async () => {
    const P = await import('../people');
    const rec = P.savePerson({ kind: 'self', name: '오세일', date: '1993-09-24' });
    expect(rec.id).toBeTruthy();
    const all = P.loadPeople();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe('오세일');
    expect(all[0].cal).toBe('solar'); // 기본값
  });

  it('peopleOf 는 kind 로 필터', async () => {
    const P = await import('../people');
    P.savePerson({ kind: 'self', name: '대표', date: '1990-01-01' });
    P.savePerson({ kind: 'client', name: '조달청', date: '1961-10-02' });
    expect(P.peopleOf('self').map((p) => p.name)).toEqual(['대표']);
    expect(P.peopleOf('client').map((p) => p.name)).toEqual(['조달청']);
  });

  it('동일 kind+date+name 재저장 시 중복 제거', async () => {
    const P = await import('../people');
    P.savePerson({ kind: 'client', name: '조달청', date: '1961-10-02' });
    P.savePerson({ kind: 'client', name: '조달청', date: '1961-10-02' });
    expect(P.peopleOf('client')).toHaveLength(1);
  });

  it('최근 저장이 앞으로 (unshift)', async () => {
    const P = await import('../people');
    P.savePerson({ kind: 'client', name: 'A', date: '2000-01-01' });
    P.savePerson({ kind: 'client', name: 'B', date: '2000-01-02' });
    expect(P.loadPeople()[0].name).toBe('B');
  });

  it('removePerson 으로 삭제', async () => {
    const P = await import('../people');
    const rec = P.savePerson({ kind: 'self', name: 'X', date: '2000-01-01' });
    P.removePerson(rec.id);
    expect(P.loadPeople()).toHaveLength(0);
  });

  it('60건 상한 유지', async () => {
    const P = await import('../people');
    for (let i = 0; i < 70; i++) P.savePerson({ kind: 'client', name: 'C' + i, date: '2000-01-01' });
    expect(P.loadPeople().length).toBeLessThanOrEqual(60);
  });

  it('window 없으면 빈 배열 (SSR 가드)', async () => {
    delete (globalThis as any).window;
    const P = await import('../people');
    expect(P.loadPeople()).toEqual([]);
  });

  it('migrateLegacy: 레거시 분산 저장(self)을 통합 키로 이관', async () => {
    const scope = await import('../scope');
    localStorage.setItem(scope.scopedKey('nakchal_self_v1'), JSON.stringify([{ name: '대표', birth: '1990-01-01' }]));
    const P = await import('../people');
    expect(P.loadPeople()).toHaveLength(0); // 이관 전
    P.migrateLegacy();
    expect(P.loadPeople().some((p) => p.kind === 'self' && p.name === '대표')).toBe(true);
  });
});
