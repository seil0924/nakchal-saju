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

export const authEnabled = () =>
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 로그인 사용자 반환 — 인증 미설정(데모)이면 null (게이팅은 결제 검증으로 유지)
export async function requireUser() {
  if (!authEnabled()) return null;
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  return user; // null이면 미인증
}
