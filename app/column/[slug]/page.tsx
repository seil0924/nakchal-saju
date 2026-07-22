import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getColumn, getAllColumnSlugs } from '@/lib/column';

const BASE = 'https://nakchalsaju.com';

export function generateStaticParams() {
  return getAllColumnSlugs().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getColumn(params.slug);
  if (!p) return { title: '사주 칼럼 · 낙찰사주' };
  return {
    title: p.title,
    description: p.description,
    keywords: p.tags,
    alternates: { canonical: `/column/${p.slug}` },
    openGraph: {
      title: p.title, description: p.description, type: 'article',
      locale: 'ko_KR', siteName: '낙찰사주', publishedTime: p.date,
      url: `${BASE}/column/${p.slug}`,
      images: p.cover ? [{ url: p.cover }] : [{ url: '/api/og' }],
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description },
  };
}

function fmtDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${y}. ${m}. ${day}`;
}

export default function ColumnPost({ params }: { params: { slug: string } }) {
  const p = getColumn(params.slug);
  if (!p) notFound();

  // Article 구조화 데이터 — 구글이 발행일·제목·저자를 정확히 인식
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    dateModified: p.date,
    inLanguage: 'ko',
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/column/${p.slug}` },
    author: { '@type': 'Organization', name: '낙찰사주' },
    publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE },
    ...(p.cover ? { image: [BASE + p.cover] } : {}),
    keywords: p.tags.join(', '),
  };

  // FAQPage 구조화데이터 — FAQ가 있는 글이면 검색 리치결과·AI(GEO) 인용에 사용
  const faqLd = p.faq && p.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: p.faq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;

  return (
    <div className="app home5 colpost">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="s">士</span>
          <div className="n">낙찰사주<em>會社 사주 전문</em></div>
        </Link>
        <Link href="/column" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>목록 ›</Link>
      </div>

      <article className="colbody">
        <div className="colmeta">{fmtDate(p.date)} · {p.readingMin}분 읽기</div>
        <h1>{p.title}</h1>
        <div className="colby">글 · 낙찰사주 편집팀 · 만세력(萬歲曆) 천문 계산 기반</div>
        {p.tags.length > 0 && (
          <div className="coltags">{p.tags.map(t => <span key={t}>#{t}</span>)}</div>
        )}
        <div className="rule" />
        <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        {p.faq && p.faq.length > 0 && (
          <section className="colfaq">
            <h2>자주 묻는 질문</h2>
            {p.faq.map((f, i) => (
              <div className="colfaq-item" key={i}>
                <p className="q">Q. {f.q}</p>
                <p className="a">{f.a}</p>
              </div>
            ))}
          </section>
        )}
      </article>

      {/* 유입 → 전환: 무료 진입 CTA */}
      <div style={{ padding: '8px 24px 0' }}>
        <Link className="fullcta" href="/reading">오늘의 낙찰 사정률 보기 <small>생년월일만 · 30초 · 무료로 시작</small></Link>
      </div>

      <div className="foot">
        <div className="crule" />
        <div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/refund">청약철회·환불</Link>
      </div>
    </div>
  );
}
