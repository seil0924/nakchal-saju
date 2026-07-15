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
