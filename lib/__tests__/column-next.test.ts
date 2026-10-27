import { describe, it, expect } from 'vitest';
import { nextSteps } from '../column-next';

// 칼럼 끝 '다음에 볼 것'. 주제에 맞는 무료 입구로 보내는지(2026-10-27).
const first = (title: string, tags: string[] = ['낙찰사주']) => nextSteps(title, tags)[0].href;

describe('칼럼 다음 단계', () => {
  it('입찰 실무 글은 오늘의 투찰 택일로', () => {
    expect(first('사정률이란 무엇인가: 기초금액과 예정가격의 관계 읽는 법')).toBe('/reading?cat=sajeong');
    expect(first('적격심사 완전정리: 점수 구조·경영상태·부채비율·신용등급·신인도, 그리고 종심제')).toBe('/reading?cat=sajeong');
    expect(first('하자보수보증금과 하자담보책임기간: 공종별 비율과 기간, 돌려받는 시점')).toBe('/reading?cat=sajeong');
  });
  it("모든 글에 붙은 '낙찰사주' 태그 때문에 사주 글이 입찰 글로 가지 않는다", () => {
    expect(first('이병철 사주 · 명식 풀이, 재성이 하나도 없는 戊申 일주')).toBe('/reading?cat=daepyo');
    expect(first('확장하자니 무섭고 안 하자니 뒤처질까: 신사업 앞에 선 대표')).toBe('/reading?cat=daepyo');
  });
  it('주제별 입구', () => {
    expect(first('공동수급협정서 작성방법: 공동도급에서 놓치면 안 되는 항목')).toBe('/reading?cat=gunghap');
    expect(first('공동대표 · 각자대표 회사의 사주, 누구 사주로 보나')).toBe('/reading?cat=gunghap');
    expect(first('발주처 궁합 보는 법: 유독 일 꼬이는 거래처, 상성(相性)의 문제')).toBe('/balju');
    expect(first('사무실 이전 택일과 방위(方位): 이사 날, 이렇게 고릅니다')).toBe('/jari');
    expect(first('계약서 도장 찍는 날 고르기: 낙찰 뒤 10일 안에서 계약일 택일')).toBe(`/taekil/${encodeURIComponent('계약일')}`);
    expect(first('회사 사주는 무엇으로 보나 · 법인 설립등기일, 사업자등록일, 개업일 중 어느 날')).toBe('/reading?cat=daeun');
    expect(first('2027년 병화(丙火) 일간 대표의 사업운, 경쟁자와 판을 나누는 해', ['낙찰사주', '동업'])).toBe('/reading?cat=daepyo');
  });
  it('두 길은 서로 다른 곳이다', () => {
    for (const t of ['사정률이란', '발주처 궁합', '동업', '이병철 사주', '사무실 이전']) {
      const [a, b] = nextSteps(t, ['낙찰사주']);
      expect(a.href).not.toBe(b.href);
    }
  });
});
