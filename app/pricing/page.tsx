import Link from 'next/link';
import { CAT_INFO } from '@/lib/report-categories';
import { PRICE_BALJU_PASS, won } from '@/lib/constants';
import { bizFooterLine } from '@/lib/bizinfo';
import { FREE_START } from '@/lib/nav';
import { ogCard } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';
import HelpNav from '@/app/_components/HelpNav';
import '../contact/support.css';
import '../faq/help.css';

export const metadata = {
  title: '이용안내·요금: 무료 시작부터 리포트 다시 보기까지',
  description: '성함·생년월일 입력, 무료 결과 확인, 선택 구매, 구매한 리포트 다시 보기까지 순서대로 안내합니다. 상품별 요금과 무료·유료 범위도 확인하세요.',
  alternates: { canonical: '/pricing' },
  openGraph: { url: 'https://nakchalsaju.com/pricing', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard({ seal: '案', k: '처음 이용 가이드', t: '이용안내 · 요금', s: '무료 시작부터 구매한 리포트 다시 보기까지' }) },
};

const PRODUCTS = [
  { name: '투찰 택일 사주', price: CAT_INFO.sajeong.price, href: '/product/taekil', desc: '무료 7일에 나머지 23일을 더한 30일 전체 명리 흐름, 길일 날짜와 길일별 시진(시간대).' },
  { name: '대표 사주', price: CAT_INFO.daepyo.price, href: '/product/daepyo', desc: '대표의 성향·재물·사람 관계와 6대 축 경영 스코어카드 등 상세 풀이.' },
  { name: '발주처 프리미엄 패스', price: PRICE_BALJU_PASS, href: '/balju', desc: '발주처 기본 점수·기관 특성은 무료. 패스를 구매하면 모든 발주처의 상세 풀이(삼계·시나리오·주의신호·연도별 흐름)를 열람할 수 있습니다.' },
  { name: '협정·궁합 사주', price: CAT_INFO.gunghap.price, href: '/product/gunghap', desc: '동업·협정 상대와의 성향, 지분·역할·결정권을 나눌 때 참고할 풀이.' },
  { name: '후보 날짜 비교', price: CAT_INFO.bigyo.price, href: '/taekil', desc: '택일 화면에서 고른 날짜 2~3개의 비교 순위와 근거, 날짜별 참고 시간대.' },
  { name: '자리 사주', price: CAT_INFO.ijeon.price, href: '/product/jari', desc: '사무실 이전 방위·거리, 문·책상 배치와 앞으로 석 달의 이사 날짜·시간대 풀이.' },
  { name: '회사 대운', price: CAT_INFO.daeun.price, href: '/product/daeun', desc: '회사 설립일로 보는 성향, 10년 단위의 큰 흐름과 연도별 풀이.' },
  { name: '사업운 캘린더 · 이달', price: CAT_INFO.calendar.price, href: '/product/calendar', desc: '오늘부터 30일간 계약·채용·발표 등 용도별로 참고할 날짜와 주차별 흐름.' },
  { name: '사업운 캘린더 · 연간', price: CAT_INFO.calendar_year.price, href: '/product/calendar-year', desc: '올해 12개월의 사업 흐름과 월별로 참고할 풀이.' },
];

