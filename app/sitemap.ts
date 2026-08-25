import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCTS } from '@/lib/categories';
import { CONCEPTS } from '@/lib/seo-concepts';
import { getAllColumns } from '@/lib/column';

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
  const primary = ['', '/reading', '/column', '/full', '/pricing', '/balju', '/ceo', '/jari',
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
