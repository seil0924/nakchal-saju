// POST /api/payment/kcp/pc-return — PC 표준결제 인증결과 수신(m_Completepayment의 submit) → 승인 → 리다이렉트
// KCP 권고 방식: 카드 인증 후 order_info 폼을 이 URL로 submit하면, 서버가 enc_data로 승인 API를 호출한다.
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const form = await req.formData();
  const g = (k: string) => String(form.get(k) ?? '');
  const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');
  const origin = new URL(req.url).origin;
  // 실패 시 사유(why)를 쿼리에 실어 원인 파악 가능하게. reportId 없으면(복채 등) 홈으로.
  const back = (ok: boolean, reportId?: string | null, why?: string) => {
    const base = reportId ? `${origin}/report/${reportId}` : `${origin}/`;
    const q = `?paid=${ok ? '1' : '0'}${why ? `&why=${encodeURIComponent(why)}` : ''}`;
    return NextResponse.redirect(base + q, 303);
  };

  if (res_cd && res_cd !== '0000') return back(false, null, `auth:${res_cd}`);            // 인증 실패/취소
  if (!enc_data || !enc_info || !tran_cd) return back(false, null, 'missing_enc');         // 인증값 누락
  const order = await getOrder(paymentId);
  if (!order) return back(false, null, 'order_not_found');
  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok) { console.error('[pc-return] approve fail', r.res_cd, r.res_msg, r.raw); return back(false, order.reportId, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`); }
  if (r.amount !== order.amount) return back(false, order.reportId, `amount:${r.amount}!=${order.amount}`);   // 금액 위변조
  await confirmOrder(paymentId, order.amount);
  return back(true, order.reportId);
}
