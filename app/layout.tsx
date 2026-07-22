import './globals.css';
import type { Metadata } from 'next';
import DesktopSidebar from '@/app/_components/DesktopSidebar';
import TapFX from '@/app/_components/TapFX';
import IntroSplash from '@/app/_components/IntroSplash';
import ScrollTop from '@/app/_components/ScrollTop';
import { requireUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  metadataBase: new URL('https://nakchalsaju.com'),
  title: { default: '낙찰사주 — 대표와 회사의 사주, 오늘의 낙찰 사정률부터', template: '%s · 낙찰사주' },
  description: '입찰·경매·조달 수주 대표를 위한 회사 사주 전문 서비스. 오늘의 낙찰 사정률·법인 운세·발주처/동업/협정 궁합·투찰 택일을 만세력으로 짚어드립니다.',
  keywords: ['회사 사주', '법인 사주', '낙찰사주', '사정률', '입찰', '경매', '공매', '법원경매', '조달', '수주', '만세력', '발주처 궁합', '법인 운세', '입찰 택일'],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '0qBkF3KE6jGqkm5dOBP2lhKzyHDqTGRwqm2ZNgQVn5Y',
    other: { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || '276fc75478f167334e1f19c9ddcb64d44d05a6ac' },
  },
};

// 구조화 데이터(JSON-LD) — 검색·AI가 서비스 정체를 정확히 이해하도록
const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': 'https://nakchalsaju.com/#org',
      name: '낙찰사주', alternateName: 'nakchal-saju', url: 'https://nakchalsaju.com',
      logo: 'https://nakchalsaju.com/og.png',
      slogan: '재주는 갖추셨습니다. 그 운칠(運七)을 짚어드립니다.',
      description: '공공입찰·경매·수주 사업을 하는 기업 대표와 법인을 위한 사주명리(만세력) 기반 비즈니스 의사결정 참고 서비스. 오늘의 낙찰 사정률, 대표 사주, 발주처·동업·협정 궁합, 회사 대운, 투찰·개업 택일을 제공한다.',
      knowsAbout: ['사주명리', '만세력', '공공입찰', '조달', '나라장터', '낙찰', '투찰 택일', '발주처 궁합', '법인 설립일 사주', '회사 대운', '십성', '오행', '일간', '관재수', '동업 궁합'],
      areaServed: { '@type': 'Country', name: '대한민국' },
    },
    {
      '@type': 'WebSite', '@id': 'https://nakchalsaju.com/#site',
      url: 'https://nakchalsaju.com', name: '낙찰사주', inLanguage: 'ko',
      description: '입찰·조달·수주 대표를 위한 회사 사주 전문 서비스',
      publisher: { '@id': 'https://nakchalsaju.com/#org' },
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://nakchalsaju.com/balju?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
    },
    {
      '@type': 'Service', '@id': 'https://nakchalsaju.com/#service',
      name: '낙찰사주 — 회사 사주·사정률·발주처 궁합·투찰 택일',
      serviceType: '사주명리 기반 비즈니스 의사결정 참고 서비스',
      provider: { '@id': 'https://nakchalsaju.com/#org' }, areaServed: 'KR',
      audience: { '@type': 'BusinessAudience', name: '공공입찰·조달·수주 사업 기업 대표' },
      description: '대표와 법인의 사주로 오늘의 낙찰 사정률, 발주처·동업·협정 궁합, 회사 대운, 투찰·경매 택일을 만세력으로 짚어드립니다. 입찰·경매·조달 수주 참고·오락용.',
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let scopeId = 'guest';
  try { const u = await requireUser(); if (u?.id) scopeId = u.id; } catch { /* 미인증 */ }
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
        <script dangerouslySetInnerHTML={{ __html: `window.__NK_SCOPE__=${JSON.stringify(scopeId)}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
        {/* Vercel Web Analytics — 대시보드에서 Analytics 활성화 시 조회수·유입경로 수집 */}
        <script defer src="/_vercel/insights/script.js" />
        <ScrollTop />
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
import './globals.css';
import type { Metadata } from 'next';
import DesktopSidebar from '@/app/_components/DesktopSidebar';
import TapFX from '@/app/_components/TapFX';
import IntroSplash from '@/app/_components/IntroSplash';
import ScrollTop from '@/app/_components/ScrollTop';
import { requireUser } from '@/lib/supabase/server';

export const metadata: Metadata = {
  metadataBase: new URL('https://nakchalsaju.com'),
  title: { default: '낙찰사주 — 대표와 회사의 사주, 오늘의 낙찰 사정률부터', template: '%s · 낙찰사주' },
  description: '입찰·경매·조달 수주 대표를 위한 회사 사주 전문 서비스. 오늘의 낙찰 사정률·법인 운세·발주처/동업/협정 궁합·투찰 택일을 만세력으로 짚어드립니다.',
  keywords: ['회사 사주', '법인 사주', '낙찰사주', '사정률', '입찰', '경매', '공매', '법원경매', '조달', '수주', '만세력', '발주처 궁합', '법인 운세', '입찰 택일'],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '0qBkF3KE6jGqkm5dOBP2lhKzyHDqTGRwqm2ZNgQVn5Y',
    other: { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION || 'f94787169f669346cdee3a077a5a78d1479458ba' },
  },
};

// 구조화 데이터(JSON-LD) — 검색·AI가 서비스 정체를 정확히 이해하도록
const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': 'https://nakchalsaju.com/#org',
      name: '낙찰사주', alternateName: 'nakchal-saju', url: 'https://nakchalsaju.com',
      logo: 'https://nakchalsaju.com/og.png',
      slogan: '재주는 갖추셨습니다. 그 운칠(運七)을 짚어드립니다.',
      description: '공공입찰·경매·수주 사업을 하는 기업 대표와 법인을 위한 사주명리(만세력) 기반 비즈니스 의사결정 참고 서비스. 오늘의 낙찰 사정률, 대표 사주, 발주처·동업·협정 궁합, 회사 대운, 투찰·개업 택일을 제공한다.',
      knowsAbout: ['사주명리', '만세력', '공공입찰', '조달', '나라장터', '낙찰', '투찰 택일', '발주처 궁합', '법인 설립일 사주', '회사 대운', '십성', '오행', '일간', '관재수', '동업 궁합'],
      areaServed: { '@type': 'Country', name: '대한민국' },
    },
    {
      '@type': 'WebSite', '@id': 'https://nakchalsaju.com/#site',
      url: 'https://nakchalsaju.com', name: '낙찰사주', inLanguage: 'ko',
      description: '입찰·조달·수주 대표를 위한 회사 사주 전문 서비스',
      publisher: { '@id': 'https://nakchalsaju.com/#org' },
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: 'https://nakchalsaju.com/balju?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
    },
    {
      '@type': 'Service', '@id': 'https://nakchalsaju.com/#service',
      name: '낙찰사주 — 회사 사주·사정률·발주처 궁합·투찰 택일',
      serviceType: '사주명리 기반 비즈니스 의사결정 참고 서비스',
      provider: { '@id': 'https://nakchalsaju.com/#org' }, areaServed: 'KR',
      audience: { '@type': 'BusinessAudience', name: '공공입찰·조달·수주 사업 기업 대표' },
      description: '대표와 법인의 사주로 오늘의 낙찰 사정률, 발주처·동업·협정 궁합, 회사 대운, 투찰·경매 택일을 만세력으로 짚어드립니다. 입찰·경매·조달 수주 참고·오락용.',
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let scopeId = 'guest';
  try { const u = await requireUser(); if (u?.id) scopeId = u.id; } catch { /* 미인증 */ }
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
        <script dangerouslySetInnerHTML={{ __html: `window.__NK_SCOPE__=${JSON.stringify(scopeId)}` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }} />
        {/* Vercel Web Analytics — 대시보드에서 Analytics 활성화 시 조회수·유입경로 수집 */}
        <script defer src="/_vercel/insights/script.js" />
        <ScrollTop />
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
