import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PAINS, painBySlug, PAIN_CAT, ALONE } from '@/lib/pains';
import { PAIN_OH, OHAENG } from '@/lib/categories';
import SiteTop from '@/app/_components/SiteTop';

export function generateStaticParams() {
  return PAINS.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = painBySlug(params.slug);
  if (!p) return { title: '낙찰사주' };
  // 제목은 대표님이 검색창에 치는 말 그대로(q). 옛 제목은 '대표님 잘못이 아닙니다' 대조 문형이었다(2026-10-28).
  // 레이아웃 템플릿이 ' · 낙찰사주'를 뒤에 붙인다. 여기서 또 붙이면 제목에 두 번 나온다.
  // lead 는 30~40자라 검색 설명으로 짧다. desc(110~150자)를 쓴다.
  return { title: `${p.q}, 대표 사주로 다시 보기`, description: p.desc, alternates: { canonical: `/why/${p.slug}` } };
}

export default function WhyPage({ params }: { params: { slug: string } }) {
  const p = painBySlug(params.slug);
  if (!p) notFound();
  const acc = OHAENG[PAIN_OH[p.slug] ?? 'su'].acc;

  return (
    <div className="app home5 catpage" style={{ ['--acc' as any]: acc }}>
      <SiteTop />

      {/* 통점 히어로 (상징 영상) */}
      <div className="hero5">
        <video className="herovid" autoPlay muted loop playsInline>
          <source src={`/why-${p.slug}.mp4`} type="video/mp4" />
        </video>
        <div className="wm">{p.mk}</div>
        <h1>{p.q}</h1>
        <div className="rule" />
        <div className="sub">{p.lead}</div>
      </div>

      {/* 대표가 겪는 장면 */}
      <div className="lab"><i /><span>대표님 속마음</span></div>
      <div className="painbox">
        {p.dig.map((d, i) => <div key={i} className="pain"><span className="pk">·</span>{d}</div>)}
      </div>

      {/* 말할 곳 없는 세 자리 → 그래서 혼자 정한다. 홈과 같은 흐름(2026-10-28). */}
      <div className="painbox alone">
        {ALONE.map((d, i) => <div key={i} className="pain"><span className="pk">·</span>{d}</div>)}
        <div className="pain turn">그래서 결국 대표님 혼자 정합니다.</div>
      </div>

      {/* 명리로 다시 보기 */}
      <div className="lab"><i /><span>명리로 다시 보면</span></div>
      <div className="auth">
        {p.reframe.map((r, i) => <p key={i} className="authlead" style={{ marginBottom: i === p.reframe.length - 1 ? 0 : 12 }} dangerouslySetInnerHTML={{ __html: r }} />)}
      </div>

      {/* 위로 + 희망: 버팀목 */}
      <div className="emocore">
        <div className="emk">士</div>
        <p className="emlast" style={{ marginTop: 0 }}>{p.console}</p>
      </div>

      {/* 이 리포트가 드리는 것 */}
      <div className="lab"><i /><span>그래서, 이 리포트가 드리는 것</span></div>
      <div className="diff">
        {p.gives.map(([t, d], i) => <div key={i} className="drow"><b>{t}</b><span>{d}</span></div>)}
      </div>

      {/* CTA · 가격 노출 없음 · 무료 진입 */}
      <div style={{ padding: '16px 24px 0' }}>
        <Link className="fullcta" href={`/reading${PAIN_CAT[p.slug] ? `?cat=${PAIN_CAT[p.slug]}` : ''}`}>{p.cta} <small>성함·생년월일만 · 30초 · 무료로 시작</small></Link>
        <p className="whyalt">생년월일 없이 먼저 보려면 <Link href="/today">일간별 오늘의 투찰 운세</Link>나 <Link href="/saeobunse/2027">2027년 일간별 사업운</Link>을 보세요.</p>
        <p className="whypromise">낙찰을 약속하지 않습니다. 정하는 건 대표님입니다.</p>
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
