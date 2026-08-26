import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

// page.tsx 가 'use client' 라 여기서 metadata 를 낸다.
// 제목이 홈과 똑같았고 canonical 이 없었다.
export const metadata: Metadata = {
  title: '투찰 직전, 붉은 기운을 담습니다',
  description: '투찰서를 넣기 전 마음을 가다듬는 화면. 명리 기반 참고이며 투찰금액 산정 근거가 아닙니다.',
  alternates: { canonical: '/ritual' },
  openGraph: {
    title: '투찰 직전, 붉은 기운을 담습니다',
    description: '투찰서를 넣기 전 마음을 가다듬는 자리',
    url: 'https://nakchalsaju.com/ritual', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '朱', k: '投札 直前', t: '붉은 기운을 담습니다', s: '투찰 직전, 마음을 가다듬는 자리' }),
  },
};

export default function RitualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

