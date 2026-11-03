import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import './product.css';
import SiteTop from '@/app/_components/SiteTop';
import { PRODUCT_PAGES, productPageBySlug } from '@/lib/product-pages';
import { PRODUCT_GUIDES, productPrice, productPurchaseName } from '@/lib/product-guide';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';
import Preview from './Preview';

export function generateStaticParams() {
  return PRODUCT_PAGES.flatMap(p => [p.slug, ...(p.old || [])]).filter((s, i, a) => a.indexOf(s) === i).map(slug => ({ slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const p = productPageBySlug(decodeURIComponent(params.slug));
  if (!p) return { title: '낙찰사주' };
  return {
    title: `${CAT_INFO[p.key].name}: 내용·무료 범위·리포트 예시`,
    description: `${PRODUCT_GUIDES[p.key].purpose}. 준비할 정보와 무료·유료 범위, 풀이 예시를 먼저 확인하세요.`,
    alternates: { canonical: `/product/${p.slug}` },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const p = productPageBySlug(slug);
  if (!p) notFound();
  if (p.slug !== slug) permanentRedirect(`/product/${p.slug}`);
  const guide = PRODUCT_GUIDES[p.key];
  const name = CAT_INFO[p.key].name;
  const sampleHref = `/samples?product=${p.slug}#sample-report`;
  return <div className="app"><SiteTop /><main className="product-page">
    <nav className="product-breadcrumb" aria-label="상품 안내"><Link href="/more">전체 메뉴</Link><span aria-hidden="true">/</span><Link href="/samples">상품별 예시·비교</Link><span aria-hidden="true">/</span><span aria-current="page">{name}</span></nav>
    <header className="product-heading">
      <span className="product-kicker">이 상품에서 볼 수 있는 내용</span><h1>{name}</h1><p className="product-lead">{guide.purpose}</p>
      <div className="product-overview"><div><span>무료로 먼저</span><b>{guide.freeSummary}</b></div><div><span>선택 구매 · 부가세 포함</span><b>{productPurchaseName(p.key)} {won(productPrice(p.key))}</b><small>한 번 결제 · 자동 갱신 없음</small></div></div>
      <div className="product-actions"><Link className="product-primary" href={p.href}>{guide.startLabel} →</Link><Link className="product-secondary" href="#example">내용 예시 먼저 읽기 ↓</Link></div>
      <p className="product-caption">무료 내용을 보는 것만으로 결제되지 않습니다. 구매할 때 상품·대상·금액을 확인합니다.</p>
    </header>
    <nav className="product-jumps" aria-label="상품 내용 바로가기"><a href="#prepare">준비할 정보</a><a href="#example">내용 예시</a><a href="#scope">무료·유료 범위</a><a href="#purchase">구매·다시 보기</a></nav>
    <section className="product-section" id="prepare" aria-labelledby="prepare-title"><h2 id="prepare-title">시작 전에 이것만 준비하세요</h2><ul className="product-list">{guide.prepare.map(x => <li key={x}>{x}</li>)}</ul><p className="product-caption">화면에서 필요한 정보를 차례로 안내합니다. <Link href="/pricing#steps">처음 이용하는 방법 보기 →</Link></p></section>
    <section className="product-section" id="example" aria-labelledby="example-title"><h2 id="example-title">어떤 풀이인지 짧게 읽어보세요</h2><Preview k={p.key} /><Link className="product-text-link" href={sampleHref}>이 예시와 다른 상품 비교하기 →</Link></section>
    <section className="product-section" id="scope" aria-labelledby="scope-title"><h2 id="scope-title">무료와 유료, 여기서 나뉩니다</h2><div className="product-scope-grid"><article className="product-scope free"><span className="sample-label">결제 없이 확인</span><h3>무료로 보는 내용</h3><ul>{p.free.map(x => <li key={x}>{x}</li>)}</ul></article><article className="product-scope paid"><span className="sample-label">원할 때 구매</span><h3>구매하면 추가되는 내용</h3><ul>{p.paid.map(x => <li key={x}>{x}</li>)}</ul></article></div><p className="product-caption">{guide.scope}</p></section>
    <section className="product-section" id="purchase" aria-labelledby="purchase-title"><h2 id="purchase-title">구매 전에 확인해주세요</h2><div className="product-price"><div><b>{productPurchaseName(p.key)}</b><span>1회 결제 · 부가세 포함</span></div><strong>{won(productPrice(p.key))}</strong></div><ol className="product-list"><li>무료 결과를 읽고 추가로 열리는 내용을 확인합니다.</li><li>결제 화면에서 상품·대상과 구매자 정보를 확인합니다.</li><li>결제가 확인되면 구매한 내용을 읽고, 다음에는 보관함이나 구매 기록으로 다시 엽니다.</li></ol><div className="product-help-links"><Link href="/vault">내 리포트 보관함</Link><Link href="/find">구매한 리포트·패스 찾기</Link><Link href="/refund">환불 기준·요청 방법</Link></div><p className="product-caption">결제했는데 열리지 않으면 다시 결제하기 전에 <Link href="/find">구매 기록</Link>을 확인하거나 <Link href="/contact?topic=pay#write">문의</Link>해주세요.</p></section>
    <section className="product-section" aria-labelledby="questions-title"><h2 id="questions-title">이 상품에서 많이 묻는 질문</h2>{p.faq.map(([q, a]) => <details className="product-faq" key={q}><summary>{q}</summary><p>{a}</p></details>)}<Link className="product-text-link" href="/faq">입력·결제·환불 자주 묻는 질문 더 보기 →</Link></section>
    <section className="product-section product-ending"><h2>내 정보로 확인해볼까요?</h2><p>{guide.freeSummary}. 상세 풀이는 무료 내용을 읽은 뒤 선택하세요.</p><div className="product-actions"><Link className="product-primary" href={p.href}>{guide.startLabel} →</Link><Link className="product-secondary" href="/samples">다른 상품과 비교하기 →</Link></div></section>
    <p className="product-caption product-disclaimer">명리 기반 참고·오락용 정보입니다. 사정률·낙찰 확률이나 사업 성과를 예측·보장하지 않으며, 실제 입찰·계약·투자 판단의 근거를 대신하지 않습니다.</p>
  </main></div>;
}
