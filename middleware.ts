// middleware.ts — Supabase 세션 갱신 + 로그인 게이트
// 인증이 설정된 환경에서는 로그인해야만 사용 가능(무료 포함). 미설정(데모)이면 게이트 없음.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res; // 인증 미설정(데모) → 게이트 없이 통과

  const sb = createServerClient(url, key, {
    cookies: {
      getAll() { return req.cookies.getAll(); },
      setAll(list) { list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
    },
  });
  const { data: { user } } = await sb.auth.getUser();

  // 공개 경로: 로그인·인증콜백·API·약관/개인정보 (그 외 전부 로그인 필요)
  const path = req.nextUrl.pathname;
  const isPublic =
    path === '/login' ||
    path.startsWith('/auth') ||
    path.startsWith('/api') ||
    path === '/terms' ||
    path === '/privacy';
  if (!user && !isPublic) {
    const to = req.nextUrl.clone();
    to.pathname = '/login';
    to.search = `?next=${encodeURIComponent(path + (req.nextUrl.search || ''))}`;
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = {
  // auth/callback은 코드 교환을 방해하지 않도록 미들웨어에서 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
};
