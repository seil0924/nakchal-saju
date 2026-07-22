// GET /api/report/get?id= — 보관함에서 리포트 다시 열기 (잠금 상태 반영)
// 결제된 리포트면 전체, 아니면 무료 게이팅본을 반환.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportAccess, unlockLevel, hasBaljuPass } from '@/lib/store';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });
  const t = new URL(req.url).searchParams.get('t');
  const user = authEnabled() ? await requireUser() : null;
  const { owner, token } = authEnabled() ? await getReportAccess(id) : { owner: null, token: null };
  // 소유자(user_id 일치) 또는 접근토큰(?t=) 일치면 결제 레벨 그대로, 아니면 무료 티저(level 0) — 유료 내용은 서버 게이팅.
  // token=null(마이그레이션 전) 또는 무인증이면 기존 동작으로 폴백(안전).
  const isOwner = !authEnabled()
    || (token === null
      ? (!!user && (!owner || owner === user.id))
      : ((!!user && !!owner && owner === user.id) || (!!t && t === token)));
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const level = isOwner ? await unlockLevel(id) : 0;
  const bpass = isOwner ? await hasBaljuPass(user?.id) : false;
  const year = Number(new URL(req.url).searchParams.get('year')) || undefined;
  const rep = computeReport(input, level, year, bpass);
  return NextResponse.json({ reportId: id, unlocked: level >= 1, level, mine: isOwner, cat: input.cat ?? null, ...rep });
}
