import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PAINS, painBySlug, PAIN_CAT } from '@/lib/pains';
import { PAIN_OH, OHAENG } from '@/lib/categories';

export function generateStaticParams() {
  return PAINS.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = painBySlug(params.slug);
  if (!p) return { title: '낙찰사주' };
  const plain = p.title.replace(/\{\/?b\}/g, '').replace(/\n/g, ' ');
  return { title: `${plain} · 낙찰사주`, description: p.lead };
}

// {b}..{/b} → <b>..</b>
function T({ s }: { s: string }) {
  const parts = s.split(/(\{b\}|\{\/b\})/);
  let on = false;
  return <>{parts.map((x, i) => { if (x === '{b}') { on = true; return null; } if (x === '{/b}') { on = false; return null; } return on ? <b key={i}>{x}</b> : <span key={i}>{x}</span>; })}</>;
}

export default function WhyPage({ params }: { params: { slug: string } }) {
  const p = painBySlug(params.slug);
  if (!p) notFound();
  const acc = OHAENG[PAIN_OH[p.slug] ?? 'su'].acc;

  return (
    <div className="app home5 catpage" style={{ ['--acc' as any]: acc }}>
      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="s">士</span>
          <div className="n">낙찰사주<em>會社 사주 전문</em></div>
        </Link>
        <Link href="/why" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>다른 고민 ›</Link>
      </div>

      {/* 통점 히어로 (상징 영상) */}
      <div className="hero5">
        <video className="herovid" autoPlay muted loop playsInline>
          <source src={`/why-${p.slug}.mp4`} type="video/mp4" />
        </video>
        <div className="wm">{p.mk}</div>
        <div className="kick">{p.kicker}</div>
        <h1>{p.title.split('\n').map((line, i) => <span key={i}>{i > 0 && <br />}<T s={line} /></span>)}</h1>
        <div className="rule" />
        <div className="sub">{p.lead}</div>
      </div>

      {/* 후벼파기 */}
      <div className="lab"><i /><span>혹시, 이런 밤을 보내셨나요</span></div>
      <div className="painbox">
        {p.dig.map((d, i) => <div key={i} className="pain"><span className="pk">·</span>{d}</div>)}
      </div>

      {/* 네 탓이 아니다 — 명리 재구성 */}
      <div className="lab"><i /><span>대표님 잘못이 아닙니다</span></div>
      <div className="auth">
        {p.reframe.map((r, i) => <p key={i} className="authlead" style={{ marginBottom: i === p.reframe.length - 1 ? 0 : 12 }} dangerouslySetInnerHTML={{ __html: r }} />)}
      </div>

      {/* 위로 + 희망 — 버팀목 */}
      <div className="emocore">
        <div className="emk">士</div>
        <p className="emlast" style={{ marginTop: 0 }}>{p.console}</p>
      </div>

      {/* 이 리포트가 드리는 것 */}
      <div className="lab"><i /><span>그래서, 이 리포트가 드리는 것</span></div>
      <div className="diff">
        {p.gives.map(([t, d], i) => <div key={i} className="drow"><b>{t}</b><span>{d}</span></div>)}
      </div>

      {/* CTA — 가격 노출 없음 · 무료 진입 */}
      <div style={{ padding: '16px 24px 0' }}>
        <Link className="fullcta" href={`/reading${PAIN_CAT[p.slug] ? `?cat=${PAIN_CAT[p.slug]}` : ''}`}>{p.cta} <small>생년월일만 · 30초 · 무료로 시작</small></Link>
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
