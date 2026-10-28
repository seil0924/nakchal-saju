// lib/sajang.ts — '나는 대표가 될 사주일까'(/sajang, 2026-10-28).
//
// 입찰 대표가 아니라 검색으로 우연히 들어온 사람을 위한 무료 판정이다.
// 두 가지를 답한다.
//   1) 대표가 될 바탕이 있는가: 신호 다섯 개를 통과·아님으로 보여 주고 개수로 네 단계만 말한다.
//   2) 대표가 된다면 어떤 대표가 맞는가: 일곱 자리 십성 가운데 가장 많은 무리로 다섯 갈래를 나눈다.
// 지킬 것: 성공·실패를 단정하지 않는다. 신호가 적게 나와도 '안 된다'고 쓰지 않고 맞는 방식을 말한다.
// 계산은 원국 여덟 글자만 본다(대운·세운 없음). 화면에도 그렇게 적는다.
import { starsOf, strengthOf, GAN_KO, type Chart8, type Slot, type Star } from './siksin';

export type Group = 'bi' | 'sik' | 'jae' | 'gwan' | 'in';
const GROUP_OF: Record<Star, Group> = {
  비견: 'bi', 겁재: 'bi', 식신: 'sik', 상관: 'sik', 편재: 'jae', 정재: 'jae',
  편관: 'gwan', 정관: 'gwan', 편인: 'in', 정인: 'in',
};

export type Signal = { key: string; ok: boolean; title: string; line: string };

export type BossType = {
  group: Group; name: string; one: string;
  strong: string[]; watch: string[]; fit: string;
};

// 다섯 갈래. 이름은 사람이 부르는 말로, 설명은 한 문장에 하나씩.
export const TYPES: Record<Group, BossType> = {
  bi: {
    group: 'bi', name: '앞장서는 대표', one: '직접 뛰어서 판을 여는 사람입니다. 남 밑에서 오래 버티기보다 내 이름을 걸 때 힘이 납니다.',
    strong: ['어려운 때에도 쉽게 꺾이지 않습니다.', '사람을 직접 만나 일을 따 오는 데 강합니다.'],
    watch: ['혼자 다 하려다 몸이 먼저 지칩니다.', '동업을 한다면 돈 나누는 선을 처음부터 글로 정해 두세요.'],
    fit: '영업과 현장이 중심인 일, 직접 발로 뛰는 만큼 커지는 사업',
  },
  sik: {
    group: 'sik', name: '만들어 파는 대표', one: '내 손으로 만든 것이 돈이 되는 사람입니다. 기술, 기획, 말솜씨가 곧 상품입니다.',
    strong: ['남이 못 본 것을 먼저 만들어 냅니다.', '제품과 서비스를 설명하는 힘이 있습니다.'],
    watch: ['숫자와 관리는 맡길 사람을 일찍 두는 편이 낫습니다.', '규정이나 윗선과 부딪힐 때 한 번 더 참으면 일이 풀립니다.'],
    fit: '기술, 제조, 디자인, 콘텐츠처럼 결과물이 곧 경쟁력인 사업',
  },
  jae: {
    group: 'jae', name: '셈이 빠른 대표', one: '돈이 어디로 흐르는지 먼저 보는 사람입니다. 기회를 알아보고 값을 매기는 감각이 있습니다.',
    strong: ['남는 장사와 안 남는 장사를 빨리 가립니다.', '거래 조건을 맞추는 협상에 강합니다.'],
    watch: ['한꺼번에 여러 판을 벌이면 감당이 어려워집니다.', '체력과 현금 흐름을 같이 챙기세요.'],
    fit: '유통, 도소매, 중개, 거래 조건이 곧 이익인 사업',
  },
  gwan: {
    group: 'gwan', name: '조직을 세우는 대표', one: '규칙과 신용으로 회사를 키우는 사람입니다. 맡은 일은 끝까지 책임집니다.',
    strong: ['약속과 기한을 지켜 신뢰를 쌓습니다.', '공공기관이나 큰 회사처럼 절차가 분명한 상대와 잘 맞습니다.'],
    watch: ['결정을 너무 오래 끌면 기회가 지나갑니다.', '책임감이 무거울 때는 짐을 나눌 사람을 두세요.'],
    fit: '공공 납품과 입찰, 건설, 용역처럼 자격과 실적이 쌓이는 사업',
  },
  in: {
    group: 'in', name: '전문가로 서는 대표', one: '배우고 익힌 것으로 이름을 얻는 사람입니다. 자격과 전문성이 회사의 얼굴이 됩니다.',
    strong: ['한 분야를 깊게 파서 믿음을 얻습니다.', '서류와 계약, 설계를 꼼꼼하게 챙깁니다.'],
    watch: ['생각이 길어지면 실행이 늦어집니다.', '영업은 잘하는 사람과 손잡는 편이 빠릅니다.'],
    fit: '설계, 컨설팅, 교육, 의료처럼 전문 자격이 신뢰가 되는 사업',
  },
};

