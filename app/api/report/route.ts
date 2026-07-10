// POST /api/report — 명식 입력 → 무료 리포트 + reportId 발급
// 유료 섹션 텍스트/정밀값은 여기서 응답하지 않습니다(게이팅).
import { NextResponse } from 'next/server';
import { computeReport, type ReportInput } from '@/lib/report';
import { saveReport } from '@/lib/store';
import { requireUser } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const input = (await req.json()) as ReportInput;
  if (!input?.birth) return NextResponse.json({ error: 'birth_required' }, { status: 400 });
  const user = await requireUser();                        // 데모면 null
  const free = computeReport(input, false);                // unlocked=false → 유료 텍스트/정밀값 제거
  const label = `${input.name ? input.name + ' 대표님' : '대표님'} · ${free.gauge.dir}${input.legalName ? ' · ' + input.legalName : ''}`;
  const reportId = await saveReport(input, user?.id, label); // 원장 보관(+소유자+라벨)
  return NextResponse.json({ reportId, label, ...free });
}
