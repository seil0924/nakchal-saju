import Link from 'next/link';
import type { Metadata } from 'next';
import SiteTop from '@/app/_components/SiteTop';
import HelpNav from '@/app/_components/HelpNav';
import { BIZ } from '@/lib/bizinfo';
import { ogCard } from '@/lib/og';
import ContactMail from './ContactMail';
import { supportTopic, supportReport } from '@/lib/support';
import './support.css';

export const metadata: Metadata = {
  title: '문의하기·고객센터',
  description: '결제·환불, 리포트 내용, 화면 오류를 이메일로 문의하세요. 문의 유형별 준비 정보와 메일 앱이 열리지 않을 때의 방법을 안내합니다.',
  alternates: { canonical: '/contact' },
  openGraph: { url: 'https://nakchalsaju.com/contact', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard({ seal: '問', k: '問議 · 고객센터', t: '문의하기·고객센터', s: '낙찰사주 · 나인굿즈' }) },
};

export default function Contact({ searchParams }: { searchParams: { topic?: string; report?: string } }) {
  return <div className="app">
    <SiteTop />
    <main className="support-page">
      <HelpNav current="/contact" />
      <h1>어떤 도움이 필요하신가요?</h1>
      <p className="support-lead">결제·환불, 리포트 내용, 화면 오류를 이메일로 문의할 수 있습니다. 가입이나 로그인 없이 이용하세요.</p>
      <div className="support-quick"><Link href="/find"><b>구매했는데 리포트가 안 보여요 →</b><span>결제할 때 입력한 성함과 번호로 다시 찾기</span></Link><Link href="/refund"><b>환불 기준부터 확인할게요 →</b><span>상황별 기준과 환불 요청 방법 확인</span></Link></div>
      <ContactMail key={supportTopic(searchParams.topic) + supportReport(searchParams.report)} email={BIZ.email} initialTopic={supportTopic(searchParams.topic)} reportId={supportReport(searchParams.report)} />
      <p className="support-fine">{BIZ.company} · 대표 {BIZ.ceo} · 고객센터 {BIZ.email}</p>
    </main>
  </div>;
}