// 동점이면 사업과 가까운 무리부터 고른다.
const TIE: Group[] = ['jae', 'sik', 'bi', 'gwan', 'in'];

export type SajangResult = {
  dayKo: string;                     // 일간 한글(갑·을…)
  signals: Signal[]; passed: number;
  verdict: string; verdictBody: string;
  type: BossType; second: BossType | null;
  counts: Record<Group, number>;
};

const VERDICT: [number, string, string][] = [
  [4, '대표 자리가 잘 맞는 사주입니다', '돈을 보는 눈, 만들어 내는 힘, 버티는 힘이 고루 있습니다. 언제 시작하느냐가 남은 숙제입니다.'],
  [3, '대표가 될 바탕이 갖춰진 사주입니다', '핵심 신호가 절반 넘게 섰습니다. 비어 있는 한두 가지는 사람과 때로 채울 수 있습니다.'],
  [2, '때와 사람을 만나면 대표가 되는 사주입니다', '혼자보다 맞는 동업자나 참모가 있을 때 판이 섭니다. 아래 갈래가 어떤 사람과 손잡을지 알려 줍니다.'],
  [0, '곁에서 판을 키울 때 더 빛나는 사주입니다', '지금 원국에서는 대표 신호가 적게 섰습니다. 대표가 되신다면 믿을 사람을 먼저 구하고, 내가 잘하는 한 가지에 집중하세요.'],
];

export function judgeSajang(c: Chart8): SajangResult {
  const slots = starsOf(c);
  const st = strengthOf(slots);
  const g = (s: Slot) => GROUP_OF[s.star];
  const has = (x: Group) => slots.some(s => g(s) === x);
  const shown = slots.some(s => s.stem && (g(s) === 'jae' || g(s) === 'sik'));

  const signals: Signal[] = [
    { key: 'jae', ok: has('jae'), title: '재성', line: has('jae') ? '돈이 어디로 흐르는지 보는 눈이 있습니다' : '돈을 보는 글자가 원국에 없습니다. 셈은 믿을 사람에게 맡기면 됩니다' },
    { key: 'sik', ok: has('sik'), title: '식상', line: has('sik') ? '내 것을 만들어 내놓는 힘이 있습니다' : '만들어 내는 글자가 없습니다. 이미 있는 것을 잘 굴리는 쪽이 맞습니다' },
    { key: 'bi', ok: has('bi'), title: '비겁', line: has('bi') ? '남 밑보다 내 판을 원하는 기질이 있습니다' : '혼자 밀어붙이기보다 조직 안에서 힘을 내는 기질입니다' },
    { key: 'st', ok: st.strong, title: '일간의 힘', line: st.strong ? '재물과 책임을 감당할 만큼 버팁니다' : '혼자 다 짊어지면 지치기 쉽습니다. 짐을 나눌 사람이 필요합니다' },
    { key: 'shown', ok: shown, title: '드러난 재주', line: shown ? '장사 감각이나 재주가 겉으로 드러나 남이 먼저 알아봅니다' : '재주가 안으로 숨어 있어 알리는 데 품이 듭니다' },
  ];
  const passed = signals.filter(s => s.ok).length;
  const v = VERDICT.find(([n]) => passed >= n)!;

  const counts: Record<Group, number> = { bi: 0, sik: 0, jae: 0, gwan: 0, in: 0 };
  for (const s of slots) counts[g(s)]++;
  const order = [...TIE].sort((a, b) => (counts[b] - counts[a]) || (TIE.indexOf(a) - TIE.indexOf(b)));
  const second = counts[order[1]] > 0 && counts[order[1]] === counts[order[0]] ? TYPES[order[1]]
    : counts[order[1]] >= 2 ? TYPES[order[1]] : null;

  return {
    dayKo: GAN_KO[c.dGan], signals, passed,
    verdict: v[1], verdictBody: v[2],
    type: TYPES[order[0]], second, counts,
  };
}
