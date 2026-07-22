// POST /api/payment/kcp/mobile-return — 모바일 결제창 결과 수신 → 승인 → 리다이렉트
// pc-return과 동일하게 실패 사유(why)를 노출해 모바일 문제도 즉시 진단 가능하게.
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const form = await req.formData();
  const g = (k: string) => String(form.get(k) ?? '');
  const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');
  const origin = new URL(req.url).origin;
  const back = (ok: boolean, reportId?: string | null, why?: string) => {
    const base = reportId ? `${origin}/report/${reportId}` : `${origin}/`;
    return NextResponse.redirect(`${base}?paid=${ok ? '1' : '0'}${why ? `&why=${encodeURIComponent(why)}` : ''}`, 303);
  };

  if (res_cd && res_cd !== '0000') return back(false, null, `auth:${res_cd}`);
  if (!enc_data || !enc_info || !tran_cd) return back(false, null, 'missing_enc');
  const order = await getOrder(paymentId);
  if (!order) return back(false, null, 'order_not_found');
  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok) { console.error('[mobile-return] approve fail', r.res_cd, r.res_msg, r.raw); return back(false, order.reportId, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`); }
  if (r.amount !== order.amount) return back(false, order.reportId, `amount:${r.amount}!=${order.amount}`);
  // 승인 성공(돈 이동 완료). 확정 저장이 실패해도 500 대신 사유를 노출한다(pc-return과 동일).
  try {
    await confirmOrder(paymentId, order.amount);
  } catch (e: any) {
    console.error('[mobile-return] confirm fail', e);
    return back(true, order.reportId, `confirm:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
  }
  return back(true, order.reportId);
}
