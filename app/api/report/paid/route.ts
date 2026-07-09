// GET /api/report/paid?id=<reportId> — 유료 전체 리포트
// ★결제가 검증된 reportId에만 200. 아니면 402. 유료 텍스트는 여기서 처음 생성됩니다.
import { NextResponse } from 'next/server';
import { computeReport } from '@/lib/report';
import { getReport, isUnlocked } from '@/lib/store';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 });

  // 실서비스: 여기서 requireUser()로 로그인/소유권도 함께 확인 (lib/supabase 참고)
  if (!(await isUnlocked(id))) {
    return NextResponse.json({ error: 'payment_required' }, { status: 402 });
  }
  const input = await getReport(id);
  if (!input) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const full = computeReport(input, true);       // unlocked=true → 전체 섹션 + 정밀값
  return NextResponse.json(full);
}
