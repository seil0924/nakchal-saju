// POST /api/payment/mock-confirm — [데모 전용] 결제 완료 시뮬레이션
// 실서비스에서는 이 라우트 대신 포트원 웹훅(/api/payment/webhook)이
// 포트원 단건조회로 금액을 재검증한 뒤 confirmOrder를 호출합니다.
import { NextResponse } from 'next/server';
import { confirmOrder, getOrder } from '@/lib/store';

export async function POST(req: Request) {
  const { paymentId } = await req.json();
  const order = await getOrder(paymentId);
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 400 });
  // 데모: 사용자가 결제창에서 주문금액(택일팩 990 / 전체 12,900)을 냈다고 가정하고 재검증 통과
  const o = await confirmOrder(paymentId, order.amount);
  if (!o) return NextResponse.json({ error: 'confirm_failed' }, { status: 400 });
  return NextResponse.json({ ok: true, reportId: o.reportId, level: o.level });
}
