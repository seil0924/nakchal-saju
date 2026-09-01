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
  '/jari', '/full', '/taekil',
]);
// '/en/' 은 통째로 공개다. 영어 페이지를 새로 만들 때마다 여기 적는 걸 잊으면
// 로그인으로 튕기고, 그 /login 은 robots.txt 가 막고 있어 구글은 "robots.txt 차단"으로 읽는다.
// 실제로 그렇게 한 번 당했다.
const PUBLIC_PREFIX = ['/auth', '/api', '/en/', '/zh/', '/product/', '/why/', '/balju/', '/report/', '/ceo/', '/guide/', '/region/', '/industry/', '/glossary/', '/saju/', '/taekil/', '/column/', '/saeobunse/'];

export function isPublicPath(rawPath: string): boolean {
  let path = rawPath; try { path = decodeURIComponent(rawPath); } catch {}
  if (/\.[^/]+$/.test(path)) return true;   // 정적 파일(.mp4·.jpg·.png·.svg 등)은 게이트 제외
  if (PUBLIC_EXACT.has(path)) return true;
  return PUBLIC_PREFIX.some((p) => path.startsWith(p));
}

// 한글 주소 별칭. app/사업운세 와 app/사주/[slug] 는 소스에 있지만 Next 가 한글 세그먼트를
// 라우팅하지 못해 배포본에서 404 였다(x-matched-path 가 라우트가 아니라 퍼센트 인코딩 문자열로 잡힌다).
// 내용은 ASCII 쪽에 그대로 있으므로 여기서 넘긴다. 라우트 파일은 삭제했다.

// 합쳐서 없어진 칼럼 → 합친 글로 301. 같은 주제를 500자씩 쪼개 놓으면 어느 쪽도 안 뜬다
// (구글은 얇은 중복을 사이트 단위로 본다). 지운 게 아니라 한 편으로 모은 것이라
// 옛 주소로 들어온 사람도 찾던 내용을 더 자세히 보게 된다.
export const COLUMN_MERGED: Record<string, string> = {
  'invalid-performance-certificate': 'performance-certificate',
  'joint-performance-recognition': 'performance-certificate',
  'performance-restricted-tender': 'performance-certificate',
  'recent-performance-period': 'performance-certificate',
  'manseryeok-boneun-beop': 'sajupalja-gujo',
  'jijanggan': 'sajupalja-gujo',
  'hapchung-hyeongpa': 'sajupalja-gujo',
  'gyeokguk-ipmun': 'sajupalja-gujo',
  'sibiunseong': 'sajupalja-gujo',
  'geunmyo-hwasil': 'sajupalja-gujo',
  'baekho-goegang': 'sibisinsal',
  'dohwa-simhwa': 'sibisinsal',
  'hwagae-simhwa': 'sibisinsal',
  'yangin-salm': 'sibisinsal',
  'jungja-tuja-sigi': 'siksang-saengjae',
  'daechul-jageumjodal-sigi': 'siksang-saengjae',
  'tuja-yuhok-hantang': 'siksang-saengjae',
  'daeun-boneun-beop': 'seun-worun-iljin',
  '2026-9wol-saeopun': 'seun-worun-iljin',
};
const KO_ALIAS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^\/사업운세\/?$/, () => '/saeobunse/2026'],
  [/^\/사주\/(.+)$/, (m) => '/saju/' + m[1]],
];

export async function middleware(req: NextRequest) {
  // 한글 별칭은 인증보다 먼저 처리한다 — 어차피 공개 페이지로 보낼 것이라.
  let koPath = req.nextUrl.pathname;
  try { koPath = decodeURIComponent(koPath); } catch { /* 잘못된 인코딩은 그대로 둔다 */ }
  // 합쳐진 칼럼은 인증보다 먼저 301 로 넘긴다.
  const cm = koPath.match(/^\/column\/([^/]+)\/?$/);
  if (cm && COLUMN_MERGED[cm[1]]) {
    const url = req.nextUrl.clone();
    url.pathname = '/column/' + COLUMN_MERGED[cm[1]];
    return NextResponse.redirect(url, 301);
  }
  for (const [re, to] of KO_ALIAS) {
    const m = koPath.match(re);
    if (m) {
      const url = req.nextUrl.clone();
      url.pathname = to(m);
      return NextResponse.redirect(url, 308);
    }
  }
  // 루트 레이아웃이 <html lang> 을 맞추려면 현재 경로를 알아야 하는데, 서버 컴포넌트는 pathname 을 못 받는다.
  // 헤더로 넘긴다. /en, /zh 에 lang="ko" 가 붙어 있으면 스크린리더와 검색엔진 둘 다에게 거짓말이 된다.
  const fwd = new Headers(req.headers);
  fwd.set('x-nk-path', req.nextUrl.pathname);
  const res = NextResponse.next({ request: { headers: fwd } });
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
