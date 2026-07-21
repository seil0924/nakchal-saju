import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES } from '@/lib/seo-landings';

const BASE = 'https://nakchal-saju.vercel.app';
const bySlug = (slug: string) => GUIDES.find(g => g.slug === decodeURIComponent(slug));

export function generateStaticParams() { return GUIDES.map(g => ({ slug: g.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = bySlug(params.slug);
  if (!g) return { title: '낙찰사주' };
  return {
    title: g.title, description: g.lead.slice(0, 155),
    alternates: { canonical: `/guide/${g.slug}` },
    openGraph: { title: g.title, description: g.lead.slice(0, 155), url: `${BASE}/guide/${g.slug}`, type: 'article', siteName: '낙찰사주' },
    keywords: [...g.keywords, '낙찰사주', '입찰 사주'],
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = bySlug(params.slug);
  if (!g) return notFound();
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, description: g.lead, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/guide/${g.slug}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '가이드', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: g.h1, item: `${BASE}/guide/${g.slug}` },
    ] },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '4px 0 12px' }}>{g.h1}</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 18px' }}>{g.lead}</p>
        {g.sections.map((s, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--navy)', marginBottom: 6 }}>{s.h}</div>
            <p style={{ fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 }}>{s.p}</p>
          </div>
        ))}
        <Link href={g.ctaHref} style={cta}>{g.ctaText}<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        {g.related && g.related.length > 0 && (<>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '20px 0 10px' }}>함께 보면 좋은 글</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {g.related.map((r, i) => (<Link key={i} href={r.href} style={chip}>{r.label}</Link>))}
          </div>
        </>)}
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ 만세력·십성·오행 상성으로 산출한 명리 기반 참고·오락용 정보입니다. 실제 투찰금액 산정의 근거로 사용할 수 없습니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
