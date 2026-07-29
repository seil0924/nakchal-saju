import { describe, it, expect } from 'vitest';
import { CLIENTS, isCoreClient, clientTip, clientSlug, clientBySlug, josa } from './clients';

describe('clients helpers', () => {
  it('clientSlug strips parentheses and spaces', () => {
    expect(clientSlug('한국전력공사(KEPCO)')).toBe('한국전력공사');
    expect(clientSlug('한국수자원공사 (K-water)')).toBe('한국수자원공사');
  });
  it('clientBySlug round-trips a known client', () => {
    const c = clientBySlug(clientSlug('조달청'));
    expect(c?.name).toBe('조달청');
    expect(clientBySlug('없는기관슬러그')).toBeUndefined();
  });
  it('isCoreClient / clientTip reflect the DB', () => {
    expect(isCoreClient('조달청')).toBe(true);
    expect(isCoreClient('경기도')).toBe(false);
    expect(isCoreClient(null)).toBe(false);
    expect(typeof clientTip('조달청')).toBe('string');
    expect(clientTip(null)).toBeUndefined();
  });
  it('josa picks the right particle by 받침', () => {
    expect(josa('조달청', '은', '는')).toBe('은');   // 청 받침 O
    expect(josa('경기도', '은', '는')).toBe('는');   // 도 받침 X
    expect(josa('한국전력공사(KEPCO)', '과', '와')).toBe('와'); // 사 받침 X, 괄호 무시
  });
  it('every client has required fields', () => {
    for (const c of CLIENTS) {
      expect(c.name).toBeTruthy();
      expect(/^\d{4}-\d{2}-\d{2}$/.test(c.date)).toBe(true);
      expect(c.cat).toBeTruthy();
    }
  });
});
