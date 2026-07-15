// POST /api/payment/kcp/approve — 결제창 인증결과로 KCP 승인 + 금액검증 + 잠금해제
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const { paymentId, enc_data, enc_info, tran_cd } = await req.json();
  if (!paymentId || !enc_data || !enc_info || !tran_cd) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const order = await getOrder(paymentId);                    // ordr_idxx = paymentId
  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 400 });

  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok) return NextResponse.json({ error: 'approve_failed', res_cd: r.res_cd, res_msg: r.res_msg }, { status: 400 });
  if (r.amount !== order.amount) return NextResponse.json({ error: 'amount_mismatch' }, { status: 400 });  // 위변조

  const o = await confirmOrder(paymentId, order.amount);
  if (!o) return NextResponse.json({ error: 'confirm_failed' }, { status: 400 });
  return NextResponse.json({ ok: true, reportId: o.reportId, level: o.level, tno: r.tno });
}
