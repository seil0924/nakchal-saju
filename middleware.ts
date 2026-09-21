// middleware.ts — Supabase 세션 갱신 + 로그인 게이트
// 정책: 랜딩·무료 리딩·바이럴/세일즈 입구는 로그인 없이 "맛보기" 가능(전환 앞단 확보).
//       로그인은 저장(보관함)·마이페이지·결제된 리포트 열람에서만 요구한다.
//       인증 미설정(데모)이면 게이트 없음.
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 로그인 없이 접근 가능한 공개 경로.
const PUBLIC_EXACT = new Set<string>([
  '/', '/login', '/terms', '/privacy', '/more', '/thanks', '/saeobunse',
  '/reading', '/hoesa', '/review', '/ceo', '/balju', '/bokchae', '/ritual', '/why', '/faq', '/samples', '/glossary', '/method', '/refund', '/pricing', '/column',
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

// 로그인이 필요한 곳은 이 셋뿐이다. 예전엔 '공개 목록에 없으면 막는다' 였는데, 그러면
// 없는 주소(오타·지운 글)까지 /login 으로 튕겨서 404 가 한 번도 안 났다 — 사람은 영문 모를
// 로그인 화면을 보고, 검색엔진은 없는 주소를 전부 로그인 페이지로 읽는다(2026-09-10 60명 점검).
const PROTECTED_PREFIX = ['/admin', '/mypage', '/vault'];
export function needsLogin(rawPath: string): boolean {
  let path = rawPath; try { path = decodeURIComponent(rawPath); } catch {}
  if (isPublicPath(path)) return false;
  return PROTECTED_PREFIX.some((p) => path === p || path.startsWith(p + '/'));
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
  'baesin-sagi-inbok': 'sosong-seungpae-gwan',
  'gapjil-balju-daeeung': 'sosong-seungpae-gwan',
  'hadogeup-partner-gunghap': 'hoesa-daepyo-gunghap',
  'samhap-yukhap': 'hoesa-daepyo-gunghap',
  'daejanggun-samsalbang': 'jiyeok-ohaeng-eopjong',
  'saok-maeip-taekil': 'jiyeok-ohaeng-eopjong',
  'bid-opening': 'josadalcheong-nara-jangteo',
  'bid-bond': 'josadalcheong-nara-jangteo',
  'bid-cancellation-invalid': 'josadalcheong-nara-jangteo',
  'failed-bid-rebid': 'josadalcheong-nara-jangteo',
  'same-price-bidder': 'josadalcheong-nara-jangteo',
  'regional-restricted-tender': 'josadalcheong-nara-jangteo',
  'construction-license-eligibility': 'josadalcheong-nara-jangteo',
  'agreement-submission-deadline': 'josadalcheong-nara-jangteo',
  'preliminary-base-price': 'josadalcheong-nara-jangteo',
  'credit-rating-tender': 'jeokgyeoksimsa-jeomsu',
  'debt-ratio-qualification': 'jeokgyeoksimsa-jeomsu',
  'financial-condition-review': 'jeokgyeoksimsa-jeomsu',
  'jeokgyeoksimsa-seoryu': 'jeokgyeoksimsa-jeomsu',
  'jonghapsimsa-un': 'jeokgyeoksimsa-jeomsu',
  'poor-performance-score': 'jeokgyeoksimsa-jeomsu',
  'advance-payment': 'progress-payment',
  'liquidated-damages': 'progress-payment',
  'subcontract-management-plan': 'progress-payment',
  'subcontract-payment-system': 'progress-payment',
  'consortium-daepyosa': 'joint-share-ratio',
  'representative-vs-lead-company': 'joint-share-ratio',
  'bigyeop-gyeopjae': 'sipseong-swipge',
  'gwanin-sangsaeng': 'sipseong-swipge',
  'sipsin-pyeonjung': 'sipseong-swipge',
  'jaegwan-ipchal': 'sipseong-swipge',
  'gyeyak-taekil': 'gaeeop-taekil',
  'beobin-seollipil-taekil': 'gaeeop-taekil',
  'daepyo-chwiimil-taekil': 'gaeeop-taekil',
  'nakchal-hu-gyeyak-ihaeng': 'gaeeop-taekil',
  'soneomneun-nal': 'gaeeop-taekil',
  'daepyo-bulmyeon-buan': 'daepyo-beonaus',
  'saeop-cheolsu-gomin': 'daepyo-beonaus',
  'pyeeop-jaegi-un': 'daepyo-beonaus',
  'ipchal-pogi-pandan': 'tuchal-magam-5bun',
  'jeoga-chulhyeol-gyeongjaeng': 'tuchal-magam-5bun',
  'jintaeyangsi-yaja': 'ipchun-gijun',
  'eumryang-yundal': 'ipchun-gijun',
  'johu-hannan': 'singang-sinyak',
  'cheongan-chung': 'singang-sinyak',
  '2026-samjae-tti': 'samjae-daeeung',
  'munchang-hakdang': 'cheoneul-gwiin',
  'wonjin-gwimun': 'sibisinsal',
  'yeokma-simhwa': 'sibisinsal',
  'jungdogeum-japhaeng': 'progress-payment',
  'gongdong-sugup-gunghap': 'hoesa-daepyo-gunghap',
  'hoesa-daeun': 'hoesa-daepyo-gunghap',
  'bidder-registration': 'josadalcheong-nara-jangteo',
  'bid-rate-vs-award-rate': 'josadalcheong-nara-jangteo',
  'mutual-market-entry': 'josadalcheong-nara-jangteo',
  'construction-trade-reform': 'josadalcheong-nara-jangteo',
  'habangi-ipchal-chongun-2026': 'seun-worun-iljin',
  'chuseok-jeonhu-suju': 'seun-worun-iljin',
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
  // 현재 경로를 헤더로 넘긴다(쓰는 쪽이 있으면 쓰라고 남겨 둔다).
  // ※ 서버 컴포넌트에서 이 헤더를 읽는 순간 그 페이지는 정적으로 굳지 못한다 — 2026-09-21 에
  //   루트 레이아웃에서 걷어냈다. 문서 언어는 /en·/zh 페이지가 스스로 바꾼다.
  const fwd = new Headers(req.headers);
  fwd.set('x-nk-path', req.nextUrl.pathname);
  const res = NextResponse.next({ request: { headers: fwd } });
  // 로그인 확인은 보관함·마이페이지·관리자에서만 한다.
  // 예전에는 모든 요청마다 Supabase 에 로그인 조회를 보냈다 — 크롤러가 캐시된 페이지를 한 장 열 때도
  // 서버 함수가 깨어나 네트워크 호출을 했다. 토큰 갱신은 브라우저 클라이언트가 알아서 한다.
  if (!needsLogin(req.nextUrl.pathname)) return res;
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

  // 보관함·마이페이지·관리자만 로그인 필요. 그 밖의 없는 주소는 그대로 흘려 404 를 받게 한다.
  if (!user && needsLogin(req.nextUrl.pathname)) {
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
