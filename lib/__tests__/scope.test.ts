// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// scope.ts 는 모듈 로드 시점의 window.__NK_SCOPE__ 로 SCOPE 를 1회 고정한다.
// 다른 스코프를 검증하려면 resetModules 후 재-import 해야 한다.
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe('scope — 계정별 저장 격리 (보안)', () => {
  it('키를 소유자 네임스페이스로 분리해 저장', async () => {
    (window as any).__NK_SCOPE__ = 'userA';
    const s = await import('../scope');
    s.sset('nakchal_people_v1', 'A-data');
    expect(s.scopedKey('nakchal_people_v1')).toBe('nakchal_people_v1::userA');
    expect(localStorage.getItem('nakchal_people_v1::userA')).toBe('A-data');
  });

  it('스코프 미지정 시 guest 로 폴백', async () => {
    delete (window as any).__NK_SCOPE__;
    const s = await import('../scope');
    expect(s.getScope()).toBe('guest');
  });

  it('계정 격리 — B 는 A 의 데이터를 못 읽음', async () => {
    (window as any).__NK_SCOPE__ = 'userA';
    const a = await import('../scope');
    a.sset('nakchal_people_v1', 'A-data');

    vi.resetModules();
    (window as any).__NK_SCOPE__ = 'userB';
    const b = await import('../scope');

    expect(b.sget('nakchal_people_v1')).toBeNull(); // B 계정엔 없음
    b.sset('nakchal_people_v1', 'B-data');

    // 두 계정 데이터가 서로 다른 키에 독립 보존
    expect(localStorage.getItem('nakchal_people_v1::userA')).toBe('A-data');
    expect(localStorage.getItem('nakchal_people_v1::userB')).toBe('B-data');
  });

  it('srem 은 해당 스코프 키만 제거', async () => {
    (window as any).__NK_SCOPE__ = 'userA';
    const s = await import('../scope');
    s.sset('nakchal_vault_v1', 'x');
    expect(s.sget('nakchal_vault_v1')).toBe('x');
    s.srem('nakchal_vault_v1');
    expect(s.sget('nakchal_vault_v1')).toBeNull();
  });
});
