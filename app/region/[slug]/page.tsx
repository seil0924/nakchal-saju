import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { REGIONS } from '@/lib/seo-landings';
import { CLIENTS, clientSlug } from '@/lib/clients';

const BASE = 'https://nakchal-saju.vercel.app';
const bySlug = (slug: string) => REGIONS.find(r => r.slug === decodeURIComponent(slug));
const NATIONAL = ['한국도로공사', '한국토지주택공사(LH)', '조달청', '한국전력공사(KEPCO)'];

export function generateStaticParams() { return REGIONS.map(r => ({ slug: r.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = bySlug(params.slug);
  if (!r) return { title: '낙찰사주' };
  const title = `${r.name} 입찰 사주 — 지역 발주처 궁합과 낙찰 흐름 | 낙찰사주`;
  const description = `${r.name} 지역 발주처(${r.clients.join('·')})와 대표님 사주의 궁합, 오늘의 사정률·투찰 길일을 30초 무료로. ${r.intro}`;
  return { title, description, alternates: { canonical: `/region/${r.slug}` },
    openGraph: { title, description, url: `${BASE}/region/${r.slug}`, type: 'article', siteName: '낙찰사주' },
    keywords: [`${r.name} 입찰`, `${r.name} 조달`, `${r.name} 발주처`, `${r.name} 입찰 사주`, '지역 입찰', '낙찰사주'] };
}

export default function RegionPage({ params }: { params: { slug: string } }) {
  const r = bySlug(params.slug);
  if (!r) return notFound();
  const localClients = CLIENTS.filter(c => r.clients.includes(c.name));
  const faqs = [
    { q: `${r.name} 지역 입찰은 어떤 특성이 있나요?`, a: r.industry },
    { q: `${r.name}에서 대표에게 유리한 발주처는 어디인가요?`, a: `${r.clients.join('·')} 등 ${r.name} 주요 발주처와 대표님 사주(설립일)의 궁합을 견줘, 그 판이 대표님과 맞는지 참고합니다. 지역제한·지역 가점을 함께 챙기면 유리합니다.` },
  ];
  const ld: any[] = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '지역 입찰', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: `${r.name} 입찰`, item: `${BASE}/region/${r.slug}` },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/balju" aria-label="발주처"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '4px 0 10px' }}>{r.name} 입찰 — 지역 발주처와 내 궁합</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 14px' }}>{r.intro}</p>
        <div style={card}><div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>{r.name} 입찰·조달 특성</div><p style={{ fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 }}>{r.industry}</p></div>

        {localClients.length > 0 && (<>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '14px 0 10px' }}>{r.name} 주요 발주처</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {localClients.map(c => (
            <Link key={c.name} href={`/balju/${clientSlug(c.name)}`} style={row}>
              <b style={{ color: 'var(--navy)', fontFamily: 'var(--serif)' }}>{c.name}</b>
              <span style={{ fontSize: 12, color: '#8a806a' }}>{c.date.slice(0, 4)} 설립 · {c.cat} ›</span>
            </Link>
          ))}
        </div>
        </>)}

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '4px 0 10px' }}>전국 공통 핵심 발주처</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {NATIONAL.map(n => (<Link key={n} href={`/balju/${clientSlug(n)}`} style={chip}>{n}</Link>))}
        </div>

        <Link href="/reading?cat=sajeong" style={cta}>오늘의 사정률 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>{r.name} 입찰, 오늘 넣을까 미룰까 · 30초</span></Link>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '22px 0 10px' }}>자주 묻는 질문</div>
        {faqs.map((x, i) => (<div key={i} style={card}><div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14.5, color: 'var(--navy)', marginBottom: 6 }}>Q. {x.q}</div><p style={{ fontSize: 14.5, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 }}>{x.a}</p></div>))}

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '18px 0 20px' }}>※ 발주처 설립일은 공개 연혁 기준 자체 DB이며, 명리 기반 참고·오락용 정보입니다. 실제 투찰 판단의 근거로 사용할 수 없습니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 3, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', textDecoration: 'none' };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none' };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
