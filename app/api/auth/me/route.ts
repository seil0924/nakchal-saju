// GET /api/auth/me — 현재 로그인 상태 (서버가 쿠키를 읽어 판정 → httpOnly여도 확실)
import { NextResponse } from 'next/server';
import { authEnabled, currentUserRole } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'; // 매 요청 쿠키를 읽어야 하므로 정적화 금지

export async function GET() {
  if (!authEnabled()) return NextResponse.json({ loggedIn: false, demo: true });
  try {
    const { user, role, profile } = (await currentUserRole()) as any;
    if (!user) return NextResponse.json({ loggedIn: false });
    return NextResponse.json({
      loggedIn: true,
      email: profile?.email ?? user.email ?? '',
      name: profile?.name ?? '',
      role: role ?? 'user',
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
