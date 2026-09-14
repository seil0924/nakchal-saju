import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDUSTRIES } from '@/lib/seo-landings';
import { CLIENTS, clientSlug } from '@/lib/clients';
import { ogCard } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';

const BASE = 'https://nakchalsaju.com';
const bySlug = (slug: string) => INDUSTRIES.find(r => r.slug === decodeURIComponent(slug));

export function generateStaticParams() { return INDUSTRIES.map(r => ({ slug: r.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = bySlug(params.slug);
  if (!r) return { title: '낙찰사주' };
  const title = `${r.name} 대표 입찰 사주 — 낙찰 흐름과 발주처 궁합`;
  const description = `${r.name} 대표님을 위한 입찰 사주 — 오늘의 투찰 택일·길일·발주처 궁합을 30초 무료로. ${r.intro}`.slice(0, 155);
  return { title, description, alternates: { canonical: `/industry/${r.slug}` },
    openGraph: { title, description, url: `${BASE}/industry/${r.slug}`, type: 'article', siteName: '낙찰사주',
      images: ogCard({ seal: '業', k: '業種 入札', t: `${r.name} 대표 입찰 사주`, s: '낙찰 흐름과 발주처 궁합' }) },
    keywords: [...r.keywords, '업종별 입찰', '낙찰사주'] };
}

export default function IndustryPage({ params }: { params: { slug: string } }) {
  const r = bySlug(params.slug);
  if (!r) return notFound();
  const rel = CLIENTS.filter(c => r.clients.includes(c.name));
  const faqs = [
    { q: `${r.name} 입찰에 사주가 도움이 되나요?`, a: `${r.name} 입찰은 면허·실적과 적격심사 정량 배점이 당락을 가르므로 서류 완결성이 최우선입니다. 사주는 낙찰을 예측하는 게 아니라, 큰 건을 어느 날 던질지와 어떤 발주처가 대표님과 맞는지의 참고로 곁들이는 것입니다.` },
    { q: `${r.name} 대표는 어떤 기질이 유리한가요?`, a: r.myeong },
  ];
  const ld: any[] = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '업종별 입찰', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: `${r.name} 입찰`, item: `${BASE}/industry/${r.slug}` },
    ] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteTop />
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 13, color: '#2f56c4', fontWeight: 700, marginBottom: 6 }}>업종별 입찰</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 10px' }}>{r.name} 대표 — 입찰 흐름과 발주처 궁합</h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 16px' }}>{r.intro}</p>
        <div style={card}><div style={h}>{r.name} 입찰·적격심사 특성</div><p style={p}>{r.trait}</p></div>
        <div style={card}><div style={h}>명리로 보는 {r.name} 대표</div><p style={p}>{r.myeong}</p></div>

        <Link href="/reading?cat=sajeong" style={cta}>오늘의 투찰 택일 무료로 보기 →<span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>

        {rel.length > 0 && (<>
        <div style={{ ...h, margin: '22px 0 10px' }}>{r.name} 주요 발주처 궁합</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {rel.map(c => (
            <Link key={c.name} href={`/balju/${clientSlug(c.name)}`} style={row}>
              <b style={{ color: 'var(--navy)', fontFamily: 'var(--serif)' }}>{c.name}</b>
              <span style={{ fontSize: 13, color: '#58616a' }}>{c.date.slice(0, 4)} 설립 · {c.cat} ›</span>
            </Link>
          ))}
        </div></>)}

        <div style={{ ...h, margin: '22px 0 10px' }}>자주 묻는 질문</div>
        {faqs.map((x, i) => (
          <div key={i} style={card}><div style={{ ...h, fontSize: 15, marginBottom: 6 }}>Q. {x.q}</div><p style={p}>{x.a}</p></div>
        ))}
        <div style={{ ...h, margin: '18px 0 10px' }}>다른 업종</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
          {INDUSTRIES.filter(x => x.slug !== r.slug).map(x => (<Link key={x.slug} href={`/industry/${x.slug}`} style={chip}>{x.name}</Link>))}
        </div>
        <p style={{ fontSize: 13, color: '#636d77', lineHeight: 1.65, marginBottom: 20 }}>※ 만세력·십성·오행 상성으로 산출한 명리 기반 참고·오락용 정보입니다. 실제 투찰금액 산정 근거가 아닙니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '15px 16px', marginBottom: 11 };
const h: React.CSSProperties = { fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 };
const p: React.CSSProperties = { fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 };
const row: React.CSSProperties = { fontSize: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', textDecoration: 'none' };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: '#3f6be0', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 12, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 17, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--navy)', background: '#f4f5f7', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
