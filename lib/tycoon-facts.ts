// lib/tycoon-facts.ts — 거장 상세 페이지에서 그 사람의 명식을 실제로 보여 주기 위한 것.
//
// "명식과 대조합니다"라고 써 놓고 정작 명식을 한 글자도 안 보여 주고 있었다.
// 검색으로 오는 질의가 "○○ 사주", "○○ 명식"인데 페이지가 그 약속을 안 지키면
// 사람은 뒤로 가기를 누른다. 계산은 lib/engine 하나로만 간다.
import 'server-only';
import { compute, pil, EL } from './engine';
import { TYCOONS, TYPE_NAME, TYPE_DESC, TYPE_MYEONG, type Tycoon } from './tycoon';

export type TycoonFacts = {
  pills: string;      // 일주(日柱) 두 글자
  el: number;         // 일간 오행 0~4
  elName: string;
  dist: number[];     // 오행 분포 — 삼주 기준
  type: string;       // 대표 유형
  desc: string;
  myeong: string;
};

export function tycoonFacts(t: Tycoon): TycoonFacts {
  const [y, m, d] = t.born.split('-').map(Number);
  // 생시 미상이라 시주(時柱)는 넣지 않는다. 모르는 것을 아는 척하면 그 순간부터 전부 못 믿는다.
  const c = compute(y, m, d, null);
  return {
    pills: pil(c.dGan, c.dZhi),
    el: c.dayMasterEl,
    elName: EL[c.dayMasterEl],
    dist: c.dist,
    type: TYPE_NAME[c.dayMasterEl],
    desc: TYPE_DESC[c.dayMasterEl],
    myeong: TYPE_MYEONG[c.dayMasterEl],
  };
}

export function tycoonFactsByName(name: string): TycoonFacts | null {
  const t = TYCOONS.find(x => x.name === name);
  return t ? tycoonFacts(t) : null;
}

