// lib/notify.ts — 결제 알림을 디스코드로(2026-10-23).
//
// 환경변수 DISCORD_PAY_WEBHOOK(디스코드 채널 웹후크 주소)이 있을 때만 보낸다. 없으면 아무 일도 안 한다.
// 손님 성함·생년월일은 보내지 않는다. 상품·금액·회원 여부·주문번호 끝자리만.
// 알림이 늦거나 실패해도 결제 흐름은 막지 않는다(2.5초 제한, 예외 삼킴).
import 'server-only';
import { paymentSummary } from './store';

export type PayNotice =
  | { kind: 'paid'; paymentId: string }
  | { kind: 'check'; paymentId: string; why: string };   // 저장 실패·결과 불명·금액 불일치 — 사람이 봐야 한다

const WHY_KO: [RegExp, string][] = [
  [/^confirm:/, '승인은 났는데 열람 저장 실패. 손님 리포트가 잠겨 있을 수 있다'],
  [/^approve_unknown/, 'KCP 승인 응답을 못 받음. 돈이 나갔는지 KCP 관리자에서 확인'],
  [/^amount:/, '승인 금액이 주문과 다름. KCP 에서 취소 필요'],
  [/^fatal:/, '서버 오류. 승인 여부 확인 필요'],
];

export async function notifyPayment(n: PayNotice): Promise<void> {
  const url = process.env.DISCORD_PAY_WEBHOOK;
  if (!url) return;
  try {
    const sum = await paymentSummary(n.paymentId);
    const item = sum?.item ?? '?', amount = sum?.amount ?? 0, member = !!sum?.member;
    const when = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
    const tail = n.paymentId.slice(-6);
    const content = n.kind === 'paid'
      ? `[결제] ${item} ${amount.toLocaleString('ko-KR')}원 · ${member ? '회원' : '비회원'} · #${tail} · ${when}`
      : `[확인 필요] #${tail} ${item} ${amount.toLocaleString('ko-KR')}원 · ${(WHY_KO.find(([re]) => re.test(n.why)) ?? [null, '확인 필요'])[1]} · ${n.why.slice(0, 80)} · ${when}`;
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
    try {
      await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, allowed_mentions: { parse: [] } }), signal: ctl.signal });
    } finally { clearTimeout(t); }
  } catch { /* 알림 실패가 결제를 막으면 안 된다 */ }
}
