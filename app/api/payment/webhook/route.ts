// POST /api/payment/webhook — [실서비스] 포트원 웹훅 수신 (참고 구현)
// 포트원이 결제 완료를 서버로 알려주면, 단건조회 API로 금액·상태를 재검증합니다.
// 데모에서는 mock-confirm이 이 역할을 대신합니다.
import { NextResponse } from 'next/server';
import { confirmOrder } from '@/lib/store';
// import { verifyPaid } from '@/lib/portone';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const paymentId: string | undefined = body?.payment_id ?? body?.data?.paymentId;
  if (!paymentId) return NextResponse.json({ error: 'no_payment_id' }, { status: 400 });

  // 실서비스 필수 단계:
  // 1) 웹훅 서명 검증 (PORTONE_WEBHOOK_SECRET)
  // 2) const ok = await verifyPaid(paymentId, 990);  // 포트원 단건조회로 금액 재검증
  // 3) if (!ok) return 400;
  const paidAmount = 990; // ← 실서비스에서는 verifyPaid로 조회한 실제 금액
  const o = await confirmOrder(paymentId, paidAmount);
  if (!o) return NextResponse.json({ error: 'confirm_failed' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
