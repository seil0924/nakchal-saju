import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CLIENTS, clientSlug, clientBySlug, josa } from '@/lib/clients';

const BASE = 'https://nakchal-saju.vercel.app';

export function generateStaticParams() {
  return CLIENTS.map((c) => ({ slug: clientSlug(c.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = clientBySlug(params.slug);
  if (!c) return { title: '발주처 · 낙찰사주' };
  const title = `${c.name} 입찰, 대표님과 맞는 발주처일까 — 낙찰사주`;
  const description = `${c.name}(${c.date.slice(0, 4)} 설립·${c.cat}) 입찰·조달 특성과 대표님 사주 궁합. ${c.tip ?? ''} 설립일 사주 × 대표 사주로 30초 무료 진단.`;
  const url = `${BASE}/balju/${clientSlug(c.name)}`;
  return {
    title, description,
    alternates: { canonical: `/balju/${clientSlug(c.name)}` },
    openGraph: { title, description, url, type: 'article', siteName: '낙찰사주' },
    keywords: [c.name, `${c.name} 입찰`, `${c.name} 조달`, `${c.name} 낙찰`, c.cat, '발주처 궁합', '입찰 사주', '낙찰사주'],
  };
}

export default function BaljuLanding({ params }: { params: { slug: string } }) {
  const c = clientBySlug(params.slug);
  if (!c) return notFound();
  const readingUrl = `/reading?cat=balju&ck=client&cn=${encodeURIComponent(c.name)}&cd=${c.date}`;
  const others = CLIENTS.filter((x) => x.name !== c.name).slice(0, 12);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${c.name} 입찰, 대표님과 맞는 발주처일까`,
    about: c.name,
    description: c.tip ?? `${c.name} 입찰·조달 특성 분석`,
    publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE },
    mainEntityOfPage: `${BASE}/balju/${clientSlug(c.name)}`,
  };

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>발주처</Link>
        <Link className="ic" href="/balju" aria-label="발주처 목록"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 12, color: '#8a806a', marginBottom: 10 }}>
          <Link href="/balju" style={{ color: '#8a806a' }}>발주처</Link> › {c.name}
        </nav>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {c.name} 입찰,<br />대표님과 맞는 발주처입니까
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{c.date.slice(0, 4)} 설립</span>
          <span style={tag}>{c.cat}</span>
          {c.core ? <span style={{ ...tag, background: '#f6e7c8', color: '#7a5c1e' }}>封 핵심 발주처</span> : <span style={{ ...tag, background: '#e7f4ee', color: '#177f5e' }}>일반 발주처</span>}
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>이 발주처, 어떻게 대해야 하나</div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#33383f', margin: 0, fontWeight: 500 }}>{c.tip ?? `${c.name}의 입찰·조달 특성을 대표님 사주와 맞춰 분석합니다.`}</p>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>설립일 사주 × 대표 사주</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#4a4636', margin: 0, fontWeight: 500 }}>
            {c.name}{josa(c.name, '은', '는')} <b>{c.date} 설립</b>입니다. 낙찰사주는 이 <b>설립일 사주</b>를 대표님 사주와 맞춰,
            이 발주처와 <b>애초에 맞는 판인지</b> — 언제 나서고 어떻게 대해야 유리한지를 짚어드립니다.
          </p>
        </div>

        <Link href={readingUrl} style={cta}>
          {c.name}{josa(c.name, '과', '와')} 내 궁합 보기 →
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>대표님 생년월일만 · 30초 무료로 시작</span>
        </Link>

        <div style={{ fontSize: 12, color: '#a99f88', textAlign: 'center', margin: '10px 0 20px', lineHeight: 1.6 }}>
          {c.core ? '핵심 발주처 상세 궁합은 유료입니다. 먼저 무료로 방향을 보실 수 있어요.' : '이 발주처 궁합은 무료로 열립니다.'}
        </div>

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '18px 0 10px' }}>다른 발주처와의 궁합도 보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {others.map((o) => (
            <Link key={o.name} href={`/balju/${clientSlug(o.name)}`} style={chip}>{o.name}</Link>
          ))}
          <Link href="/balju" style={{ ...chip, background: 'var(--navy)', color: '#f4e7c4', borderColor: 'var(--navy)' }}>전체 발주처 →</Link>
        </div>

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>
          ※ 설립일은 공개 연혁 기준 자체 구축 DB이며, 명리 기반 참고 정보입니다. 실제 입찰·투찰 판단의 근거로 사용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

const tag: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#6b6249', background: '#f3ead6', padding: '5px 11px', borderRadius: 999 };
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
