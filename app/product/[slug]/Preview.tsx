import type { ProductGuideKey } from '@/lib/product-guide';
import { PRODUCT_GUIDES } from '@/lib/product-guide';

export default function Preview({ k }: { k: ProductGuideKey }) {
  const { sample } = PRODUCT_GUIDES[k];
  return <div className="product-excerpts">
    <p className="sample-notice"><b>설명용 가상 예시</b> · 실제 항목의 구성을 설명하기 위해 짧게 재작성했습니다. 실제 리포트 원문이나 전체 화면은 아니며, 이름·날짜·풀이가 내 결과를 뜻하지 않습니다.</p>
    <div className="sample-excerpt-grid">
      {(['free', 'paid'] as const).map(kind => <article className={'sample-excerpt ' + kind} key={kind}>
        <span className="sample-label">{kind === 'free' ? '무료로 보는 항목 예시' : '구매 후 보는 항목 예시'}</span>
        <h3>{sample[kind].title}</h3>
        {sample[kind].lines.map(line => <p key={line}>{line}</p>)}
        {kind === 'paid' && <small>이 예시는 결제 없이 읽을 수 있습니다.</small>}
      </article>)}
    </div>
  </div>;
}
