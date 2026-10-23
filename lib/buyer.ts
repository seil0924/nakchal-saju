// lib/buyer.ts — 로그인 없이 '산 사람'을 알아보는 열쇠(2026-10-23).
//
// 회원가입을 붙이지 않는다. 결제하기로 한 순간에 이름·휴대폰 번호만 받고(창업레이더와 같은 방식),
// 그 둘을 서버 비밀값으로 섞은 해시(buyer_key)로 산 것을 묶는다.
//  · 다른 기기에서는 '산 리포트 찾기'에 이름과 번호를 넣으면 같은 열쇠가 나와 목록이 뜬다
//  · 발주처 프리미엄 패스는 이 열쇠에 붙는다(예전엔 로그인 계정에만 붙어 비회원이 못 샀다)
//  · 결제가 끝나면 이 열쇠를 브라우저 쿠키(nk_buyer)에 둬서 같은 기기에선 다시 넣지 않는다
// 번호 인증 문자는 보내지 않는다 — 1건 결제 앞 인증은 카드사 심사에서 걸린다(창업레이더 메모).
import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';

export const BUYER_COOKIE = 'nk_buyer';
export const BUYER_KEEP_YEARS = 5;   // 거래기록 보관(전자상거래법 시행령 제6조). 지난 것은 purgeOldBuyers 가 지운다

// 같은 사람의 이름을 같게: 빈칸 제거 + 유니코드 모양(NFC) 맞춤. 맥에서 붙여넣은 자모 풀린 이름도 같게 본다.
export const normName = (v: string) => String(v ?? '').normalize('NFC').replace(/\s+/g, '').slice(0, 20);

// 번호는 숫자만, +82 는 0 으로. 010-1234-5678, 01012345678, +82 10 1234 5678 이 모두 같은 번호다.
export function normPhone(v: string): string {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('82') && d.length >= 11) d = '0' + d.slice(2);
  return d;
}
export const validPhone = (d: string) => /^01[016789]\d{7,8}$/.test(d);

// 화면에 보일 때는 가운데를 가린다(관리자 목록은 전체를 본다).
export const maskPhone = (d: string) => d.length >= 10 ? `${d.slice(0, 3)}-****-${d.slice(-4)}` : d;
export const dashPhone = (d: string) => d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : d;

function pepper(): string {
  return process.env.BUYER_PEPPER || process.env.SUPABASE_SERVICE_ROLE_KEY || 'nakchal-dev-pepper';
}
export function buyerKey(name: string, phone: string): string {
  return createHash('sha256').update(`${pepper()}|${normName(name)}|${normPhone(phone)}`).digest('hex');
}
export const ipHash = (ip: string) => createHash('sha256').update(`${pepper()}|ip|${ip}`).digest('hex').slice(0, 32);

// 결제 준비 때 받은 값 검사. 틀린 이유를 짚어 준다(창업레이더: 자릿수를 세어 알려 준다).
export function checkBuyer(name: string, phone: string, agree: boolean): { ok: true; name: string; phone: string; key: string } | { ok: false; error: string; message: string } {
  const n = String(name ?? '').trim().slice(0, 20);
  const d = normPhone(phone);
  if (!n) return { ok: false, error: 'buyer_name', message: '성함을 넣어주세요.' };
  if (!validPhone(d)) {
    const len = d.length;
    return { ok: false, error: 'buyer_phone', message: len && len < 10 ? `휴대폰 번호가 ${len}자리입니다. 010-0000-0000 처럼 모두 넣어주세요.` : '휴대폰 번호를 010-0000-0000 처럼 넣어주세요.' };
  }
  if (!agree) return { ok: false, error: 'buyer_agree', message: '개인정보 수집·이용에 동의해 주셔야 결제할 수 있습니다.' };
  return { ok: true, name: n, phone: d, key: buyerKey(n, d) };
}

// 이 브라우저의 구매자 열쇠(결제·'산 리포트 찾기' 뒤에 심어 둔 쿠키). 요청 밖에서 부르면 null.
export function buyerKeyFromCookie(): string | null {
  try { const v = cookies().get(BUYER_COOKIE)?.value ?? ''; return /^[0-9a-f]{64}$/.test(v) ? v : null; } catch { return null; }
}
// 응답에 심을 쿠키 옵션. 1년, 자바스크립트로는 못 읽게(httpOnly).
export const BUYER_COOKIE_OPTS = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 365 };
