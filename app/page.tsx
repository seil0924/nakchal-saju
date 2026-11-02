import type { Metadata } from 'next';
import Link from 'next/link';
import './home6.css';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import LangNudge from '@/app/_components/LangNudge';
import ReviewStrip from '@/app/_components/ReviewStrip';
import TaekilAccess from '@/app/_components/TaekilAccess';
import { bizFooterLine } from '@/lib/bizinfo';
import { GAN, ZHI, EL_HEX, GAN_ELc, ZHI_ELc } from '@/lib/preview';
import BrandMark from '@/app/_components/BrandMark';
import { FREE_START, GROUPS } from '@/lib/nav';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'zh-Hant': '/zh/bazi', 'x-default': '/en/bazi' },
    types: { 'application/rss+xml': [{ url: '/rss.xml', title: '낙찰사주 칼럼' }] },
  },
};
// 공개 후기는 등록 즉시 갱신하며, 10분 주기로도 갱신한다.
export const revalidate = 600;
// 실제 명식(1971-07-16생)을 사용한 화면 예시. 오늘의 실시간 결과가 아니다.
const SAMPLE = [
  { pos: '년주', g: 7, z: 11 }, { pos: '월주', g: 1, z: 7 }, { pos: '일주', g: 8, z: 2 },
];

