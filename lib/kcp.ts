// lib/kcp.ts — NHN KCP 표준결제 (서버) : 모바일 거래등록 + 결제 승인.
// env: NEXT_PUBLIC_KCP_SITE_CD(사이트코드) · KCP_CERT_INFO(서비스 인증서 pem, 서버전용)
//      NEXT_PUBLIC_KCP_TEST('0'이면 운영, 그 외/미설정은 테스트)
import 'server-only';

export const KCP_SITE_CD = process.env.NEXT_PUBLIC_KCP_SITE_CD || '';
const CERT = (process.env.KCP_CERT_INFO || '').trim();
export const KCP_ENABLED = !!(KCP_SITE_CD && CERT);
export const KCP_TEST = process.env.NEXT_PUBLIC_KCP_TEST !== '0';

const URL_REGISTER = KCP_TEST ? 'https://testsmpay.kcp.co.kr/trade/register.do' : 'https://smpay.kcp.co.kr/trade/register.do';
const URL_APPROVE  = KCP_TEST ? 'https://stg-spl.kcp.co.kr/gw/enc/v1/payment' : 'https://spl.kcp.co.kr/gw/enc/v1/payment';

// 모바일: 거래등록 → approvalKey · PayUrl 수신
export async function kcpRegister(p: { ordr_idxx: string; good_mny: number; good_name: string; ret_url: string; pay_method?: string }) {
  const body = {
    site_cd: KCP_SITE_CD,
    ordr_idxx: p.ordr_idxx,
    good_mny: String(p.good_mny),
    good_name: p.good_name,
    pay_method: p.pay_method || 'CARD',
    Ret_URL: p.ret_url,
    currency: '410',
    shop_name: '낙찰사주',
  };
  const res = await fetch(URL_REGISTER, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body) });
  const data = await res.json();
  // 성공 시 approvalKey, PayUrl 반환
  return { ok: data?.Code === '0000' || !!data?.approvalKey, approvalKey: data?.approvalKey, PayUrl: data?.PayUrl, raw: data };
}

// 승인: 결제창 인증결과(enc_data, enc_info) → 실제 결제 승인 + 금액/수단 검증
export async function kcpApprove(p: { enc_data: string; enc_info: string; tran_cd: string; ordr_mony: number; ordr_no: string; pay_type?: string }) {
  const body = {
    tran_cd: p.tran_cd,
    kcp_cert_info: CERT,
    site_cd: KCP_SITE_CD,
    enc_data: p.enc_data,
    enc_info: p.enc_info,
    ordr_mony: String(p.ordr_mony),   // 금액 위변조 검증(가맹점 저장 금액)
    ordr_no: p.ordr_no,
    pay_type: p.pay_type || 'PACA',   // 신용카드
  };
  const res = await fetch(URL_APPROVE, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body) });
  const data = await res.json();
  const ok = data?.res_cd === '0000';
  const amount = Number(data?.amount || 0);
  return { ok, amount, tno: data?.tno, res_cd: data?.res_cd, res_msg: data?.res_msg, raw: data };
}
