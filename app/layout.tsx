import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://nakchal-saju.example.com'),
  title: { default: '낙찰사주 — 오늘의 낙찰 사정률을 사주로 짚다', template: '%s · 낙찰사주' },
  description: '만세력·십성으로 오늘의 낙찰 사정률 방향과 발주처·법인·동업 궁합을 짚어드리는 입찰 실무자용 사주 서비스.',
  keywords: ['낙찰사주', '사정률', '입찰', '조달', '사주', '만세력', '발주처 궁합'],
  openGraph: {
    title: '낙찰사주 — 오늘의 낙찰 사정률을 사주로 짚다',
    description: '재주는 갖추셨습니다. 그 운칠(運七)을 짚어드립니다.',
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
