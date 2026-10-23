// lib/kcp-return.ts — KCP 인증결과를 받아 승인하고, 손님을 돌려보낼 주소를 낸다(PC·모바일 공용, 2026-10-23).
//
// pc-return 과 mobile-return 이 같은 일을 따로 하다가 서로 어긋났다(모바일만 홈으로 튕김·패스 주소 깨짐).
// 여기 한 곳에서 한다. 지키는 선:
//  · 이미 paid 인 주문이 다시 들어오면 승인을 다시 부르지 않고 성공으로 돌려보낸다(중복 콜백·뒤로가기 재전송)
//  · KCP 승인 응답을 못 받으면(시간 초과·비 JSON) '결과 불명'으로 남긴다. 돈이 나갔을 수 있어 실패로 덮지 않는다
//  · 승인은 났는데 저장이 실패하면 그 자리에서 세 번까지 다시 저장한다
//  · 어떤 예외가 나도 500 대신 사유를 남기고 손님을 자기 리포트로 돌려보낸다
import 'server-only';
import { getOrder, confirmOrder, failOrder, getReportAccess, recordTno } from './store';
import { kcpApprove } from './kcp';
import { payReturnDest, payReturnQuery } from './pay-return';
import { notifyPayment } from './notify';

export type KcpFields = { paymentId: string; enc_data: string; enc_info: string; tran_cd: string; res_cd: string };

async function tokenQuery(reportId: string): Promise<string> {
  try { const { token } = await getReportAccess(reportId); return token ? `&t=${encodeURIComponent(token)}` : ''; } catch { return ''; }
}

export async function kcpReturnUrl(origin: string, f: KcpFields): Promise<string> {
  const { paymentId } = f;
  let reportId: string | null = null;

  const back = async (ok: boolean, why?: string) => {
    if (why && paymentId) { try { await failOrder(paymentId, why); } catch { /* 진단이 결제 흐름을 막으면 안 된다 */ } }
    // 사람이 봐야 하는 건(돈이 나갔을 수 있는 것)은 디스코드로 바로 알린다.
    if (why && paymentId && /^(confirm:|approve_unknown|amount:|fatal:)/.test(why)) await notifyPayment({ kind: 'check', paymentId, why });
    if (!reportId && paymentId) { try { reportId = (await getOrder(paymentId))?.reportId ?? null; } catch { /* 못 찾으면 홈 */ } }
    const base = payReturnDest(origin, ok, reportId);
    // 결제가 끝났으면 접근 토큰을 싣는다. 휴대폰 카드 결제는 카드사 앱을 거쳐 다른 브라우저로 돌아오는 일이 많다.
    const isReport = !!reportId && !String(reportId).startsWith('pass:');
    const tq = ok && isReport ? await tokenQuery(String(reportId)) : '';
    return payReturnQuery(base, ok, why, tq);
  };

  try {
    if (f.res_cd && f.res_cd !== '0000') return await back(false, `auth:${f.res_cd}`);           // 인증 실패·취소
    if (!f.enc_data || !f.enc_info || !f.tran_cd) return await back(false, 'missing_enc');
    const order = await getOrder(paymentId);
    if (!order) return await back(false, 'order_not_found');
    reportId = order.reportId;
    if (order.status === 'paid') return await back(true);                                       // 이미 끝난 주문: 다시 승인하지 않는다

    const r = await kcpApprove({ enc_data: f.enc_data, enc_info: f.enc_info, tran_cd: f.tran_cd, ordr_mony: order.amount, ordr_no: paymentId });
    if ((r as any).unknown) return await back(false, `approve_unknown:${r.res_msg || ''}`.slice(0, 80));
    if (!r.ok) { console.error('[kcp-return] approve fail', r.res_cd, r.res_msg); return await back(false, `approve:${r.res_cd || '?'}:${(r.res_msg || '').slice(0, 40)}`); }
    if (r.amount !== order.amount) return await back(false, `amount:${r.amount}!=${order.amount}`);   // 승인은 났다 — 관리자가 KCP 에서 취소해야 한다
    await recordTno(paymentId, r.tno);

    // 승인 성공(돈 이동 완료). 저장이 실패하면 세 번까지 다시 한다. 그래도 안 되면 사유를 남기고 성공 쪽으로 돌려보낸다.
    let lastErr: any = null;
    for (let i = 0; i < 3; i++) {
      try { await confirmOrder(paymentId, order.amount); lastErr = null; break; }
      catch (e) { lastErr = e; await new Promise(res => setTimeout(res, 400 * (i + 1))); }
    }
    if (lastErr) {
      console.error('[kcp-return] confirm fail', lastErr);
      return await back(true, `confirm:${(lastErr?.message || lastErr?.code || String(lastErr)).slice(0, 90)}`);
    }
    await notifyPayment({ kind: 'paid', paymentId });
    return await back(true);
  } catch (e: any) {
    console.error('[kcp-return] fatal', e);
    return await back(false, `fatal:${(e?.message || e?.code || String(e)).slice(0, 90)}`);
  }
}
