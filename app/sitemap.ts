import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCT_PAGES } from '@/lib/product-pages';
import { CONCEPTS } from '@/lib/seo-concepts';
import { getAllColumns } from '@/lib/column';
import { TYCOONS, tycoonSlug } from '@/lib/tycoon';
import { TAEKIL } from '@/lib/taekil';
import { listPublicReviews } from '@/lib/reviews-db';
import { clientSlug } from '@/lib/clients';
import { indexableBalju } from '@/lib/balju-index';

const BASE = 'https://nakchalsaju.com';

// 크롤링 예산 집중 전략.
// 신생 도메인에 450개 URL을 한꺼번에 제출하니 구글이 "발견됨 - 색인 생성 안 됨"으로 252개를 방치했다.
// 자동 생성 페이지(발주처·인물·용어·지역/업종 랜딩)는 사이트맵에서 제외해
// 사람이 직접 쓴 칼럼과 핵심 상품 페이지에 크롤링을 몰아준다.
// 제외한 페이지도 살아 있고 내부 링크로 접근 가능하므로 색인에서 강제로 빠지지 않는다.
// 색인률이 회복되면 단계적으로 다시 편입한다.
// 후기가 0건인 동안 /review 는 사이트맵에서 뺀다. 빈 페이지가 색인되면
// "후기 없는 서비스"가 검색결과에 박힌다 — 첫 후기가 승인되면 자동으로 들어온다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const hasReviews = (await listPublicReviews(1)).rows.length > 0;

  // 1순위 — 전환이 일어나는 페이지
  const primary = ['', '/reading', '/hoesa', ...(hasReviews ? ['/review'] : []), '/column', '/full', '/pricing', '/contact', '/balju', '/ceo', '/jari', '/taekil',
    '/en/bazi', '/en/date-picker', '/en/why-charts-differ',
    '/zh/bazi', '/zh/why-charts-differ'];
  // 2순위 — 신뢰·전환 보조
  // /bokchae 는 뺐다. 결제 화면이라 noindex 인데 사이트맵에 실려 있으면 서로 모순이다.
  const secondary = ['/why', '/faq', '/samples', '/method', '/ritual', '/glossary'];
  // 3순위 — 법적 고지
  const legal = ['/terms', '/privacy', '/refund'];

  const entries: MetadataRoute.Sitemap = [
    ...primary.map(u => ({
      url: BASE + u, lastModified: now,
      changeFrequency: 'daily' as const, priority: u === '' ? 1 : 0.9,
    })),
    ...PRODUCT_PAGES.map(p => ({
      url: `${BASE}/product/${p.slug}`, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.9,
    })),
    // 사람이 쓴 칼럼 — 색인 최우선 대상
    ...getAllColumns().map(p => ({
      url: `${BASE}/column/${p.slug}`,
      lastModified: p.date ? new Date(p.date) : now,
      changeFrequency: 'monthly' as const, priority: 0.8,
    })),
    // 닮은 CEO 상세 100장. 자동생성이라며 사이트맵에서 빼 뒀는데, 실측해 보니 이 페이지들의 CTR 이
    // 사이트에서 가장 높다(용어사전 0.3% 대 CEO 75%). 진입점이 없어 구글이 몇 장밖에 못 찾고 있었다.
    ...TYCOONS.map(t => ({
      // 한글 주소는 퍼센트 인코딩해야 한다. 날것으로 실었더니 네이버 서치어드바이저가 사이트맵 전체를 오류로 돌려보냈다(2026-10-27).
      url: `${BASE}/ceo/${encodeURIComponent(tycoonSlug(t.name))}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    // 택일 랜딩. 구매 의도가 실린 검색어(개업일·법인설립일·계약일)로 들어오는 자리라
    // 자동 생성이어도 우선순위를 낮게 두지 않는다. 용어사전을 낮춘 것과 같은 기준이다.
    ...TAEKIL.map(t => ({
      url: `${BASE}/taekil/${encodeURIComponent(t.slug)}`, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.8,
    })),
    // 핵심 발주처 상세. 공고 보는 곳·본사·주요 발주를 출처로 확인했고, 이웃 페이지와 겹침이 65% 미만인 곳만(lib/balju-index).
    // 같은 분야·같은 설립일 기관(발전 5사 등)은 문장이 78% 겹쳐 얇은 페이지로 읽히므로 계속 뺀다.
    ...indexableBalju().map(c => ({
      url: `${BASE}/balju/${clientSlug(c.name)}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    ...PAINS.map(p => ({
      url: `${BASE}/why/${p.slug}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.6,
    })),
    ...CONCEPTS.map(c => ({
      url: `${BASE}/saju/${c.slug}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.6,
    })),
    ...secondary.map(u => ({
      url: BASE + u, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.5,
    })),
    ...legal.map(u => ({
      url: BASE + u, lastModified: now,
      changeFrequency: 'yearly' as const, priority: 0.2,
    })),
  ];

  // 한글 주소는 모두 퍼센트 인코딩해서 낸다(이미 인코딩된 것은 한 번 풀고 다시 묶어 이중 인코딩을 막는다).
  // /ceo/스티브잡스, /saju/갑목-일간 이 날것으로 실려 네이버 서치어드바이저가 사이트맵 전체를 오류로 돌려보냈다(2026-10-27).
  return entries.map(e => ({ ...e, url: encodeURI(decodeURI(e.url)) }));
}
