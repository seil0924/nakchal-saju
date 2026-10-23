// lib/pay-return.ts — KCP 결제 뒤 손님을 어디로 돌려보낼지(PC·모바일 공용, 2026-10-23).
//
// 모바일 쪽이 따로 만든 규칙을 쓰고 있었다.
//  · 결제창을 닫거나 실패하면 주문의 리포트를 찾지 않고 홈으로 보냈다 — 방금 본 결과를 잃는다.
//  · 발주처 패스 주문은 reportId 가 'pass:…' 라 /report/pass:… 라는 없는 주소로 갔다.
//  · 복채는 감사 화면 없이 홈으로 갔다.
//  · 패스·복채 결제창을 닫으면 아무 말 없이 홈으로 갔다. 산 곳으로 돌려보내고 PayNotice 가 알린다.
export function payReturnDest(origin: string, ok: boolean, reportId?: string | null): string {
  const rid = reportId ? String(reportId) : '';
  if (rid.startsWith('pass:')) return ok ? `${origin}/thanks` : `${origin}/balju`;   // 발주처 패스 등 이용권
  if (!rid) return ok ? `${origin}/thanks?kind=bokchae` : `${origin}/bokchae`;  // 복채 등 리포트와 무관한 결제
  return `${origin}/report/${rid}`;                                            // 리포트 결제: 성공·실패 모두 그 리포트로
}

// 리포트 화면이 읽는 결과 쿼리. why 는 관리자 진단용이라 화면에는 뜻만 보인다.
export function payReturnQuery(base: string, ok: boolean, why?: string, tokenQuery = ''): string {
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}paid=${ok ? '1' : '0'}${tokenQuery}${why ? `&why=${encodeURIComponent(why)}` : ''}`;
}
