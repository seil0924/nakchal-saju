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
  (globalThis as any).window = { __NK_SCOPE__: 'userV' };
  (globalThis as any).localStorage = makeStorage();
  vi.resetModules();
});

const item = (id: string, unlocked = false) => ({ id, label: 'L' + id, when: 1000, unlocked });

describe('vault — 보관함 저장', () => {
  it('recordReport 후 listVault 로 조회', async () => {
    const V = await import('../vault');
    V.recordReport(item('r1'));
    expect(V.listVault().map((x) => x.id)).toEqual(['r1']);
  });

  it('같은 id 재기록 시 중복 없이 맨 앞으로', async () => {
    const V = await import('../vault');
    V.recordReport(item('r1'));
    V.recordReport(item('r2'));
    V.recordReport(item('r1')); // r1 갱신 → 앞으로
    const ids = V.listVault().map((x) => x.id);
    expect(ids).toEqual(['r1', 'r2']);
  });

  it('markUnlocked 는 해당 항목만 unlocked=true', async () => {
    const V = await import('../vault');
    V.recordReport(item('r1'));
    V.recordReport(item('r2'));
    V.markUnlocked('r1');
    const list = V.listVault();
    expect(list.find((x) => x.id === 'r1')?.unlocked).toBe(true);
    expect(list.find((x) => x.id === 'r2')?.unlocked).toBe(false);
  });

  it('removeVault 로 삭제', async () => {
    const V = await import('../vault');
    V.recordReport(item('r1'));
    V.removeVault('r1');
    expect(V.listVault()).toEqual([]);
  });

  it('50건 상한 유지', async () => {
    const V = await import('../vault');
    for (let i = 0; i < 60; i++) V.recordReport(item('r' + i));
    expect(V.listVault().length).toBeLessThanOrEqual(50);
  });
});
