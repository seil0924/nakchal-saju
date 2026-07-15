// GET /api/report/paid?id=<reportId> — 유료 전체 리포트
// ★결제 검증 + (인증 시)소유권 확인된 경우에만 200. 아니면 402/403.
// 유료 텍스트는 여기서 처음 생성됩니다.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportOwner, unlockLevel, hasBaljuPass } from '@/lib/store';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  // 소유권 확인 (인증이 켜져 있을 때만) — reportId만 알아도 남의 리포트를 못 열게
  const user = authEnabled() ? await requireUser() : null;
  if (authEnabled()) {
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const owner = await getReportOwner(id);
    if (owner && owner !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const level = await unlockLevel(id);           // 0 무료 · 1 택일팩 · 2 전체
  const bpass = await hasBaljuPass(user?.id);     // 발주처 프리미엄 패스
  if (level < 1 && !bpass) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const year = Number(new URL(req.url).searchParams.get('year')) || undefined;
  const full = computeReport(input, level, year, bpass); // 결제된 레벨 + 패스만큼 공개
  return NextResponse.json({ ...full, level });
}
