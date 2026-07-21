import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CONCEPTS } from '@/lib/seo-concepts';

const BASE = 'https://nakchal-saju.vercel.app';
const bySlug = (slug: string) => CONCEPTS.find(c => c.slug === decodeURIComponent(slug));

export function generateStaticParams() { return CONCEPTS.map(c => ({ slug: c.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = bySlug(params.slug);
  if (!c) return { title: '사주 · 낙찰사주' };
  return { title: c.title, description: c.lead.slice(0, 155),
    alternates: { canonical: `/사주/${c.slug}` },
    openGraph: { title: c.title, description: c.lead.slice(0, 155), url: `${BASE}/사주/${c.slug}`, type: 'article', siteName: '낙찰사주' },
    keywords: [...c.keywords, '대표 사주', '낙찰사주'] };
}

export default function ConceptPage({ params }: { params: { slug: string } }) {
  const c = bySlug(params.slug);
  if (!c) return notFound();
  const siblings = CONCEPTS.filter(x => x.group === c.group && x.slug !== c.slug);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: c.h1, description: c.lead, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/사주/${c.slug}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '사주', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: c.label, item: `${BASE}/사주/${c.slug}` },
    ] },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading?cat=daepyo" aria-label="대표 사주"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 12, color: '#8a806a', marginBottom: 10 }}>{c.group} › {c.label}</nav>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '4px 0 12px' }}>{c.h1}</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 18px' }}>{c.lead}</p>
        {c.sections.map((s, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--navy)', marginBottom: 6 }}>{s.h}</div>
            <p style={{ fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 }}>{s.p}</p>
          </div>
        ))}
        <Link href="/reading?cat=daepyo" style={cta}>내 일간·오행으로 대표 사주 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료 · 6대 축 스코어카드</span></Link>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 {c.group} 보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {siblings.map(x => (<Link key={x.slug} href={`/사주/${x.slug}`} style={chip}>{x.label}</Link>))}
        </div>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ 만세력·십성·오행 상성으로 산출한 명리 기반 참고·오락용 정보입니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
