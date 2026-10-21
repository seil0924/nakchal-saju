// lib/tycoon-facts.ts — 거장 상세 페이지에서 그 사람의 명식을 실제로 보여 주기 위한 것.
//
// "명식과 대조합니다"라고 써 놓고 정작 명식을 한 글자도 안 보여 주고 있었다.
// 검색으로 오는 질의가 "○○ 사주", "○○ 명식"인데 페이지가 그 약속을 안 지키면
// 사람은 뒤로 가기를 누른다. 계산은 lib/engine 하나로만 간다.
//
// 2026-10-21: 일주만 보여 주던 것을 삼주 전체·십성 분포·신살까지 넓혔다.
// 검색한 사람이 원하는 것은 "이 사람 명식이 어떻게 생겼나"이고, 그다음이 "나는?"이다.
import 'server-only';
import { compute, pil, sipsung, sinsal, EL, GAN, ZHI } from './engine';
import { TYCOONS, TYPE_NAME, TYPE_DESC, TYPE_MYEONG, type Tycoon } from './tycoon';

const GAN_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const ZHI_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const SIP = ['비겁', '식상', '재성', '관성', '인성'];
// 주도하는 십성이 사업에서 어떻게 드러나는가 — 리포트 본문과 같은 결로 짧게
const SIP_BIZ = [
  '나와 같은 기운이 두터워 스스로 판을 끌고 가는 힘이 셉니다. 남에게 기대기보다 직접 쥐는 쪽입니다.',
  '표현하고 만들어 내는 기운이 두터워 기획·영업·제품으로 승부합니다. 말과 결과물이 무기입니다.',
  '재물을 다루는 기운이 두터워 돈의 흐름과 거래를 읽는 눈이 밝습니다. 굴리고 불리는 쪽입니다.',
  '규율과 자리를 뜻하는 기운이 두터워 조직을 세우고 지키는 힘이 셉니다. 명예와 책임을 무겁게 봅니다.',
  '배움과 문서를 뜻하는 기운이 두터워 판단의 근거를 쌓고 사람을 키우는 쪽입니다. 오래 버팁니다.',
];

export type Pillar = { pos: string; gan: string; zhi: string; ganEl: number; zhiEl: number };
export type TycoonFacts = {
  pills: string;      // 일주(日柱) 두 글자
  el: number;         // 일간 오행 0~4
  elName: string;
  dist: number[];     // 오행 분포: 삼주 기준
  type: string;       // 대표 유형
  desc: string;
  myeong: string;
  pillars: Pillar[];  // 년주·월주·일주 (생시 미상이라 시주 없음)
  sip: number[];      // 십성 분포 [비겁, 식상, 재성, 관성, 인성] — 일간 제외 다섯 글자
  sipTop: string;     // 가장 두터운 십성
  sipBiz: string;     // 그 십성이 사업에서 드러나는 모습
  strong: string;     // 가장 많은 오행
  weak: string;       // 가장 적은 오행(여럿이면 가운뎃점으로 잇는다)
  weakZero: boolean;  // 가장 적은 오행이 0개인가(비어 있는가)
  sinsal: { name: string; head: string }[];
};

const argmax = (a: number[]) => a.reduce((b, v, i) => (v > a[b] ? i : b), 0);
const argmin = (a: number[]) => a.reduce((b, v, i) => (v < a[b] ? i : b), 0);

export function tycoonFacts(t: Tycoon): TycoonFacts {
  const [y, m, d] = t.born.split('-').map(Number);
  // 생시 미상이라 시주(時柱)는 넣지 않는다. 모르는 것을 아는 척하면 그 순간부터 전부 못 믿는다.
  const c = compute(y, m, d, null);
  const sip = sipsung(c);
  const top = argmax(sip);
  return {
    pills: pil(c.dGan, c.dZhi),
    el: c.dayMasterEl,
    elName: EL[c.dayMasterEl],
    dist: c.dist,
    type: TYPE_NAME[c.dayMasterEl],
    desc: TYPE_DESC[c.dayMasterEl],
    myeong: TYPE_MYEONG[c.dayMasterEl],
    pillars: [
      { pos: '년주', gan: GAN[c.yGan], zhi: ZHI[c.yZhi], ganEl: GAN_EL[c.yGan], zhiEl: ZHI_EL[c.yZhi] },
      { pos: '월주', gan: GAN[c.mGan], zhi: ZHI[c.mZhi], ganEl: GAN_EL[c.mGan], zhiEl: ZHI_EL[c.mZhi] },
      { pos: '일주', gan: GAN[c.dGan], zhi: ZHI[c.dZhi], ganEl: GAN_EL[c.dGan], zhiEl: ZHI_EL[c.dZhi] },
    ],
    sip,
    sipTop: SIP[top],
    sipBiz: SIP_BIZ[top],
    strong: EL[argmax(c.dist)],
    weak: c.dist.map((n, i) => (n === c.dist[argmin(c.dist)] ? EL[i] : '')).filter(Boolean).join('·'),
    weakZero: c.dist[argmin(c.dist)] === 0,
    sinsal: sinsal(c).map(s => ({ name: s.name, head: s.head })),
  };
}

export function tycoonFactsByName(name: string): TycoonFacts | null {
  const t = TYCOONS.find(x => x.name === name);
  return t ? tycoonFacts(t) : null;
}
