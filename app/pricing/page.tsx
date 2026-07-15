import Link from 'next/link';
import { CAT_INFO } from '@/lib/report-categories';
import { PRICE_BALJU_PASS, won } from '@/lib/constants';
import { bizFooterLine } from '@/lib/bizinfo';

export const metadata = { title: '이용안내·요금 · 낙찰사주', description: '낙찰사주 상품 안내와 판매가, 청약철회·환불 정책, 사업자정보.' };

const PRODUCTS: [string, number, string][] = [
  ['대표 사주', CAT_INFO.daepyo.price, '대표님의 그릇·승부 기질·재물·사람·6대 축 경영 스코어카드·유형별 실전 수칙 등 대표 사주 심층 진단(디지털 콘텐츠 열람).'],
  ['사정률 사주', CAT_INFO.sajeong.price, '오늘의 투찰 택일 신호 + 이달 흐름 + 투찰 길일. 명식×일진 상성 기반 참고 지표.'],
  ['발주처 프리미엄 패스', PRICE_BALJU_PASS, '발주처 궁합 기본(점수·기관 특성)은 무료. 패스 1회 결제로 모든 발주처의 상세(3계·시나리오·주의신호·연도 세운) 무제한 열람.'],
  ['협정·궁합 사주', CAT_INFO.gunghap.price, '동업·협정 상대와의 궁합 — 지분·역할·결정권 배분 지침.'],
  ['회사 대운', CAT_INFO.daeun.price, '법인 설립일 기준 10년 대운 + 연도별 세운(歲運).'],
  ['사업운 캘린더 · 이달', CAT_INFO.calendar.price, '오늘부터 30일 — 계약·채용·발표에 좋은 날/조심할 날(달력·.ics 내보내기).'],
  ['사업운 캘린더 · 연간', CAT_INFO.calendar_year.price, '올 한 해 12개월 흐름 — 밀어주는 달·조여지는 달.'],
];

export default function Pricing() {
  return (
    <div className="app">
      <div className="hero"><div className="k">利 用 案 內</div><h1>이용안내 · 요금</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p></div>
      <div className="wrap">
        <div className="card">
          <div className="st"><span className="l"><span className="b" />판매 상품 · 가격</span></div>
          <p className="note" style={{ marginTop: 0 }}>모든 상품은 사주명리 기반의 <b>참고·오락용 디지털 콘텐츠</b>입니다. 오늘의 사정률·발주처 기본 등 무료 항목으로 먼저 체험하실 수 있습니다.</p>
          <div className="pricelist">
            {PRODUCTS.map(([n, p, d]) => (
              <div key={n} className="pricerow">
                <div className="prn"><b>{n}</b><span>{d}</span></div>
                <div className="prp">{won(p)}</div>
              </div>
            ))}
          </div>
          <p className="note">※ 표시가는 부가세 포함 최종 결제금액입니다. 결제수단: 신용·체크카드(NHN KCP).</p>
        </div>

        <div className="card">
          <div className="st"><span className="l"><span className="b" />취소 · 환불</span></div>
          <p style={{ fontSize: 13.5, lineHeight: 1.8, color: '#3a3f47' }}>
            유료 콘텐츠는 디지털 콘텐츠 특성상 <b>열람 전</b>에는 전액 환불, <b>열람 후</b>에는 청약철회가 제한될 수 있습니다(전자상거래법 제17조). 자세한 내용은 <Link href="/refund" style={{ color: 'var(--navy)', fontWeight: 700 }}>청약철회·환불 안내</Link>와 <Link href="/terms" style={{ color: 'var(--navy)', fontWeight: 700 }}>이용약관</Link>을 확인해 주세요.
          </p>
        </div>

        <div className="card">
          <div className="st"><span className="l"><span className="b" />사업자 정보</span></div>
          <p style={{ fontSize: 13, lineHeight: 1.9, color: '#4a4636' }}>{bizFooterLine()}</p>
          <p className="note">홈페이지 제작: 자체제작(독립몰)</p>
          <p style={{ marginTop: 10, color: '#a5241f', fontSize: 12, fontWeight: 600 }}>※ 배포용 초안 — 시행 전 사업자 정보 기입 필요.</p>
        </div>
      </div>
    </div>
  );
}
