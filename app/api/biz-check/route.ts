// POST /api/biz-check — 거장 사주 페이지의 "대표님은 사업을 해도 되는 사주일까요?" (2026-10-21)
// 생년월일로 버는 방식 판정·6대 축 맛보기, 그리고 지금 보던 거장과의 여섯 부호 비교를 준다.
// 리포트를 저장하지 않는다(맛보기라 원장에 남길 이유가 없다).
import { NextResponse } from 'next/server';
import { chartFromBirth, pil } from '@/lib/engine';
import { bizCheck } from '@/lib/biz-check';
import { compareTycoon } from '@/lib/tycoon';

export async function POST(req: Request) {
  try {
    const { birth, tycoon } = await req.json();
    if (!birth || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) {
      return NextResponse.json({ error: 'birth_required' }, { status: 400 });
    }
    const c = chartFromBirth(birth, null, 'solar', false);
    const vs = typeof tycoon === 'string' && tycoon.length <= 40 ? compareTycoon(c, tycoon) : null;
    return NextResponse.json({ myPills: pil(c.dGan, c.dZhi), ...bizCheck(c), vs });
  } catch {
    return NextResponse.json({ error: 'compute_failed' }, { status: 400 });
  }
}
