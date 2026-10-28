import '@/app/_components/ilgan.css';
// /today/임수 — 일간별 오늘의 투찰 운세(2026-10-28).
// 투찰 전날 밤이나 당일 아침에 "오늘 넣어도 되나"를 검색하는 대표님이 오는 자리. 매일 바뀐다(한 시간마다 다시 굽는다).
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteTop from '@/app/_components/SiteTop';
import { ogCard, ogCardUrl } from '@/lib/og';
import { kstYmd } from '@/lib/kst';
import { ILGAN, ilganBySlug, TONE_LABEL } from '@/lib/ilgan';
import { weekSignals, bestWeekday } from '@/lib/today-ilgan';

export const revalidate = 3600;
const BASE = 'https://nakchalsaju.com';

export function generateStaticParams() { return ILGAN.map(x => ({ ilgan: x.slug })); }

const pick = (raw: string) => { let s = raw; try { s = decodeURIComponent(raw); } catch { } return ilganBySlug(s); };

export function generateMetadata({ params }: { params: { ilgan: string } }): Metadata {
  const il = pick(params.ilgan);
  if (!il) return { title: { absolute: '오늘의 투찰 운세 | 낙찰사주' } };
  const name = `${il.ko}${il.el}`;
  const t = `${name} 일간 대표 오늘의 투찰 운세`;
  const d = `${name}(${il.hanja}) 일간 대표님께 오늘 일진이 넣기 편한 날인지, 맞는 시간은 언제인지, 이번 주 평일 중 어느 날이 나은지 매일 계산해 둡니다. 가입 없이 무료입니다.`;
  const path = `/today/${encodeURIComponent(il.slug)}`;
  const card = { seal: il.hanja, k: '今日 投札', t: `${name} 일간 대표\n오늘 넣어도 될까`, s: '매일 바뀌는 투찰 신호 · 무료' };
  return {
    title: { absolute: `${t} | 낙찰사주` }, description: d,
    keywords: [`${name} 일간 오늘의 운세`, `${name} 오늘 운세`, '오늘의 투찰 운세', '입찰 운세', '오늘 입찰 운', '투찰 좋은 날'],
    alternates: { canonical: path },
    openGraph: { title: t, description: d, url: BASE + path, type: 'article', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(card) },
    twitter: { card: 'summary_large_image', title: t, description: d, images: [ogCardUrl(card)] },
  };
}

