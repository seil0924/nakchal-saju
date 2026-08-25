import './bazi.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import BaziCalc from '@/app/_components/BaziCalc';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  // 레이아웃 템플릿이 ' · 낙찰사주'를 뒤에 붙인다. 영어 페이지에는 안 어울려 absolute 로 끊는다.
  title: { absolute: 'BaZi Calculator — Four Pillars with true solar time' },
  description: 'Free BaZi chart calculator. Enter your birth date, time and city — the hour pillar is set by true solar time, and solar terms are computed astronomically rather than read off a fixed calendar.',
  keywords: ['bazi', 'bazi calculator', 'bazi chart', 'four pillars of destiny', 'chinese astrology', 'day master', 'ten gods', 'saju'],
  alternates: {
    canonical: '/en/bazi',
    // 같은 내용의 다른 언어판이 어디 있는지 알려 준다. 자동 리다이렉트 대신 이걸 쓴다 —
    // 구글이 한국 검색자에겐 한국어판을, 영어권엔 이 페이지를 알아서 띄운다.
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'x-default': '/en/bazi' },
  },
  openGraph: {
    title: 'BaZi Calculator — Four Pillars with true solar time',
    description: 'Free BaZi chart. True solar time by birthplace, astronomical solar terms.',
    url: BASE + '/en/bazi', type: 'website', locale: 'en', siteName: 'Nakchal Saju',
  },
  // 트위터 카드는 레이아웃 것이 그대로 물려와 한국어로 나갔다. 영어 페이지에는 영어를 건다.
  twitter: {
    card: 'summary_large_image',
    title: 'BaZi Calculator — Four Pillars with true solar time',
    description: 'Free BaZi chart. True solar time by birthplace, astronomical solar terms.',
  },
};

export default function BaziPage() {
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: 'BaZi Calculator', applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Any', url: BASE + '/en/bazi', inLanguage: 'en',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free Four Pillars (BaZi) chart calculator with true solar time correction by birthplace.',
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is BaZi?',
          acceptedAnswer: { '@type': 'Answer', text: 'BaZi, also called the Four Pillars of Destiny, maps a birth moment onto eight characters: a heavenly stem and an earthly branch for the year, month, day and hour. Each character carries one of the five elements, and the relationships between them are what a reading works with.' } },
        { '@type': 'Question', name: 'Why does the birthplace matter?',
          acceptedAnswer: { '@type': 'Answer', text: 'The hour pillar follows true solar time, not clock time. Clock time is set by a country-wide standard meridian, so a birthplace east or west of that meridian is offset. Madrid runs about 75 minutes behind its clock, and Urumqi more than two hours. Without the birthplace, the hour pillar is a guess.' } },
        { '@type': 'Question', name: 'What if I do not know my birth time?',
          acceptedAnswer: { '@type': 'Answer', text: 'You still get three pillars, year, month and day. The day master, the element balance and most of the ten gods are all readable without the hour. Add the time later if you find it.' } },
      ],
    },
  ];
  return (
    <div className="app home" lang="en">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/en/bazi" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>BaZi</Link>
        <Link className="bz-lang" href="/" hrefLang="ko">한국어</Link>
      </div>

      <div className="hero"><div className="kick">八 字 · FOUR PILLARS</div>
        <h2 style={{ fontSize: 19 }}>Your BaZi chart,<br />with the hour done properly</h2>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>Free · no sign-up · true solar time by birthplace</div>
      </div>

      <BaziCalc />

      <section className="bz-read" lang="en">
        <h3>What the eight characters are</h3>
        <p>BaZi reads a birth moment as four pillars — year, month, day and hour. Each pillar holds two characters: a <b>heavenly stem</b> above and an <b>earthly branch</b> below. Eight characters in total, which is what <i>ba zi</i> means. Every character carries one of five elements and a yin or yang polarity, and a reading works with how they support and control one another.</p>

        <h3>The day master is the anchor</h3>
        <p>The stem of the day pillar stands for the person. Everything else is read in relation to it — which characters feed it, which drain it, which it controls. That relationship is what the <b>ten gods</b> name. A Direct Wealth character is not wealth itself; it is the thing your day master takes hold of.</p>

        <h3>Why most calculators get the hour wrong</h3>
        <p>Clock time is a political convenience. A whole country runs on one standard meridian, so anyone living east or west of it is out of step with the sun. Spain sits west of Greenwich but keeps Central European Time, putting Madrid about <b>75 minutes</b> behind the sun. Xinjiang keeps Beijing time and runs more than <b>two hours</b> out. The hour pillar follows the sun, not the clock — so a calculator that never asks where you were born cannot place it.</p>

        <h3>Solar terms, computed not looked up</h3>
        <p>The month pillar changes at a <b>solar term</b>, the moment the sun reaches a particular apparent longitude. That moment drifts by hours from year to year, so a fixed calendar date gets it wrong for anyone born close to a boundary. This calculator computes the sun&rsquo;s position for the actual date, which is the only way to place those births correctly.</p>

        <h3>Where this comes from</h3>
        <p>This calculator runs the same engine behind <Link href="/" hrefLang="ko">Nakchal Saju</Link>, a Korean service that reads charts for company owners bidding on public contracts. The tradition is shared across East Asia — <i>saju</i> in Korea, <i>bazi</i> in China, <i>shichu suimei</i> in Japan — and the calculation is the same. Only the vocabulary differs.</p>
      </section>
    </div>
  );
}
