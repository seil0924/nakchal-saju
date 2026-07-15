import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '나와 닮은 세계적 CEO는? — 낙찰사주',
  description: '생년월일만 넣으면 30초. 잡스·록펠러·샤넬 등 세계 거장 100인 중 당신의 사주와 가장 닮은 대표를 무료로 찾아 드립니다.',
  openGraph: {
    title: '나와 닮은 세계적 CEO는? · 낙찰사주',
    description: '세계 거장 100인 중, 당신의 사주와 가장 닮은 대표는 누구일까요?',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: [{ url: '/api/og?seal=%E9%8F%A1&k=%E9%8F%A1%20%C2%B7%20%EB%8B%AE%EC%9D%80%20%EC%82%AC%EC%A3%BC&t=%EB%82%98%EC%99%80%20%EB%8B%AE%EC%9D%80%20%EC%84%B8%EA%B3%84%EC%A0%81%20CEO%EB%8A%94%3F&s=%EA%B1%B0%EC%9E%A5%20100%EC%9D%B8%20%C3%97%20%EB%82%B4%20%EC%82%AC%EC%A3%BC%20%C2%B7%2030%EC%B4%88%20%EB%AC%B4%EB%A3%8C', width: 1200, height: 630, alt: '나와 닮은 세계적 CEO — 낙찰사주' }],
  },
};

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
