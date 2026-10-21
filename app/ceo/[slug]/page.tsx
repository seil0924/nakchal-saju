import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TYCOONS, tycoonSlug, tycoonBySlug, tyProfile } from '@/lib/tycoon';
import { EL_HEX } from '@/lib/preview';
import TwinCheck from './TwinCheck';
import { josa } from '@/lib/josa';
import './tycoon.css';
import { tycoonFacts } from '@/lib/tycoon-facts';
import { ogCard, ogCardUrl } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';

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
  const title = `${t.name} 사주 · 명식: 일주 ${f.pills}, ${f.type} | 낙찰사주`;
  const card = { seal: '命', k: `${t.born} 출생 · ${t.co}`, t: `${t.name} 사주 · 명식`, s: `일주 ${f.pills} · 일간 ${f.elName} · ${f.type}` };
  const description = `${t.name}(${t.en}, ${t.co}, ${t.born} 출생)의 명식: 일주 ${f.pills}, 일간 ${f.elName}(${ELKO[f.el]}), 대표 유형 ${f.type}. 생시 미상이라 삼주로 계산했습니다. 대표님 사주와 얼마나 겹치는지 30초 무료로 대조해 보면 좋습니다.`;
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
  const prof = tyProfile(t.en);
  const others = TYCOONS.filter((x) => x.name !== t.name).slice(0, 14);
  const maxD = Math.max(1, ...f.dist);

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
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {t.name} 사주 · 명식
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#58616a', margin: '0 0 4px' }}>
          일주 <b style={{ color: 'var(--ink)' }}>{f.pills}</b>, {f.type}. 아래에서 대표님 생년월일로 바로 견줘 볼 수 있습니다.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{t.en}</span>
          <span style={tag}>{t.co}</span>
          <span style={tag}>{t.born} 출생</span>
        </div>

        {/* 명식을 실제로 보여 준다. 대조한다고만 하고 안 보여 주면 페이지가 약속을 안 지키는 것이다. */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 10 }}>{t.name}의 명식(命式)</div>
          {/* 년주·월주·일주를 다 보여 준다. 태어난 시는 공개 기록에 없어 시주 칸은 비워 둔다. */}
          <div className="tyw" role="table" aria-label={`${t.name} 명식`}>
            {[...f.pillars, null].map((p, i) => (
              <div key={i} className={'tyw-c' + (p?.pos === '일주' ? ' day' : '') + (p ? '' : ' none')} role="cell">
                <span className="tyw-p">{p ? p.pos : '시주'}</span>
                {p ? (
                  <>
                    <b style={{ background: EL_HEX[p.ganEl] }}>{p.gan}</b>
                    <b style={{ background: EL_HEX[p.zhiEl] }}>{p.zhi}</b>
                  </>
                ) : (
                  <><i>?</i><i>?</i></>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#58616a', lineHeight: 1.6, margin: '10px 0 12px' }}>
            일간 <b style={{ color: 'var(--ink)' }}>{f.elName}({ELKO[f.el]})</b> · 대표 유형 <b style={{ color: 'var(--ink)' }}>{f.type}</b>, {f.desc} 그릇입니다.
            태어난 시는 알려지지 않아 시주는 비웠습니다.
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 11 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#58616a', marginBottom: 7 }}>오행이 몇 자씩 앉았는가 <span style={{ fontWeight: 500 }}>· 삼주 기준</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
              {f.dist.map((n, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: n ? '#33383f' : '#58616a' }}>{ELC[i]}</div>
                  <div style={{ height: 4, borderRadius: 2, background: '#f4f5f7', margin: '5px 0' }}>
                    <div style={{ width: `${Math.round((n / maxD) * 100)}%`, height: 4, borderRadius: 2, background: n ? '#2f56c4' : 'transparent' }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: n ? '#33383f' : '#58616a' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 십성 — 다섯 기운이 일간에게 무엇인가. 검색으로 온 사람이 '이 사람 사주 구조'를 읽는 자리 */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 8 }}>십성으로 본 구조</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6, marginBottom: 10 }}>
            {['비겁', '식상', '재성', '관성', '인성'].map((k, i) => (
              <div key={k} style={{ textAlign: 'center', padding: '8px 0', borderRadius: 10, background: f.sipTop === k ? '#eef3fe' : '#f4f5f7' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: f.sipTop === k ? '#2f56c4' : '#58616a' }}>{k}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{f.sip[i]}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#33383f', margin: 0 }}>
            가장 두터운 것은 <b>{f.sipTop}</b>입니다. {f.sipBiz} 오행으로는 <b>{f.strong}</b>{josa(f.strong, '이')} 가장 많고, <b>{f.weak}</b>{josa(f.weak, '이')} {f.weakZero ? '비어 있습니다' : '가장 적습니다'}.
          </p>
          {f.sinsal.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#58616a', marginBottom: 6 }}>명식에 새겨진 신살</div>
              {f.sinsal.map(s => (
                <p key={s.name} style={{ fontSize: 15, lineHeight: 1.7, color: '#33383f', margin: '0 0 4px' }}><b>{s.name}</b>: {s.head}</p>
              ))}
            </div>
          )}
        </div>

        {/* 여기서 바로 견준다. 다른 화면으로 보내 다시 입력시키면 검색으로 온 사람은 떠난다. */}
        <TwinCheck name={t.name} slugOf={Object.fromEntries(TYCOONS.map(x => [x.name, tycoonSlug(x.name)]))} />

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>어떤 그릇의 사람인가</div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#33383f', margin: '0 0 10px', fontWeight: 500 }}>{t.story}</p>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#4a4636', margin: 0 }}>{f.myeong}</p>
          {prof && (
            <dl className="tyw-dl">
              <div><dt>분야</dt><dd>{prof.field}</dd></div>
              <div><dt>활동</dt><dd>{prof.life}</dd></div>
              <div><dt>이룬 것</dt><dd>{prof.scale}</dd></div>
              <div><dt>연혁</dt><dd>{prof.arc}</dd></div>
            </dl>
          )}
        </div>

        {/* 여기까지는 재미다. 회사에 필요한 것은 따로 있다: 그 다리를 안 놓아서 다 나가고 있었다. */}
        <div style={{ ...card, marginTop: 14, background: '#f4f5f7', borderColor: '#e2cd97' }}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: '#2f56c4', marginBottom: 6 }}>닮은 사람을 아는 것으로는 오늘이 안 바뀝니다</div>
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

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 거장과도 비교해 보기</div>
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
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '15px 16px', marginBottom: 11 };
const chip: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#2f56c4', background: '#f4f5f7', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
