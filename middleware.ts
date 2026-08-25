// middleware.ts — Supabase 세션 갱신 + 로그인 게이트
// 정책: 랜딩·무료 리딩·바이럴/세일즈 입구는 로그인 없이 "맛보기" 가능(전환 앞단 확보).
//       로그인은 저장(보관함)·마이페이지·결제된 리포트 열람에서만 요구한다.
//       인증 미설정(데모)이면 게이트 없음.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 로그인 없이 접근 가능한 공개 경로.
const PUBLIC_EXACT = new Set<string>([
  '/', '/login', '/terms', '/privacy', '/more', '/thanks', '/saeobunse',
  '/reading', '/ceo', '/balju', '/bokchae', '/ritual', '/why', '/faq', '/samples', '/glossary', '/method', '/refund', '/pricing', '/column',
  // '/full' 은 리포트 본문이 아니라 그것을 파는 랜딩이다. 사이트맵 1순위에 올려놓고
  // 로그인으로 막고 있었다 — 검색으로 온 사람이 전부 튕겼다.
  '/jari', '/full',
]);
// '/en/' 은 통째로 공개다. 영어 페이지를 새로 만들 때마다 여기 적는 걸 잊으면
// 로그인으로 튕기고, 그 /login 은 robots.txt 가 막고 있어 구글은 "robots.txt 차단"으로 읽는다.
// 실제로 그렇게 한 번 당했다.
const PUBLIC_PREFIX = ['/auth', '/api', '/en/', '/product/', '/why/', '/balju/', '/report/', '/ceo/', '/guide/', '/region/', '/industry/', '/glossary/', '/saju/', '/column/', '/saeobunse/'];

export function isPublicPath(rawPath: string): boolean {
  let path = rawPath; try { path = decodeURIComponent(rawPath); } catch {}
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
