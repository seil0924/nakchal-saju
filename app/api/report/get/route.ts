// GET /api/report/get?id= — 보관함에서 리포트 다시 열기 (잠금 상태 반영)
// 결제된 리포트면 전체, 아니면 무료 게이팅본을 반환.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportOwner, unlockLevel } from '@/lib/store';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  if (authEnabled()) {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const owner = await getReportOwner(id);
    if (owner && owner !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const level = await unlockLevel(id);
  const year = Number(new URL(req.url).searchParams.get('year')) || undefined;
  const rep = computeReport(input, level, year);
  return NextResponse.json({ reportId: id, unlocked: level >= 1, level, cat: input.cat ?? null, ...rep });
}
