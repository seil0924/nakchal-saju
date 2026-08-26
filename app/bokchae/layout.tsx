import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

// page.tsx 가 'use client' 라 여기서 metadata 를 낸다.
// 제목이 홈과 똑같았고 canonical 이 없었다.
export const metadata: Metadata = {
  title: '복채 청산 — 결제하고 리포트 열기',
  description: '낙찰사주 복채(卜債) 청산 화면. 결제 후 대표님 리포트가 보관함에 남습니다.',
  alternates: { canonical: '/bokchae' },
  robots: { index: false, follow: true },
  openGraph: {
    title: '복채 청산',
    description: '낙찰사주 복채 청산 화면',
    url: 'https://nakchalsaju.com/bokchae', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '債', k: '卜債 淸算', t: '복채 청산', s: '낙찰사주' }),
  },
};

export default function BokchaeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