export default function TodayIlgan({ params }: { params: { ilgan: string } }) {
  const il = pick(params.ilgan);
  if (!il) redirect('/today');
  const name = `${il.ko}${il.el}`;
  const week = weekSignals(il.idx, kstYmd());
  const t = week[0];
  const best = bestWeekday(week);
  const faq = [
    { q: `${name} 일간은 어떤 날 투찰이 편한가요?`, a: `그날 일진 천간이 ${name}을 살리는 기운(인성)이거나 같은 기운(비겁)이면 넣기 편한 날로 봅니다. 반대로 ${name}을 누르는 기운(편관)이 들거나, 건제십이신에서 파·위·폐가 든 날은 큰 건을 미루는 편으로 봅니다.` },
    { q: '이 신호로 낙찰이 되나요?', a: '사정률은 복수예비가격 추첨으로 정해져 누구도 미리 맞히지 못합니다. 이 화면은 대표님이 고를 수 있는 넣는 날과 시간을 정할 근거 하나입니다. 정하는 건 대표님입니다.' },
    { q: '같은 일간이면 모두 같은 결과인가요?', a: '이 화면은 일간 하나만 봅니다. 대표님 일지와 그날 일지가 부딪히는 충은 생년월일을 넣어야 보이고, 같은 일간이라도 그 때문에 결과가 달라질 수 있습니다.' },
  ];
  const path = `/today/${encodeURIComponent(il.slug)}`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE + '/' },
      { '@type': 'ListItem', position: 2, name: '오늘의 투찰 운세', item: BASE + '/today' },
      { '@type': 'ListItem', position: 3, name: `${name} 일간`, item: BASE + path },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];

  return (
    <div className="app il-app">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />
      <header className="il-hero">
        <p className="il-crumb"><Link href="/today">오늘의 투찰 운세</Link> › {name} 일간</p>
        <p className="il-eye">{il.hanja} {name} · {il.image}</p>
        <h1>{name} 일간 대표님, 오늘 넣어도 될까</h1>
        <p className="il-lead">오늘 일진을 {name} 일간에 맞대어 매일 계산합니다.</p>
      </header>

      <section className="il-sec">
        <div className="il-card">
          <div className="il-date">{t.label} · 일진 {t.ganji}</div>
          <div className={'il-big t-' + t.tone}>{TONE_LABEL[t.tone]}</div>
          <p className="il-line">{t.line}</p>
          <dl className="il-kv">
            <dt>오늘의 별</dt><dd>{t.star}</dd>
            <dt>건제십이신</dt><dd>{t.officer}{t.officerGood ? ', 입찰에 맞는 날' : t.officerAvoid ? ', 피하는 날' : ''}</dd>
            <dt>{t.tone === 'hold' ? '넣어야 한다면' : '맞는 시간'}</dt><dd>{t.goodHours.length ? t.goodHours.join(' · ') : '일하는 시간 안에 특별히 맞는 시진은 없습니다'}</dd>
          </dl>
          {(t.holiday || t.weekend) && <p className="il-note">{t.holiday ? `${t.holiday}입니다. ` : '주말입니다. '}전자입찰 마감이 있는지 공고를 먼저 확인하세요.</p>}
        </div>
        <Link className="il-cta" href="/reading?cat=sajeong">
          내 생년월일로 오늘 보기
          <small>일지 충까지 넣은 신호 · 30일 길일 · 무료로 시작</small>
        </Link>
      </section>

      <section className="il-sec">
        <h2 className="il-h">이번 주 {name} 일간 투찰 신호</h2>
        <ul className="il-rows">
          {week.map((d, i) => (
            <li key={d.ymd} className={i === 0 ? 'today' : undefined}>
              <b>{d.label}</b>
              <span className={'il-tag t-' + d.tone}>{TONE_LABEL[d.tone]}</span>
              <small>일진 {d.ganji} · {d.star} · {d.officer}{d.holiday ? ` · ${d.holiday}` : ''}</small>
            </li>
          ))}
        </ul>
        {best && <p className="il-best">이번 주 평일 가운데는 <b>{best.label}</b>이 가장 편합니다{best.goodHours.length ? `. 맞는 시간은 ${best.goodHours[0]}부터입니다.` : '.'}</p>}
      </section>

      <section className="il-sec">
        <h2 className="il-h">다른 일간 보기</h2>
        <div className="il-chips">
          {ILGAN.map(x => (
            <Link key={x.slug} href={`/today/${encodeURIComponent(x.slug)}`} aria-current={x.slug === il.slug ? 'page' : undefined}>{x.ko}{x.el}</Link>
          ))}
        </div>
        <p className="il-disc">
          {name} 일간의 한 해 흐름은 <Link href={`/saeobunse/2027/${encodeURIComponent(il.slug)}`}>2027년 {name} 일간 사업운</Link>에,
          {' '}성정은 <Link href={`/saju/${encodeURIComponent(il.slug + '-일간')}`}>{name} 일간 이야기</Link>에 있습니다.
        </p>
      </section>

      <section className="il-sec il-faq">
        <h2 className="il-h">자주 묻는 질문</h2>
        {faq.map(f => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
        <p className="il-disc">일간 하나와 그날 일진, 건제십이신으로 낸 명리 기반 참고 정보입니다. 낙찰을 약속하지 않고 투찰금액 산정 근거가 아닙니다.</p>
      </section>
    </div>
  );
}
