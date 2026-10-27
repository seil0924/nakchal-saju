import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CLIENTS, clientSlug, clientBySlug, josa } from '@/lib/clients';
import { baljuContent } from '@/lib/balju-content';
import { ilganTable, ilganSummary, neighbors } from '@/lib/balju-ilgan';
import { factsOf, srcHost } from '@/lib/balju-facts';
import { ogCard } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';

const BASE = 'https://nakchalsaju.com';

export function generateStaticParams() {
  return CLIENTS.map((c) => ({ slug: clientSlug(c.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = clientBySlug(params.slug);
  if (!c) return { title: '발주처 · 낙찰사주' };
  const ct = baljuContent(c, factsOf(c.name));
  const title = `${c.name} 입찰, 대표님과 맞는 발주처일까: 낙찰사주`;
  const f = factsOf(c.name);
  // 확인된 사실이 있으면 설명 앞에 둔다(공고 보는 곳·본사). 64장이 같은 분야 문장으로 시작하던 것을 가른다.
  // 설명에는 시스템 이름만(괄호·쉼표 뒤 덧붙임은 화면에서 본다)
  const sys = f?.notice ? f.notice.split(/[(,]/)[0].trim() : '';
  const lead = sys ? `${c.name} 입찰공고는 ${sys}에서 봅니다${f?.hq ? `. 본사 ${f.hq}` : ''}. ` : '';
  const description = `${lead}${c.name}(${c.date.slice(0, 4)} 설립·${ct.sector}) 입찰 방식과 준비 포인트, 대표님 사주 궁합. 설립일 사주 × 대표 사주로 30초 무료 진단.`;
  const url = `${BASE}/balju/${clientSlug(c.name)}`;
  return {
    title, description,
    alternates: { canonical: `/balju/${clientSlug(c.name)}` },
    openGraph: { title, description, url, type: 'article', siteName: '낙찰사주',
      images: ogCard({ seal: '官', k: '發注處 宮合', t: `${c.name} 입찰`, s: '대표님과 맞는 발주처일까 · 낙찰사주' }) },
    keywords: [c.name, `${c.name} 입찰`, `${c.name} 조달`, `${c.name} 낙찰`, `${c.name} 입찰 방식`, ct.sector, c.cat, '발주처 궁합', '입찰 사주', '낙찰사주'],
  };
}

export default function BaljuLanding({ params }: { params: { slug: string } }) {
  const c = clientBySlug(params.slug);
  if (!c) return notFound();
  const ct = baljuContent(c, factsOf(c.name));
  const readingUrl = `/reading?cat=balju&ck=client&cn=${encodeURIComponent(c.name)}&cd=${c.date}`;
  // 모든 페이지가 목록 맨 앞 12곳에 링크하던 것을, 같은 분야·같은 기운의 이웃으로(lib/balju-ilgan)
  const others = neighbors(c, 12);
  const rows = ilganTable(c);
  const f = factsOf(c.name);

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: `${c.name} 입찰, 대표님과 맞는 발주처일까`, about: c.name, description: ct.intro, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/balju/${clientSlug(c.name)}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '발주처', item: `${BASE}/balju` },
      { '@type': 'ListItem', position: 2, name: c.name, item: `${BASE}/balju/${clientSlug(c.name)}` },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: ct.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 13, color: '#58616a', marginBottom: 10 }}>
          <Link href="/balju" style={{ color: '#58616a' }}>발주처</Link> › {c.name}
        </nav>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {c.name} 입찰,<br />대표님과 맞는 발주처입니까
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{c.date.slice(0, 4)} 설립</span>
          <span style={tag}>{c.cat}</span>
          {c.core ? <span style={{ ...tag, background: '#eef3fe', color: '#2f56c4' }}>핵심 발주처</span> : <span style={{ ...tag, background: '#f4f5f7', color: '#58616a' }}>일반 발주처</span>}
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>{c.name}, 어떤 발주처인가</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#33383f', margin: 0, fontWeight: 500 }}>{ct.intro}</p>
        </div>

        {/* 확인된 사실만(lib/data/balju-facts.json, 출처 함께). 모르는 칸은 줄째 뺀다. */}
        {f && (f.notice || f.hq || f.biz) && (
          <div style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 8 }}>{c.name} 입찰, 어디서 보나</div>
            <dl style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: '#33383f' }}>
              {f.notice && (<div style={fact}><dt style={dt}>공고 보는 곳</dt><dd style={dd}>{f.noticeUrl ? <a href={f.noticeUrl} target="_blank" rel="noopener nofollow" style={{ color: '#2f56c4' }}>{f.notice}</a> : f.notice}</dd></div>)}
              {f.hq && (<div style={fact}><dt style={dt}>본사</dt><dd style={dd}>{f.hq}</dd></div>)}
              {f.biz && (<div style={fact}><dt style={dt}>주로 발주하는 것</dt><dd style={dd}>{f.biz}</dd></div>)}
            </dl>
            {f.src.length > 0 && <p style={{ fontSize: 13, color: '#636d77', margin: '8px 0 0' }}>출처 {[...new Set(f.src.map(srcHost))].slice(0, 3).join(' · ')} · 기관 사정으로 바뀔 수 있으니 공고 원문을 확인하세요</p>}
          </div>
        )}

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>{ct.sector} · 입찰은 이렇게 진행됩니다</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#33383f', margin: 0, fontWeight: 500 }}>{ct.bid}</p>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 8 }}>{c.name} 입찰, 먼저 챙길 것</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.8, color: '#33383f', fontWeight: 500 }}>
            {ct.prep.map((p, i) => <li key={i} style={{ marginBottom: 4 }}>{p}</li>)}
          </ol>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>설립일 사주 × 대표 사주</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#4a4636', margin: 0, fontWeight: 500 }}>{ct.founding}</p>
        </div>

        {/* 대표 일간 10개 각각에게 이 발주처가 몇 번째인지. 페이지마다 다른 계산값이라 템플릿 글의 겹침을 줄인다(2026-10-27). */}
        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>대표님 일간별로 보면</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#33383f', margin: '0 0 10px', fontWeight: 500 }}>{ilganSummary(c)}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ color: '#636d77', textAlign: 'left' }}><th style={th}>대표 일간</th><th style={th}>이 발주처는</th><th style={{ ...th, textAlign: 'right' }}>{CLIENTS.length}곳 중</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.ilgan} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={td}><b>{r.ilgan}</b> {r.hanja}</td>
                  <td style={td}>{r.desc}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{r.rank}위</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: '#636d77', lineHeight: 1.6, margin: '8px 0 0' }}>일지를 모르는 상태로 일지 12개를 고르게 평균한 순위입니다. 대표님 일지에 따라 점수가 10점 안팎 오르내립니다.</p>
        </div>

        <Link href={readingUrl} style={cta}>
          {c.name}{josa(c.name, '과', '와')} 내 궁합 보기 →
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 3 }}>대표님 성함·생년월일만 · 30초 무료로 시작</span>
        </Link>

        <div style={{ fontSize: 13, color: '#636d77', textAlign: 'center', margin: '10px 0 20px', lineHeight: 1.6 }}>
          {c.core ? '핵심 발주처 상세 궁합은 유료입니다. 먼저 무료로 방향을 보실 수 있어요.' : '이 발주처 궁합은 무료로 열립니다.'}
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '20px 0 10px' }}>자주 묻는 질문</div>
        <div style={{ marginBottom: 24 }}>
          {ct.faqs.map(([q, a], i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '13px 15px', marginBottom: 9 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginBottom: 5 }}>Q. {q}</div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: '#4a4636', margin: 0, fontWeight: 500 }}>{a}</p>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '18px 0 10px' }}>같은 분야·같은 기운의 발주처</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {others.map((o) => (
            <Link key={o.name} href={`/balju/${clientSlug(o.name)}`} style={chip}>{o.name}</Link>
          ))}
          <Link href="/balju" style={{ ...chip, background: 'var(--navy)', color: '#f4e7c4', borderColor: 'var(--navy)' }}>전체 발주처 →</Link>
        </div>

        <p style={{ fontSize: 13, color: '#636d77', lineHeight: 1.65, marginBottom: 20 }}>
          ※ 설립일은 공개 연혁 기준 자체 구축 DB이며, 명리 기반 참고 정보입니다. 실제 입찰·투찰 판단의 근거로 사용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

const fact: React.CSSProperties = { display: 'flex', gap: 10, padding: '4px 0' };
const dt: React.CSSProperties = { flex: '0 0 96px', color: '#636d77', fontSize: 13, fontWeight: 700, paddingTop: 2 };
const dd: React.CSSProperties = { margin: 0, fontWeight: 600 };
const th: React.CSSProperties = { padding: '6px 4px', fontWeight: 700 };
const td: React.CSSProperties = { padding: '7px 4px', color: '#33383f' };
const tag: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#58616a', background: '#f4f5f7', padding: '5px 11px', borderRadius: 999 };
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: '#2f56c4', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 17, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--navy)', background: '#f4f5f7', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
