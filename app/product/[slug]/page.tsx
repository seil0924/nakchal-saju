import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCTS, productBySlug, OHAENG } from '@/lib/categories';

export function generateStaticParams() { return PRODUCTS.map(p => ({ slug: p.slug })); }

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = productBySlug(params.slug);
  if (!p) return { title: '낙찰사주' };
  return { title: `${p.name} — ${p.title.replace(/\{\/?b\}/g, '')} · 낙찰사주`, description: p.lead };
}

function T({ s }: { s: string }) {
  const parts = s.split(/(\{b\}|\{\/b\})/); let on = false;
  return <>{parts.map((x, i) => { if (x === '{b}') { on = true; return null; } if (x === '{/b}') { on = false; return null; } return on ? <b key={i}>{x}</b> : <span key={i}>{x}</span>; })}</>;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = productBySlug(params.slug);
  if (!p) notFound();
  const oh = OHAENG[p.oh];

  return (
    <div className="app home5 catpage" style={{ ['--acc' as any]: oh.acc }}>
      <div className="mast">
        <div className="mb"><Link href="/" className="s" style={{ textDecoration: 'none' }}>士</Link>
          <div className="n">{p.name}<em>{p.kicker}</em></div></div>
        <Link href="/" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>홈 ›</Link>
      </div>

      <div className="hero5">
        <div className="wm">{p.hanja}</div>
        <div className="kick">{oh.el} · {p.kicker}</div>
        <h1><T s={p.title} /></h1>
        <div className="rule" />
        <div className="sub">{p.lead}</div>
      </div>

      <div className="lab"><i /><span>이런 대표님께</span></div>
      <div className="painbox">
        {p.pains.map((x, i) => <div key={i} className="pain"><span className="pk">✓</span>{x}</div>)}
      </div>

      <div className="lab"><i /><span>이 진단이 드리는 것</span></div>
      <div className="diff">
        {p.gives.map(([t, d], i) => <div key={i} className="drow"><b>{t}</b><span>{d}</span></div>)}
      </div>

      {/* 가격 비노출 — 결과 페이월에서만 */}

      <div style={{ padding: '16px 24px 0' }}>
        <Link className="fullcta" href={p.href}>{p.cta} <small>생년월일만 · 30초 · 무료로 시작</small></Link>
      </div>

      <div className="lab"><i /><span>다른 진단</span></div>
      <div className="list">
        {PRODUCTS.filter(x => x.slug !== p.slug).map((x, i) => (
          <Link key={i} className="li5" href={`/product/${x.slug}`}>
            <div className="gz" style={{ color: OHAENG[x.oh].acc }}>{x.hanja}</div>
            <div className="bd5"><div className="t">{x.name}</div><div className="d">{x.lead}</div></div>
            <div className="rt"><div className="arw">→</div></div>
          </Link>
        ))}
      </div>

      <div className="foot">
        <div className="crule" /><div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/refund">청약철회·환불</Link>
      </div>
    </div>
  );
}
