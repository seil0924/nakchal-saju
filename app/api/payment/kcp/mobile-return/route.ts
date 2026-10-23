// POST /api/payment/kcp/mobile-return — 모바일 결제창 결과 수신 → 승인 → 리다이렉트
// 승인·저장·돌려보내기는 lib/kcp-return 한 곳에서 한다(PC와 같게).
import { NextResponse } from 'next/server';
import { kcpReturnUrl } from '@/lib/kcp-return';

export async function POST(req: Request) {
  const origin = new URL(req.url).origin;
  let form: FormData | null = null;
  try { form = await req.formData(); } catch { /* 폼을 못 읽으면 아래에서 빈 값으로 처리 */ }
  const g = (k: string) => String(form?.get(k) ?? '');
  const url = await kcpReturnUrl(origin, { paymentId: g('ordr_idxx'), enc_data: g('enc_data'), enc_info: g('enc_info'), tran_cd: g('tran_cd'), res_cd: g('res_cd') });
  return NextResponse.redirect(url, 303);
}