export default function Pricing() {
  return <div className="app"><SiteTop /><main className="support-page help-page" id="help-top">
    <HelpNav current="/pricing" />
    <span className="help-eyebrow">처음 이용 가이드</span>
    <h1>무료로 시작하고,<br />필요한 풀이만 선택하세요</h1>
    <p className="support-lead">성함과 생년월일로 오늘의 흐름을 먼저 확인하세요. 회원가입 없이 이용하며, 상세 풀이는 내용을 살펴본 뒤 구매할 수 있습니다.</p>
    <Link className="guide-start" href={FREE_START.href}>{FREE_START.label} →</Link>
    <nav className="help-jumps" aria-label="이용안내 바로가기"><a href="#steps">이용 순서</a><a href="#free-paid">무료·유료 차이</a><a href="#prices">상품별 요금</a><a href="#reopen">구매 후 다시 보기</a><a href="#help">문의·환불</a></nav>

    <section className="support-card" id="steps" aria-labelledby="steps-title">
      <h2 id="steps-title">처음이라면 이 순서대로</h2>
      <p className="support-caption">‘오늘의 흐름 무료로 보기’를 기준으로 안내합니다.</p>
      <ol className="guide-steps">
        <li><h3>성함·생년월일 입력</h3><p>양력·음력을 먼저 고르고 날짜를 입력하세요. 태어난 시간을 모르면 추가하지 않고 진행할 수 있습니다. 회사·궁합 서비스는 추가 정보가 필요할 수 있습니다.</p></li>
        <li><h3>입력 확인 후 무료 결과 보기</h3><p>‘입력 내용 확인’에서 대상과 생일을 확인한 뒤 ‘무료 결과 확인하기’를 누르세요. 잘못 입력했다면 ‘입력 내용 수정’으로 돌아갈 수 있습니다.</p></li>
        <li><h3>더 보고 싶을 때만 구매</h3><p>무료 내용을 읽은 뒤 상품·대상·가격을 확인하세요. 구매자 성함과 휴대폰 번호를 입력하고 카드 결제를 완료하면 구매한 풀이가 열립니다.</p></li>
        <li><h3>다음에는 보관함에서 다시 보기</h3><p>같은 기기에서는 보관함을 확인하세요. 다른 기기이거나 기록이 안 보이면 결제할 때 입력한 구매자 정보로 다시 찾을 수 있습니다.</p></li>
      </ol>
      <p className="guide-note">휴대폰 번호는 구매한 리포트를 다시 찾는 데 쓰입니다. 사주 대상자와 구매자가 다르면, 결제할 때 입력한 <b>구매자의 성함과 번호</b>를 기억해주세요.</p>
    </section>

    <section className="support-card" id="free-paid" aria-labelledby="free-paid-title">
      <h2 id="free-paid-title">무료와 유료, 무엇이 다른가요?</h2>
      <p>오늘의 투찰 택일은 아래처럼 나뉩니다. 다른 상품의 무료 범위는 각 서비스 화면에서 안내합니다.</p>
      <div className="guide-compare">
        <article><span className="guide-label">결제 없이 확인</span><h3>무료 결과</h3><ul><li>기본 명식: 생년월일로 계산한 사주</li><li>오늘의 해석과 시진(시간대)</li><li>오늘부터 7일간의 흐름</li><li>30일 안의 길일 개수</li></ul></article>
        <article><span className="guide-label">원할 때 선택 · {won(CAT_INFO.sajeong.price)}</span><h3>구매하면 추가되는 내용</h3><ul><li>나머지 23일을 포함한 30일 전체 흐름</li><li>30일 안의 길일 날짜</li><li>길일별 참고 시진(시간대)</li></ul><p className="support-caption">1회 결제 · 부가세 포함</p></article>
      </div>
      <p className="support-caption">명리 기반 참고·오락용 정보입니다. 실제 사정률·낙찰 확률을 예측하거나 낙찰을 보장하지 않으며, 투찰금액 산정 근거로 사용할 수 없습니다.</p>
    </section>

    <section className="support-card" id="prices" aria-labelledby="prices-title">
      <h2 id="prices-title">상품별 요금과 구매 범위</h2>
      <p>모든 표시 금액은 <b>부가세 포함 최종 금액</b>입니다. 정기 구독이나 자동 갱신 없이 한 번 결제합니다.</p>
      <p className="support-caption">리포트는 구매 화면에 표시된 대상과 상품에 적용됩니다. 한 상품을 샀다고 다른 상품이나 새로 만든 리포트가 모두 열리지는 않습니다. 발주처 패스는 아래 안내 범위에 적용됩니다.</p>
      <dl className="guide-price-list">{PRODUCTS.map(p => <div className="guide-price-row" key={p.name}><dt>{p.name}</dt><dd className="guide-price">{won(p.price)}<span className="guide-price-meta">1회 결제</span></dd><dd className="guide-desc">{p.desc}<Link href={p.href}>{p.name === '후보 날짜 비교' ? '날짜 고르기' : '내용 살펴보기'} →</Link></dd></div>)}</dl>
      <p className="support-caption">결제수단: 신용·체크카드(NHN KCP). 결제 전 구매 화면에서 상품명·대상·최종 금액과 <Link href="/refund">환불 기준</Link>을 확인해주세요.</p>
      <Link href="/samples">리포트 예시 먼저 보기 →</Link>
    </section>

    <section className="support-card" id="reopen" aria-labelledby="reopen-title">
      <h2 id="reopen-title">구매한 리포트, 다시 결제하지 마세요</h2>
      <div className="support-quick"><Link href="/vault"><b>같은 기기에서 다시 보기 →</b><span>내 리포트 보관함에서 원하는 결과 열기</span></Link><Link href="/find"><b>다른 기기·기록이 없을 때 →</b><span>결제할 때 입력한 성함과 휴대폰 번호로 찾기</span></Link></div>
      <p>보관함은 기기와 브라우저에 따라 목록이 다를 수 있습니다. 구매 기록 찾기는 구매한 리포트와 패스를 다시 여는 기능이며, 다른 기기의 무료 결과를 옮기지는 않습니다.</p>
      <p className="guide-note">결제했는데 잠겨 있거나 결제 완료 여부가 불확실하면, <Link href="/find">구매 기록부터 확인</Link>해주세요. 해결되지 않으면 <Link href="/contact?topic=pay#write">결제·열람 문제 문의</Link>로 알려주세요.</p>
    </section>

    <section className="support-card help-ending" id="help" aria-labelledby="help-title">
      <h2 id="help-title">이용 중 막히면 여기서 확인하세요</h2>
      <p>입력 방법과 결제·열람 문제는 자주 묻는 질문에서 확인할 수 있습니다. 환불을 원하면 상황별 기준과 요청 순서를 먼저 살펴보세요.</p>
      <div className="guide-reopen-links"><Link href="/faq">자주 묻는 질문 →</Link><Link href="/refund">환불 안내·요청 방법 →</Link><Link href="/contact">문의하기 →</Link></div>
      <p className="support-caption">문의는 이메일로 받습니다. 문의 화면에서 내용만 작성하면 접수되지 않으며, 메일 앱에서 직접 보내야 합니다.</p>
    </section>
    <p className="support-fine">{bizFooterLine()}</p><p className="support-fine"><Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link></p>
  </main></div>;
}
