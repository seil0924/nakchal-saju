// POST /api/payment/prepare — 결제 사전등록
// 서버가 금액을 확정합니다. 카테고리 리포트면 카테고리 개별가, 아니면 sku(택일팩/전체).
import { NextResponse } from 'next/server';
import { getReport, createOrder, BALJU_PASS_KEY } from '@/lib/store';
import { PRICE_BALJU_PASS } from '@/lib/constants';
import { isCatKey, CAT_INFO } from '@/lib/report-categories';
import { requireUser } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { reportId, sku, bokchae, amount } = await req.json();
  // 복채(福債) — 리포트와 무관한 자율 감사·기원 결제. 서버가 금액 범위만 clamp.
  if (bokchae) {
    const amt = Math.max(1000, Math.min(1000000, Math.round(Number(amount) || 0)));
    const order = await createOrder(reportId || 'bokchae', amt, 0);   // level 0 — 언락과 무관
    return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: '낙찰사주 복채(福債)', sku: 'bokchae' });
  }
  // 발주처 프리미엄 패스 — 사용자 계정 단위 권한(리포트와 무관)
  if (sku === 'baljuPass') {
    const user = await requireUser();
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
  // 카테고리 전용 정책 — 카테고리 없는 통합 리포트의 '전체 열기'(구 12,900원)는 폐지.
  // 열람은 개별 카테고리 상품(대표·사정률·발주처·협정·대운·캘린더)으로만 결제한다.
  return NextResponse.json({ error: 'category_required' }, { status: 400 });
}
