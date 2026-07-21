// middleware.ts — Supabase 세션 갱신 + 로그인 게이트
// 정책: 랜딩·무료 리딩·바이럴/세일즈 입구는 로그인 없이 "맛보기" 가능(전환 앞단 확보).
//       로그인은 저장(보관함)·마이페이지·결제된 리포트 열람에서만 요구한다.
//       인증 미설정(데모)이면 게이트 없음.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 로그인 없이 접근 가능한 공개 경로.
const PUBLIC_EXACT = new Set<string>([
  '/', '/login', '/terms', '/privacy', '/more',
  '/reading', '/ceo', '/balju', '/bokchae', '/ritual', '/why', '/refund', '/pricing',
]);
const PUBLIC_PREFIX = ['/auth', '/api', '/product/', '/why/', '/balju/', '/report/', '/ceo/', '/guide/', '/region/'];

export function isPublicPath(path: string): boolean {
  if (/\.[^/]+$/.test(path)) return true;   // 정적 파일(.mp4·.jpg·.png·.svg 등)은 게이트 제외
  if (PUBLIC_EXACT.has(path)) return true;
  return PUBLIC_PREFIX.some((p) => path.startsWith(p));
}

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

  // 공개 경로 외(보관함·마이페이지·리포트 열람 등)는 로그인 필요.
  if (!user && !isPublicPath(req.nextUrl.pathname)) {
    const to = req.nextUrl.clone();
    to.pathname = '/login';
    to.search = `?next=${encodeURIComponent(req.nextUrl.pathname + (req.nextUrl.search || ''))}`;
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = {
  // 정적 자산(경로에 . 포함)·_next·auth/callback 은 미들웨어 자체를 태우지 않음
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\..*).*)'],
};
