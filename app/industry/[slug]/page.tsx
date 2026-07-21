import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDUSTRIES } from '@/lib/seo-landings';
import { CLIENTS, clientSlug } from '@/lib/clients';

const BASE = 'https://nakchal-saju.vercel.app';
const bySlug = (slug: string) => INDUSTRIES.find(r => r.slug === decodeURIComponent(slug));

export function generateStaticParams() { return INDUSTRIES.map(r => ({ slug: r.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = bySlug(params.slug);
  if (!r) return { title: '낙찰사주' };
  const title = `${r.name} 대표 입찰 사주 — 낙찰 흐름과 발주처 궁합 | 낙찰사주`;
  const description = `${r.name} 대표님을 위한 입찰 사주 — 오늘의 사정률·투찰 길일·발주처 궁합을 30초 무료로. ${r.intro}`.slice(0, 155);
  return { title, description, alternates: { canonical: `/industry/${r.slug}` },
    openGraph: { title, description, url: `${BASE}/industry/${r.slug}`, type: 'article', siteName: '낙찰사주' },
    keywords: [...r.keywords, '업종별 입찰', '낙찰사주'] };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const r = bySlug(params.slug);
  if (!r) return notFound();
  const rel = CLIENTS.filter(c => r.clients.includes(c.name));
  const ld = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: '업종별 입찰', item: `${BASE}/` },
    { '@type': 'ListItem', position: 2, name: `${r.name} 입찰`, item: `${BASE}/industry/${r.slug}` },
  ] };
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>業種別 入札</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 10px' }}>{r.name} 대표 — 입찰 흐름과 발주처 궁합</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 16px' }}>{r.intro}</p>
        <div style={card}><div style={h}>{r.name} 입찰·적격심사 특성</div><p style={p}>{r.trait}</p></div>
        <div style={card}><div style={h}>명리로 보는 {r.name} 대표</div><p style={p}>{r.myeong}</p></div>

        <Link href="/reading?cat=sajeong" style={cta}>오늘의 사정률 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>

        {rel.length > 0 && (<>
        <div style={{ ...h, margin: '22px 0 10px' }}>{r.name} 주요 발주처 궁합</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {rel.map(c => (
            <Link key={c.name} href={`/balju/${clientSlug(c.name)}`} style={row}>
              <b style={{ color: 'var(--navy)', fontFamily: 'var(--serif)' }}>{c.name}</b>
              <span style={{ fontSize: 12, color: '#8a806a' }}>{c.date.slice(0, 4)} 설립 · {c.cat} ›</span>
            </Link>
          ))}
        </div></>)}

        <div style={{ ...h, margin: '18px 0 10px' }}>다른 업종</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
          {INDUSTRIES.filter(x => x.slug !== r.slug).map(x => (<Link key={x.slug} href={`/industry/${x.slug}`} style={chip}>{x.name}</Link>))}
        </div>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ 만세력·십성·오행 상성으로 산출한 명리 기반 참고·오락용 정보입니다. 실제 투찰금액 산정 근거가 아닙니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const h: React.CSSProperties = { fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 };
const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', textDecoration: 'none' };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
