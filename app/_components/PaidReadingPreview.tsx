'use client';
import { useId } from 'react';
import type { PaidPreview } from '@/lib/paid-preview';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';

export default function PaidReadingPreview({ preview, onOpen, busy = false }: {
  preview: PaidPreview; onOpen: () => void; busy?: boolean;
}) {
  const id = useId();
  const product = CAT_INFO[preview.cat];
  return <section id="paid-reading-preview" className="paid-reading-preview no-print" aria-labelledby={id}>
    <p className="prp-eyebrow">내 사주에서 이어지는 질문</p>
    <h2 id={id}>{preview.question}</h2>
    <p className="prp-reason">{preview.reason}</p>
    <div className="prp-excerpt">
      <span className="prp-label">내 유료 풀이 일부 · 무료 미리보기</span>
      <h3>{preview.excerptTitle}</h3>
      <blockquote>{preview.excerpt}</blockquote>
    </div>
    <h3 className="prp-next-title">이어서 확인할 내용</h3>
    <ul>{preview.next.map(item => <li key={item}>{item}</li>)}</ul>
    <button type="button" className="prp-open" onClick={onOpen} disabled={busy}>
      {preview.cat==='daepyo' ? '내 적용 방법과 전체 풀이 보기' : '30일 날짜와 시간대 전체 보기'} · {won(product.price)}
    </button>
    <p className="prp-scope">{product.name} 한 리포트 · 1회 결제 · 구매 내용을 확인한 뒤 결제합니다.</p>
    {preview.cat==='sajeong' && <p className="prp-scope">명리 기준 참고 시간대입니다. 실제 제출은 공고 마감 시각과 참가 조건을 우선합니다.</p>}
  </section>;
}
