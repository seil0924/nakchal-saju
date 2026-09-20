// lib/scope.ts — 계정별 저장 격리(namespacing)
// 모든 개인 데이터 localStorage 키를 현재 로그인 소유자(uid) 네임스페이스로 분리한다.
// 소유자 uid는 브라우저가 로그인 쿠키에서 동기적으로 읽는다 → 첫 렌더부터 올바른 계정 데이터만 읽음.
// 로그인/로그아웃은 전체 새로고침(window.location)이라 모듈이 새 스코프로 다시 초기화된다.
//
// 2026-09-21 이전에는 서버가 매 요청 로그인 조회를 해서 첫 HTML 에 window.__NK_SCOPE__ 를 심었다.
// 그 한 줄 때문에 사이트 전체(62개 경로)가 정적 파일이 되지 못하고 접속마다 서버에서 다시 그려졌다
// — Vercel 무료 CPU 한도를 잡아먹은 원인. 쿠키는 브라우저에도 있으니 여기서 읽는다.
'use client';

const PERSONAL_KEYS = [
  'nakchal_people_v1',
  'nakchal_vault_v1',
  'nakchal_saved_targets_v1',
  'nakchal_self_v1',
  'nakchal_legal_v1',
];

let SCOPE = 'guest';
let inited = false;

// Supabase 로그인 쿠키에서 uid 를 꺼낸다.
// 쿠키 이름은 sb-<프로젝트>-auth-token 이고, 값은 세션 JSON 을 base64 로 담은 것이다.
// 4KB 가 넘으면 .0 .1 로 쪼개 저장되므로 번호 순으로 이어 붙인다.
// 못 읽으면 'guest' — 남의 데이터를 보여주는 쪽으로는 틀리지 않는다.
export function uidFromCookie(cookie: string): string | null {
  try {
    const parts: [number, string][] = [];
    for (const kv of String(cookie).split(';')) {
      const i = kv.indexOf('=');
      if (i < 0) continue;
      const k = kv.slice(0, i).trim(), v = kv.slice(i + 1).trim();
      const m = /^sb-.+-auth-token(?:\.(\d+))?$/.exec(k);
      if (m) parts.push([m[1] ? Number(m[1]) : 0, v]);
    }
    if (!parts.length) return null;
    let raw = decodeURIComponent(parts.sort((a, b) => a[0] - b[0]).map(p => p[1]).join(''));
    if (raw.startsWith('base64-')) raw = atob(raw.slice(7));
    const s = JSON.parse(raw);
    const id = s?.user?.id;
    if (typeof id === 'string' && id) return id;
    const t = s?.access_token;   // 세션에 user 가 없으면 토큰(JWT)의 sub
    if (typeof t === 'string' && t.split('.').length === 3) {
      const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const sub = JSON.parse(atob(b + '='.repeat((4 - b.length % 4) % 4)))?.sub;
      if (typeof sub === 'string' && sub) return sub;
    }
    return null;
  } catch { return null; }
}

function init() {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  SCOPE = (window as any).__NK_SCOPE__ || uidFromCookie(typeof document === 'undefined' ? '' : document.cookie || '') || 'guest';
  try {
    // 최초 1회: 계정 격리 도입 이전의 '전역' 키를 현재 스코프로 이관(기존 유저 데이터 보존)
    if (!localStorage.getItem('nakchal_scope_init')) {
      for (const base of PERSONAL_KEYS) {
        const legacy = localStorage.getItem(base);
        if (legacy != null && localStorage.getItem(`${base}::${SCOPE}`) == null) {
          localStorage.setItem(`${base}::${SCOPE}`, legacy);
        }
        try { localStorage.removeItem(base); } catch {} // 전역 잔재 제거(다른 계정에 노출 방지)
      }
      localStorage.setItem('nakchal_scope_init', '1');
    }
  } catch {}
}

export function getScope(): string { init(); return SCOPE; }
export function scopedKey(base: string): string { init(); return `${base}::${SCOPE}`; }

export function sget(base: string): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem(scopedKey(base)); } catch { return null; }
}
export function sset(base: string, value: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(scopedKey(base), value); } catch {}
}
export function srem(base: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(scopedKey(base)); } catch {}
}
