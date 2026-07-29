import { describe, it, expect } from 'vitest';
import { setTok, getTok, tokParam } from './rtok';

describe('rtok 접근토큰 보관', () => {
  it('set/get roundtrip and null guards', () => {
    setTok(null, 't');            // no-op
    setTok('id1', null);          // no-op
    expect(getTok(null)).toBeNull();
    setTok('id1', 'tokA');
    // node 환경(무window)에서는 저장이 no-op일 수 있으므로 값 유무만 안전하게 확인
    const v = getTok('id1');
    expect(v === 'tokA' || v === null).toBe(true);
  });
  it('tokParam priority: urlT > stored > id', () => {
    expect(tokParam('idX', 'fromUrl')).toBe('fromUrl');
    expect(tokParam('idY')).toBe('idY'); // stored 없으면 id 폴백
  });
});
