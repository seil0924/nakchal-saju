import { describe, it, expect } from 'vitest';
import { validateReview, looksPromotional, averageRating, stars, BIZ, BODY_MIN, BODY_MAX, NICK_MAX } from '../reviews';

const good = { nickname: '대전 K대표', biz: '전기공사', rating: 5, body: '입찰 앞두고 날짜 고를 때 참고했습니다. 방향이 잡혀 좋았습니다.' };

describe('reviews: validateReview', () => {
  it('제대로 된 입력은 통과하고 값이 정리된다', () => {
    const r = validateReview({ ...good, nickname: '  대전   K대표 ' });
    expect(r.ok).toBe(true);
    expect(r.value?.nickname).toBe('대전 K대표');
    expect(r.value?.rating).toBe(5);
  });

  it('이름이 없거나 너무 길면 막는다', () => {
    expect(validateReview({ ...good, nickname: '   ' }).ok).toBe(false);
    expect(validateReview({ ...good, nickname: 'ㄱ'.repeat(NICK_MAX + 1) }).ok).toBe(false);
  });

  it('별점은 1~5 정수만 받는다 — 폼을 우회한 값이 들어온다', () => {
    for (const bad of [0, 6, 2.5, -1, NaN, '별점']) expect(validateReview({ ...good, rating: bad }).ok).toBe(false);
    for (const n of [1, 2, 3, 4, 5]) expect(validateReview({ ...good, rating: n }).ok).toBe(true);
  });

  it('본문 길이를 지킨다', () => {
    expect(validateReview({ ...good, body: '좋아요' }).ok).toBe(false);
    expect(validateReview({ ...good, body: '가'.repeat(BODY_MIN) }).ok).toBe(true);
    expect(validateReview({ ...good, body: '가'.repeat(BODY_MAX + 1) }).ok).toBe(false);
  });

  it('목록에 없는 업종은 버리고 통과시킨다 — 업종은 선택이라 반려할 이유가 없다', () => {
    const r = validateReview({ ...good, biz: '<script>' });
    expect(r.ok).toBe(true);
    expect(r.value?.biz).toBe('');
    expect(validateReview({ ...good, biz: BIZ[0] }).value?.biz).toBe(BIZ[0]);
  });

  it('실패하면 사람이 읽을 이유를 준다', () => {
    const r = validateReview({ ...good, body: '' });
    expect(r.ok).toBe(false);
    expect(r.value).toBeNull();
    expect(r.reason.length).toBeGreaterThan(5);
  });
});

describe('reviews: looksPromotional', () => {
  it('링크·연락처가 박힌 글을 표시한다', () => {
    for (const s of ['http://spam.kr 방문', 'www.spam.kr', '010-1234-5678 로 연락', '카톡 주세요', 'a@b.com'])
      expect(looksPromotional(s)).toBe(true);
  });
  it('멀쩡한 후기는 표시하지 않는다 — 자동 반려가 아니라 표시일 뿐이지만 오탐은 적을수록 좋다', () => {
    expect(looksPromotional(good.body)).toBe(false);
    expect(looksPromotional('투찰 3건 넣었는데 날짜 잡는 데 참고가 됐습니다.')).toBe(false);
  });
});

describe('reviews: averageRating · stars', () => {
  it('후기가 없으면 null — 0.0 은 "없다"가 아니라 "나쁘다"로 읽힌다', () => {
    expect(averageRating([])).toBeNull();
  });
  it('소수 첫째 자리로 반올림한다', () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }])).toBe(4.5);
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3);
  });
  it('별은 항상 다섯 칸이다', () => {
    for (const n of [0, 1, 3, 5, 9]) expect(stars(n)).toHaveLength(5);
    expect(stars(3)).toBe('★★★☆☆');
  });
});
