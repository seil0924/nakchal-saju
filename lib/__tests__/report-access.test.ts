import { describe, it, expect } from 'vitest';
import { canViewPaid } from '../report-access';

const base = { auth: true, userId: null, owner: null, token: null, t: null };

describe('canViewPaid — 리포트 다시 열기/결제 직후 같은 답', () => {
  it('토큰 칸이 없는 비회원 리포트는 비회원도 연다(첫 손님 중복 결제의 원인)', () => {
    expect(canViewPaid({ ...base })).toBe(true);
  });
  it('토큰 칸이 없는 회원 리포트는 주인만', () => {
    expect(canViewPaid({ ...base, owner: 'u1' })).toBe(false);
    expect(canViewPaid({ ...base, owner: 'u1', userId: 'u2' })).toBe(false);
    expect(canViewPaid({ ...base, owner: 'u1', userId: 'u1' })).toBe(true);
  });
  it('토큰이 있으면 주인이거나 토큰이 맞아야 한다', () => {
    expect(canViewPaid({ ...base, token: 'k' })).toBe(false);
    expect(canViewPaid({ ...base, token: 'k', t: 'x' })).toBe(false);
    expect(canViewPaid({ ...base, token: 'k', t: 'k' })).toBe(true);
    expect(canViewPaid({ ...base, token: 'k', owner: 'u1', userId: 'u1' })).toBe(true);
  });
  it('인증이 꺼진 데모는 다 연다', () => {
    expect(canViewPaid({ ...base, auth: false, owner: 'u1', token: 'k' })).toBe(true);
  });
});

describe('0007 백필 행(token = id)', () => {
  it('토큰 없는 리포트와 똑같이 다룬다 — 브라우저가 옛 랜덤 토큰을 들고 있어도 잠기지 않는다', () => {
    expect(canViewPaid({ ...base, token: 'r1', reportId: 'r1', t: 'old-random' })).toBe(true);
    expect(canViewPaid({ ...base, token: 'r1', reportId: 'r1', owner: 'u1', userId: 'u2' })).toBe(false);
  });
  it('새로 만든 행(진짜 토큰)은 그대로 따진다', () => {
    expect(canViewPaid({ ...base, token: 'k', reportId: 'r1', t: 'x' })).toBe(false);
  });
});
