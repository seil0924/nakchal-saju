'use client';
// KCP 표준결제 클라이언트 — PC(팝업+콜백) / 모바일(거래등록+리다이렉트)
const SITE_CD = process.env.NEXT_PUBLIC_KCP_SITE_CD || '';
const TEST = process.env.NEXT_PUBLIC_KCP_TEST !== '0';
export const KCP_CLIENT_ENABLED = !!SITE_CD;
const PC_JS = TEST ? 'https://testspay.kcp.co.kr/plugin/kcp_spay_hub.js' : 'https://spay.kcp.co.kr/plugin/kcp_spay_hub.js';
const isMobile = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('script')); document.head.appendChild(s);
  });
}

type Auth = { enc_data: string; enc_info: string; tran_cd: string };

async function payPC(p: { paymentId: string; amount: number; goodName: string }): Promise<Auth | null> {
  await loadScript(PC_JS);
  return new Promise((resolve) => {
    const form = document.createElement('form'); form.setAttribute('name', 'order_info'); form.method = 'post'; form.style.display = 'none';
    const add = (n: string, v: string) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.appendChild(i); };
    add('site_cd', SITE_CD); add('site_name', '낙찰사주'); add('pay_method', '110000000000'); add('currency', 'WON'); // 1=카드,2=계좌이체
    add('ordr_idxx', p.paymentId); add('good_name', p.goodName); add('good_mny', String(p.amount));
    // KCP PC 표준결제 필수/권장 필드 — 누락 시 결제창이 '진행중'에서 멈춤
    add('escw_used', 'N');            // 에스크로 미사용
    add('quotaopt', '0');             // 일시불(할부개월 옵션)
    add('shop_user_id', p.paymentId); // 상점 사용자 식별(주문번호로 대체)
    add('buyr_name', '고객');          // 구매자명(빈값 방지)
    add('buyr_tel1', '');
    add('buyr_mail', '');
    add('res_cd', ''); add('res_msg', ''); add('enc_data', ''); add('enc_info', ''); add('tran_cd', ''); add('ordr_chk', ''); add('use_pay_method', '');
    document.body.appendChild(form);
    const gv = (n: string) => (form.querySelector(`[name="${n}"]`) as HTMLInputElement | null)?.value || '';
    (window as any).m_Completepayment = () => {
      const res_cd = gv('res_cd');
      const out = res_cd === '0000' ? { enc_data: gv('enc_data'), enc_info: gv('enc_info'), tran_cd: gv('tran_cd') } : null;
      form.remove(); resolve(out);
    };
    try { (window as any).KCP_Pay_Execute_Web(form); } catch { /* 정상 종료 시 throw */ }
  });
}

async function payMobile(p: { paymentId: string; amount: number; goodName: string }) {
  const reg = await fetch('/api/payment/kcp/register', { method: 'POST', body: JSON.stringify({ paymentId: p.paymentId, goodName: p.goodName }) }).then(r => r.json());
  if (!reg?.PayUrl || !reg?.approvalKey) throw new Error('register_failed');
  const form = document.createElement('form'); form.setAttribute('name', 'order_info'); form.method = 'post';
  form.action = reg.PayUrl.substring(0, reg.PayUrl.lastIndexOf('/')) + '/jsp/encodingFilter/encodingFilter.jsp';
  const add = (n: string, v: string) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = n; i.value = v; form.appendChild(i); };
  // TODO: 모바일 계좌이체 오픈 시 KCP 모바일 pay_method 규격 확인 후 확장
  add('site_cd', reg.siteCd || SITE_CD); add('pay_method', 'CARD'); add('currency', '410'); add('shop_name', '낙찰사주');
  add('Ret_URL', location.origin + '/api/payment/kcp/mobile-return'); add('approval_key', reg.approvalKey); add('PayUrl', reg.PayUrl);
  add('ordr_idxx', p.paymentId); add('good_name', p.goodName); add('good_mny', String(p.amount));
  document.body.appendChild(form); form.submit();   // 전체 페이지 이동 → 결과는 서버 mobile-return이 처리
}

// PC면 인증결과(enc) 반환, 모바일이면 'redirect'(페이지 이동), 취소면 null
export async function openKcpPay(p: { paymentId: string; amount: number; goodName: string }): Promise<Auth | null | 'redirect'> {
  if (isMobile()) { await payMobile(p); return 'redirect'; }
  return await payPC(p);
}
