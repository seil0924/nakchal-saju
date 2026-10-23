'use client';
// 발주처 고르기 — 입력 화면 안에서 바로 고른다(2026-10-23).
// 예전엔 [고르기]가 /balju 로 보냈고, /balju 의 [내 자리 채우기]는 다시 입력 화면으로 보냈다.
// 넣은 정보를 버리고 두 화면을 맴돌았다(대표 지적). 이제 이 창에서 검색해 고르면 그 자리에 들어간다.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CLIENTS, type Client } from '@/lib/clients';

export default function ClientPicker({ open, onPick, onClose }: { open: boolean; onPick: (c: Client) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(''); setTimeout(() => box.current?.focus(), 50); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc);
  }, [open, onClose]);
  const list = useMemo(() => {
    const s = q.replace(/\s+/g, '');
    const hit = s ? CLIENTS.filter(c => (c.name + c.cat).replace(/\s+/g, '').includes(s)) : CLIENTS;
    return [...hit].sort((a, b) => Number(!!b.core) - Number(!!a.core));   // 핵심 발주처 먼저
  }, [q]);
  if (!open) return null;
  return (
    <div className="cp-back" role="presentation" onClick={onClose}>
      <div className="cp-sheet" role="dialog" aria-modal="true" aria-labelledby="cp-h" onClick={e => e.stopPropagation()}>
        <div className="cp-top">
          <b id="cp-h">발주처 고르기</b>
          <button type="button" className="cp-x" onClick={onClose}>닫기</button>
        </div>
        <input ref={box} className="cp-q" value={q} onChange={e => setQ(e.target.value)} placeholder="발주처 이름·분야로 검색 (예: 도로공사, 철도)" aria-label="발주처 검색" />
        <ul className="cp-list">
          {list.map(c => (
            <li key={c.name}>
              <button type="button" onClick={() => { onPick(c); onClose(); }}>
                <span className="cp-n">{c.name}{c.core && <em>핵심</em>}</span>
                <span className="cp-d">{c.date.slice(0, 4)} 설립 · {c.cat}</span>
              </button>
            </li>
          ))}
          {!list.length && <li className="cp-empty">찾는 발주처가 없습니다. 이름 일부만 넣어 보세요.</li>}
        </ul>
      </div>
    </div>
  );
}
