// POST /api/payment/kcp/register — 모바일 결제창용 거래등록(approvalKey·PayUrl 발급)
import { NextResponse } from 'next/server';
import { getOrder } from '@/lib/store';
import { kcpRegister } from '@/lib/kcp';

export async function POST(req: Request) {
  const { paymentId, goodName } = await req.json();
  const order = await getOrder(paymentId);
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 400 });
  const origin = new URL(req.url).origin;
  const r = await kcpRegister({
    ordr_idxx: paymentId, good_mny: order.amount, good_name: goodName || '낙찰사주 리포트',
    ret_url: `${origin}/api/payment/kcp/mobile-return`,
  });
  if (!r.ok || !r.PayUrl || !r.approvalKey) return NextResponse.json({ error: 'register_failed', raw: r.raw }, { status: 400 });
  return NextResponse.json({ approvalKey: r.approvalKey, PayUrl: r.PayUrl, siteCd: process.env.NEXT_PUBLIC_KCP_SITE_CD });
}
