import Link from 'next/link';
import { PAINS } from '@/lib/pains';

export const metadata = {
  title: '대표님 잘못이 아닙니다 — 낙찰사주',
  description: '하한가·연패·큰 건·동업·관재수 — 대표님을 괴롭힌 그 일, 실력이 아니라 흐름의 문제일 수 있습니다.',
};

export default function WhyHub() {
  return (
    <div className="app home5">
      <div className="mast">
        <div className="mb">
          <Link href="/" className="s" style={{ textDecoration: 'none' }}>士</Link>
          <div className="n">낙찰사주<em>會社 사주 전문</em></div>
        </div>
        <Link href="/" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>홈 ›</Link>
      </div>

      <div className="hero5">
        <div className="wm">運</div>
        <div className="kick">運七技三</div>
        <h1>그 일, 대표님 <b>실력</b> 탓이<br />아닐 수 있습니다</h1>
        <div className="rule" />
        <div className="sub">대표님을 오래 괴롭힌 그 고민 — 어느 쪽에 가까운지 골라 보십시오.</div>
      </div>

      <div className="lab"><i /><span>어떤 고민이 가장 무거우신가요</span></div>
      <div className="list">
        {PAINS.map((p, i) => {
          const plain = p.title.replace(/\{\/?b\}/g, '').replace(/\n/g, ' ');
          return (
            <Link key={i} className="li5" href={`/why/${p.slug}`}>
              <div className="gz" style={{ color: '#9a2a20' }}>{p.mk}</div>
              <div className="bd5"><div className="t">{plain}</div><div className="d">{p.lead}</div></div>
              <div className="rt"><div className="arw">→</div></div>
            </Link>
          );
        })}
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
