// POST /api/payment/prepare — 결제 사전등록
// 서버가 상품(sku)별 금액을 확정합니다. 클라이언트가 금액을 정하지 못하게.
import { NextResponse } from 'next/server';
import { getReport, createOrder } from '@/lib/store';
import { SKU, type Sku } from '@/lib/constants';

export async function POST(req: Request) {
  const { reportId, sku } = await req.json();
  if (!reportId || !(await getReport(reportId))) {
    return NextResponse.json({ error: 'invalid_report' }, { status: 400 });
  }
  const key: Sku = (sku === 'taekil' || sku === 'full') ? sku : 'full';
  const { price, level, orderName } = SKU[key];
  const order = await createOrder(reportId, price, level);   // 서버가 금액·레벨 확정
  return NextResponse.json({ paymentId: order.paymentId, amount: order.amount, orderName, sku: key });
}
