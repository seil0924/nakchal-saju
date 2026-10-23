'use client';
// 결제 창의 구매자 칸 — 성함·휴대폰 번호·개인정보 수집 동의(2026-10-23, 로그인 대신).
// 이 번호로 다른 기기에서 '구매한 리포트 찾기'를 하고, 발주처 패스도 이 번호에 붙는다.
// 인증 문자는 보내지 않는다(1건 결제 앞 인증은 카드사 심사에서 걸린다). 번호만 받는다.
import Link from 'next/link';

export type BuyerState = { name: string; phone: string; agree: boolean };

export default function BuyerFields({ v, set }: { v: BuyerState; set: (p: Partial<BuyerState>) => void }) {
  return (
    <div className="buyer">
      <div className="buyer-row">
        <label htmlFor="by-name">성함</label>
        <input id="by-name" value={v.name} onChange={e => set({ name: e.target.value })} maxLength={20} autoComplete="name" placeholder="홍길동" />
      </div>
      <div className="buyer-row">
        <label htmlFor="by-phone">휴대폰 번호</label>
        <input id="by-phone" value={v.phone} onChange={e => set({ phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" />
      </div>
      <p className="buyer-why">다른 기기에서 <Link href="/find">구매한 리포트 찾기</Link>를 할 때 이 성함과 번호를 씁니다. 회원가입은 없고 문자도 보내지 않습니다.</p>
      <label className="consent">
        <input type="checkbox" checked={v.agree} onChange={e => set({ agree: e.target.checked })} />
        <span>개인정보 수집·이용에 동의합니다. 항목: 성함, 휴대폰 번호 · 목적: 결제 확인, 구매한 리포트 찾기, 문의 응대 · 보관: 거래기록과 함께 5년(전자상거래법) 뒤 파기. <Link href="/privacy" className="legal-link">처리방침</Link></span>
      </label>
    </div>
  );
}
