// POST /api/payment/kcp/mobile-return — 모바일 결제창 결과 수신 → 승인 → 리다이렉트
// 승인·저장·돌려보내기는 lib/kcp-return 한 곳에서 한다(PC와 같게).
import { NextResponse } from 'next/server';
import { kcpReturn } from '@/lib/kcp-return';
import { BUYER_COOKIE, BUYER_COOKIE_OPTS } from '@/lib/buyer';

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  let form: FormData | null = null;
  try { form = await req.formData(); } catch { /* 폼을 못 읽으면 아래에서 빈 값으로 처리 */ }
  const g = (k: string) => String(form?.get(k) ?? '');
  const { url, buyerKey } = await kcpReturn(origin, { paymentId: g('ordr_idxx'), enc_data: g('enc_data'), enc_info: g('enc_info'), tran_cd: g('tran_cd'), res_cd: g('res_cd') });
  const res = NextResponse.redirect(url, 303);
  if (buyerKey) res.cookies.set(BUYER_COOKIE, buyerKey, BUYER_COOKIE_OPTS);   // 같은 기기에선 산 것(패스 포함)이 바로 열린다
  return res;
}
