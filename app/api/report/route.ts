// POST /api/report — 명식 입력 → 무료 리포트 + reportId 발급
// 유료 섹션 텍스트/정밀값은 여기서 응답하지 않습니다(게이팅).
import { NextResponse } from 'next/server';
import { computeReport, type ReportInput } from '@/lib/report';
import { saveReport, hasBaljuPass } from '@/lib/store';
import { adminBypass } from '@/lib/entitle';
import { requireUser } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const input = (await req.json()) as ReportInput;
  if (!input?.birth) return NextResponse.json({ error: 'birth_required' }, { status: 400 });
  const user = await requireUser();                        // 데모면 null
  // 관리자는 무료 리포트 단계에서부터 잠금 없이 본다 — 매번 결제를 태우고 점검할 수는 없다.
  const admin = await adminBypass();
  const bpass = admin || await hasBaljuPass(user?.id);
  const free = computeReport(input, admin ? 2 : false, undefined, bpass);
  const label = `${input.name ? input.name + ' 대표님' : '대표님'} · ${free.gauge.dir}${input.legalName ? ' · ' + input.legalName : ''}`;
  const { id: reportId, token } = await saveReport(input, user?.id, label); // 원장 보관(+소유자+라벨+접근토큰)
  return NextResponse.json({ reportId, token, label, admin, ...free });
}
