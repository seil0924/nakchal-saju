// POST /api/payment/prepare — 결제 사전등록
// 서버가 금액을 확정합니다. 카테고리 리포트면 카테고리 개별가, 아니면 sku(택일팩/전체).
import { NextResponse } from 'next/server';
import { getReport, createOrder, BALJU_PASS_KEY } from '@/lib/store';
import { PRICE_BALJU_PASS } from '@/lib/constants';
import { isCatKey, CAT_INFO, canSellCat } from '@/lib/report-categories';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function POST(req: Request) {
 try {
  const { reportId, sku, bokchae, amount, cat: pickedCat } = await req.json();
  // 복채(福債) — 리포트와 무관한 자율 감사·기원 결제. 서버가 금액 범위만 clamp.
  if (bokchae) {
    const amt = Math.max(1000, Math.min(1000000, Math.round(Number(amount) || 0)));
    const order = await createOrder(reportId || 'bokchae', amt, 0);   // level 0 — 언락과 무관
    return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: '낙찰사주 복채(福債)', sku: 'bokchae' });
  }
  // 발주처 프리미엄 패스 — 사용자 계정 단위 권한(리포트와 무관)
  if (sku === 'baljuPass') {
    const user = await requireUser();
    if (authEnabled() && !user?.id) return NextResponse.json({ error: 'login_required' }, { status: 401 });
    const order = await createOrder(BALJU_PASS_KEY(user?.id), PRICE_BALJU_PASS, 1);
    return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: '낙찰사주 발주처 프리미엄 패스', sku: 'baljuPass' });
  }
  const input = await getReport(reportId);
  if (!reportId || !input) {
    return NextResponse.json({ error: 'invalid_report' }, { status: 400 });
  }
  // 카테고리 개별 결제
  if (isCatKey(input.cat)) {
    const c = CAT_INFO[input.cat];
    const order = await createOrder(reportId, c.price, 2);   // 단일 언락(레벨2)
    return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: `낙찰사주 ${c.name}`, sku: 'full' });
  }
  // 카테고리 없이 들어온 리포트 — 손님이 결제 시점에 고른 상품으로 판다.
  //
  // 예전에는 여기서 그냥 400 을 돌려줬다. 그래서 홈·칼럼에서 온 손님(링크 36곳)은
  // 리포트는 받고도 값을 볼 데가 없었고, 잠긴 섹션을 누르면 폼으로 되돌아가
  // 생년월일을 처음부터 다시 넣어야 했다. 이미 받은 정보를 버리는 셈이었다.
  //
  // 고른 값은 믿지 않는다. needs(발주처 설립일·상대 날짜 등)가 채워졌는지 서버가 확인하고,
  // 금액도 서버가 CAT_INFO 에서 꺼낸다. 클라이언트가 보낸 금액은 쓰지 않는다.
  if (canSellCat(pickedCat, input)) {
    const c = CAT_INFO[pickedCat];
    const order = await createOrder(reportId, c.price, 2);
    return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: `낙찰사주 ${c.name}`, sku: 'full', cat: pickedCat });
  }
  return NextResponse.json({ error: 'category_required' }, { status: 400 });
 } catch (e: any) {
  // 진단: DB/스키마 오류 등 서버 예외 메시지를 표면화(운영 500 원인 파악용)
  console.error('[payment/prepare]', e?.code, e?.message, e);
  return NextResponse.json({ error: 'prepare_failed', code: e?.code ?? null }, { status: 500 });
 }
}
