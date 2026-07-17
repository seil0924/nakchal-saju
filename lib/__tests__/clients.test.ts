import { describe, it, expect } from 'vitest';
import { isCoreClient, clientTip, CLIENTS } from '../clients';

describe('clients — 발주처 사전', () => {
  it('isCoreClient: 핵심 발주처만 true', () => {
    expect(isCoreClient('한국도로공사')).toBe(true); // core
    expect(isCoreClient('조달청')).toBe(true);
    expect(isCoreClient('서울특별시')).toBe(false); // 일반(core 아님)
    expect(isCoreClient('없는기관')).toBe(false);
    expect(isCoreClient(null)).toBe(false);
    expect(isCoreClient(undefined)).toBe(false);
  });
  it('clientTip: 등록 기관은 문자열, 미등록은 undefined', () => {
    expect(typeof clientTip('조달청')).toBe('string');
    expect(clientTip('없는기관')).toBeUndefined();
    expect(clientTip(null)).toBeUndefined();
  });
});

describe('CLIENTS 데이터 무결성', () => {
  it('모든 설립일은 YYYY-MM-DD, 이름 중복 없음', () => {
    const names = new Set<string>();
    for (const c of CLIENTS) {
      expect(c.name).toBeTruthy();
      expect(c.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.cat).toBeTruthy();
      expect(names.has(c.name)).toBe(false);
      names.add(c.name);
    }
  });
});
