// lib/track-src.ts — 방문자가 어디서 왔는가. 낱말 하나로만 남긴다.
//
// **왜 클라이언트가 보내는가.** sendBeacon 이 붙이는 Referer 는 우리 페이지 주소다.
// 밖에서 온 경로는 document.referrer 에만 있고, 서버 헤더로는 볼 수 없다.
// 서버에서 referer 를 읽는 코드를 짜면 전부 'nakchalsaju.com' 으로 찍힌다.
//
// **왜 도메인만 남기는가.** 전체 URL 에는 검색어와 경로가 붙는다. 그건 개인정보다.
// page_views 는 IP·UA·쿠키를 남기지 않기로 한 표다. 그 원칙을 여기서 깨지 않는다.
// 남는 것은 'naver' 같은 낱말 하나뿐이고, 그것으로 채널 판단은 충분하다.

export const SRC = [
  'naver', 'google', 'daum', 'kakao', 'instagram', 'threads',
  'facebook', 'youtube', 'bing', 'pwa', 'direct', 'other',
] as const;
export type Src = (typeof SRC)[number];

const SRC_SET: ReadonlySet<string> = new Set(SRC);
export const isSrc = (v: unknown): v is Src => typeof v === 'string' && SRC_SET.has(v);

// 호스트 → 낱말. naver.com 하나로 통합검색·블로그·모바일이 모두 잡힌다.
const HOSTS: [RegExp, Src][] = [
  [/(^|\.)naver\.com$/i, 'naver'],
  [/(^|\.)google\./i, 'google'],
  [/(^|\.)daum\.net$/i, 'daum'],
  [/(^|\.)kakao\.com$/i, 'kakao'],
  [/(^|\.)kakaocdn\.net$/i, 'kakao'],
  [/(^|\.)instagram\.com$/i, 'instagram'],
  [/(^|\.)threads\.(net|com)$/i, 'threads'],
  [/(^|\.)facebook\.com$/i, 'facebook'],
  [/(^|\.)(youtube\.com|youtu\.be)$/i, 'youtube'],
  [/(^|\.)bing\.com$/i, 'bing'],
];

// utm_source 로 들어온 값도 같은 낱말로 접는다(홈 화면 아이콘은 pwa).
function fromUtm(raw: string): Src | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (isSrc(v)) return v;
  if (v === 'blog' || v === 'naverblog') return 'naver';
  return 'other';
}

function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

/**
 * referrer(document.referrer)와 search(location.search)로 유입원 낱말을 정한다.
 * utm_source 가 있으면 그것이 우선이다 — 우리가 직접 붙인 표시라 referrer 보다 정확하다.
 * 우리 도메인에서 온 것과 referrer 가 없는 것은 둘 다 'direct' 다.
 */
export function srcOf(referrer: string, search: string, selfHost = 'nakchalsaju.com'): Src {
  let utm = '';
  try { utm = new URLSearchParams(search || '').get('utm_source') || ''; } catch { utm = ''; }
  const byUtm = fromUtm(utm);
  if (byUtm) return byUtm;

  const host = hostOf(referrer || '');
  if (!host) return 'direct';
  if (host === selfHost || host.endsWith('.' + selfHost)) return 'direct';

  for (const [re, src] of HOSTS) if (re.test(host)) return src;
  return 'other';
}

export const SRC_LABEL: Record<Src, string> = {
  naver: '네이버', google: '구글', daum: '다음', kakao: '카카오',
  instagram: '인스타그램', threads: '스레드', facebook: '페이스북',
  youtube: '유튜브', bing: '빙', pwa: '홈 화면 아이콘',
  direct: '직접 방문', other: '기타',
};
