import type { Metadata } from 'next';
import Link from 'next/link';
import { ogCard } from '@/lib/og';
import { FAQ_GROUPS, FAQ_MAIN } from '@/lib/faq';
import { FREE_START } from '@/lib/nav';
import SiteTop from '@/app/_components/SiteTop';
import HelpNav from '@/app/_components/HelpNav';
import '../contact/support.css';
import './help.css';

const BASE = 'https://nakchalsaju.com';
export const metadata: Metadata = {
  title: '자주 묻는 질문: 무료 시작·결제·리포트 다시 보기',
  description: '생년월일 입력, 무료·유료 범위, 결제, 구매한 리포트 다시 보기, 문의·환불까지 이용 중 궁금한 점을 순서대로 확인하세요.',
  alternates: { canonical: '/faq' },
  openGraph: { title: '자주 묻는 질문 | 낙찰사주', description: '처음 시작부터 구매한 리포트 다시 보기까지', url: `${BASE}/faq`, type: 'website', siteName: '낙찰사주', images: ogCard({ seal: '問', k: '이용 도움말', t: '자주 묻는 질문', s: '시작 · 입력 · 결제 · 다시 보기 · 문의' }) },
};

export default function FaqPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_MAIN.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: BASE },
      { '@type': 'ListItem', position: 2, name: '자주 묻는 질문', item: `${BASE}/faq` },
    ] },
  ];
  return <div className="app">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <SiteTop />
    <main className="support-page help-page" id="help-top">
      <HelpNav current="/faq" />
      <span className="help-eyebrow">처음 이용하는 분을 위한 도움말</span>
      <h1>자주 묻는 질문</h1>
      <p className="support-lead">궁금한 주제를 고른 뒤 질문을 눌러보세요. 답변 아래에서 필요한 화면으로 바로 이동할 수 있습니다.</p>
      <div className="support-quick">
        <Link href="/pricing#steps"><b>처음부터 순서대로 알고 싶어요 →</b><span>입력 → 무료 결과 → 선택 구매 → 다시 보기</span></Link>
        <Link href="/find"><b>구매했는데 리포트가 안 보여요 →</b><span>다시 결제하기 전에 구매 기록부터 확인</span></Link>
      </div>
      <nav className="help-jumps" aria-label="질문 주제 바로가기">{FAQ_GROUPS.map(g => <a href={'#' + g.id} key={g.id}>{g.title}</a>)}</nav>
      {FAQ_GROUPS.map((group, i) => <section className="support-card faq-group" id={group.id} key={group.id} aria-labelledby={group.id + '-title'}>
        <h2 id={group.id + '-title'}><span className="help-number">0{i + 1}</span>{group.title}</h2>
        <p className="support-caption">{group.intro}</p>
        {group.items.map((item, j) => <details key={item.id} id={'question-' + item.id} open={i === 0 && j === 0}>
          <summary>{item.q}</summary><p>{item.a}</p><Link className="faq-next" href={item.href}>{item.label} →</Link>
        </details>)}
        <a className="help-back" href="#help-top">주제 목록으로 ↑</a>
      </section>)}
      <section className="support-card help-ending"><h2>아직 궁금한 점이 남았나요?</h2><p>문의 유형을 고르면 필요한 정보를 안내해드립니다. 아는 내용만 적어 이메일로 보내주세요.</p><div className="support-actions"><Link href="/contact">문의하기 →</Link><Link href={FREE_START.href}>{FREE_START.label} →</Link></div></section>
    </main>
  </div>;
}
