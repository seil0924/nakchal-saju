// lib/supabase/server.ts — 서버 컴포넌트/라우트 핸들러용 Supabase 클라이언트
import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return store.getAll(); },
        setAll(list) {
          try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* RSC */ }
        },
      },
    },
  );
}

// 로그인/소유권 확인 헬퍼 — 실서비스 유료 라우트에서 사용
export async function requireUser() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  return user; // null이면 미인증
}
