import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCTS } from '@/lib/categories';
import { CONCEPTS } from '@/lib/seo-concepts';
import { getAllColumns } from '@/lib/column';
import { TYCOONS, tycoonSlug } from '@/lib/tycoon';
import { TAEKIL } from '@/lib/taekil';

const BASE = 'https://nakchalsaju.com';

// 크롤링 예산 집중 전략.
// 신생 도메인에 450개 URL을 한꺼번에 제출하니 구글이 "발견됨 - 색인 생성 안 됨"으로 252개를 방치했다.
// 자동 생성 페이지(발주처·인물·용어·지역/업종 랜딩)는 사이트맵에서 제외해
// 사람이 직접 쓴 칼럼과 핵심 상품 페이지에 크롤링을 몰아준다.
// 제외한 페이지도 살아 있고 내부 링크로 접근 가능하므로 색인에서 강제로 빠지지 않는다.
// 색인률이 회복되면 단계적으로 다시 편입한다.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 1순위 — 전환이 일어나는 페이지
  const primary = ['', '/reading', '/column', '/full', '/pricing', '/balju', '/ceo', '/jari', '/taekil',
    '/en/bazi', '/en/date-picker', '/en/why-charts-differ',
    '/zh/bazi', '/zh/why-charts-differ'];
  // 2순위 — 신뢰·전환 보조
  const secondary = ['/why', '/faq', '/samples', '/method', '/bokchae', '/ritual', '/glossary'];
  // 3순위 — 법적 고지
  const legal = ['/terms', '/privacy', '/refund'];

  const entries: MetadataRoute.Sitemap = [
    ...primary.map(u => ({
      url: BASE + u, lastModified: now,
      changeFrequency: 'daily' as const, priority: u === '' ? 1 : 0.9,
    })),
    ...PRODUCTS.map(p => ({
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
      url: `${BASE}/ceo/${tycoonSlug(t.name)}`, lastModified: now,
      changeFrequency: 'monthly' as const, priority: 0.7,
    })),
    // 택일 랜딩. 구매 의도가 실린 검색어(개업일·법인설립일·계약일)로 들어오는 자리라
    // 자동 생성이어도 우선순위를 낮게 두지 않는다. 용어사전을 낮춘 것과 같은 기준이다.
    ...TAEKIL.map(t => ({
      url: `${BASE}/taekil/${encodeURIComponent(t.slug)}`, lastModified: now,
      changeFrequency: 'weekly' as const, priority: 0.8,
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

  return entries;
}
