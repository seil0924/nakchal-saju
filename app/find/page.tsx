// /find — 산 리포트 찾기. 회원가입 없이, 결제 때 넣은 성함·휴대폰 번호로 찾는다(2026-10-23).
import type { Metadata } from 'next';
import SiteTop from '@/app/_components/SiteTop';
import FindClient from './FindClient';

export const metadata: Metadata = {
  title: '산 리포트 찾기',
  description: '결제할 때 넣은 성함과 휴대폰 번호로, 다른 기기에서도 산 리포트와 발주처 프리미엄 패스를 다시 엽니다. 회원가입이나 로그인 없이 됩니다.',
  alternates: { canonical: '/find' },
  robots: { index: false, follow: true },
};

export default function FindPage() {
  return (
    <div className="app">
      <SiteTop />
      <div className="wrap">
        <h1 className="ct-h">산 리포트 찾기</h1>
        <p className="ct-lead">결제할 때 넣은 성함과 휴대폰 번호를 넣으면, 다른 기기에서도 산 리포트를 다시 열 수 있습니다. 회원가입은 없습니다.</p>
        <FindClient />
      </div>
    </div>
  );
}
