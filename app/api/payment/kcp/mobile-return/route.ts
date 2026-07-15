// POST /api/payment/kcp/mobile-return — 모바일 결제창 결과 수신 → 승인 → 리다이렉트
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const form = await req.formData();
  const g = (k: string) => String(form.get(k) ?? '');
  const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');
  const origin = new URL(req.url).origin;
  const back = (ok: boolean, reportId?: string) => NextResponse.redirect(`${origin}/report/${reportId || ''}?paid=${ok ? '1' : '0'}`, 303);

  if (res_cd && res_cd !== '0000') return back(false);
  const order = await getOrder(paymentId);
  if (!order) return back(false);
  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok || r.amount !== order.amount) return back(false, order.reportId);
  await confirmOrder(paymentId, order.amount);
  return back(true, order.reportId);
}
