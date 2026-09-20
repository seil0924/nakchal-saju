import { describe, it, expect, beforeEach, vi } from 'vitest';

// jsdom 대신 경량 목(mock) — Node 20 에서 jsdom 의존성(html-encoding-sniffer →
// @exodus/bytes)이 require(ESM) 로 깨지는 문제를 피한다. scope.ts 는 window·localStorage 만 쓴다.
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
  (globalThis as any).window = {};
  (globalThis as any).localStorage = makeStorage();
  vi.resetModules();
});

describe('scope — 계정별 저장 격리 (보안)', () => {
  it('키를 소유자 네임스페이스로 분리해 저장', async () => {
    (globalThis as any).window.__NK_SCOPE__ = 'userA';
    const s = await import('../scope');
    s.sset('nakchal_people_v1', 'A-data');
    expect(s.scopedKey('nakchal_people_v1')).toBe('nakchal_people_v1::userA');
    expect(localStorage.getItem('nakchal_people_v1::userA')).toBe('A-data');
  });

  it('스코프 미지정 시 guest 로 폴백', async () => {
    delete (globalThis as any).window.__NK_SCOPE__;
    const s = await import('../scope');
    expect(s.getScope()).toBe('guest');
  });

  it('계정 격리 — B 는 A 의 데이터를 못 읽음', async () => {
    (globalThis as any).window.__NK_SCOPE__ = 'userA';
    const a = await import('../scope');
    a.sset('nakchal_people_v1', 'A-data');

    vi.resetModules();
    (globalThis as any).window.__NK_SCOPE__ = 'userB';
    const b = await import('../scope');

    expect(b.sget('nakchal_people_v1')).toBeNull(); // B 계정엔 없음
    b.sset('nakchal_people_v1', 'B-data');

    // 두 계정 데이터가 서로 다른 키에 독립 보존
    expect(localStorage.getItem('nakchal_people_v1::userA')).toBe('A-data');
    expect(localStorage.getItem('nakchal_people_v1::userB')).toBe('B-data');
  });

  it('srem 은 해당 스코프 키만 제거', async () => {
    (globalThis as any).window.__NK_SCOPE__ = 'userA';
    const s = await import('../scope');
    s.sset('nakchal_vault_v1', 'x');
    expect(s.sget('nakchal_vault_v1')).toBe('x');
    s.srem('nakchal_vault_v1');
    expect(s.sget('nakchal_vault_v1')).toBeNull();
  });
});

// 로그인 쿠키에서 uid 읽기 — 서버가 매 요청 로그인 조회를 하지 않으려고 브라우저가 직접 읽는다(2026-09-21)
describe('uidFromCookie', () => {
  const sess = (id: string) => 'base64-' + Buffer.from(JSON.stringify({ user: { id } })).toString('base64');
  it('한 조각짜리 쿠키', async () => {
    const { uidFromCookie } = await import('../scope');
    expect(uidFromCookie(`a=1; sb-abcd-auth-token=${sess('u-1')}; b=2`)).toBe('u-1');
  });
  it('쪼개진 쿠키는 번호 순으로 이어 붙인다', async () => {
    const { uidFromCookie } = await import('../scope');
    const v = sess('u-2'); const h = Math.ceil(v.length / 2);
    const c = `sb-x-auth-token.1=${v.slice(h)}; sb-x-auth-token.0=${v.slice(0, h)}`;
    expect(uidFromCookie(c)).toBe('u-2');
  });
  it('토큰만 있으면 JWT 의 sub 를 본다', async () => {
    const { uidFromCookie } = await import('../scope');
    const b64 = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const jwt = `${b64({ alg: 'x' })}.${b64({ sub: 'u-3' })}.sig`;
    expect(uidFromCookie('sb-y-auth-token=' + 'base64-' + Buffer.from(JSON.stringify({ access_token: jwt })).toString('base64'))).toBe('u-3');
  });
  it('없거나 깨졌으면 null — 남의 데이터로 새지 않는다', async () => {
    const { uidFromCookie } = await import('../scope');
    expect(uidFromCookie('')).toBeNull();
    expect(uidFromCookie('other=1')).toBeNull();
    expect(uidFromCookie('sb-z-auth-token=깨진값')).toBeNull();
  });
});
