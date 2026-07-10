// GET /api/reports/mine — 내 보관함 리포트 목록 (로그인 시 계정별, 데모는 이 서버 세션)
import { NextResponse } from 'next/server';
import { listReports } from '@/lib/store';
import { requireUser } from '@/lib/supabase/server';

export async function GET() {
  const user = await requireUser();
  const list = await listReports(user?.id);
  return NextResponse.json({ reports: list });
}
