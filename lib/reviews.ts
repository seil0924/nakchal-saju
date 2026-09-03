// lib/reviews.ts — 이용 후기.
//
// **지어내지 않는다.** 2026-08-21 결정("사회적 증명은 지어내지 않는다")이 여기에도 그대로 걸린다.
// 그래서 시드 데이터가 없고, 후기가 0건이면 0건이라고 말하는 화면이 나간다.
// 없는 것을 있는 척하는 순간 나머지 숫자까지 못 믿게 된다.
//
// 검증은 순수 함수로 떼어 두고(테스트 가능), 저장은 서버에서만 한다.

export const BIZ = [
  '건설·토목', '전기공사', '정보통신공사', '소방시설', '기계설비',
  '조경', '시설관리·용역', '물품·구매', '기타',
] as const;

export type ReviewInput = { nickname: string; biz: string; rating: number; body: string };
export type Review = ReviewInput & { id: number; created_at: string };

export const NICK_MAX = 20;
export const BODY_MIN = 15;
export const BODY_MAX = 600;

// 판별 유니온이 아니라 한 모양으로 돌려준다 — tsconfig 가 strict:false 라
// { ok:true } | { ok:false } 를 써도 좁혀지지 않아 호출부마다 캐스팅이 붙는다.
export type ReviewCheck = { ok: boolean; value: ReviewInput | null; reason: string };

const no = (reason: string): ReviewCheck => ({ ok: false, value: null, reason });

/**
 * 후기 입력 검증. 통과하면 정리된 값을, 아니면 사람이 읽을 이유를 돌려준다.
 * 공개 폼이라 길이·범위를 여기서 자르고, 저장 쪽에서는 이 함수만 믿는다.
 */
export function validateReview(raw: Partial<Record<keyof ReviewInput, unknown>>): ReviewCheck {
  const nickname = String(raw.nickname ?? '').trim().replace(/\s+/g, ' ');
  const bizRaw = String(raw.biz ?? '').trim();
  const body = String(raw.body ?? '').trim();
  const rating = Number(raw.rating);

  if (!nickname) return no('표시할 이름을 적어 주세요.');
  if (nickname.length > NICK_MAX) return no(`이름은 ${NICK_MAX}자까지입니다.`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return no('별점을 골라 주세요.');
  if (body.length < BODY_MIN) return no(`후기를 ${BODY_MIN}자 이상 적어 주세요.`);
  if (body.length > BODY_MAX) return no(`후기는 ${BODY_MAX}자까지입니다.`);

  // 업종은 선택이지만, 목록에 없는 값이 들어오면 버린다(폼을 우회한 입력).
  const biz = (BIZ as readonly string[]).includes(bizRaw) ? bizRaw : '';
  return { ok: true, value: { nickname, biz, rating, body }, reason: '' };
}

/** 링크·연락처가 박힌 글은 대개 광고다. 자동 반려가 아니라 관리자에게 표시만 한다. */
export function looksPromotional(body: string): boolean {
  const s = String(body || '');
  return /https?:\/\/|www\.|@[a-z0-9-]+\.|010[- ]?\d{3,4}[- ]?\d{4}|카톡|오픈채팅/i.test(s);
}

export const stars = (n: number) => '★'.repeat(Math.max(0, Math.min(5, n))) + '☆'.repeat(5 - Math.max(0, Math.min(5, n)));

/** 평균 별점. 후기가 없으면 null — 0.0 을 띄우면 "0점짜리 서비스"로 읽힌다. */
export function averageRating(list: { rating: number }[]): number | null {
  if (!list.length) return null;
  return Math.round((list.reduce((a, r) => a + r.rating, 0) / list.length) * 10) / 10;
}
