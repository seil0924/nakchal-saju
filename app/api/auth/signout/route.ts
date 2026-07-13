// POST /api/auth/signout — 서버에서 세션 종료(httpOnly 쿠키도 확실히 제거)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const sb = createServerClient(url, key, {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(list) { list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); },
      },
    });
    await sb.auth.signOut();
  }
  return res;
}
