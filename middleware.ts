// middleware.ts — Supabase 세션 갱신 (env 없으면 no-op → 로컬/데모에서도 빌드·실행 OK)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res; // 환경변수 없으면 인증 비활성(데모 모드)

  const sb = createServerClient(url, key, {
    cookies: {
      getAll() { return req.cookies.getAll(); },
      setAll(list) { list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
    },
  });
  await sb.auth.getUser();
  return res;
}

export const config = {
  // auth/callback은 코드 교환을 방해하지 않도록 미들웨어에서 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
};
