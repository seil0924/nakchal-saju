// POST /api/report — 명식 입력 → 무료 리포트 + reportId 발급
// 유료 섹션 텍스트/정밀값은 여기서 응답하지 않습니다(게이팅).
import { NextResponse } from 'next/server';
import { computeReport, type ReportInput } from '@/lib/report';
import { saveReport } from '@/lib/store';

export async function POST(req: Request) {
  const input = (await req.json()) as ReportInput;
  if (!input?.birth) return NextResponse.json({ error: 'birth_required' }, { status: 400 });
  const reportId = await saveReport(input);      // 서버가 입력 원장을 보관 (유료는 이걸로 재계산)
  const free = computeReport(input, false);      // unlocked=false → 유료 텍스트/정밀값 제거
  return NextResponse.json({ reportId, ...free });
}
