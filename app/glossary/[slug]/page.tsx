import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GLOSSARY, glossaryBySlug } from '@/lib/glossary';

const BASE = 'https://nakchalsaju.com';

export function generateStaticParams() { return GLOSSARY.map(t => ({ slug: t.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = glossaryBySlug(params.slug);
  if (!t) return { title: '낙찰사주' };
  const title = `${t.term} 뜻 — ${t.cat} 용어 | 낙찰사주`;
  return { title, description: t.def.slice(0, 155), alternates: { canonical: `/glossary/${t.slug}` },
    keywords: [`${t.term} 뜻`, t.term, `${t.cat} 용어`, '낙찰사주 용어사전'],
    openGraph: { title, description: t.def.slice(0, 155), url: `${BASE}/glossary/${t.slug}`, type: 'article', siteName: '낙찰사주' } };
}

export default function TermPage({ params }: { params: { slug: string } }) {
  const t = glossaryBySlug(params.slug);
  if (!t) return notFound();
  const rel = (t.related || []).map(name => GLOSSARY.find(x => x.term.startsWith(name) || x.slug === name)).filter(Boolean) as typeof GLOSSARY;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'DefinedTerm', '@id': `${BASE}/glossary/${t.slug}#term`, name: t.term, description: t.def, url: `${BASE}/glossary/${t.slug}`,
      inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${BASE}/glossary#set`, name: '낙찰사주 입찰·명리 용어사전', url: `${BASE}/glossary` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '용어사전', item: `${BASE}/glossary` },
      { '@type': 'ListItem', position: 2, name: t.term, item: `${BASE}/glossary/${t.slug}` },
    ] },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/glossary" aria-label="용어사전" style={{ fontSize: 12, fontWeight: 700, color: '#7f786c', textDecoration: 'none' }}>용어사전 ›</Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.24em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>{t.cat} 用語{t.hanja ? ` · ${t.hanja}` : ''}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 24, lineHeight: 1.35, color: 'var(--ink)', margin: '2px 0 12px' }}>{t.term}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.85, color: '#33383f', fontWeight: 500, margin: '0 0 18px' }}>{t.def}</p>
        {rel.length > 0 && (<>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '8px 0 10px' }}>연관 용어</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {rel.map(r => (<Link key={r.slug} href={`/glossary/${r.slug}`} style={chip}>{r.term}</Link>))}
          </div>
        </>)}
        <Link href="/reading" style={cta}>오늘의 사정률 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 용어</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
          {GLOSSARY.filter(x => x.slug !== t.slug && x.cat === t.cat).slice(0, 12).map(x => (<Link key={x.slug} href={`/glossary/${x.slug}`} style={chip}>{x.term}</Link>))}
        </div>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ {t.cat === '명리·사주' ? '명리 기반 참고·오락용 해석입니다.' : '일반적 설명으로, 실제 제도는 공고문·관련 법령을 따릅니다.'}</p>
      </div>
    </div>
  );
}
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
