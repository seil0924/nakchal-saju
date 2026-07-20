import type { MetadataRoute } from 'next';
import { PAINS } from '@/lib/pains';
import { PRODUCTS } from '@/lib/categories';
import { CLIENTS, clientSlug } from '@/lib/clients';
const BASE = 'https://nakchal-saju.vercel.app';
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticUrls = ['', '/reading', '/ceo', '/balju', '/why', '/full', '/bokchae', '/ritual', '/pricing', '/terms', '/privacy', '/refund'];
  const urls = [
    ...staticUrls,
    ...PAINS.map(p => `/why/${p.slug}`),
    ...PRODUCTS.map(p => `/product/${p.slug}`),
    ...CLIENTS.map(c => `/balju/${clientSlug(c.name)}`),
  ];
  return urls.map(u => ({ url: BASE + u, lastModified: now, changeFrequency: 'weekly' as const, priority: u === '' ? 1 : 0.7 }));
}
