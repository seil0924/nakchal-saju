import '@/app/_components/ilgan.css';
// /saeobunse/2027/임수 — 일간별 그해 사업운(2026-10-28).
// 사업운 검색은 12~2월에 몰린다. 11월 중순 전에 색인되도록 미리 깐다.
// 장마다 계산이 다르다: 그해 천간·지지가 그 일간에게 무슨 별인가, 열두 달 월건이 무슨 별인가(lib/saeun-ilgan).
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteTop from '@/app/_components/SiteTop';
import { ogCard, ogCardUrl } from '@/lib/og';
import { ILGAN, ilganBySlug, MONTH_LABEL } from '@/lib/ilgan';
import { yearReading, SAEUN_YEARS } from '@/lib/saeun-ilgan';

const BASE = 'https://nakchalsaju.com';


export function generateStaticParams() {
  return SAEUN_YEARS.flatMap(y => ILGAN.map(x => ({ year: String(y), ilgan: x.slug })));
}

function parse(p: { year: string; ilgan: string }) {
  let s = p.ilgan; try { s = decodeURIComponent(s); } catch { }
  return { il: ilganBySlug(s), year: Number(p.year) };
}

export function generateMetadata({ params }: { params: { year: string; ilgan: string } }): Metadata {
  const { il, year } = parse(params);
  if (!il || !SAEUN_YEARS.includes(year)) return { title: { absolute: '사업운 | 낙찰사주' } };
  const r = yearReading(il.idx, year);
  const name = `${il.ko}${il.el}`;
  const t = `${year}년 ${r.ganjiKo}년 ${name} 일간 대표 사업운`;
  const d = `${year}년(${r.ganjiKo}년, ${r.name})은 ${name} 일간 대표님께 ${r.stemStar}의 해, ${r.head}입니다. 움직일 달 ${r.go.length}번과 조심할 달 ${r.hold.length}번을 절기로 나눈 열두 달 표로 정리했습니다.`;
  const path = `/saeobunse/${year}/${encodeURIComponent(il.slug)}`;
  const card = { seal: il.hanja, k: `${r.ganji}年 事業運`, t: `${year} ${name} 일간\n대표 사업운`, s: `${r.stemStar}의 해 · 열두 달 표` };
  return {
    title: { absolute: `${t} | 낙찰사주` }, description: d,
    keywords: [`${year} 사업운`, `${year}년 ${r.ganjiKo}년 운세`, `${name} 일간 ${year}`, `${year} 신년운세 사업`, `${year} 입찰운`, '일간별 사업운'],
    alternates: { canonical: path },
    openGraph: { title: t, description: d, url: BASE + path, type: 'article', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(card) },
    twitter: { card: 'summary_large_image', title: t, description: d, images: [ogCardUrl(card)] },
  };
}

