import './why.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import ChartDiff from '@/app/_components/ChartDiff';
import { solarShiftMin } from '@/lib/manse-core';
import { findCity } from '@/lib/cities';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: { absolute: 'Why do BaZi calculators give different charts?' },
  description: 'Two sites, one birth date, two different charts. The usual causes: true solar time, historical daylight saving, the solar term boundary, the late-night day change, and lunar dates entered as solar. With a side-by-side you can run yourself.',
  keywords: ['bazi calculator different results', 'why do bazi charts differ', 'true solar time bazi', 'bazi hour pillar wrong', 'solar term boundary', 'bazi birth time correction'],
  alternates: {
    canonical: '/en/why-charts-differ',
    languages: { 'en': '/en/why-charts-differ', 'zh-Hant': '/zh/why-charts-differ', 'x-default': '/en/why-charts-differ' },
  },
  openGraph: {
    title: 'Why do BaZi calculators give different charts?',
    description: 'Five reasons, and a side-by-side you can run on your own birth data.',
    url: BASE + '/en/why-charts-differ', type: 'article', locale: 'en', siteName: 'Nakchal Saju',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why do BaZi calculators give different charts?',
    description: 'Five reasons, and a side-by-side you can run on your own birth data.',
  },
};

// 도시별 어긋남은 계산해서 낸다. 손으로 적으면 언젠가 코드와 어긋난다.
const SAMPLE = ['Urumqi, China', 'Madrid, Spain', 'Paris, France', 'Seoul, South Korea',
  'Warsaw, Poland', 'Chicago, United States', 'London, United Kingdom', 'New York, United States',
  'Tokyo, Japan', 'Sydney, Australia'];

export default function WhyPage() {
  const rows = SAMPLE.map(k => {
    const c = findCity(k)!;
    return { city: c.city, country: c.country, jan: solarShiftMin(c, 1990, 1, 15, 12, 0) };
  }).sort((a, b) => a.jan - b.jan);

  const ld = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Why do two BaZi calculators give me different charts?',
        acceptedAnswer: { '@type': 'Answer', text: 'Most often the hour pillar, because clock time is not solar time. A country runs on one standard meridian, so a birthplace east or west of it is offset — Madrid by about 75 minutes, Urumqi by more than two hours. Other causes are historical daylight saving, the exact moment a solar term begins, how a tool treats births after 11pm, and lunar dates entered as if they were solar.' } },
      { '@type': 'Question', name: 'Which chart is correct?',
        acceptedAnswer: { '@type': 'Answer', text: 'For the hour pillar, the one that used your birthplace. Solar time is not a school of thought, it is arithmetic: four minutes per degree of longitude away from the standard meridian. The late-night day change is a genuine difference of opinion between schools, and there the two answers can both be defensible.' } },
      { '@type': 'Question', name: 'Does this matter if I do not know my birth time?',
        acceptedAnswer: { '@type': 'Answer', text: 'Less. Without a time you read three pillars and the hour drops out, so the largest source of disagreement disappears. The month pillar can still differ if you were born within a day of a solar term.' } },
    ],
  };

  return (
    <div className="app home" lang="en">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/en/bazi" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>BaZi</Link>
        <Link className="bz-lang" href="/en/bazi">Calculator</Link>
      </div>

      <div className="hero"><div className="kick">同 日 異 命 · ONE BIRTH, TWO CHARTS</div>
        <h1 style={{ fontSize: 19, marginTop: 8, lineHeight: 1.35 }}>Why do BaZi calculators<br />disagree with each other?</h1>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>Five reasons — and a side-by-side you can run yourself</div>
      </div>

      <ChartDiff />

      <section className="bz-read" lang="en">
        <h3>1. Clock time is not solar time</h3>
        <p>This is the big one. A whole country keeps a single standard meridian, so if you were born east or west of it your local noon is not twelve o&rsquo;clock. The arithmetic is plain — <b>four minutes for every degree of longitude</b> away from that meridian. Spain sits west of Greenwich but runs on Central European Time, so Madrid is more than an hour out. Xinjiang keeps Beijing time from 2,000 km away.</p>

        <div className="why-tbl">
          <div className="why-h"><span>Born in</span><span>Solar correction</span></div>
          {rows.map(r => (
            <div className="why-r" key={r.city}>
              <span>{r.city}<em>{r.country}</em></span>
              <span className={'why-n ' + (Math.abs(r.jan) >= 30 ? 'big' : '')}>
                {r.jan === 0 ? 'none' : `${r.jan > 0 ? '+' : '−'}${Math.abs(r.jan)} min`}
              </span>
            </div>
          ))}
          <p className="why-cap">Mid-January, so no summer time. In summer a country on daylight saving shifts a further hour.</p>
        </div>

        <p>An hour of error moves the hour pillar by a whole branch, because each branch covers two hours. Half an hour moves it whenever the birth sits near the boundary — which is a quarter of all births.</p>

        <h3>2. Daylight saving that no longer exists</h3>
        <p>Korea ran summer time in 1948&ndash;1960 and again in 1987&ndash;1988. Anyone born in those windows has a clock reading an hour ahead of standard time, and a calculator that does not know the history will place their hour pillar one branch late. The same trap exists in most countries; the rules changed often and were rarely tidy. This is a lookup problem, not a doctrinal one — a tool either carries the timezone history or it does not.</p>

        <h3>3. The month changes at a solar term, not on a date</h3>
        <p>The month pillar turns when the sun reaches a particular apparent longitude. That moment drifts by hours from year to year, so it does not land on a fixed calendar date. A tool that reads the month off a table will put anyone born within a day of the boundary into the wrong month — and the month pillar is the one most readings lean on hardest.</p>

        <h3>4. Births after eleven at night</h3>
        <p>The branch that begins at 11pm belongs to the next day&rsquo;s cycle in one reading, and to the current day in another. Schools genuinely disagree here, and both positions have a long pedigree. If two charts differ only in the day pillar and the birth was late at night, this is usually why — and neither tool is broken. It is worth knowing which convention a reading assumed.</p>

        <h3>5. A lunar date entered as a solar one</h3>
        <p>Older family records often carry the lunar date. Typed into a field expecting a Gregorian date, it produces a chart that is close enough to look plausible and wrong by weeks. If a chart feels off by about a month, this is the first thing to check.</p>

        <h3>So which one is right?</h3>
        <p>For the first three, there is a correct answer and it is arithmetic rather than opinion. For the fourth, there is a real difference of schools. For the fifth, ask which calendar the date came from.</p>
        <p>If you want to see your own chart with the birthplace taken into account, the <Link href="/en/bazi">calculator is here</Link>. It is free, it asks where you were born, and it will tell you how many minutes the correction came to.</p>
      </section>
    </div>
  );
}
