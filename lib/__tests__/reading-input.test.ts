import { describe, expect, it } from 'vitest';
import { birthDateError, birthMonthDays, relatedSolarDate, updateBirthParts, validBirthTime } from '../reading-input';

describe('처음 입력하는 생년월일', () => {
  it('관계 대상의 음력 날짜를 계산용 양력으로 환산한다', () => {
    expect(relatedSolarDate('2020-01-01', 'lunar')).toBe('2020-01-25');
    expect(relatedSolarDate('2020-04-01', 'lunar', true)).toBe('2020-05-23');
    expect(relatedSolarDate('1896-08-04')).toBe('1896-08-04');
    expect(relatedSolarDate('2020-01-31', 'lunar')).toBe('');
  });
  it('윤년과 달별 마지막 날을 확인한다', () => {
    expect(birthMonthDays(1980, 2, 'solar')).toBe(29);
    expect(birthDateError('1981-02-29')).not.toBe('');
    expect(birthDateError('1980-02-29')).toBe('');
    expect(birthDateError('1980-04-31')).not.toBe('');
  });
  it('월을 바꾸면 이전 날짜를 잘못 제출하지 않는다', () => {
    const next = updateBirthParts({ y: 1980, m: 1, d: 31 }, { m: 2 }, 'solar');
    expect(next).toEqual({ parts: { y: 1980, m: 2, d: 0 }, birth: '', cleared: true });
    expect(updateBirthParts(next.parts, { d: 29 }, 'solar').birth).toBe('1980-02-29');
  });
  it('윤년을 평년으로 바꿔도 날짜 재선택이 필요하다', () => {
    expect(updateBirthParts({ y: 1980, m: 2, d: 29 }, { y: 1981 }, 'solar').birth).toBe('');
  });
  it('없는 음력 윤달과 음력 31일을 거절한다', () => {
    expect(birthDateError('1980-01-15', 'lunar', true)).toContain('윤달');
    expect(birthDateError('1980-01-31', 'lunar')).not.toBe('');
    expect(birthDateError('1980-01-15', 'lunar')).toBe('');
    expect(birthDateError('2020-04-01', 'lunar', true)).toBe('');
  });
  it('부분 입력과 잘못된 외부 입력을 거절한다', () => {
    for (const value of ['', '1980-02', '1980-00-10', '1899-12-31', null, 19800101]) expect(birthDateError(value)).not.toBe('');
  });
  it('시간을 안다고 선택했으면 실제 시간을 입력해야 한다', () => {
    for (const t of ['', '24:00', '12:60', '9:20', null]) expect(validBirthTime(t)).toBe(false);
    expect(validBirthTime('00:00')).toBe(true);
    expect(validBirthTime('23:59')).toBe(true);
  });
});
