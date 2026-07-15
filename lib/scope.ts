// lib/scope.ts — 계정별 저장 격리(namespacing)
// 모든 개인 데이터 localStorage 키를 현재 로그인 소유자(uid) 네임스페이스로 분리한다.
// 소유자 uid는 서버가 첫 HTML에 window.__NK_SCOPE__ 로 주입 → 첫 렌더부터 동기적으로 올바른 계정 데이터만 읽음.
// 로그인/로그아웃은 전체 새로고침(window.location)이라 모듈이 새 스코프로 다시 초기화된다.
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

function init() {
  if (inited || typeof window === 'undefined') return;
  inited = true;
  SCOPE = (window as any).__NK_SCOPE__ || 'guest';
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
