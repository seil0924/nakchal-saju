import './jari.css';
import { ogCard } from '@/lib/og';

const CARD = { seal: '宅', k: '事務室 移轉 方位', t: '사무실을 옮기기 전에,\n어느 쪽인지부터', s: '지금 자리 진단 · 옮길 방위 · 이사 택일' };
import type { Metadata } from 'next';
import Link from 'next/link';
import JariMap from '@/app/_components/JariMap';
import ScrollReveal from '@/app/_components/ScrollReveal';
import SiteTop from '@/app/_components/SiteTop';

export const metadata: Metadata = {
  // 레이아웃 템플릿이 ' · 낙찰사주'를 뒤에 붙인다. 여기서 또 붙이면 두 번 나온다.
  title: '자리 사주 — 사무실 방위와 이전 택일',
  description: '지금 사무실의 출입문·대표 자리 방위를 팔택으로 보고, 옮길 곳의 방위·거리와 이사에 좋은 날을 짚어 드립니다. 주소만 넣으면 됩니다.',
  alternates: {
    canonical: 'https://nakchalsaju.com/jari',
    // 영어 택일과 짝이다. 같은 엔진으로 같은 일을 하니 언어판으로 묶어 준다.
    languages: { 'ko-KR': '/jari', 'en': '/en/date-picker' },
  },
  openGraph: {
    title: '자리 사주 — 사무실 방위와 이전 택일',
    description: '출입문과 대표 자리의 방위, 옮길 곳의 방위와 거리, 이사에 좋은 날까지.',
    url: 'https://nakchalsaju.com/jari', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard(CARD),
  },
};

export default function Jari() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '자리 사주 — 사무실 이전 택일과 방위',
    serviceType: '사무실 방위·이전 택일 상담',
    provider: { '@type': 'Organization', name: '낙찰사주', url: 'https://nakchalsaju.com' },
    areaServed: { '@type': 'Country', name: '대한민국' },
    url: 'https://nakchalsaju.com/jari',
  };
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ScrollReveal />
      <SiteTop />

      <div className="hero"><div className="kick">자리 사주</div>
        <h1 style={{ fontSize: 17, marginTop: 8, lineHeight: 1.35 }}>사무실을 옮기기 전에,<br />어느 쪽인지부터</h1>
        <div style={{ color: '#c3cfe3', fontSize: 13, marginTop: 8, fontWeight: 500 }}>지금 자리의 문·책상 방위와 옮길 곳의 방위·택일을 함께 봅니다</div>
      </div>

      <JariMap />

      <nav aria-label="함께 보면 좋은 것" style={{ padding: '4px 15px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#58616a', margin: '6px 0 8px' }}>함께 보면 좋은 것</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[['/reading?cat=daeun', '회사 대운 — 지금이 옮길 때인가'], ['/reading?cat=sajeong', '오늘의 투찰 택일'], ['/balju', '발주처 궁합'], ['/column', '칼럼']].map(([h, t]) => (
            <Link key={h} href={h} style={{ fontSize: 13, fontWeight: 600, color: '#58616a', background: '#f4f5f7', border: '1px solid #e6e8ea', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{t}</Link>
          ))}
        </div>
      </nav>

    </div>
  );
}
