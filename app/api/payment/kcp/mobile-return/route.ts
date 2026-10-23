// POST /api/payment/kcp/mobile-return — 모바일 결제창 결과 수신 → 승인 → 리다이렉트
// pc-return과 동일하게 실패 사유(why)를 노출해 모바일 문제도 즉시 진단 가능하게.
import { NextResponse } from 'next/server';
import { getOrder, confirmOrder, failOrder, getReportAccess } from '@/lib/store';
import { kcpApprove } from '@/lib/kcp';

export async function POST(req: Request) {
  const form = await req.formData();
  const g = (k: string) => String(form.get(k) ?? '');
  const paymentId = g('ordr_idxx'), enc_data = g('enc_data'), enc_info = g('enc_info'), tran_cd = g('tran_cd'), res_cd = g('res_cd');
  const origin = new URL(req.url).origin;
  // 사유를 쿼리로만 흘려보내고 행에는 안 남겼다. pc-return 과 같은 이유로 같이 고친다.
  const back = async (ok: boolean, reportId?: string | null, why?: string) => {
    if (why) { try { await failOrder(paymentId, why); } catch { /* 진단이 결제 흐름을 막으면 안 된다 */ } }
    const base = reportId ? `${origin}/report/${reportId}` : `${origin}/`;
    // 결제가 끝났으면 접근 토큰을 주소에 싣는다. 휴대폰 카드 결제는 카드사 앱을 거쳐 다른 브라우저로 돌아오는 일이 많고,
    // 그 브라우저엔 비회원 토큰이 없어 돈은 나갔는데 잠겨 보였다(2026-10-22 실제 손님이 같은 상품을 두 번 결제).
    const tq = ok && reportId ? await tokenQuery(reportId) : '';
    return NextResponse.redirect(`${base}?paid=${ok ? '1' : '0'}${tq}${why ? `&why=${encodeURIComponent(why)}` : ''}`, 303);
  };

  if (res_cd && res_cd !== '0000') return await back(false, null, `auth:${res_cd}`);
  if (!enc_data || !enc_info || !tran_cd) return await back(false, null, 'missing_enc');
  const order = await getOrder(paymentId);
  if (!order) return await back(false, null, 'order_not_found');
  const r = await kcpApprove({ enc_data, enc_info, tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
  if (!r.ok) { console.error('[mobile-return] approve fail', r.res_cd, r.res_msg, r.raw); return await back(false, order.reportId, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`); }
  if (r.amount !== order.amount) return await back(false, order.reportId, `amount:${r.amount}!=${order.amount}`);
  // 승인 성공(돈 이동 완료). 확정 저장이 실패해도 500 대신 사유를 노출한다(pc-return과 동일).
  try {
    await confirmOrder(paymentId, order.amount);
  } catch (e: any) {
    console.error('[mobile-return] confirm fail', e);
    return await back(true, order.reportId, `confirm:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
  }
  return await back(true, order.reportId);
}

// 리포트 접근 토큰을 쿼리 조각으로. 토큰 컬럼이 없거나 조회가 실패하면 빈 문자열 — 결제 흐름을 막지 않는다.
async function tokenQuery(reportId: string): Promise<string> {
  try { const { token } = await getReportAccess(reportId); return token ? `&t=${encodeURIComponent(token)}` : ''; } catch { return ''; }
}
