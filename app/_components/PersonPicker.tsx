'use client';
import { useEffect, useState } from 'react';
import DateSelect from '@/app/_components/DateSelect';
import { peopleOf, savePerson, removePerson, migrateLegacy, KIND_LABEL, KIND_HANJA, KIND_DATELABEL, type Person, type PersonKind } from '@/lib/people';

// 재사용 사람/업체 선택 바텀시트 (사주아이식) — 낙찰사주 브랜드(먹빛·금박)
export default function PersonPicker({ open, kind, title, onPick, onClose }: {
  open: boolean; kind: PersonKind; title?: string;
  onPick: (p: Person) => void; onClose: () => void;
}) {
  const [list, setList] = useState<Person[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState<{ name: string; date: string; gender: 'M' | 'F'; cal: 'solar' | 'lunar'; leap: boolean; time: string; timeMode: 'Y' | 'grid' | 'N' }>(
    { name: '', date: '', gender: 'M', cal: 'solar', leap: false, time: '09:20', timeMode: 'N' });

  const refresh = () => { migrateLegacy(); setList(peopleOf(kind)); };
  useEffect(() => { if (open) { refresh(); setAdding(false); } }, [open, kind]);
  if (!open) return null;

  const isSelf = kind === 'self';
  const heading = title || `${KIND_LABEL[kind]} 선택`;
  const dateLabel = KIND_DATELABEL[kind];

  const commitNew = () => {
    if (!f.date) return;
    const rec = savePerson({ kind, name: f.name, date: f.date, gender: isSelf ? f.gender : undefined,
      cal: f.cal, leap: f.leap, time: isSelf && f.timeMode !== 'N' ? f.time : null, timeMode: isSelf ? f.timeMode : undefined });
    onPick(rec); onClose();
  };
  const del = (e: React.MouseEvent, id: string) => { e.stopPropagation(); removePerson(id); refresh(); };

  return (
    <div className="pp-ov" onClick={e => { if ((e.target as HTMLElement).classList.contains('pp-ov')) onClose(); }}>
      <div className="pp-sheet">
        <div className="pp-hd"><span className="pp-seal">{KIND_HANJA[kind]}</span><b>{heading}</b><button className="pp-x" onClick={onClose} aria-label="닫기">✕</button></div>

        {!adding ? (
          <div className="pp-body">
            <button className="pp-add" onClick={() => setAdding(true)}><span className="pp-plus">＋</span> 새로운 {isSelf ? '사람' : KIND_LABEL[kind]} 추가하기</button>
            {list.length === 0 ? (
              <div className="pp-empty">아직 저장된 {KIND_LABEL[kind]}이(가) 없습니다.<br />위에서 추가해 주세요.</div>
            ) : (
              <div className="pp-list">
                {list.map(p => (
                  <button key={p.id} className="pp-row" onClick={() => { onPick(p); onClose(); }}>
                    <span className="pp-nm">{p.name || KIND_LABEL[kind]}</span>
                    <span className="pp-tags">
                      <em>{KIND_LABEL[kind]}</em>
                      {p.gender && <em>{p.gender === 'M' ? '남성' : '여성'}</em>}
                      <em>{p.date}</em>
                    </span>
                    <span className="pp-del" onClick={e => del(e, p.id)} aria-label="삭제">✕</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="pp-body">
            <label className="pp-l">{isSelf ? '성함' : `${KIND_LABEL[kind]} 이름`} <span className="pp-opt">(선택)</span></label>
            <input className="pp-in" value={f.name} maxLength={20} placeholder={isSelf ? '예) 홍길동' : '예) 한국도로공사'} onChange={e => setF(s => ({ ...s, name: e.target.value }))} />
            <label className="pp-l">달력</label>
            <div className="pp-seg">
              <button className={f.cal === 'solar' ? 'on' : ''} onClick={() => setF(s => ({ ...s, cal: 'solar' }))}>양력</button>
              <button className={f.cal === 'lunar' ? 'on' : ''} onClick={() => setF(s => ({ ...s, cal: 'lunar' }))}>음력</button>
            </div>
            {f.cal === 'lunar' && (
              <div className="pp-seg" style={{ marginTop: 6 }}>
                <button className={!f.leap ? 'on' : ''} onClick={() => setF(s => ({ ...s, leap: false }))}>평달</button>
                <button className={f.leap ? 'on' : ''} onClick={() => setF(s => ({ ...s, leap: true }))}>윤달</button>
              </div>
            )}
            <label className="pp-l">{dateLabel}</label>
            <DateSelect value={f.date} onChange={v => setF(s => ({ ...s, date: v }))} yearFrom={1930} yearTo={2026} />
            {isSelf && (<>
              <label className="pp-l">성별</label>
              <div className="pp-seg">
                <button className={f.gender === 'M' ? 'on' : ''} onClick={() => setF(s => ({ ...s, gender: 'M' }))}>남</button>
                <button className={f.gender === 'F' ? 'on' : ''} onClick={() => setF(s => ({ ...s, gender: 'F' }))}>여</button>
              </div>
              <label className="pp-l">태어난 시간</label>
              <div className="pp-seg">
                <button className={f.timeMode === 'Y' ? 'on' : ''} onClick={() => setF(s => ({ ...s, timeMode: 'Y' }))}>안다</button>
                <button className={f.timeMode === 'N' ? 'on' : ''} onClick={() => setF(s => ({ ...s, timeMode: 'N' }))}>모름</button>
              </div>
              {f.timeMode === 'Y' && <input type="time" className="pp-in" value={f.time} onChange={e => setF(s => ({ ...s, time: e.target.value }))} style={{ marginTop: 8 }} />}
            </>)}
            <div className="pp-btns">
              <button onClick={() => setAdding(false)}>← 목록</button>
              <button className="pp-ok" onClick={commitNew} disabled={!f.date}>저장하고 선택 →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
