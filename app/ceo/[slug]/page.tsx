import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TYCOONS, tycoonSlug, tycoonBySlug } from '@/lib/tycoon';
import { tycoonFacts } from '@/lib/tycoon-facts';
import { ogCard, ogCardUrl } from '@/lib/og';

const BASE = 'https://nakchalsaju.com';
const ELC = ['木', '火', '土', '金', '水'];
const ELKO = ['나무', '불', '흙', '쇠', '물'];

export function generateStaticParams() {
  return TYCOONS.map((t) => ({ slug: tycoonSlug(t.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = tycoonBySlug(params.slug);
  if (!t) return { title: '나와 닮은 CEO · 낙찰사주' };
  const f = tycoonFacts(t);
  const title = `${t.name} 사주 · 명식 — 일주 ${f.pills}, ${f.type} | 낙찰사주`;
  const card = { seal: '命', k: `${t.born} 출생 · ${t.co}`, t: `${t.name} 사주 · 명식`, s: `일주 ${f.pills} · 일간 ${f.elName} · ${f.type}` };
  const description = `${t.name}(${t.en}, ${t.co}, ${t.born} 출생)의 명식 — 일주 ${f.pills}, 일간 ${f.elName}(${ELKO[f.el]}), 대표 유형 ${f.type}. 생시 미상이라 삼주로 계산했습니다. 대표님 사주와 얼마나 겹치는지 30초 무료로 대조해 보십시오.`;
  return {
    title, description,
    alternates: { canonical: `/ceo/${tycoonSlug(t.name)}` },
    openGraph: { title, description, url: `${BASE}/ceo/${tycoonSlug(t.name)}`, type: 'article', siteName: '낙찰사주', images: ogCard(card) },
    twitter: { card: 'summary_large_image', title, description, images: [ogCardUrl(card)] },
    keywords: [t.name, `${t.name} 사주`, `${t.name} 명식`, `${t.name} 일주`, t.en, '나와 닮은 CEO', '거장 사주', '사주 궁합', '낙찰사주'],
  };
}

export default function TycoonLanding({ params }: { params: { slug: string } }) {
  const t = tycoonBySlug(params.slug);
  // 목록이 바뀌면서 사라진 이름들이 있다(예: /ceo/워런버핏 — 구글이 색인했고 실제로 클릭도 받던 주소다).
  // 404 로 버리면 그 클릭이 그냥 날아간다. 인덱스로 넘겨 고를 수 있게 한다.
  if (!t) redirect('/ceo');
  const f = tycoonFacts(t);
  const others = TYCOONS.filter((x) => x.name !== t.name).slice(0, 14);
  const maxD = Math.max(1, ...f.dist);

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: `${t.name} 사주 · 명식 — 일주 ${f.pills}`, about: t.name, description: t.story, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '나와 닮은 CEO', item: `${BASE}/ceo` },
      { '@type': 'ListItem', position: 2, name: t.name, item: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    ] },
  ];

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/ceo" aria-label="나와 닮은 CEO"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 12, color: '#6f6a58', marginBottom: 10 }}>
          <Link href="/ceo" style={{ color: '#2f56c4', textDecoration: 'none', fontWeight: 600 }}>나와 닮은 CEO</Link> › {t.name}
        </nav>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {t.name} 사주,<br />대표님과 닮았을까
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{t.en}</span>
          <span style={tag}>{t.co}</span>
          <span style={tag}>{t.born} 출생</span>
        </div>

        {/* 명식을 실제로 보여 준다. 대조한다고만 하고 안 보여 주면 페이지가 약속을 안 지키는 것이다. */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 10 }}>{t.name}의 명식(命式)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div aria-hidden="true" style={{ width: 62, height: 62, borderRadius: 15, background: '#20242c', color: '#f2ede0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 25, letterSpacing: '-.02em', flex: 'none' }}>{f.pills}</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#33383f', lineHeight: 1.6 }}>일주(日柱) <b>{f.pills}</b> · 일간 <b>{f.elName}({ELKO[f.el]})</b></div>
              <div style={{ fontSize: 13, color: '#5b564a', lineHeight: 1.6 }}>대표 유형 <b>{f.type}</b> — {f.desc} 그릇</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 11 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6f6a58', marginBottom: 7 }}>오행이 몇 자씩 앉았는가 <span style={{ fontWeight: 500 }}>· 삼주 기준</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
              {f.dist.map((n, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: n ? '#33383f' : '#6f6a58' }}>{ELC[i]}</div>
                  <div style={{ height: 4, borderRadius: 2, background: '#ece7db', margin: '5px 0' }}>
                    <div style={{ width: `${Math.round((n / maxD) * 100)}%`, height: 4, borderRadius: 2, background: n ? '#2f56c4' : 'transparent' }} />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: n ? '#33383f' : '#6f6a58' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>어떤 그릇의 사람인가</div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#33383f', margin: '0 0 10px', fontWeight: 500 }}>{t.story}</p>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: '#4a4636', margin: 0 }}>{f.myeong}</p>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>나와 닮은 정도는?</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#4a4636', margin: 0, fontWeight: 500 }}>
            생년월일을 넣으면 대표님의 명식을 <b>{t.name}</b>을 포함한 거장 100인의 명식과 견줍니다.
            일간·음양·강한 기운·비는 기운·주도하는 십성·신살 — 여섯 부호 중 몇 가지가 겹치는지로 가장 닮은 사람을 찾습니다.
          </p>
        </div>

        <Link href="/ceo" style={cta}>
          나와 닮은 CEO 찾기 →
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료 · 거장 100인과 대조</span>
        </Link>

        {/* 여기까지는 재미다. 회사에 필요한 것은 따로 있다 — 그 다리를 안 놓아서 다 나가고 있었다. */}
        <div style={{ ...card, marginTop: 14, background: '#faf6ec', borderColor: '#e2cd97' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14.5, color: '#2f56c4', marginBottom: 6 }}>닮은 사람을 아는 것으로는 오늘이 안 바뀝니다</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#4a4636', margin: '0 0 10px' }}>
            같은 유형이라도 <b>오늘 일진</b>은 사람마다 다릅니다. 공공입찰을 하시는 대표님이라면
            오늘의 흐름과 발주처 궁합, 그리고 계약·개업·이전에 맞는 날이 실제로 필요한 것들입니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            <Link href="/reading" style={chip}>오늘의 사정률 전망</Link>
            <Link href="/product/balju" style={chip}>발주처 궁합</Link>
            <Link href="/taekil" style={chip}>택일 — 좋은 날 고르기</Link>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 거장과도 비교해 보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {others.map((o) => (
            <Link key={o.name} href={`/ceo/${tycoonSlug(o.name)}`} style={chip}>{o.name}</Link>
          ))}
        </div>

        <p style={{ fontSize: 11.5, color: '#6f6a58', lineHeight: 1.65, marginBottom: 20 }}>
          ※ 출생일은 공개 기록 기준이며, 생시가 미상이라 시주(時柱)를 뺀 삼주(三柱)로 계산했습니다.
          유사도는 명식의 구조적 비교이며 해당 인물의 실제 운세 단정이 아닙니다. 명리 기반 참고·오락용 정보입니다.
        </p>
      </div>
    </div>
  );
}

const tag: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#5f5949', background: '#f3ead6', padding: '5px 11px', borderRadius: 999 };
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: '#2f56c4', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
