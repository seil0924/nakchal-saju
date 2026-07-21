import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQ_MAIN } from '@/lib/faq';

const BASE = 'https://nakchal-saju.vercel.app';

export const metadata: Metadata = {
  title: '자주 묻는 질문 — 입찰 사주·발주처 궁합·투찰 택일 | 낙찰사주',
  description: '입찰 사주란 무엇인지, 사주로 낙찰을 예측할 수 있는지, 발주처 궁합·법인 설립일 사주·투찰 길일은 어떻게 보는지 — 낙찰사주에 대해 자주 묻는 질문에 답합니다.',
  alternates: { canonical: '/faq' },
  keywords: ['입찰 사주', '낙찰 사주', '발주처 궁합', '투찰 택일', '법인 설립일 사주', '사주 낙찰', '낙찰사주 FAQ'],
  openGraph: { title: '자주 묻는 질문 | 낙찰사주', description: '입찰 사주·발주처 궁합·투찰 택일에 대해 자주 묻는 질문', url: `${BASE}/faq`, type: 'article', siteName: '낙찰사주' },
};

export default function FaqPage() {
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ_MAIN.map(x => ({
        '@type': 'Question', name: x.q,
        acceptedAnswer: { '@type': 'Answer', text: x.a },
      })),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: '자주 묻는 질문', item: `${BASE}/faq` },
      ],
    },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.3em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>自主 問答</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>자주 묻는 질문</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 18px' }}>입찰 사주가 무엇인지부터 발주처 궁합·투찰 택일까지 — 대표님이 가장 많이 묻는 것들에 답합니다.</p>
        {FAQ_MAIN.map((x, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--navy)', marginBottom: 7, lineHeight: 1.5 }}>Q. {x.q}</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.82, color: '#33383f', margin: 0, fontWeight: 500 }}>{x.a}</p>
          </div>
        ))}
        <Link href="/reading" style={cta}>오늘의 사정률 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '22px 0 10px' }}>더 알아보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          <Link href="/guide/입찰-사주" style={chip}>입찰 사주란</Link>
          <Link href="/balju" style={chip}>발주처 궁합</Link>
          <Link href="/guide/투찰-길일" style={chip}>투찰 길일</Link>
          <Link href="/guide/법인-설립일-사주" style={chip}>법인 설립일 사주</Link>
          <Link href="/why" style={chip}>대표 고민별</Link>
        </div>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ 사주명리 이론에 기반한 참고·오락용 정보입니다. 미래를 예측하거나 특정 결과(낙찰 등)를 보장하지 않으며, 실제 투찰금액 산정의 근거로 사용할 수 없습니다.</p>
      </div>
    </div>
  );
}
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
