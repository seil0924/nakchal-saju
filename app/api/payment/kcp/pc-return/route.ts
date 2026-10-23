// POST /api/payment/kcp/pc-return — PC 표준결제 인증결과 수신(m_Completepayment의 submit) → 승인 → 리다이렉트
// KCP 권고 방식: 카드 인증 후 order_info 폼을 이 URL로 submit하면, 서버가 enc_data로 승인 API를 호출한다.
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder, failOrder, getReportAccess } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';
import { payReturnDest, payReturnQuery } from '@/lib/pay-return';

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  // 도착지·쿼리 규칙은 lib/pay-return 한 곳(모바일과 같게).
  const back = async (ok: boolean, reportId?: string | null, why?: string, paymentId?: string) => {
    if (why && paymentId) { try { await failOrder(paymentId, why); } catch { /* 진단이 흐름을 막으면 안 된다 */ } }   // ok 인데 why 면 confirm:* · 승인은 났다
    if (!reportId && paymentId) { try { reportId = (await getOrder(paymentId))?.reportId ?? null; } catch { /* 못 찾으면 홈 */ } }
    const base = payReturnDest(origin, ok, reportId);
    const isReport = !!reportId && !String(reportId).startsWith('pass:');
    const tq = ok && isReport ? await tokenQuery(String(reportId)) : '';
    return NextResponse.redirect(payReturnQuery(base, ok, why, tq), 303);
  };

  try {
    const form = await req.formData();
    const g = (k: string) => String(form.get(k) ?? '');
    const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');

    if (res_cd && res_cd !== '0000') return await back(false, null, `auth:${res_cd}`, paymentId);            // 인증 실패/취소
    if (!enc_data || !enc_info || !tran_cd) return await back(false, null, 'missing_enc', paymentId);         // 인증값 누락
    const order = await getOrder(paymentId);
    if (!order) return await back(false, null, 'order_not_found', paymentId);
    const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
    if (!r.ok) { console.error('[pc-return] approve fail', r.res_cd, r.res_msg, r.raw); return await back(false, order.reportId, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`, paymentId); }
    if (r.amount !== order.amount) return await back(false, order.reportId, `amount:${r.amount}!=${order.amount}`, paymentId);   // 금액 위변조
    // 승인 성공(돈 이동 완료). 확정 저장이 실패해도 절대 500 내지 않고 사유를 노출한다.
    try {
      await confirmOrder(paymentId, order.amount);
    } catch (e: any) {
      console.error('[pc-return] confirm fail', e);
      return await back(true, order.reportId, `confirm:${(e?.message || e?.code || String(e)).slice(0, 90)}`, paymentId);
    }
    return await back(true, order.reportId);
  } catch (e: any) {
    console.error('[pc-return] fatal', e);
    return await back(false, null, `fatal:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
  }
}

// 리포트 접근 토큰을 쿼리 조각으로. 토큰 컬럼이 없거나 조회가 실패하면 빈 문자열 — 결제 흐름을 막지 않는다.
async function tokenQuery(reportId: string): Promise<string> {
  try { const { token } = await getReportAccess(reportId); return token ? `&t=${encodeURIComponent(token)}` : ''; } catch { return ''; }
}
