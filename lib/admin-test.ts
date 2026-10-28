// lib/admin-test.ts — 운영자·점검 계정 가려내기.
// 회원·결제 목록에 운영자가 직접 해 본 가입·결제가 섞여 손님 숫자를 읽기 어려웠다(2026-10-28).
// 지우지 않고 목록에서만 기본으로 숨긴다. 관리자 화면의 '점검·운영' 칸에서 다시 볼 수 있다.
// 여기서 못 거른 계정이 있으면 TEST_NAMES 에 이름을 더한다.

// 운영자가 점검할 때 쓰는 이름. 리포트 원문 조회의 빠른 찾기(QUICK)와 같은 목록이다.
export const TEST_NAMES = ['점검용', '오세일'];

const WORD = /(점검|테스트|test|qa\b|dummy|더미|example|sample|샘플)/i;

export function isTestName(name?: string | null): boolean {
  const n = (name ?? '').trim();
  if (!n) return false;
  return TEST_NAMES.includes(n) || WORD.test(n);
}

export function isTestEmail(email?: string | null): boolean {
  const e = (email ?? '').trim().toLowerCase();
  if (!e) return false;
  const local = e.split('@')[0];
  // qa1@, qa.kim@ 처럼 메일 앞머리는 낱말 경계가 없다. qa 로 시작하거나 +qa, +test 가 붙은 것도 점검으로 본다.
  return WORD.test(local) || /^qa[\d._+-]/.test(local) || /\+(qa|test)/.test(local) || /@(example\.|test\.)/.test(e);
}

// 회원 한 명이 운영·점검 계정인가. 관리자 권한(profiles.role='admin')은 무조건 운영자다.
export function isTestProfile(p: { role?: string | null; name?: string | null; email?: string | null }): boolean {
  return p.role === 'admin' || isTestName(p.name) || isTestEmail(p.email);
}

// 메일 앞머리에서 . _ - 를 뺀 모양. oh_kim 과 ohkim 을 같은 사람으로 본다.
const bare = (email?: string | null) => (email ?? '').toLowerCase().split('@')[0].replace(/[._-]/g, '');

// 회원 목록 전체를 보고 운영·점검 계정 id 를 고른다. 한 명씩 볼 때보다 둘을 더 잡는다.
//  1) 관리자 계정과 메일 앞머리가 같은 계정: 운영자가 다른 메일로 가입해 본 것(2026-10-28 실제로 있었다)
//  2) 이름도 메일도 없는 빈 계정: 손님이면 연락할 길도 없고, 가입 점검 때 생긴 것이었다
export function testIdsOf(profiles: { id: string; role?: string | null; name?: string | null; email?: string | null }[]): Set<string> {
  const out = new Set<string>();
  const adminBare = new Set(profiles.filter(p => p.role === 'admin').map(p => bare(p.email)).filter(Boolean));
  for (const p of profiles) {
    if (isTestProfile(p)) out.add(p.id);
    else if (p.email && adminBare.has(bare(p.email))) out.add(p.id);
    else if (!(p.name ?? '').trim() && !(p.email ?? '').trim()) out.add(p.id);
  }
  return out;
}
