import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

// page.tsx 가 'use client' 라 여기서 metadata 를 낸다.
// 제목이 홈과 똑같았고 canonical 이 없었다.
export const metadata: Metadata = {
  // 화면은 '리포트 열람과 무관한 자율 결제'라고 하는데 제목은 '결제하고 리포트 열기'였다. 카드사 심사에서 걸릴 문구라 화면에 맞춘다(2026-10-23).
  title: '복채: 마음만큼 놓고 가는 자율 결제',
  description: '낙찰사주 복채(卜債) 화면. 리포트 열람과 무관한 자율 결제이며 정해진 값은 없습니다.',
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

