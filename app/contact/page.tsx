// /contact — 이메일 문의(2026-10-23).
// 폼으로 받아 DB 에 쌓지 않는다. 손님 메일 앱으로 고객센터 주소·제목·양식을 채워 열어 줄 뿐이라
// 우리가 따로 보관하는 개인정보가 없다(처리방침에 새 항목이 생기지 않는다).
import Link from 'next/link';
import type { Metadata } from 'next';
import SiteTop from '@/app/_components/SiteTop';
import { BIZ } from '@/lib/bizinfo';
import { ogCard } from '@/lib/og';
import ContactMail from './ContactMail';

export const metadata: Metadata = {
  title: '이메일 문의',
  description: `결제·환불, 리포트 내용, 오류 신고, 제휴 문의는 이메일(${BIZ.email})로 받습니다. 문의 유형을 고르면 제목과 양식이 채워진 메일이 열립니다. 받은 순서대로 답장드립니다.`,
  alternates: { canonical: '/contact' },
  openGraph: {
    url: 'https://nakchalsaju.com/contact', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '問', k: '問議 · 고객센터', t: '이메일 문의', s: '낙찰사주 · 나인굿즈' }),
  },
};

export default function Contact() {
  return (
    <div className="app">
      <SiteTop />
      <div className="wrap">
        <h1 className="ct-h">이메일 문의</h1>
        <p className="ct-lead">문의 유형을 고르면 제목과 양식이 채워진 메일이 열립니다. 받은 순서대로 답장드립니다.</p>
        <ContactMail email={BIZ.email} />
        <div className="card ct-more">
          <p><b>환불은 이렇게 요청해 주세요</b><br />결제자 성함, 결제일시, 주문번호(또는 리포트 주소)를 함께 적어 주시면 바로 확인합니다. 기준은 <Link href="/refund">청약철회·환불 안내</Link>에 있습니다.</p>
          <p><b>산 리포트가 안 보이면</b><br />다른 기기에서는 <Link href="/find">산 리포트 찾기</Link>에 결제 때 넣은 성함과 휴대폰 번호를 넣으면 다시 열립니다.</p>
          <p><b>자주 묻는 질문</b><br />결과를 다시 여는 법, 생년월일을 바꾸는 법은 <Link href="/faq">자주 묻는 질문</Link>에 먼저 정리해 두었습니다.</p>
          <p className="ct-biz">{BIZ.company} · 대표 {BIZ.ceo} · 고객센터 {BIZ.email}</p>
        </div>
      </div>
    </div>
  );
}
