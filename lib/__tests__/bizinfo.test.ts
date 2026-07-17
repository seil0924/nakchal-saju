import { describe, it, expect } from 'vitest';
import { BIZ, bizFooterLine } from '../bizinfo';

describe('bizinfo — 사업자정보 푸터', () => {
  it('bizFooterLine 은 회사·대표·사업자번호를 포함', () => {
    const line = bizFooterLine();
    expect(line).toContain(BIZ.company);
    expect(line).toContain(BIZ.ceo);
    expect(line).toContain(BIZ.bizNo);
  });
});
