import type { Metadata } from 'next';
import { ogCard } from '@/lib/og';

export const metadata: Metadata = {
  title: '나와 닮은 세계적 CEO는?',
  description: '생년월일만 넣으면 30초. 잡스·록펠러·샤넬 등 국내외 거장 111인 중 당신의 사주와 가장 닮은 대표를 무료로 찾아 드립니다.',
  alternates: { canonical: '/ceo' },
  openGraph: {
    title: '나와 닮은 세계적 CEO는? · 낙찰사주',
    description: '국내외 거장 111인 중, 당신의 사주와 가장 닮은 대표는 누구일까요?',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '鏡', k: '鏡 · 닮은 사주', t: '나와 닮은 세계적 CEO는?', s: '거장 111인 × 내 사주 · 30초 무료' }),
  },
};

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
