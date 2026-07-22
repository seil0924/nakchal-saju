import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { GLOSSARY } from '@/lib/glossary';
import { PRODUCTS } from '@/lib/categories';
import { CLIENTS, clientSlug } from '@/lib/clients';
import { TYCOONS, tycoonSlug } from '@/lib/tycoon';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import { getAllColumns } from '@/lib/column';
const BASE = 'https://nakchalsaju.com';
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls = ['', '/reading', '/ceo', '/balju', '/why', '/faq', '/samples', '/glossary', '/method', '/full', '/bokchae', '/ritual', '/pricing', '/column', '/terms', '/privacy', '/refund'];
  const columns = getAllColumns();
  const urls = [
    ...staticUrls,
    ...Array.from({ length: 10 }, (_, i) => `/saeobunse/${2026 + i}`),
    ...PAINS.map(p => `/why/${p.slug}`),
    ...GLOSSARY.map(t => `/glossary/${t.slug}`),
    ...PRODUCTS.map(p => `/product/${p.slug}`),
    ...CLIENTS.map(c => `/balju/${clientSlug(c.name)}`),
    ...TYCOONS.map(t => `/ceo/${tycoonSlug(t.name)}`),
    ...GUIDES.map(g => `/guide/${g.slug}`),
    ...REGIONS.map(r => `/region/${r.slug}`),
    ...INDUSTRIES.map(r => `/industry/${r.slug}`),
    ...CONCEPTS.map(c => `/saju/${c.slug}`),
  ];
  const base = urls.map(u => ({ url: BASE + u, lastModified: now, changeFrequency: 'weekly' as const, priority: u === '' ? 1 : 0.7 }));
  // 칼럼 글은 개별 발행일을 lastModified로 — 검색엔진 신선도 신호
  const posts = columns.map(p => ({ url: `${BASE}/column/${p.slug}`, lastModified: p.date ? new Date(p.date) : now, changeFrequency: 'monthly' as const, priority: 0.6 }));
  return [...base, ...posts];
}
