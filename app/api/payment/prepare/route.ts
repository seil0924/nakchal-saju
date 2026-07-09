// POST /api/payment/prepare — 결제 사전등록
// 서버가 주문금액(990원)을 확정합니다. 클라이언트가 금액을 정하지 못하게.
import { NextResponse } from 'next/server';
import { getReport, createOrder } from '@/lib/store';

const PRICE = 990;

export async function POST(req: Request) {
  const { reportId } = await req.json();
  if (!reportId || !(await getReport(reportId))) {
    return NextResponse.json({ error: 'invalid_report' }, { status: 400 });
  }
  const order = await createOrder(reportId, PRICE);   // 서버가 금액 확정
  return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName: '낙찰사주 전체 리포트' });
}
