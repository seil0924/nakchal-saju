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
  const back = (ok: boolean, reportId?: string) => NextResponse.redirect(`${origin}/report/${reportId || ''}?paid=${ok ? '1' : '0'}`, 303);

  if (res_cd && res_cd !== '0000') return back(false);            // 인증 실패/취소
  const order = await getOrder(paymentId);
  if (!order) return back(false);
  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok || r.amount !== order.amount) return back(false, order.reportId);   // 승인 실패/금액 위변조
  await confirmOrder(paymentId, order.amount);
  return back(true, order.reportId);
}
