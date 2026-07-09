import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://nakchal-saju.example.com'),
  title: { default: '낙찰사주 — 대표와 회사의 사주, 오늘의 낙찰 사정률부터', template: '%s · 낙찰사주' },
  description: '대표와 회사(법인)의 사주를 봐드리는 회사 사주 전문 서비스. 오늘의 낙찰 사정률·법인 운세·발주처/동업/협정 궁합·투찰 택일을 만세력으로 짚어드립니다.',
  keywords: ['회사 사주', '법인 사주', '낙찰사주', '사정률', '입찰', '조달', '만세력', '발주처 궁합', '법인 운세'],
  openGraph: {
    title: '낙찰사주 — 대표와 회사의 사주 전문',
    description: '재주는 갖추셨습니다. 그 운칠(運七)을 짚어드립니다. 오늘의 낙찰 사정률부터 회사 운세·궁합까지.',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
  },
  twitter: { card: 'summary', title: '낙찰사주', description: '오늘의 낙찰 사정률을 사주로 짚다' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
