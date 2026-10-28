import Link from 'next/link';
import { PAINS } from '@/lib/pains';
import SiteTop from '@/app/_components/SiteTop';

export const metadata = {
  title: '대표님 잘못이 아닙니다',
  description: '하한가에서 미끄러질 때, 연패가 이어질 때, 동업이 삐걱일 때. 입찰 대표가 자주 겪는 17가지 고민을 명식으로 어떻게 짚는지, 무료로 먼저 볼 수 있는 것과 함께 정리했습니다.',
  alternates: { canonical: '/why' },
};

export default function WhyHub() {
  return (
    <div className="app home5">
      <SiteTop />

      <div className="hero5">
        <div className="wm">運</div>
        <h1>입찰 대표가 자주 겪는 <b>고민 17가지</b>,<br />명식으로 짚어 봅니다</h1>
        <div className="rule" />
        <div className="sub">대표님을 오래 괴롭힌 그 고민: 어느 쪽에 가까운지 골라 보면 좋습니다.</div>
      </div>

      <div className="lab"><i /><span>어떤 고민이 가장 무거우신가요</span></div>
      <div className="list">
        {PAINS.map((p, i) => {
          const plain = p.q;
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
