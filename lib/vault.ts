// lib/vault.ts — 보관함(내 리포트 기록) 클라이언트 저장
// 데모: 이 기기(localStorage). 로그인 연결 시 서버(/api/reports/mine)가 계정별로 대체.
'use client';
export type VaultItem = { id: string; label: string; when: number; unlocked: boolean };
const KEY = 'nakchal_vault_v1';

export function listVault(): VaultItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(list: VaultItem[]) { try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); } catch {} }

export function recordReport(item: VaultItem) {
  const list = listVault().filter(x => x.id !== item.id);
  save([item, ...list]);
}
export function markUnlocked(id: string) {
  save(listVault().map(x => x.id === id ? { ...x, unlocked: true } : x));
}
export function removeVault(id: string) {
  save(listVault().filter(x => x.id !== id));
}
