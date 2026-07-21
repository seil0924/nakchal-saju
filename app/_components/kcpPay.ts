'use client';
// KCP 표준결제 클라이언트 — PC(팝업+콜백) / 모바일(거래등록+리다이렉트)
const SITE_CD = process.env.NEXT_PUBLIC_KCP_SITE_CD || '';
const TEST = process.env.NEXT_PUBLIC_KCP_TEST !== '0';
export const KCP_CLIENT_ENABLED = !!SITE_CD;
const PC_JS = TEST ? 'https://testspay.kcp.co.kr/plugin/kcp_spay_hub.js' : 'https://spay.kcp.co.kr/plugin/kcp_spay_hub.js';
const isMobile = () => typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

let scriptPromise: Promise<void> | null = null;
function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('script')); document.head.appendChild(s);
  });
}
// ★페이지 로드 시 미리 호출 → 결제창 클릭 때 스크립트 대기(await) 없이 즉시 팝업 오픈(팝업 차단 방지)
export function preloadKcp(): void {
  if (!KCP_CLIENT_ENABLED || typeof window === 'undefined' || isMobile()) return;
  if (!scriptPromise) scriptPromise = loadScript(PC_JS).catch(() => { scriptPromise = null; });
}

type Auth = { enc_data: string; enc_info: string; tran_cd: string };

async function payPC(p: { paymentId: string; amount: number; goodName: string }): Promise<Auth | null> {
  // 사전 로드돼 있으면 resolved 프라미스(마이크로태스크) → 사용자 클릭 활성 유지된 채 팝업 오픈
  if (scriptPromise) { await scriptPromise; } else { await loadScript(PC_JS); }
  return new Promise((resolve) => {
    if (typeof (window as any).KCP_Pay_Execute_Web !== 'function') { resolve(null); return; } // 스크립트 미준비 → 무한대기 방지
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
    // KCP 표준: 인증 성공 시 order_info 폼을 서버로 submit → 서버(pc-return)가 승인 API 호출 후 리다이렉트
    form.action = location.origin + '/api/payment/kcp/pc-return';
    document.body.appendChild(form);
    const gv = (n: string) => (form.querySelector(`[name="${n}"]`) as HTMLInputElement | null)?.value || '';
    // KCP 완료 콜백. KCP hub 버전에 따라 결과를 (1)폼에 직접 채우거나 (2)인자로 넘긴다 →
    // 인자가 오면 폼에 반영한 뒤 res_cd를 판정. 0000이면 pc-return으로 submit(서버가 승인).
    const setv = (n: string, v: string) => { const el = form.querySelector(`[name="${n}"]`) as HTMLInputElement | null; if (el) el.value = v; };
    // KCP hub는 인증 결과를 m_Completepayment(폼/객체)로 넘긴다. 각 필드가 문자열이 아니라
    // input 요소(예: result.res_cd → HTMLInputElement)일 수 있어 .value로 안전하게 추출한다.
    const readv = (o: any, k: string): string => {
      const v = o == null ? undefined : o[k];
      if (v == null) return '';
      if (typeof v === 'object' && 'value' in v) return String((v as any).value ?? '');   // input 요소
      return String(v);                                                                     // 이미 문자열
    };
    const KFIELDS = ['res_cd', 'res_msg', 'enc_data', 'enc_info', 'tran_cd', 'use_pay_method', 'ordr_chk', 'pay_method'];
    (window as any).m_Completepayment = (result?: any) => {
      // 결과 원본: 인자로 오면 그것, 아니면 KCP가 우리 폼을 직접 채운 경우 → 우리 폼
      const src = (result && typeof result === 'object') ? result : form;
      for (const k of KFIELDS) { const val = readv(src, k); if (val !== '') setv(k, val); }   // 실제 문자열 값을 우리 폼(pc-return submit용)에 반영
      const rc = gv('res_cd');
      if (rc === '0000') { form.submit(); return; }                // 정상 인증 → pc-return으로 submit(서버 승인)
      // 인증 실패/미인증 — 사유(문자열)를 노출해 원인 파악(조용한 hang 방지)
      const msg = gv('res_msg');
      try { (window as any).__kcpLastRes = { res_cd: rc, res_msg: msg }; console.error('[KCP m_Completepayment] res_cd=', rc, 'res_msg=', msg); } catch { /* noop */ }
      form.remove();
      if (rc) { try { alert('결제 인증 응답: [' + rc + '] ' + (msg || '')); } catch { /* noop */ } }
      resolve(null);
    };
    (window as any).m_Cancelpayment = () => { form.remove(); resolve(null); };   // 사용자 취소
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

// PC면 인증결과(enc) 반환, 모바일이면 'redirect'(페이지 이동), 취소/실패면 null
export async function openKcpPay(p: { paymentId: string; amount: number; goodName: string }): Promise<Auth | null | 'redirect'> {
  if (isMobile()) { await payMobile(p); return 'redirect'; }
  return await payPC(p);
}
