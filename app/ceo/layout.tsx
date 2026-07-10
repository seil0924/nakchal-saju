import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나와 닮은 세계적 CEO는? — 낙찰사주',
  description: '생년월일만 넣으면 30초. 잡스·록펠러·샤넬 등 세계 거장 50인 중 당신의 사주와 가장 닮은 대표를 무료로 찾아 드립니다.',
  openGraph: {
    title: '나와 닮은 세계적 CEO는? · 낙찰사주',
    description: '세계 거장 50인 중, 당신의 사주와 가장 닮은 대표는 누구일까요?',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: '나와 닮은 세계적 CEO — 낙찰사주' }],
  },
};

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
