'use client';
// 연도별 세운(歲運) 선택 — 대표·회사·발주처 궁합을 그 해 기준으로 다시 본다.
export default function YearBar({ year, onChange, hanja, busy }: { year: number; onChange: (y: number) => void; hanja?: string; busy?: boolean }) {
  const now = new Date().getFullYear();
  const years: number[] = [];
  for (let y = now - 1; y <= now + 6; y++) years.push(y);
  return (
    <div className="yearbar">
      <div className="ybhd"><span className="ybk">歲 運</span><span className="ybt">이 풀이는 <b>{year}년{hanja ? ` (${hanja})` : ''}</b> 기준입니다 — 해마다 흐름이 바뀝니다</span></div>
      <div className="ybrow">
        {years.map(y => (
          <button key={y} className={'ybchip' + (y === year ? ' on' : '')} disabled={busy} onClick={() => y !== year && onChange(y)}>
            {y}{y === now ? <em>올해</em> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
