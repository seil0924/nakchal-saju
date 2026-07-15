import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCTS } from '@/lib/categories';
const BASE = 'https://nakchal-saju.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls = ['', '/reading', '/ceo', '/balju', '/why', '/full', '/bokchae', '/ritual', '/terms', '/privacy', '/refund'];
  const urls = [
    ...staticUrls,
    ...PAINS.map(p => `/why/${p.slug}`),
    ...PRODUCTS.map(p => `/product/${p.slug}`),
  ];
  return urls.map(u => ({ url: BASE + u, lastModified: now, changeFrequency: 'weekly' as const, priority: u === '' ? 1 : 0.7 }));
}
