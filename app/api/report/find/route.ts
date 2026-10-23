// POST /api/report/find — 산 리포트 다시 찾기(2026-10-23, 로그인 대신).
// 결제 때 넣은 성함과 휴대폰 번호가 둘 다 맞아야 목록이 나온다(번호만으로는 안 된다).
// 같은 곳에서 한 시간에 10번까지 — 그 이상은 남의 번호를 두드려 보는 것이다(창업레이더와 같은 선).
// 찾으면 이 브라우저에 구매자 열쇠를 심어, 패스가 있으면 이 기기에서도 열리게 한다.
import { NextResponse } from 'next/server';
import { purchasesOf, findTooMany } from '@/lib/store';
import { buyerKey, normName, normPhone, validPhone, ipHash, BUYER_COOKIE, BUYER_COOKIE_OPTS } from '@/lib/buyer';

export async function POST(req: Request) {
  let name = '', phone = '';
  try { const b = await req.json(); name = normName(String(b?.name ?? '')); phone = normPhone(String(b?.phone ?? '')); }
  catch { return NextResponse.json({ error: 'bad_request', message: '요청을 읽지 못했습니다.' }, { status: 400 }); }
  if (!name) return NextResponse.json({ error: 'name', message: '결제 때 넣은 성함을 넣어주세요.' }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: 'phone', message: '휴대폰 번호를 010-0000-0000 처럼 넣어주세요.' }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  if (await findTooMany(ipHash(ip))) return NextResponse.json({ error: 'too_many', message: '잠시 뒤 다시 해 주세요. 한 시간에 10번까지 찾을 수 있습니다.' }, { status: 429 });

  const key = buyerKey(name, phone);
  const list = await purchasesOf(key);
  const reports = list.filter(x => x.reportId).map(x => ({ id: x.reportId as string, item: x.item, paidAt: x.paidAt }));
  const pass = list.some(x => x.passKey);
  const res = NextResponse.json({ reports, pass });
  if (reports.length || pass) res.cookies.set(BUYER_COOKIE, key, BUYER_COOKIE_OPTS);
  return res;
}
