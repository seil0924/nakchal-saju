// GET /auth/callback — 소셜 OAuth 콜백 (코드 → 세션 교환)
// ★세션 쿠키를 반드시 "리다이렉트 응답 객체(res)"에 직접 심어야 브라우저에 전달되어 로그인이 유지된다.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';
  const res = NextResponse.redirect(new URL(next, origin));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (code && url && key) {
    const sb = createServerClient(url, key, {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(list) { list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
      },
    });
    await sb.auth.exchangeCodeForSession(code);
  }
  return res;
}
