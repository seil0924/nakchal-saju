// lib/report-access.ts — 이 사람이 이 리포트의 결제 레벨을 볼 수 있는가(2026-10-23).
//
// /api/report/get(다시 열기)과 /api/report/paid(결제 직후)가 같은 질문에 다르게 답하고 있었다.
// 접근 토큰 칸이 없는 리포트(token=null)에서 get 만 '로그인한 사람'을 요구해, 비회원은 결제를 해도
// 다시 열면 늘 잠겨 보였다. 2026-10-22 첫 실제 손님이 그 화면을 보고 2분 뒤 같은 상품을 한 번 더 결제했다.
// 판정은 여기 한 곳에서만 한다.
export type AccessInput = {
  auth: boolean;              // 인증이 켜진 환경인가(데모면 false)
  userId: string | null;      // 로그인한 사람
  owner: string | null;       // 리포트 주인(비회원이면 null)
  token: string | null;       // 리포트 접근 토큰(칸이 없거나 비어 있으면 null)
  t: string | null;           // 요청에 실린 ?t=
  reportId?: string;          // 0007 백필 행(token = id)을 토큰 없는 리포트와 같게 다루려고 받는다
};

export function canViewPaid(a: AccessInput): boolean {
  if (!a.auth) return true;
  const isOwner = !!a.userId && !!a.owner && a.owner === a.userId;
  // 0007 은 기존 행 토큰을 id 로 채운다. 그 행은 브라우저마다 다른 값을 들고 있을 수 있어(예전엔 랜덤을 돌려줬다)
  // 토큰이 없던 때와 똑같이 다룬다. 새로 만든 행만 진짜 토큰을 따진다.
  const legacy = a.token === null || (!!a.reportId && a.token === a.reportId);
  if (legacy) return !a.owner || isOwner;   // 토큰 없는 리포트: 비회원 것은 주소가 열쇠, 회원 것은 주인만
  return isOwner || (!!a.t && a.t === a.token);
}
