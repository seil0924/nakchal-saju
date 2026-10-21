// lib/biz-check.ts — "사업을 해도 되는 사주일까요?" 맛보기(2026-10-21).
//
// 명리는 사업 사주를 된다/안 된다로 자르지 않는다. 돈을 다루는 기운(재성)과
// 그 돈을 버티는 힘(비겁·인성), 그리고 버는 방식(식상·관성)의 짜임으로 본다.
// 그래서 판정 대신 '어떤 식으로 버는 사주인가'를 보여 주고, 근거 숫자를 같이 적는다.
// 6대 축 점수는 결과 리포트(lib/report-copy scoreAxes)와 같은 계산이다.
import 'server-only';
import { sipsung, seunOf, type Chart } from './engine';
import { scoreAxes, TYPE4 } from './report-copy';
import { kstYmd } from './kst';

export type BizVerdict = { key: string; title: string; body: string };

const V: Record<string, [string, string]> = {
  big: ['재물을 감당할 힘도 있는 사주', '돈을 다루는 기운과 그것을 버티는 힘이 함께 두텁습니다. 판을 키울수록 그릇이 따라오는 쪽이라, 사업의 크기를 스스로 묶어 두지 않는 편이 낫습니다.'],
  heavy: ['기회는 많은데 그릇이 따라가야 하는 사주', '돈이 보이는 자리는 많은데 버티는 힘이 그보다 옅습니다. 명리에서 재다신약이라 부르는 짜임입니다. 건수를 늘리기보다 사람과 시스템을 먼저 세우면 들어오는 것을 놓치지 않습니다.'],
  maker: ['만들어서 버는 사주', '돈보다 표현하고 만들어 내는 기운이 앞섭니다. 기술·제품·영업으로 판을 먼저 열고, 재물은 그 뒤를 따라오는 쪽입니다.'],
  office: ['자리와 조직으로 버는 사주', '규율과 자리를 뜻하는 기운이 두텁습니다. 큰 조직이나 공공 일감처럼 기준이 분명한 판과 결이 맞고, 신용을 쌓을수록 커집니다.'],
  solo: ['혼자 끌고 가는 힘이 센 사주', '나와 같은 기운이 두터워 스스로 밀어붙이는 힘이 셉니다. 대신 동업·지분 문제에서 부딪히기 쉬우니 역할과 몫을 처음부터 문서로 나눠 두는 편이 낫습니다.'],
  even: ['고르게 섞인 사주', '어느 한쪽으로 크게 쏠리지 않았습니다. 무엇이든 할 수 있는 만큼, 어떤 판을 고르느냐가 성패를 가릅니다.'],
};

export function bizVerdict(c: Chart): BizVerdict & { jae: number; power: number; sik: number; gwan: number } {
  const s = sipsung(c);              // [비겁, 식상, 재성, 관성, 인성]
  const jae = s[2], power = s[0] + s[4], sik = s[1], gwan = s[3];
  const key =
    jae >= 2 && power >= 2 ? 'big'
    : jae >= 2 ? 'heavy'
    : jae === 0 && s[0] >= 3 ? 'solo'
    : sik >= 2 && sik >= gwan ? 'maker'
    : gwan >= 2 ? 'office'
    : 'even';
  return { key, title: V[key][0], body: V[key][1], jae, power, sik, gwan };
}

export function bizCheck(c: Chart) {
  const year = Number(kstYmd().slice(0, 4));
  const axes = scoreAxes(c, seunOf(c, year)).map((a: any) => ({ label: a.label, score: a.score as number }));
  const sorted = [...axes].sort((a, b) => b.score - a.score);
  return {
    year,
    type: TYPE4[c.dayMasterEl],
    verdict: bizVerdict(c),
    total: axes.reduce((t, a) => t + a.score, 0),   // 30점 만점
    top: sorted.slice(0, 2),                          // 가장 두터운 두 축만 미리 보여 준다
    hidden: axes.length - 2,                          // 나머지는 무료 리포트에서
  };
}
