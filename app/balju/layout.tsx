import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

// page.tsx 가 'use client' 라 여기서 metadata 를 낸다.
// 이 페이지도 제목이 홈과 똑같았고 canonical 이 없었다. /balju?q= 로 검색 쿼리가 붙는다.
export const metadata: Metadata = {
  title: '발주처 궁합 — 그 발주처, 나와 맞는 판인가',
  description: '발주처 설립일 사주와 대표님 사주의 상성. 어느 발주처와 결이 맞는지, 언제 넣어야 하는지를 만세력으로 짚습니다.',
  alternates: { canonical: '/balju' },
  openGraph: {
    title: '발주처 궁합 — 그 발주처, 나와 맞는 판인가',
    description: '발주처 설립일과 대표 사주의 상성 — 손대기 전에 봅니다.',
    url: 'https://nakchalsaju.com/balju', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '宮', k: '發注處 宮合', t: '그 발주처,\n나와 맞는 판인가', s: '설립일 사주와 대표 사주의 상성' }),
  },
};

export default function BaljuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

