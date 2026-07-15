import './globals.css';
import type { Metadata } from 'next';
import DesktopSidebar from '@/app/_components/DesktopSidebar';
import TapFX from '@/app/_components/TapFX';
import IntroSplash from '@/app/_components/IntroSplash';

export const metadata: Metadata = {
  metadataBase: new URL('https://nakchal-saju.vercel.app'),
  title: { default: '낙찰사주 — 대표와 회사의 사주, 오늘의 낙찰 사정률부터', template: '%s · 낙찰사주' },
  description: '대표와 회사(법인)의 사주를 봐드리는 회사 사주 전문 서비스. 오늘의 낙찰 사정률·법인 운세·발주처/동업/협정 궁합·투찰 택일을 만세력으로 짚어드립니다.',
  keywords: ['회사 사주', '법인 사주', '낙찰사주', '사정률', '입찰', '조달', '만세력', '발주처 궁합', '법인 운세'],
  openGraph: {
    title: '낙찰사주 — 대표와 회사의 사주 전문',
    description: '재주는 갖추셨습니다. 그 운칠(運七)을 짚어드립니다. 오늘의 낙찰 사정률부터 회사 운세·궁합까지.',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: '낙찰사주 — 會社 사주 전문' }],
  },
  twitter: { card: 'summary_large_image', title: '낙찰사주 — 會社 사주 전문', description: '오늘의 낙찰 사정률을 사주로 짚다', images: ['/api/og'] },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION } : {},
  },
};

// 구조화 데이터(JSON-LD) — 검색·AI가 서비스 정체를 정확히 이해하도록
const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://nakchal-saju.vercel.app/#org', name: '낙찰사주', url: 'https://nakchal-saju.vercel.app', description: '공공입찰·수주 대표를 위한 회사 사주 전문 서비스.' },
    { '@type': 'WebSite', '@id': 'https://nakchal-saju.vercel.app/#site', url: 'https://nakchal-saju.vercel.app', name: '낙찰사주', inLanguage: 'ko', publisher: { '@id': 'https://nakchal-saju.vercel.app/#org' } },
    { '@type': 'Service', name: '낙찰사주 — 회사 사주·사정률·발주처 궁합·투찰 택일', serviceType: '사주명리 기반 비즈니스 의사결정 참고 서비스', provider: { '@id': 'https://nakchal-saju.vercel.app/#org' }, areaServed: 'KR', description: '대표와 법인의 사주로 오늘의 낙찰 사정률, 발주처·동업·협정 궁합, 회사 대운, 투찰 택일을 만세력으로 짚어드립니다. 참고·오락용.' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 본문: Pretendard(동적 서브셋) · 제목/한자: Noto Serif KR 명조 */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
        <IntroSplash />
        <TapFX />
        <div className="shell">
          <DesktopSidebar />
          <div className="dmain">{children}</div>
        </div>
      </body>
    </html>
  );
}
