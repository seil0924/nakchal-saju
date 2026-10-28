import { describe, it, expect } from 'vitest';
import { isTestName, isTestEmail, isTestProfile } from './admin-test';

describe('운영·점검 계정 가려내기', () => {
  it('점검 이름', () => {
    expect(isTestName('점검용')).toBe(true);
    expect(isTestName('오세일')).toBe(true);
    expect(isTestName('테스트계정')).toBe(true);
    expect(isTestName('Test User')).toBe(true);
    expect(isTestName('김대영')).toBe(false);
    expect(isTestName('')).toBe(false);
  });
  it('점검 메일', () => {
    expect(isTestEmail('qa1@foo.com')).toBe(true);
    expect(isTestEmail('test.kim@gmail.com')).toBe(true);
    expect(isTestEmail('a@example.com')).toBe(true);
    expect(isTestEmail('kim@daeyoung.co.kr')).toBe(false);
    // 도메인에 낱말이 들어 있다고 손님을 빼면 안 된다
    expect(isTestEmail('kim@testbed-construct.co.kr')).toBe(false);
  });
  it('관리자 권한은 이름이 무엇이든 운영자', () => {
    expect(isTestProfile({ role: 'admin', name: '김대영', email: 'kim@x.co.kr' })).toBe(true);
    expect(isTestProfile({ role: 'user', name: '김대영', email: 'kim@x.co.kr' })).toBe(false);
  });
});

import { testIdsOf } from './admin-test';
describe('회원 목록에서 점검 계정 고르기', () => {
  it('관리자와 메일 앞머리가 같은 계정, 빈 계정', () => {
    const ids = testIdsOf([
      { id: 'a', role: 'admin', name: '운영', email: 'oh_kim24@naver.com' },
      { id: 'b', role: 'user', name: null, email: 'ohkim24@gmail.com' },
      { id: 'c', role: 'user', name: null, email: null },
      { id: 'd', role: 'user', name: '김대영', email: 'kim@x.co.kr' },
    ]);
    expect([...ids].sort()).toEqual(['a', 'b', 'c']);
  });
});

import { isNamelessSetupOrder } from './admin-test';
describe('성함 받기 전 이름 없는 주문', () => {
  it('10.24 전 이름 없는 주문만 점검으로', () => {
    expect(isNamelessSetupOrder({ created_at: '2026-07-21T03:00:00Z' }, false)).toBe(true);
    expect(isNamelessSetupOrder({ created_at: '2026-10-23T05:46:00Z' }, false)).toBe(true);
    expect(isNamelessSetupOrder({ created_at: '2026-10-22T08:48:00Z' }, true)).toBe(false);   // 태끄니처럼 이름이 있으면 손님
    expect(isNamelessSetupOrder({ created_at: '2026-10-24T14:02:00Z' }, false)).toBe(false);  // 그날부터는 규칙 밖
  });
});
