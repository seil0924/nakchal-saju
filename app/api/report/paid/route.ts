// GET /api/report/paid?id=<reportId> — 유료 전체 리포트
// ★결제 검증 + (인증 시)소유권 확인된 경우에만 200. 아니면 402/403.
// 유료 텍스트는 여기서 처음 생성됩니다.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, getReportAccess } from '@/lib/store';
import { entitlement, adminBypass } from '@/lib/entitle';
import { requireUser, authEnabled } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  // 소유권/토큰 확인 — reportId(UUID)만 알아도 남의 리포트를 못 열게.
  // 소유자(user_id 일치) 또는 접근토큰(?t=) 일치만 허용. token=null(마이그레이션 전)은 기존 동작 폴백(안전).
  const t = new URL(req.url).searchParams.get('t');
  const user = authEnabled() ? await requireUser() : null;
  const admin = await adminBypass();
  if (authEnabled()) {
    const { owner, token } = await getReportAccess(id);
    const isOwner = !!user && !!owner && owner === user.id;
    const hasToken = !!token && !!t && t === token;
    // 관리자는 남의 리포트도 연다 — 문의에 답하려면 봐야 한다.
    if (token !== null && !isOwner && !hasToken && !admin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { level, bpass } = await entitlement(id, user?.id);
  if (level < 1 && !bpass) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const year = Number(new URL(req.url).searchParams.get('year')) || undefined;
  const full = computeReport(input, level, year, bpass); // 결제된 레벨 + 패스만큼 공개
  return NextResponse.json({ ...full, level, admin });
}
