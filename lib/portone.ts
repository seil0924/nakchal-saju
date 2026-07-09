// lib/portone.ts — 포트원(PortOne) V2 결제 검증 래퍼 (참고 구현)
// 데모에서는 호출하지 않지만, 실서비스 웹훅에서 이 함수로 금액·상태를 재검증합니다.
import 'server-only';

const API = 'https://api.portone.io';

// 포트원 결제 단건조회 — 클라이언트가 보낸 값이 아니라 이 응답을 신뢰
export async function getPayment(paymentId: string) {
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('portone lookup failed');
  return res.json() as Promise<{ status: string; amount: { total: number }; id: string }>;
}

// 웹훅에서: 조회한 실제 결제금액이 서버가 확정한 주문금액과 일치하는지 확인
export async function verifyPaid(paymentId: string, expectedAmount: number): Promise<boolean> {
  const p = await getPayment(paymentId);
  return p.status === 'PAID' && p.amount.total === expectedAmount;
}
