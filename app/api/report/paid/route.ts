// GET /api/report/paid?id=<reportId> — 유료 전체 리포트
// ★결제 검증 + (인증 시)소유권 확인된 경우에만 200. 아니면 402/403.
// 유료 텍스트는 여기서 처음 생성됩니다.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportOwner, unlockLevel } from '@/lib/store';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  // 소유권 확인 (인증이 켜져 있을 때만) — reportId만 알아도 남의 리포트를 못 열게
  if (authEnabled()) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const owner = await getReportOwner(id);
    if (owner && owner !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const level = await unlockLevel(id);           // 0 무료 · 1 택일팩 · 2 전체
  if (level < 1) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const full = computeReport(input, level);      // 결제된 레벨만큼만 섹션·정밀값 공개
  return NextResponse.json({ ...full, level });
}
