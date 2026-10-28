import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';
import { ogCard, ogCardUrl } from '@/lib/og';
import { TYPES } from '@/lib/sajang';
import SajangCheck from './SajangCheck';
import './sajang.css';

// /sajang — 나는 대표가 될 사주일까(2026-10-28).
// 입찰 대표가 아니라 '사업할 사주', '사장 될 팔자'를 검색하다 들어온 사람을 위한 무료 판정.
const BASE = 'https://nakchalsaju.com';
const T = '나는 대표가 될 사주일까';
const D = '생년월일만 넣으면 대표가 될 바탕이 있는지 신호 다섯 개로 보고, 대표가 된다면 어떤 대표가 맞는지 다섯 갈래로 알려 드립니다. 가입도 결제도 없이 바로 나옵니다.';
const CARD = { seal: '長', k: '代表 四柱', t: '나는 대표가\n될 사주일까', s: '생년월일만 넣고 바로 · 무료' };

export const metadata: Metadata = {
  title: { absolute: `${T}? 사업가 사주 무료로 보기 | 낙찰사주` },
  description: D,
  keywords: ['대표 될 사주', '사업할 사주', '사장 될 팔자', '사업가 사주', '창업 사주', '사업 운 사주', '대표 사주'],
  alternates: { canonical: '/sajang' },
  openGraph: { title: T, description: D, url: BASE + '/sajang', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(CARD) },
  twitter: { card: 'summary_large_image', title: T, description: D, images: [ogCardUrl(CARD)] },
};

const FAQ = [
  { q: '대표가 될 사주는 따로 정해져 있나요?', a: '사주로 보는 것은 대표가 되었을 때 어떤 방식이 편한지입니다. 돈을 보는 눈(재성), 만들어 내는 힘(식상), 내 판을 원하는 기질(비겁), 버티는 힘(일간의 힘), 겉으로 드러난 재주 다섯 가지가 많이 설수록 대표 자리가 편하다고 봅니다.' },
  { q: '신호가 적게 나오면 사업하면 안 되나요?', a: '신호가 적으면 혼자보다 맞는 사람과 손잡을 때 판이 선다는 뜻으로 읽습니다. 비어 있는 자리를 채워 줄 동업자나 참모가 누구인지가 더 중요해집니다. 사업의 성패는 사주보다 시장과 준비가 먼저 정합니다.' },
  { q: '태어난 시각을 모르면 어떻게 되나요?', a: '여섯 글자로 봅니다. 시각을 넣으면 두 글자가 더 붙어 신호 개수와 갈래가 바뀔 수 있습니다. 대운과 세운처럼 해마다 들어오는 기운은 이 판정에 넣지 않았습니다.' },
];

export default function SajangPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: T, url: BASE + '/sajang', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', inLanguage: 'ko', offers: { '@type': 'Offer', price: 0, priceCurrency: 'KRW' }, description: D },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];
  return (
    <div className="app sajang-app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />
      <header className="sj-hero">
        <p className="sj-eye">무료 · 생년월일만</p>
        <h1>나는 대표가 될 사주일까</h1>
        <p>대표가 될 바탕이 있는지, 대표가 된다면 어떤 대표가 맞는지 바로 봅니다.</p>
      </header>

      <SajangCheck />

      <section className="sj-read">
        <h2>다섯 갈래의 대표</h2>
        <ul className="sj-types">
          {Object.values(TYPES).map(t => (
            <li key={t.group}><b>{t.name}</b><span>{t.one}</span></li>
          ))}
        </ul>

        <h2>자주 묻는 질문</h2>
        {FAQ.map(f => (
          <div key={f.q} className="sj-faq"><h3>{f.q}</h3><p>{f.a}</p></div>
        ))}

        <p className="sj-disc">원국 여덟 글자로 낸 명리 기반 참고 정보입니다. 사업의 성패를 정하지 않습니다.
          이미 대표이시고 공공입찰을 하신다면 <Link href="/">오늘 넣을 날인지</Link>부터 보셔도 됩니다.</p>
      </section>
    </div>
  );
}
