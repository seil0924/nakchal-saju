import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TYCOONS, tycoonSlug, tycoonBySlug, tyProfile, isKorean } from '@/lib/tycoon';
import { tycoonFacts } from '@/lib/tycoon-facts';
import { ogCard, ogCardUrl } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';
import PersonChart from '@/app/_components/PersonChart';
import BizCheck from '@/app/_components/BizCheck';

const BASE = 'https://nakchalsaju.com';
const ELKO = ['나무', '불', '흙', '쇠', '물'];

export function generateStaticParams() {
  return TYCOONS.map((t) => ({ slug: tycoonSlug(t.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = tycoonBySlug(params.slug);
  if (!t) return { title: '나와 닮은 CEO · 낙찰사주' };
  const f = tycoonFacts(t);
  const title = `${t.name} 사주 · 명식: 일주 ${f.pills}, ${f.type} | 낙찰사주`;
  const card = { seal: '命', k: `${t.born} 출생 · ${t.co}`, t: `${t.name} 사주 · 명식`, s: `일주 ${f.pills} · 일간 ${f.elName} · ${f.type}` };
  const description = `${t.name}(${t.en}, ${t.co}, ${t.born} 출생)의 명식: 일주 ${f.pills}, 일간 ${f.elName}(${ELKO[f.el]}), 대표 유형 ${f.type}. 생시 미상이라 삼주로 계산했습니다. 내 생년월일로 사업을 해도 되는 사주인지 30초 무료로 볼 수 있습니다.`;
  return {
    title, description,
    alternates: { canonical: `/ceo/${tycoonSlug(t.name)}` },
    openGraph: { title, description, url: `${BASE}/ceo/${tycoonSlug(t.name)}`, type: 'article', siteName: '낙찰사주', images: ogCard(card) },
    twitter: { card: 'summary_large_image', title, description, images: [ogCardUrl(card)] },
    keywords: [t.name, `${t.name} 사주`, `${t.name} 명식`, `${t.name} 일주`, t.en, '나와 닮은 CEO', '거장 사주', '사업 사주', '낙찰사주'],
  };
}

export default function TycoonLanding({ params }: { params: { slug: string } }) {
  const t = tycoonBySlug(params.slug);
  // 목록이 바뀌면서 사라진 이름들이 있다(예: /ceo/워런버핏 — 구글이 색인했고 실제로 클릭도 받던 주소다).
  // 404 로 버리면 그 클릭이 그냥 날아간다. 인덱스로 넘겨 고를 수 있게 한다.
  if (!t) redirect('/ceo');
  const f = tycoonFacts(t);
  const prof = tyProfile(t.en);
  // 국내 창업주를 먼저 건다. 손님이 국내 대표들이라 정주영 다음에 잡스를 누르는 쪽보다 그 반대가 많다.
  const others = [...TYCOONS.filter(isKorean), ...TYCOONS.filter((x) => !isKorean(x))].filter((x) => x.name !== t.name).slice(0, 16);

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: `${t.name} 사주 · 명식: 일주 ${f.pills}`, about: t.name, description: t.story, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '나와 닮은 CEO', item: `${BASE}/ceo` },
      { '@type': 'ListItem', position: 2, name: t.name, item: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    ] },
  ];

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 13, color: '#58616a', marginBottom: 10 }}>
          <Link href="/ceo" style={{ color: '#2f56c4', textDecoration: 'none', fontWeight: 600 }}>나와 닮은 CEO</Link> › {t.name}
        </nav>
        <h1 style={{ fontWeight: 800, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {t.name} 사주 · 명식
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#58616a', margin: '0 0 4px' }}>
          일주 <b style={{ color: 'var(--ink)' }}>{f.pills}</b>, {f.type}. 명식과 십성, 걸어온 길을 차례로 보여 드립니다.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{t.en}</span>
          <span style={tag}>{t.co}</span>
          <span style={tag}>{t.born} 출생</span>
        </div>

        <PersonChart name={t.name} f={f} />

        <div className="pc-card">
          <div className="pc-h">어떤 그릇의 사람인가</div>
          <p className="pc-p" style={{ marginBottom: 10 }}>{t.story}</p>
          <p className="pc-p">{f.myeong}</p>
          {prof && (
            <dl className="tyw-dl">
              <div><dt>분야</dt><dd>{prof.field}</dd></div>
              <div><dt>활동</dt><dd>{prof.life}</dd></div>
              <div><dt>이룬 것</dt><dd>{prof.scale}</dd></div>
              <div><dt>연혁</dt><dd>{prof.arc}</dd></div>
            </dl>
          )}
        </div>

        {/* 다 보여 준 다음에 묻는다. 다른 화면으로 보내 다시 입력시키면 검색으로 온 사람은 떠난다. */}
        <BizCheck name={t.name} tycoon={t.name} />

        <div className="pc-card" style={{ background: '#f4f5f7' }}>
          <div className="pc-h">닮은 사람을 아는 것으로는 오늘이 안 바뀝니다</div>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: '#4a4636', margin: '0 0 10px' }}>
            같은 유형이라도 <b>오늘 일진</b>은 사람마다 다릅니다. 공공입찰을 하시는 대표님이라면
            오늘의 흐름과 발주처 궁합, 그리고 계약·개업·이전에 맞는 날이 실제로 필요한 것들입니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <Link href="/reading" style={chip}>오늘, 넣을 날인가</Link>
            <Link href="/product/balju" style={chip}>발주처 궁합</Link>
            <Link href="/taekil" style={chip}>택일: 좋은 날 고르기</Link>
          </div>
        </div>

        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 거장과도 비교해 보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {others.map((o) => (
            <Link key={o.name} href={`/ceo/${tycoonSlug(o.name)}`} style={chip}>{o.name}</Link>
          ))}
        </div>

        <p style={{ fontSize: 13, color: '#58616a', lineHeight: 1.65, marginBottom: 20 }}>
          ※ 출생일은 공개 기록 기준이며, 생시가 미상이라 시주(時柱)를 뺀 삼주(三柱)로 계산했습니다.
          유사도는 명식의 구조적 비교이며 해당 인물의 실제 운세 단정이 아닙니다. 명리 기반 참고·오락용 정보입니다.
        </p>
      </div>
    </div>
  );
}

const tag: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#58616a', background: '#f4f5f7', padding: '5px 11px', borderRadius: 999 };
const chip: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#2f56c4', background: '#f4f5f7', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
