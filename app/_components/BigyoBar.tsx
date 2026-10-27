'use client';
// 후보 날짜 비교(較) 입력 막대. 택일 목록에서 고른 날과 직접 넣은 날을 모아 리딩으로 넘긴다.
// 목록은 모든 업체가 같이 보는 칸이고, 대표님 사주로 순위를 매기는 것은 리딩(유료) 쪽이다.
import { useState } from 'react';
import { BIGYO_MAX, BIGYO_MIN, BIGYO_LABEL, bigyoHref, parseCands, type BigyoPurpose } from '@/lib/bigyo-input';
import { CAT_INFO } from '@/lib/report-categories';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
export const shortYmd = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${m}/${d}(${DOW[new Date(y, m - 1, d).getDay()]})`;
};

// 고른 날짜 목록을 다루는 작은 규칙. 같은 날은 빼고, 셋을 넘으면 더 넣지 않는다.
export function toggleCand(sel: string[], ymd: string): string[] {
  if (sel.includes(ymd)) return sel.filter(x => x !== ymd);
  if (sel.length >= BIGYO_MAX) return sel;
  return parseCands([...sel, ymd]);
}

export default function BigyoBar({ purpose, sel, setSel }: { purpose: BigyoPurpose; sel: string[]; setSel: (v: string[]) => void }) {
  const [own, setOwn] = useState('');
  const full = sel.length >= BIGYO_MAX;
  const ready = sel.length >= BIGYO_MIN;
  return (
    <>
      <div className="bg-own" id="bigyo">
        <p className="bg-own-h">이미 생각해 둔 날이 있으면 직접 넣으세요</p>
        <p className="bg-own-s">발주처가 정한 날, 법무사가 잡아 준 날처럼 목록에 없는 날도 됩니다. 최대 {BIGYO_MAX}개까지 비교합니다.</p>
        <div className="bg-own-row">
          <input id="bigyo-own" type="date" value={own} onChange={e => setOwn(e.target.value)} aria-label="비교할 날짜" />
          <button type="button" disabled={!own || full} onClick={() => { if (own) { setSel(toggleCand(sel, own)); setOwn(''); } }}>넣기</button>
        </div>
      </div>
      {sel.length > 0 && (
        <div className="bg-bar" role="region" aria-label="고른 날짜">
          <div className="bg-chips">
            {sel.map(d => (
              <button key={d} type="button" className="bg-chip" onClick={() => setSel(sel.filter(x => x !== d))} aria-label={shortYmd(d) + ' 빼기'}>
                {shortYmd(d)} <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
          {ready ? (
            <a className="bg-go" href={bigyoHref(purpose, parseCands(sel))}>
              대표님 사주로 {sel.length}개 순위 보기<em>{BIGYO_LABEL[purpose]} · {CAT_INFO.bigyo.price.toLocaleString('ko-KR')}원 · 무료 칸 먼저</em>
            </a>
          ) : (
            <p className="bg-wait">하나 더 고르시면 비교할 수 있습니다</p>
          )}
        </div>
      )}
    </>
  );
}
