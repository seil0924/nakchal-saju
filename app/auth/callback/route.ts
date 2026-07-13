// GET /auth/callback — 소셜 OAuth 콜백 (코드 → 세션 교환)
// ★1) 세션 쿠키를 redirect 응답(res)에 직접 심고
//   2) Vercel 프록시 뒤에서 내부 호스트로 튕기지 않도록 x-forwarded-host로 공개 도메인 복원
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  const forwardedHost = req.headers.get('x-forwarded-host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const base = forwardedHost ? `${proto}://${forwardedHost}` : origin;
  const res = NextResponse.redirect(`${base}${next}`);

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