export default function Home() {
  return (
    <div className="app home6">
      <LangNudge />
      <header className="h6-top">
        <Link href="/" className="h6-brand" aria-label="낙찰사주 홈"><BrandMark size={40} /><span>낙찰사주</span></Link>
        <Link href="/more" className="h6-menu" aria-label="전체 메뉴">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </Link>
      </header>
      <section className="h6-intro" aria-labelledby="h6-title">
        <div className="h6-intro-copy">
          <p className="h6-eye">입찰·수주 대표를 위한 사주</p>
          <h1 id="h6-title">대표와 회사의 사주,<br />오늘의 흐름부터 확인하세요</h1>
          <p className="h6-lead">생년월일로 오늘의 명리 해석과 7일 흐름을 봅니다. 대표·회사 분석과 관계 궁합도 살펴볼 수 있습니다.</p>
          <Link className="h6-cta" href={FREE_START.href}>{FREE_START.label}<span aria-hidden="true">→</span></Link>
          <p className="h6-assure">회원가입 없이 시작 · 무료 결과를 본 뒤 구매 선택</p>
          <Link href="/samples" className="h6-textlink">리포트 예시 먼저 보기 →</Link>
        </div>
        <figure className="h6-sample" aria-label="결과 화면 예시">
          <figcaption><span className="h6-tag">결과 예시</span>1971년 7월 16일생 대표</figcaption>
          <div className="h6-smain">
            <div className="h6-pils" aria-label="명식 辛亥 乙未 壬寅">
              {SAMPLE.map(p => (
                <div key={p.pos} className={'h6-pil' + (p.pos === '일주' ? ' day' : '')}>
                  <span className="h6-pp">{p.pos}</span>
                  <b style={{ background: EL_HEX[GAN_ELc[p.g]] }}>{GAN[p.g]}</b>
                  <b style={{ background: EL_HEX[ZHI_ELc[p.z]] }}>{ZHI[p.z]}</b>
                </div>
              ))}
            </div>
            <div className="h6-sig"><span className="h6-sl">명리 해석 점수</span><span className="h6-sn">65<small>점</small></span><span className="h6-sv">기운을 돕는 흐름</span></div>
          </div>
          <p className="h6-snote">점수는 명리 해석의 참고 지표입니다.<br />사정률이나 낙찰 확률을 뜻하지 않습니다.</p>
          <p className="h6-scaption">화면 이해를 위한 예시이며, 내 결과는 입력 후 확인합니다.</p>
        </figure>
      </section>
      <section className="h6-sec h6-gray" aria-labelledby="h6-start">
        <p className="h6-eye">처음 이용하시나요?</p>
        <h2 id="h6-start" className="h6-h">이렇게 시작하면 됩니다</h2>
        <ol className="h6-steps">
          <li><span>1</span><div><b>생년월일 입력</b><p>태어난 시간을 모르면 ‘모름’을 골라주세요.</p></div></li>
          <li><span>2</span><div><b>무료 결과 확인</b><p>오늘의 해석과 오늘부터 7일 흐름을 봅니다.</p></div></li>
          <li><span>3</span><div><b>필요한 상세 풀이 선택</b><p>30일 전체가 궁금할 때 결제 후 열어보세요.</p></div></li>
        </ol>
        <TaekilAccess />
      </section>
      <section className="h6-sec" aria-labelledby="h6-purpose">
        <div className="h6-section-head"><h2 id="h6-purpose" className="h6-h">다른 내용이 궁금하다면</h2><Link href="/more">전체 메뉴 →</Link></div>
        <div className="h6-purposes">
          {GROUPS.filter(g => g.key !== 'light').map(g => (
            <section key={g.key} className="h6-purpose" aria-labelledby={'h6-' + g.key}>
              <span className="h6-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={g.items[0].d} /></svg></span>
              <h3 id={'h6-' + g.key}>{g.title}</h3><p>{g.sub}</p>
              <ul>{g.items.slice(0, 2).map(n => <li key={n.href}><Link href={n.href}>{n.label}<span aria-hidden="true">→</span></Link></li>)}</ul>
              <Link className="h6-group-more" href={'/more#' + g.key}>이 분야 전체 보기 →</Link>
            </section>
          ))}
        </div>
        <p className="h6-note">서비스마다 무료로 제공하는 범위가 다릅니다. 상세 내용과 요금은 각 서비스에서 안내합니다.</p>
      </section>
      <ReviewStrip />
      <section className="h6-sec h6-faq" aria-labelledby="h6-faq">
        <h2 id="h6-faq" className="h6-h">시작 전에 궁금한 점</h2>
        <details><summary>무료로 어디까지 볼 수 있나요?</summary><p>오늘의 투찰 택일은 기본 명식, 오늘의 해석과 시진, 오늘부터 7일 흐름, 30일 안의 길일 개수를 무료로 제공합니다. 나머지 23일과 길일별 시진은 구매를 선택하면 열립니다. <Link href="/pricing">이용안내·요금 보기</Link></p></details>
        <details><summary>태어난 시간을 몰라도 되나요?</summary><p>시간을 모르면 입력 화면에서 ‘모름’을 선택하세요. 확인할 수 있는 정보로 풀이하며, 시간에 따라 달라지는 해석에는 제한이 있습니다.</p></details>
        <details><summary>사정률이나 낙찰을 예측하나요?</summary><p>사정률이나 낙찰 확률을 예측하지 않습니다. 생년월일과 날짜를 명리 기준으로 해석하는 참고 정보이며, 투찰금액 산정 근거가 아닙니다. 실제 입찰은 공고와 마감 시간을 우선해 판단하세요. <Link href="/method">계산 방법 보기</Link></p></details>
        <div className="h6-help"><Link href="/faq">자주 묻는 질문 더 보기 →</Link><Link href="/contact">문의하기 →</Link></div>
      </section>
      <section className="h6-sec h6-close" aria-labelledby="h6-ready">
        <BrandMark size={60} /><h2 id="h6-ready" className="h6-h">내 생년월일로 확인해보세요</h2>
        <p>오늘의 해석과 7일 흐름은 무료입니다.</p>
        <Link className="h6-cta" href={FREE_START.href}>{FREE_START.label}<span aria-hidden="true">→</span></Link>
      </section>
      <section className="h6-sec h6-resources" aria-label="더 읽을거리">
        <details><summary>입찰 사주 가이드·용어사전</summary><nav className="h6-chips" aria-label="입찰 사주 가이드">
          {GUIDES.map(g => <Link key={g.slug} href={'/guide/' + g.slug}>{g.keywords[0]}</Link>)}
          {REGIONS.map(r => <Link key={r.slug} href={'/region/' + r.slug}>{r.name} 입찰</Link>)}
          {INDUSTRIES.map(x => <Link key={x.slug} href={'/industry/' + x.slug}>{x.name}</Link>)}
          <Link href="/glossary">용어사전</Link><Link href="/method">계산 방법</Link>
        </nav></details>
        <details><summary>사주 개념 알아보기</summary><nav className="h6-chips" aria-label="사주 개념">
          {CONCEPTS.map(c => <Link key={c.slug} href={'/saju/' + c.slug}>{c.label}</Link>)}
        </nav></details>
      </section>
      <footer className="h6-foot">
        <p>명리 기반 참고 정보입니다. 투찰금액 산정 근거가 아닙니다.</p>
        <p className="h6-flinks"><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">청약철회·환불</Link><Link href="/pricing">이용안내·요금</Link></p>
        <p className="h6-biz">{bizFooterLine()}</p>
      </footer>
    </div>
  );
}
