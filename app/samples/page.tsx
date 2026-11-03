import type { Metadata } from 'next';
import Link from 'next/link';
import SiteTop from '@/app/_components/SiteTop';
import { PRODUCT_PAGES, productPageBySlug } from '@/lib/product-pages';
import { PRODUCT_GUIDES, productPrice, productPurchaseName } from '@/lib/product-guide';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';
import { ogCard } from '@/lib/og';
import Preview from '../product/[slug]/Preview';
import '../product/[slug]/product.css';

export const metadata: Metadata = {
  title: '리포트 예시·상품 비교: 어떤 풀이를 볼 수 있나요?',
  description: '8개 상품의 목적과 준비할 정보, 무료·유료 내용 예시를 비교하세요. 상품별 풀이를 읽고 원하는 무료 결과로 시작할 수 있습니다.',
  alternates: { canonical: '/samples' },
  openGraph: { title: '상품별 리포트 예시 | 낙찰사주', description: '무료·유료 내용 예시를 읽고 나에게 맞는 풀이 선택하기', type: 'website', siteName: '낙찰사주', images: ogCard({ seal: '例', k: '상품별 내용 예시', t: '어떤 풀이를 볼 수 있나요?', s: '목적 · 준비 정보 · 무료와 유료 비교' }) },
};

export default function SamplesPage({ searchParams }: { searchParams: { product?: string | string[] } }) {
  const p = productPageBySlug(typeof searchParams.product === 'string' ? searchParams.product : 'taekil') || productPageBySlug('taekil')!;
  const guide = PRODUCT_GUIDES[p.key];
  const choices = [...PRODUCT_PAGES].sort((a, b) => Number(b.key === 'sajeong') - Number(a.key === 'sajeong'));
  return <div className="app"><SiteTop /><main className="product-page sample-page" id="sample-top">
    <nav className="product-breadcrumb" aria-label="리포트 안내"><Link href="/more">전체 메뉴</Link><span aria-hidden="true">/</span><Link href="/pricing">이용안내·요금</Link><span aria-hidden="true">/</span><span aria-current="page">리포트 예시</span></nav>
    <header className="product-heading"><span className="product-kicker">상품별 리포트 예시</span><h1>어떤 풀이를 볼 수 있나요?</h1><p className="product-lead">궁금한 주제에 맞는 상품을 고르고, 무료 항목과 구매 후 항목의 예시를 읽어보세요.</p><p className="product-caption">이 페이지의 모든 예시는 결제·정보 입력 없이 볼 수 있습니다.</p></header>
    <section className="product-section" id="choose" aria-labelledby="choose-title"><h2 id="choose-title">1. 궁금한 내용에 맞춰 골라보세요</h2>
      <nav className="sample-choices" aria-label="예시를 볼 상품 선택">{choices.map(item => <Link key={item.key} href={`/samples?product=${item.slug}#sample-report`} aria-current={p.key === item.key ? 'true' : undefined}><span className="sample-choice-name">{CAT_INFO[item.key].name}{p.key === item.key && <small>선택됨</small>}</span><span>{PRODUCT_GUIDES[item.key].purpose}</span></Link>)}</nav>
      <details className="product-faq"><summary>투찰 택일·이달·연간 캘린더는 어떻게 다른가요?</summary><p><b>투찰 택일</b>은 오늘의 해석과 길일별 시간대를, <b>이달 캘린더</b>는 30일의 계약·채용·발표 등 용도별 날짜와 주차별 풀이를, <b>연간 캘린더</b>는 월별·분기별 큰 흐름을 살펴보는 상품입니다.</p></details>
    </section>
    <section className="product-section sample-report" id="sample-report" aria-labelledby="sample-report-title">
      <span className="product-kicker">2. 선택한 상품의 내용 예시</span><h2 id="sample-report-title">{CAT_INFO[p.key].name}</h2><p className="product-lead">{guide.purpose}</p>
      <Preview k={p.key} />
      <div className="sample-read-guide"><h3>이 예시는 이렇게 읽어주세요</h3><p>왼쪽 또는 위쪽은 무료로 확인할 수 있는 항목, 오른쪽 또는 아래쪽은 구매 후 열리는 항목을 설명합니다. 실제 결과는 입력 정보와 리포트 기준일에 따라 달라집니다.</p></div>
      <div className="product-scope-grid"><div><h3>무료로 먼저 보는 내용</h3><ul className="product-list">{p.free.map(x => <li key={x}>{x}</li>)}</ul></div><div><h3>구매 후 추가되는 내용</h3><ul className="product-list">{p.paid.map(x => <li key={x}>{x}</li>)}</ul></div></div>
      <p className="product-caption">{guide.scope}</p>
      <div className="sample-prepare"><h3>내 결과를 보려면 준비할 정보</h3><ul className="product-list">{guide.prepare.map(x => <li key={x}>{x}</li>)}</ul></div>
      <div className="product-price"><div><b>선택 구매 · {productPurchaseName(p.key)}</b><span>1회 결제 · 부가세 포함 · 자동 갱신 없음</span></div><strong>{won(productPrice(p.key))}</strong></div>
      <div className="product-actions"><Link className="product-primary" href={p.href}>{guide.startLabel} →</Link><Link className="product-secondary" href={`/product/${p.slug}`}>상품 소개 자세히 보기 →</Link></div>
      <a className="product-text-link" href="#choose">다른 상품 예시 고르기 ↑</a>
    </section>
    <section className="product-section product-ending"><h2>아직 고르기 어렵다면</h2><p>개인 정보 입력 없이 전체 이용 순서를 살펴보거나, 질문별 도움말을 확인할 수 있습니다.</p><div className="product-help-links"><Link href="/pricing#steps">처음 이용하는 방법</Link><Link href="/faq">자주 묻는 질문</Link><Link href="/contact?topic=report#write">풀이 내용 문의</Link></div></section>
    <p className="product-caption product-disclaimer">명리 기반 참고·오락용 정보입니다. 예시의 점수·날짜·해석은 실제 사정률, 낙찰 확률 또는 사업 성과를 예측·보장하지 않습니다.</p>
  </main></div>;
}
