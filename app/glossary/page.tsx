import type { Metadata } from 'next';
import Link from 'next/link';
import { GLOSSARY, glossaryByCat } from '@/lib/glossary';

const BASE = 'https://nakchal-saju.vercel.app';
const slugify = (s: string) => s;

export const metadata: Metadata = {
  title: '입찰·명리 용어사전 — 사정률·적격심사·일간·대운까지 | 낙찰사주',
  description: '공공입찰·조달 용어(사정률·낙찰하한율·적격심사·종합심사)와 사주명리 용어(일간·십성·대운·세운·관재수)를 한자리에서 명확히 정의합니다.',
  alternates: { canonical: '/glossary' },
  keywords: ['입찰 용어', '조달 용어', '사정률 뜻', '적격심사 뜻', '사주 용어', '명리 용어', '일간 뜻', '대운 뜻', '낙찰사주'],
  openGraph: { title: '입찰·명리 용어사전 | 낙찰사주', description: '입찰·조달·사주명리 핵심 용어 정의', url: `${BASE}/glossary`, type: 'article', siteName: '낙찰사주' },
};

const cats: ('입찰·조달' | '명리·사주')[] = ['입찰·조달', '명리·사주'];

export default function GlossaryPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'DefinedTermSet', '@id': `${BASE}/glossary#set`, name: '낙찰사주 입찰·명리 용어사전', url: `${BASE}/glossary`,
      hasDefinedTerm: GLOSSARY.map(t => ({ '@type': 'DefinedTerm', '@id': `${BASE}/glossary/${t.slug}#term`, name: t.term, description: t.def, url: `${BASE}/glossary/${t.slug}`, inDefinedTermSet: `${BASE}/glossary#set` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: '용어사전', item: `${BASE}/glossary` },
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
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>用語 辭典</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>입찰·명리 용어사전</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 16px' }}>공공입찰·조달과 사주명리의 핵심 용어를 한자리에서 명확히 정의합니다. 각 용어를 눌러 자세한 뜻과 연관어를 확인하세요.</p>
        {cats.map(cat => (
          <section key={cat} style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '6px 0 10px' }}>{cat} 용어</div>
            <dl style={{ margin: 0 }}>
              {glossaryByCat(cat).map(t => (
                <div key={t.slug} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 13, padding: '13px 15px', marginBottom: 9 }}>
                  <dt style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--ink)', marginBottom: 5 }}>
                    <Link href={`/glossary/${t.slug}`} style={{ color: 'var(--navy)', textDecoration: 'none' }}>{t.term}{t.hanja && t.hanja !== t.term ? '' : ''}</Link>
                  </dt>
                  <dd style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: '#33383f', fontWeight: 500 }}>{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <Link href="/reading" style={cta}>오늘의 사정률 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '14px 0 22px' }}>※ 명리 용어 해석은 참고·오락용이며, 입찰·조달 용어는 일반적 설명으로 실제 제도는 공고문·관련 법령을 따릅니다.</p>
      </div>
    </div>
  );
}
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
