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
