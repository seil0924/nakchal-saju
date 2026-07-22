import type { MetadataRoute } from 'next';
const BASE = 'https://nakchalsaju.com';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 검색·AI 크롤러 모두 허용(공개 페이지). 개인·관리·API는 제외.
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin', '/mypage', '/vault', '/login', '/report/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
