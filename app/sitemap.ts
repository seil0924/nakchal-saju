import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCTS } from '@/lib/categories';
import { CLIENTS, clientSlug } from '@/lib/clients';
import { TYCOONS, tycoonSlug } from '@/lib/tycoon';
import { GUIDES, REGIONS } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
const BASE = 'https://nakchal-saju.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls = ['', '/reading', '/ceo', '/balju', '/why', '/faq', '/full', '/bokchae', '/ritual', '/pricing', '/terms', '/privacy', '/refund'];
  const urls = [
    ...staticUrls,
    ...PAINS.map(p => `/why/${p.slug}`),
    ...PRODUCTS.map(p => `/product/${p.slug}`),
    ...CLIENTS.map(c => `/balju/${clientSlug(c.name)}`),
    ...TYCOONS.map(t => `/ceo/${tycoonSlug(t.name)}`),
    ...GUIDES.map(g => `/guide/${g.slug}`),
    ...REGIONS.map(r => `/region/${r.slug}`),
    ...CONCEPTS.map(c => `/사주/${c.slug}`),
  ];
  return urls.map(u => ({ url: BASE + u, lastModified: now, changeFrequency: 'weekly' as const, priority: u === '' ? 1 : 0.7 }));
}
