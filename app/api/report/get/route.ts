// GET /api/report/get?id= — 보관함에서 리포트 다시 열기 (잠금 상태 반영)
// 결제된 리포트면 전체, 아니면 무료 게이팅본을 반환.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportOwner, unlockLevel, hasBaljuPass } from '@/lib/store';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const user = authEnabled() ? await requireUser() : null;
  const owner = authEnabled() ? await getReportOwner(id) : null;
  // 소유자(또는 데모/무인증)면 결제 레벨 그대로, 공유링크로 온 비소유자·비로그인은 무료 티저(level 0)만 — 유료 내용은 계속 서버 게이팅.
  const isOwner = !authEnabled() || (!!user && (!owner || owner === user.id));
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const level = isOwner ? await unlockLevel(id) : 0;
  const bpass = isOwner ? await hasBaljuPass(user?.id) : false;
  const year = Number(new URL(req.url).searchParams.get('year')) || undefined;
  const rep = computeReport(input, level, year, bpass);
  return NextResponse.json({ reportId: id, unlocked: level >= 1, level, mine: isOwner, cat: input.cat ?? null, ...rep });
}
