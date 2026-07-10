// /api/charts — 저장된 사주/대상 (계정별). 로그인 시 계정 귀속, 데모는 서버 세션.
import { NextResponse } from 'next/server';
import { saveChart, listCharts } from '@/lib/store';
import { requireUser } from '@/lib/supabase/server';

export async function GET() {
  const user = await requireUser();
  const charts = await listCharts(user?.id);
  return NextResponse.json({ charts });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  if (!body?.kind || !body?.birth_date) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  await saveChart(user?.id ?? null, {
    kind: body.kind, name: body.name, birth_date: body.birth_date,
    birth_time: body.birth_time ?? null, calendar: body.calendar ?? 'solar', is_leap: !!body.is_leap,
  });
  return NextResponse.json({ ok: true });
}
