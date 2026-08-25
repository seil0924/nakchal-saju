import './date-picker.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import DayPicker from '@/app/_components/DayPicker';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: { absolute: 'Auspicious Date Picker — the twelve day officers' },
  description: 'Pick a date for opening a business, signing, moving, travelling or a wedding. Built on the twelve day officers of the Chinese almanac, with the month set by astronomical solar terms.',
  keywords: ['auspicious date', 'date selection', 'zeri', 'twelve day officers', 'chinese almanac', 'tong shu', 'good day to open a business', 'muhurta', 'rokuyo'],
  alternates: {
    canonical: '/en/date-picker',
    languages: { 'ko-KR': '/jari', 'en': '/en/date-picker', 'x-default': '/en/date-picker' },
  },
  openGraph: {
    title: 'Auspicious Date Picker — the twelve day officers',
    description: 'Opening, signing, moving, travel or a wedding — the next 90 days, sorted.',
    url: BASE + '/en/date-picker', type: 'website', locale: 'en', siteName: 'Nakchal Saju',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Auspicious Date Picker — the twelve day officers',
    description: 'Opening, signing, moving, travel or a wedding — the next 90 days, sorted.',
  },
};

export default function DatePickerPage() {
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: 'Auspicious Date Picker', applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Any', url: BASE + '/en/date-picker', inLanguage: 'en',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Free date selection tool based on the twelve day officers, with months set by astronomical solar terms.',
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What are the twelve day officers?',
          acceptedAnswer: { '@type': 'Answer', text: 'A cycle of twelve labels that turns one step each day: Establish, Remove, Full, Balance, Stable, Initiate, Destruction, Danger, Success, Collect, Open and Close. Which label a day carries depends on its earthly branch and the solar month it falls in. Almanacs across East Asia have used the cycle for centuries to choose dates.' } },
        { '@type': 'Question', name: 'Is choosing a date really a business practice?',
          acceptedAnswer: { '@type': 'Answer', text: 'In several markets it is institutional rather than private. The Indian exchanges NSE and BSE close normal trading on Diwali and hold a one-hour Muhurat session at an astrologically chosen time, a practice BSE began in 1957. In Japan the rokuyo cycle still guides contract dates and groundbreaking ceremonies.' } },
        { '@type': 'Question', name: 'Which days should I avoid?',
          acceptedAnswer: { '@type': 'Answer', text: 'Destruction, Danger and Close. Destruction breaks what you want to last, Danger is read as precarious for travel and risk, and Close is the opposite of opening. The tool lists them so you can see what is being skipped rather than take it on trust.' } },
      ],
    },
  ];
  return (
    <div className="app home" lang="en">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/en/bazi" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>BaZi</Link>
        <Link className="bz-lang" href="/jari" hrefLang="ko">한국어</Link>
      </div>

      <div className="hero"><div className="kick">擇 日 · CHOOSING A DAY</div>
        <h1 style={{ fontSize: 19, marginTop: 8, lineHeight: 1.35 }}>When to start,<br />by the old calendar</h1>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>Free · no sign-up · the next 90 days</div>
      </div>

      <DayPicker />

      <section className="bz-read" lang="en">
        <h3>What the twelve officers are</h3>
        <p>A cycle of twelve labels turns one step each day — <b>Establish, Remove, Full, Balance, Stable, Initiate, Destruction, Danger, Success, Collect, Open, Close</b>. Which label a day carries comes from its earthly branch measured against the solar month it falls in. The cycle is old and plain: some days are read as opening, some as closing, and most as neither.</p>

        <h3>This is not a fringe habit</h3>
        <p>Choosing a date is institutional in several markets. On Diwali the Indian exchanges NSE and BSE shut normal trading and hold a single one-hour <b>Muhurat</b> session at a time chosen astrologically — BSE has done it since 1957. In Japan the <i>rokuyo</i> cycle still shapes when contracts are signed and when a Shinto groundbreaking is held. In Hong Kong the brokerage CLSA has published a Feng Shui Index every year since 1992.</p>

        <h3>Why the month matters</h3>
        <p>The officer for a day depends on which solar month it sits in, and solar months do not begin on fixed calendar dates. They begin the moment the sun reaches a particular apparent longitude, which drifts by hours from year to year. This tool computes that moment rather than reading it off a table, so days near a boundary land in the right month.</p>

        <h3>How to use it</h3>
        <p>Pick what the day is for. The list shows the next 90 days that suit it, best first. The days to avoid are listed too — not to alarm you, but so you can see what is being skipped and judge for yourself. A date is one input among many; the lease, the crew and the weather still matter more.</p>

        <h3>Where this comes from</h3>
        <p>The same engine runs <Link href="/jari" hrefLang="ko">Nakchal Saju</Link>, a Korean service that picks moving dates and office directions for company owners. If you want your own chart rather than a date, the <Link href="/en/bazi">BaZi calculator</Link> is here.</p>
      </section>
    </div>
  );
}
