'use client';
import type { Focus } from '@/lib/reading-focus';
export default function ReadingFocus({ focus, onRead }: { focus?: Focus | null; onRead: () => void }) {
  if (!focus) return null;
  return <section className="reading-focus no-print" aria-label="처음 궁금했던 질문">
    <p>처음 궁금했던 질문</p><h2>{focus.question}</h2>
    {focus.open ? <><p>이 질문과 연결된 풀이를 먼저 펼쳤습니다.</p><button type="button" onClick={onRead}>내 질문에 연결된 풀이 읽기 ↓</button></>
      : <p>무료 내용을 먼저 확인하세요. 이 상품을 구매하면 질문과 연결된 풀이부터 펼쳐집니다.</p>}
  </section>;
}
