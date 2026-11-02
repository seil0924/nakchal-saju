import Link from 'next/link';
import { bizFooterLine } from '@/lib/bizinfo';
import { ogCard } from '@/lib/og';
import SiteTop from '@/app/_components/SiteTop';
import '../contact/support.css';

export const metadata = {
  title: '환불 안내·요청 방법',
  description: '유료 리포트의 열람 전·후 환불 기준, 제공 오류 시 안내, 환불 요청에 필요한 정보와 처리 순서를 확인하세요.',
  alternates: { canonical: '/refund' },
  openGraph: { url: 'https://nakchalsaju.com/refund', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard({ seal: '還', k: '請約撤回 · 還拂', t: '환불 안내 · 요청 방법', s: '낙찰사주 · 나인굿즈' }) },
};

export default function Refund() {
  return <div className="app"><SiteTop /><main className="support-page">
    <nav className="support-tabs" aria-label="고객센터 안내"><Link href="/contact">문의하기</Link><Link href="/refund" aria-current="page">환불 안내</Link><Link href="/faq">자주 묻는 질문</Link></nav>
    <h1>환불, 이렇게 요청해주세요</h1>
    <p className="support-lead">구매한 유료 내용을 보았는지, 정상적으로 제공되었는지에 따라 안내가 달라집니다. 상황을 잘 모르셔도 고객센터에 확인을 요청할 수 있습니다.</p>
    <div className="support-actions"><Link href="/contact?topic=refund#write">환불 요청 내용 작성하기 →</Link><a href="#refund-process">요청 후 처리 순서 보기</a></div>
    <section className="support-card" aria-labelledby="refund-cases-title">
      <h2 id="refund-cases-title">내 상황에 맞는 기준 확인</h2>
      <div className="refund-cases">
        <article className="refund-case"><span className="case-label">아직 유료 내용을 보지 않았어요</span><h3>미열람 리포트는 전액 환불 요청</h3><p>결제한 유료 리포트를 아직 열람하지 않았다면 고객센터에 결제 취소를 요청해주세요. 결제수단 취소 방식으로 처리합니다.</p></article>
        <article className="refund-case"><span className="case-label">이미 유료 내용을 봤어요</span><h3>열람 후에는 청약철회가 제한될 수 있습니다</h3><p>유료 리포트는 디지털 콘텐츠입니다. 제공·열람이 시작된 경우 단순 변심에 따른 취소가 제한될 수 있습니다. 결제 전에 무료 미리보기와 상품 범위를 확인해주세요.</p></article>
        <article className="refund-case"><span className="case-label">결제했지만 오류로 이용하지 못했어요</span><h3>열람 여부와 관계없이 확인을 요청하세요</h3><p>시스템 오류 등 회사의 귀책으로 정상 제공되지 않았거나 표시·광고와 현저히 다른 경우에는 관련 법령에 따라 환불해 드립니다. 다시 결제하지 말고 문제가 생긴 화면과 결제 내역을 알려주세요.</p></article>
      </div>
      <p className="support-caption">무료 결과를 본 것과 구매한 유료 내용을 본 것은 구분합니다. 열람 여부를 모르겠다면 문의에 ‘모름’이라고 적어주세요. 위 안내와 관계없이 법령에 따른 권리는 보장됩니다.</p>
      <Link href="/contact?topic=refund#write" className="ct-go">환불 요청 내용 작성하기 →</Link>
    </section>
    <section className="support-card" id="refund-process" aria-labelledby="refund-process-title">
      <h2 id="refund-process-title">요청부터 처리 확인까지</h2>
      <ol className="support-process">
        <li><b>결제 정보를 아는 만큼 적어주세요</b><span>결제자 성함, 결제일시·금액, 주문번호 또는 리포트 주소, 요청 사유를 준비하세요. 주문번호를 몰라도 문의할 수 있습니다.</span></li>
        <li><b>문의 내용을 이메일로 보내주세요</b><span>문의 화면에서 유형을 고르고 작성한 뒤, 메일 앱에서 직접 보내면 됩니다. 화면에서 작성만 하면 접수되지 않습니다.</span></li>
        <li><b>고객센터의 확인 답변을 받아보세요</b><span>결제·제공·열람 내역을 확인한 뒤 처리 안내를 보내신 이메일로 드립니다. 정보가 부족하면 추가 확인을 요청할 수 있습니다.</span></li>
        <li><b>결제수단의 취소 내역을 확인하세요</b><span>환불은 결제수단 취소 방식으로 처리합니다. 취소 처리와 카드사 내역 반영 시점은 다를 수 있으며, PG·카드사 사정에 따라 영업일 기준 수일이 걸릴 수 있습니다.</span></li>
      </ol>
    </section>
    <section className="support-card" aria-labelledby="refund-more-title"><h2 id="refund-more-title">이런 경우도 확인해주세요</h2>
      <details><summary>구매한 리포트가 안 보이면 바로 환불해야 하나요?</summary><p><Link href="/find">구매한 리포트 찾기</Link>에서 결제할 때 입력한 성함과 번호로 다시 열 수 있습니다. 찾은 뒤에도 열리지 않으면 <Link href="/contact?topic=pay#write">결제·열람 문제 문의</Link>로 알려주세요. 환불을 원하면 환불 요청으로 문의하시면 됩니다.</p></details>
      <details><summary>주문번호나 리포트 주소는 어디서 찾나요?</summary><p>리포트 주소는 <Link href="/vault">보관함</Link>에서 해당 리포트를 연 뒤 브라우저 주소창에서 복사할 수 있습니다. 결제일시·금액은 결제한 카드사나 간편결제 앱의 내역에서 확인해주세요. 찾기 어려운 항목은 비워두고 문의하세요.</p></details>
      <details><summary>복채도 같은 환불 기준인가요?</summary><p>복채는 풀이에 대한 자율적 감사·기원의 성격이며 리포트 열람과 무관합니다. 원칙적으로 환불 대상이 아니지만, 오결제 등이 있다면 <Link href="/contact?topic=refund#write">고객센터에 확인을 요청</Link>해주세요.</p></details>
      <p className="support-caption">청약철회란 구매 계약의 취소를 요청하는 것을 말합니다. 자세한 기준은 <Link href="/terms">이용약관 제6·7조</Link>와 <a href="https://www.law.go.kr/법령/전자상거래등에서의소비자보호에관한법률" target="_blank" rel="noopener noreferrer">전자상거래법 제17·18조</a>에서 확인할 수 있습니다.</p>
    </section>
    <p className="support-fine">{bizFooterLine()}</p>
  </main></div>;
}
