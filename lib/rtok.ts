// lib/rtok.ts — 리포트 접근토큰(access_token) 클라이언트 보관.
// 비회원(owner=null) 리포트를 reportId만으로 열람하던 IDOR를 막기 위해, 리포트 생성 시 발급된
// 토큰을 로컬에 보관하고 /api/report/get|paid 호출·공유링크에 ?t= 로 실어보낸다.
'use client';
import { sget, sset } from '@/lib/scope';

const KEY = 'nk_rtok_v1';

function all(): Record<string, string> {
  try { return JSON.parse(sget(KEY) || '{}') as Record<string, string>; } catch { return {}; }
}

export function setTok(id?: string | null, tok?: string | null): void {
  if (!id || !tok) return;
  const m = all(); m[id] = tok;
  try { sset(KEY, JSON.stringify(m)); } catch { /* 저장 실패 무시 */ }
}

export function getTok(id?: string | null): string | null {
  if (!id) return null;
  return all()[id] ?? null;
}

// API 호출/공유링크에 쓸 t 값. 우선순위: URL의 ?t= → 저장 토큰 → id(레거시 백필=id 대응).
export function tokParam(id: string, urlT?: string | null): string {
  return urlT || getTok(id) || id;
}
