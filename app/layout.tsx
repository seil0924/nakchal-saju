import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '낙찰사주 · 작동 엔진 (MVP)',
  description: '만세력·십성 위에 세운 입찰 실무자용 사주 리포트 — 서버 게이팅 데모',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
