// lib/people.ts — 통합 사람/업체 저장소 (사주아이식 선택 풀)
// 본인(대표)·법인·발주처·동업·협정 상대를 한 풀에 저장하고, 어디서든 골라 쓴다.
'use client';
export type PersonKind = 'self' | 'legal' | 'client' | 'partner' | 'ally';
export type Person = {
  id: string;
  kind: PersonKind;
  name: string;
  date: string;                 // YYYY-MM-DD (생년월일/설립일)
  gender?: 'M' | 'F';
  cal?: 'solar' | 'lunar';
  leap?: boolean;
  time?: string | null;         // HH:MM (self만)
  timeMode?: 'Y' | 'grid' | 'N';
};

export const KIND_LABEL: Record<PersonKind, string> = {
  self: '대표 · 본인', legal: '법인', client: '발주처', partner: '동업 상대', ally: '협정 상대',
};
export const KIND_HANJA: Record<PersonKind, string> = {
  self: '代', legal: '法', client: '宮', partner: '同', ally: '協',
};
export const KIND_DATELABEL: Record<PersonKind, string> = {
  self: '생년월일', legal: '설립일', client: '설립일', partner: '생년월일', ally: '설립일',
};

const KEY = 'nakchal_people_v1';
const newId = () => 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function loadPeople(): Person[] {
  if (typeof window === 'undefined') return [];
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
export function peopleOf(kind: PersonKind): Person[] { return loadPeople().filter(p => p.kind === kind); }
export function savePerson(p: Partial<Person> & { kind: PersonKind; date: string }): Person {
  const rec: Person = { id: p.id || newId(), kind: p.kind, name: (p.name || '').trim(), date: p.date,
    gender: p.gender, cal: p.cal || 'solar', leap: !!p.leap, time: p.time ?? null, timeMode: p.timeMode };
  const arr = loadPeople().filter(x => !(x.kind === rec.kind && x.date === rec.date && x.name === rec.name) && x.id !== rec.id);
  arr.unshift(rec);
  try { localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 60))); } catch {}
  return rec;
}
export function removePerson(id: string) {
  const arr = loadPeople().filter(x => x.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch {}
}

// 기존 분산 저장(nakchal_self_v1 / _legal_v1 / _saved_targets_v1)을 1회 이관
export function migrateLegacy() {
  if (typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(KEY)) return; // 이미 통합됨
    const out: Person[] = [];
    const self = JSON.parse(localStorage.getItem('nakchal_self_v1') || '[]');
    for (const s of self) if (s?.birth) out.push({ id: newId(), kind: 'self', name: s.name || '', date: s.birth, gender: s.gender, cal: s.cal || 'solar', leap: !!s.leap, time: s.time ?? null, timeMode: s.timeMode });
    const legal = JSON.parse(localStorage.getItem('nakchal_legal_v1') || '[]');
    for (const l of legal) if (l?.legal) out.push({ id: newId(), kind: 'legal', name: l.company || '', date: l.legal, cal: 'solar' });
    const tg = JSON.parse(localStorage.getItem('nakchal_saved_targets_v1') || '[]');
    for (const t of tg) if (t?.date && ['client', 'partner', 'ally'].includes(t.kind)) out.push({ id: newId(), kind: t.kind, name: t.name || '', date: t.date, cal: 'solar' });
    if (out.length) localStorage.setItem(KEY, JSON.stringify(out.slice(0, 60)));
  } catch {}
}
