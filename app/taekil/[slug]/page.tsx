import '@/app/en/date-picker/date-picker.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TAEKIL, OFFICER_KO, taekilBySlug } from '@/lib/taekil';
import TaekilPick from '@/app/_components/TaekilPick';

const BASE = 'https://nakchalsaju.com';

// 한글 슬러그다. 정적 세그먼트(app/택일)는 배포본에서 라우팅이 안 되지만
// 동적 세그먼트 값으로는 멀쩡히 돈다 — /saju/갑목-일간 이 그 증거다.
export function generateStaticParams() {
  return TAEKIL.map(t => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  let slug = params.slug; try { slug = decodeURIComponent(slug); } catch { }
  const t = taekilBySlug(slug);
  if (!t) return { title: { absolute: '택일 | 낙찰사주' } };
  const url = BASE + '/taekil/' + encodeURIComponent(t.slug);
  return {
    title: { absolute: t.h1 + ' | 낙찰사주' },
    description: t.lead + ' 건제십이신으로 앞으로 90일을 가립니다. 회원가입 없이 바로 보실 수 있습니다.',
    keywords: [t.kw, t.slug, '택일', '좋은 날', '건제십이신', '길일'],
    alternates: { canonical: '/taekil/' + encodeURIComponent(t.slug) },
    openGraph: { title: t.h1, description: t.lead, url, type: 'article', locale: 'ko_KR', siteName: '낙찰사주' },
  };
}

export default function TaekilPage({ params }: { params: { slug: string } }) {
  let slug = params.slug; try { slug = decodeURIComponent(slug); } catch { }
  const t = taekilBySlug(slug);
  // 없는 슬러그는 404 대신 허브로 보낸다. 목록이 바뀌면 예전 주소가 죽는데,
  // CEO 페이지에서 그렇게 한 번 당했다 — 구글이 이미 물고 있던 주소가 통째로 404였다.
  if (!t) redirect('/taekil');

  const others = TAEKIL.filter(x => x.slug !== t.slug);
  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: t.h1, applicationCategory: 'ReferenceApplication', operatingSystem: 'Any',
      url: BASE + '/taekil/' + encodeURIComponent(t.slug), inLanguage: 'ko',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
      description: t.lead,
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: BASE + '/' },
        { '@type': 'ListItem', position: 2, name: '택일', item: BASE + '/taekil' },
        { '@type': 'ListItem', position: 3, name: t.kw, item: BASE + '/taekil/' + encodeURIComponent(t.slug) },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: t.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" /></svg></Link>
      </div>

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 12, color: '#6f6a58', marginBottom: 10 }}>
          <Link href="/taekil" style={{ color: '#2f56c4', textDecoration: 'none', fontWeight: 600 }}>택일</Link> › {t.kw}
        </nav>
        <div style={{ fontSize: 11, letterSpacing: '.24em', color: '#6f6a58', fontWeight: 700, marginBottom: 6 }}>{t.kicker}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 10px' }}>{t.h1}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 14px' }}>{t.lead}</p>
      </div>

      <TaekilPick slug={t.slug} />

      <section className="bz-read" style={{ padding: '0 18px 8px' }}>
        {t.body.map((b, i) => (
          <div key={i}>
            <h3>{b.h}</h3>
            <p>{b.p}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '4px 18px 0' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '10px 0 8px' }}>자주 묻는 질문</h2>
        {t.faq.map((f, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14.5, color: 'var(--navy)', marginBottom: 6 }}>Q. {f.q}</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#33383f', margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>

      <section style={{ padding: '10px 18px 0' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '10px 0 8px' }}>다른 날 고르기</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {others.map(x => (
            <Link key={x.slug} href={'/taekil/' + encodeURIComponent(x.slug)} style={chip}>{x.kw.replace(' 택일', '')}</Link>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: '#6f6a58', lineHeight: 1.65, margin: '14px 0 22px' }}>
          ※ 절기로 나눈 달과 그날의 일지로 건제십이신을 낸 참고·오락용 정보입니다.
          계약 조건·비용·사람이 먼저이고 이 글은 그 위에 얹는 것입니다. 투찰금액 산정 근거가 아닙니다.
        </p>
      </section>
    </div>
  );
}

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid var(--line)', borderRadius: 13,
  padding: '13px 15px', marginBottom: 9,
};
const chip: React.CSSProperties = {
  fontSize: 12.5, fontWeight: 700, color: '#2f56c4', background: '#faf6ec',
  border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none',
};

