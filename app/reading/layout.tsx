import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

// page.tsx 가 'use client' 라 metadata 를 못 내보낸다. 그래서 여기 둔다.
//
// 이게 없어서 이 페이지는 제목이 홈과 **똑같았고** canonical 도 없었다.
// 사이트에서 제일 중요한 진입 화면인데 구글이 홈의 사본으로 볼 여지를 열어 둔 셈이다.
// /reading?cat=... 처럼 쿼리가 붙는 주소가 여럿이라 canonical 이 특히 중요하다.
export const metadata: Metadata = {
  title: '오늘, 넣을 날인가 — 대표 사주로 보는 투찰 택일',
  description: '생년월일만 넣으면 30초. 대표님 사주와 오늘 일진으로 오늘의 흐름을 짚어 드립니다. 회원가입 없이 무료로 시작.',
  alternates: { canonical: '/reading' },
  openGraph: {
    title: '오늘, 넣을 날인가 — 투찰 택일',
    description: '대표님 사주와 오늘 일진 — 30초, 무료.',
    url: 'https://nakchalsaju.com/reading', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '擇', k: '運七技三 · 오늘의 택일', t: '오늘, 넣을 날인가', s: '생년월일만 · 30초 · 무료로 시작' }),
  },
};

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

