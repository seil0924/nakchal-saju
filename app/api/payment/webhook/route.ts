// POST /api/payment/webhook — [실서비스] 포트원 웹훅 수신
// ① 서명 검증(위조 차단) → ② 주문 조회 → ③ 포트원 단건조회로 금액·상태 재검증
// → ④ confirmOrder 로 잠금 해제. 데모에서는 mock-confirm 이 대신.
import { NextResponse } from 'next/server';
import { confirmOrder, getOrder } from '@/lib/store';
import { verifyPaid } from '@/lib/portone';
import { Webhook } from '@portone/server-sdk';

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'webhook_secret_unset' }, { status: 500 });

  // ① 서명 검증 — 대표님만 아는 시크릿으로 서명을 다시 계산해 대조. 진짜 포트원이 보낸 것만 통과.
  let webhook: any;
  try {
    webhook = await Webhook.verify(secret, raw, {
      'webhook-id': req.headers.get('webhook-id') ?? '',
      'webhook-signature': req.headers.get('webhook-signature') ?? '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
    });
  } catch (e) {
    if (e instanceof Webhook.WebhookVerificationError) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });   // 위조·변조 → 거부
    }
    return NextResponse.json({ error: 'webhook_error' }, { status: 400 });
  }

  // ② paymentId 추출 (검증된 웹훅 우선, 없으면 원문에서)
  let paymentId: string | undefined = webhook?.data?.paymentId;
  if (!paymentId) { try { const b = JSON.parse(raw || '{}'); paymentId = b?.payment_id ?? b?.data?.paymentId; } catch {} }
  if (!paymentId) return NextResponse.json({ error: 'no_payment_id' }, { status: 400 });

  // ③ 주문 조회 → 그 주문의 확정 금액으로 재검증
  const order = await getOrder(paymentId);
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 400 });

  // ④ 포트원 단건조회로 실제 결제금액·상태 재검증 (클라이언트 값 불신)
  const ok = await verifyPaid(paymentId, order.amount).catch(() => false);
  if (!ok) return NextResponse.json({ error: 'not_verified' }, { status: 400 });

  const o = await confirmOrder(paymentId, order.amount);
  if (!o) return NextResponse.json({ error: 'confirm_failed' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