export default function SaeunIlgan({ params }: { params: { year: string; ilgan: string } }) {
  const { il, year } = parse(params);
  if (!il) redirect(`/saeobunse/${SAEUN_YEARS[0]}`);
  if (!SAEUN_YEARS.includes(year)) redirect(`/saeobunse/${SAEUN_YEARS[0]}/${encodeURIComponent(il.slug)}`);
  const r = yearReading(il.idx, year);
  const name = `${il.ko}${il.el}`;
  const path = `/saeobunse/${year}/${encodeURIComponent(il.slug)}`;
  const faq = [
    { q: `${year}년 ${name} 일간 대표에게 가장 좋은 달은 언제인가요?`, a: r.go.length ? `월건 천간이 ${name}에게 도움이 되는 별로 드는 ${r.go.map(m => m.from + '부터 한 달').join(', ')}입니다. 큰 계약과 실적 신고, 등록 정비를 이 무렵에 두면 흐름을 탑니다.` : `${year}년에는 월건이 크게 밀어주는 달이 따로 없습니다. 다지는 달에 내실을 쌓는 편이 낫습니다.` },
    { q: '조심할 달에는 입찰을 쉬어야 하나요?', a: '입찰은 계획대로 하시면 됩니다. 조심할 달에는 지출, 동업, 서류처럼 그 달의 별이 가리키는 것을 한 번 더 챙기세요. 공고와 실적은 대표님 계획이 먼저입니다.' },
    { q: '같은 일간이면 모두 같은 운인가요?', a: '이 페이지는 일간과 그해·그달의 천간만 봅니다. 월지, 일지, 대운까지 넣으면 같은 일간이라도 흐름이 달라집니다. 정확한 판정은 생년월일로 보는 대표 사주에서 합니다.' },
  ];
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: `${year} 사업운`, item: `${BASE}/saeobunse/${year}` },
      { '@type': 'ListItem', position: 3, name: `${name} 일간`, item: BASE + path },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return (
    <div className="app il-app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />
      <header className="il-hero">
        <p className="il-crumb"><Link href={`/saeobunse/${year}`}>{year} 사업운</Link> › {name} 일간</p>
        <p className="il-eye">{r.ganji}年 · {r.name}</p>
        <h1>{year}년 {r.ganjiKo}년, {name} 일간 대표님의 사업운</h1>
        <p className="il-lead">{year}년의 천간 {r.ganji[0]}은 {name} 일간에게 <b>{r.stemStar}</b>입니다. 열두 달 가운데 움직일 달이 {r.go.length}번, 조심할 달이 {r.hold.length}번입니다.</p>
      </header>

      <section className="il-sec">
        <div className="il-card">
          <div className="il-date">{year}년 한 해</div>
          <div className="il-big t-mid">{r.head}</div>
          <p className="il-line">{r.body}</p>
          <p className="il-line" style={{ marginBottom: 0, color: '#58616a' }}>{r.branchLine}</p>
        </div>
        <ul className="il-rows" style={{ marginTop: 12 }}>
          <li><b>움직일 달</b><span className="il-tag t-go">{r.go.length}번</span><small>{r.go.length ? r.go.map(m => `${m.from}부터`).join(', ') : '없음'}</small></li>
          <li><b>조심할 달</b><span className="il-tag t-hold">{r.hold.length}번</span><small>{r.hold.length ? r.hold.map(m => `${m.from}부터`).join(', ') : '없음'}</small></li>
        </ul>
      </section>

      <section className="il-sec">
        <h2 className="il-h">{year}년 열두 달, 절기로 나눈 흐름</h2>
        <div className="il-scroll">
          <table className="il-months">
            <thead><tr><th>시작</th><th>월건</th><th>흐름</th></tr></thead>
            <tbody>
              {r.months.map(m => (
                <tr key={m.from}>
                  <td>{m.from}<small>{m.to}까지</small></td>
                  <td>{m.ganji}<small>{m.star}</small></td>
                  <td><span className={'il-tag t-' + m.tone}>{MONTH_LABEL[m.tone]}</span><small>{m.head}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="il-disc">사주의 달은 절기에서 바뀝니다. 시작일은 태양황경으로 계산한 절입일입니다.</p>
        <Link className="il-cta" href="/reading?cat=daepyo">
          내 명식 전체로 보기
          <small>월지·일지까지 넣은 대표 사주 · 첫 장은 무료</small>
        </Link>
      </section>

      <section className="il-sec">
        <h2 className="il-h">다른 일간의 {year}년</h2>
        <div className="il-chips">
          {ILGAN.map(x => (
            <Link key={x.slug} href={`/saeobunse/${year}/${encodeURIComponent(x.slug)}`} aria-current={x.slug === il.slug ? 'page' : undefined}>{x.ko}{x.el}</Link>
          ))}
        </div>
        <p className="il-disc">
          날마다의 신호는 <Link href={`/today/${encodeURIComponent(il.slug)}`}>{name} 일간 오늘의 투찰 운세</Link>에서,
          {' '}{year}년 계약일과 개업일은 <Link href={`/taekil/${encodeURIComponent('계약일')}/${year}`}>{year}년 열두 달 택일표</Link>에서 봅니다.
        </p>
      </section>

      <section className="il-sec il-faq">
        <h2 className="il-h">자주 묻는 질문</h2>
        {faq.map(f => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
        <p className="il-disc">일간과 그해·그달 천간의 십성으로 낸 명리 기반 참고 정보입니다. 사업의 성패와 낙찰을 약속하지 않습니다.</p>
      </section>
    </div>
  );
}
