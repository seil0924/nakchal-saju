// POST /api/payment/kcp/pc-return — PC 표준결제 인증결과 수신(m_Completepayment의 submit) → 승인 → 리다이렉트
// KCP 권고 방식: 카드 인증 후 order_info 폼을 이 URL로 submit하면, 서버가 enc_data로 승인 API를 호출한다.
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  // 결제 결과에 따른 도착지: 리포트 구매→리포트, 복채/패스 등 언락無→결제완료 페이지, 실패→홈.
  const dest = (ok: boolean, reportId?: string | null) => {
    const rid = reportId ? String(reportId) : '';
    if (ok && !rid) return `${origin}/thanks?kind=bokchae`;      // 복채(福債) 등 리포트와 무관한 결제
    if (ok && rid.startsWith('pass:')) return `${origin}/thanks`; // 발주처 패스 등 이용권
    if (rid && !rid.startsWith('pass:')) return `${origin}/report/${rid}`;
    return `${origin}/`;
  };
  const back = (ok: boolean, reportId?: string | null, why?: string) => {
    const base = dest(ok, reportId);
    const sep = base.includes('?') ? '&' : '?';
    const q = `${sep}paid=${ok ? '1' : '0'}${why ? `&why=${encodeURIComponent(why)}` : ''}`;
    return NextResponse.redirect(base + q, 303);
  };

  try {
    const form = await req.formData();
    const g = (k: string) => String(form.get(k) ?? '');
    const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');

    if (res_cd && res_cd !== '0000') return back(false, null, `auth:${res_cd}`);            // 인증 실패/취소
    if (!enc_data || !enc_info || !tran_cd) return back(false, null, 'missing_enc');         // 인증값 누락
    const order = await getOrder(paymentId);
    if (!order) return back(false, null, 'order_not_found');
    const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
    if (!r.ok) { console.error('[pc-return] approve fail', r.res_cd, r.res_msg, r.raw); return back(false, order.reportId, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`); }
    if (r.amount !== order.amount) return back(false, order.reportId, `amount:${r.amount}!=${order.amount}`);   // 금액 위변조
    // 승인 성공(돈 이동 완료). 확정 저장이 실패해도 절대 500 내지 않고 사유를 노출한다.
    try {
      await confirmOrder(paymentId, order.amount);
    } catch (e: any) {
      console.error('[pc-return] confirm fail', e);
      return back(true, order.reportId, `confirm:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
    }
    return back(true, order.reportId);
  } catch (e: any) {
    console.error('[pc-return] fatal', e);
    return back(false, null, `fatal:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
  }
}
