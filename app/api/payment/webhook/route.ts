// POST /api/payment/webhook — [실서비스] 포트원 웹훅 수신
// 포트원이 결제 완료를 서버로 알려주면, ① 웹훅 서명 검증 → ② 단건조회로
// 금액·상태 재검증 → ③ confirmOrder 로 잠금 해제. 데모에서는 mock-confirm이 대신.
import { NextResponse } from 'next/server';
import { confirmOrder, getOrder } from '@/lib/store';
import { verifyPaid } from '@/lib/portone';

// 포트원 웹훅 서명 검증 (@portone/server-sdk의 Webhook.verify 사용 권장).
// 여기서는 시크릿 유무만 확인하는 골격 — 실서비스에서 실제 서명 검증으로 대체.
async function verifySignature(_raw: string, _headers: Headers): Promise<boolean> {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return false; // 시크릿 미설정이면 웹훅 신뢰 불가
  // TODO: import { Webhook } from '@portone/server-sdk';
  //       await Webhook.verify(secret, _raw, Object.fromEntries(_headers));
  return true;
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!(await verifySignature(raw, req.headers))) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }
  const body = JSON.parse(raw || '{}');
  const paymentId: string | undefined = body?.payment_id ?? body?.data?.paymentId;
  if (!paymentId) return NextResponse.json({ error: 'no_payment_id' }, { status: 400 });

  // 주문 조회 → 그 주문의 확정 금액(택일팩 990 / 전체 12,900)으로 재검증
  const order = await getOrder(paymentId);
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 400 });

  // 포트원 단건조회로 금액·상태 재검증 (클라이언트 값 불신)
  const ok = await verifyPaid(paymentId, order.amount).catch(() => false);
  if (!ok) return NextResponse.json({ error: 'not_verified' }, { status: 400 });

  const o = await confirmOrder(paymentId, order.amount);
  if (!o) return NextResponse.json({ error: 'confirm_failed' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
