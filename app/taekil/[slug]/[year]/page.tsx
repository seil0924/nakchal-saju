import '@/app/en/date-picker/date-picker.css';
// /taekil/계약일/2027 — 택일 연도판(2026-10-28). 휴대폰으로 보는 사람이 대부분이라 달 단위로 끊어 위아래로 넘긴다.
// 열두 달을 전부 HTML 에 싣는다(탭으로 감추면 검색엔진은 1월만 본다). 달 이동은 위에 붙은 달 막대로 한다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TAEKIL, OFFICER_KO, taekilBySlug } from '@/lib/taekil';
import { yearData, yearName, isTaekilYear, TAEKIL_YEARS, YEAR_COPY, YEAR_FAQ } from '@/lib/taekil-year';
import { ogCard, ogCardUrl } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';
import TaekilYear from '@/app/_components/TaekilYear';

const BASE = 'https://nakchalsaju.com';

export function generateStaticParams() {
  return TAEKIL.flatMap(t => TAEKIL_YEARS.map(y => ({ slug: t.slug, year: String(y) })));
}

function parse(params: { slug: string; year: string }) {
  let slug = params.slug; try { slug = decodeURIComponent(slug); } catch { }
  const year = Number(params.year);
  return { t: taekilBySlug(slug), year };
}

export function generateMetadata({ params }: { params: { slug: string; year: string } }): Metadata {
  const { t, year } = parse(params);
  if (!t || !isTaekilYear(year)) return { title: { absolute: '택일 | 낙찰사주' } };
  const yn = yearName(year);
  const path = `/taekil/${encodeURIComponent(t.slug)}/${year}`;
  const h1 = `${year}년 ${YEAR_COPY[t.slug].h1}`;
  const desc = `${year}년(${yn.ko}년) 열두 달 ${t.kw.replace(' 택일', '')}에 맞는 날과 피하는 날을 달마다 정리했습니다. 공휴일·대체공휴일과 주말을 표시하고, 평일 으뜸날을 맨 위에 모았습니다. 고른 날 두세 개는 대표님 사주로 순위를 매길 수 있습니다.`;
  const card = { seal: '擇', k: `${yn.hanja}年 ${t.kicker}`, t: `${year} ${t.kw}`, s: '열두 달 · 공휴일 표시 · 평일 으뜸날' };
  return {
    title: { absolute: h1 + ' | 낙찰사주' },
    description: desc,
    keywords: [`${year} ${t.kw}`, `${year}년 ${t.slug}`, `${year} 길일`, `${yn.ko}년 택일`, t.kw, '건제십이신'],
    alternates: { canonical: path },
    openGraph: { title: h1, description: desc, url: BASE + path, type: 'article', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(card) },
    twitter: { card: 'summary_large_image', title: h1, description: desc, images: [ogCardUrl(card)] },
  };
}

export default function TaekilYearPage({ params }: { params: { slug: string; year: string } }) {
  const { t, year } = parse(params);
  // 없는 일·없는 해는 그 일의 90일 화면이나 허브로 보낸다(예전 주소를 404 로 죽이지 않는다)
  if (!t) redirect('/taekil');
  if (!isTaekilYear(year)) redirect('/taekil/' + encodeURIComponent(t.slug));
  const months = yearData(t.slug, year)!;
  const yn = yearName(year);
  const copy = YEAR_COPY[t.slug];
  const h1 = `${year}년 ${copy.h1}`;
  const faq = [copy.faq, ...YEAR_FAQ(year)];
  const path = `/taekil/${encodeURIComponent(t.slug)}/${year}`;
  const total = months.reduce((n, m) => n + m.good.length, 0);
  const bestTotal = months.reduce((n, m) => n + m.best.length, 0);
  const top = OFFICER_KO[t.good[0]];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: '택일', item: BASE + '/taekil' },
      { '@type': 'ListItem', position: 3, name: t.kw, item: BASE + '/taekil/' + encodeURIComponent(t.slug) },
      { '@type': 'ListItem', position: 4, name: `${year}년`, item: BASE + path },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];
  const others = TAEKIL.filter(x => x.slug !== t.slug);

  return (
    <div className="app home taekil-app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 13, color: '#58616a', marginBottom: 10 }}>
          <Link href="/taekil" style={lk}>택일</Link> › <Link href={'/taekil/' + encodeURIComponent(t.slug)} style={lk}>{t.kw}</Link> › {year}년
        </nav>
        <div style={{ fontSize: 13, letterSpacing: '.24em', color: '#58616a', fontWeight: 700, marginBottom: 6 }}>{yn.hanja}年 {t.kicker}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 10px' }}>{h1}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 6px' }}>
          {year}년({yn.ko}년) 한 해 동안 {t.kw.replace(' 택일', '')}에 맞는 날은 {total}일입니다. 그중 가장 힘이 실리는 {top.name}({top.hanja})이면서 평일인 날이 {bestTotal}일이고, 달마다 맨 위에 모았습니다.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#58616a', margin: '0 0 12px' }}>{t.pick}</p>
      </div>

      <TaekilYear slug={t.slug} year={year} months={months} />

      <section style={{ padding: '4px 18px 0' }}>
        <h2 style={h2}>자주 묻는 질문</h2>
        {faq.map((f, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>Q. {f.q}</div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: '#33383f', margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '10px 18px 0' }}>
        <h2 style={h2}>{year}년 다른 날 고르기</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {others.map(x => (
            <Link key={x.slug} href={`/taekil/${encodeURIComponent(x.slug)}/${year}`} style={chip}>{x.kw.replace(' 택일', '')}</Link>
          ))}
          <Link href={'/taekil/' + encodeURIComponent(t.slug)} style={chip}>오늘부터 90일 보기</Link>
        </div>
        <p style={{ fontSize: 13, color: '#58616a', lineHeight: 1.65, margin: '14px 0 22px' }}>
          절기로 나눈 달과 그날의 일지로 건제십이신을 낸 책력의 셈법입니다. 예언이 아니고 결과를 보장하지 않습니다.
          계약 조건과 일정과 사람이 먼저이고, 이 표는 그 위에 얹는 참고입니다. 투찰금액 산정 근거가 아닙니다.
        </p>
      </section>
    </div>
  );
}

const lk: React.CSSProperties = { color: '#2f56c4', textDecoration: 'none', fontWeight: 600 };
const h2: React.CSSProperties = { fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '10px 0 8px' };
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px', marginBottom: 9 };
const chip: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#2f56c4', background: '#f4f5f7',
  border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none',
};
