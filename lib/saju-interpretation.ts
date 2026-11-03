import type { Chart } from './engine';
import { GAN, ZHI, GAN_EL, ZHI_EL, relation } from './manse-core';
import { starOf } from './siksin';

/** v1: 지장간은 여기·중기·정기 순서. 마지막 글자가 본기다.
 * 일수/가중치를 부여하지 않으며 표면 분포와 합산하지 않는다.
 * 표의 출처와 해석 범위: docs/interpretation-rules.md
 */
export const HIDDEN_STEMS: readonly (readonly number[])[] = [
  [8, 9], [9, 7, 5], [4, 2, 0], [0, 1], [1, 9, 4], [4, 6, 2],
  [2, 5, 3], [3, 1, 5], [4, 8, 6], [6, 7], [7, 3, 4], [4, 0, 8],
];
export const GROUPS = ['비겁', '식상', '재성', '관성', '인성'] as const;
const RELS = ['bi', 'sik', 'jae', 'gwan', 'in'];
const ELEMENTS = ['목(木)', '화(火)', '토(土)', '금(金)', '수(水)'];
const POS = ['년', '월', '일', '시'];
const SEASONS = ['겨울', '겨울 끝', '봄 초입', '봄', '봄 끝', '여름 초입', '여름', '여름 끝', '가을 초입', '가을', '가을 끝', '겨울 초입'];
const groupOf = (me: number, el: number) => RELS.indexOf(relation(me, el));
export type ReadingNote = { title: string; body: string; evidence: string; action: string };
export type Interpretation = ReturnType<typeof interpretChart>;

const THEMES = [
  { label: '주도·협력', strength: '스스로 기준을 세우거나 동료와 역할을 나누는 쪽', risk: '서로 결정권을 주장할 때 조율이 늦어지는 점', action: '함께하는 일은 결정권과 책임 범위를 먼저 합의합니다.' },
  { label: '표현·실행', strength: '생각을 설명하고 결과물로 옮기는 쪽', risk: '실행 속도에 비해 검토가 따라가지 못하는 점', action: '작게 실행한 뒤 결과를 검토하고 다음 범위를 정합니다.' },
  { label: '성과·관리', strength: '목표와 자원 배분을 구체적으로 살피는 쪽', risk: '목표를 늘리면서 맡은 일도 함께 불어나는 점', action: '목표를 정할 때 필요한 인력과 시간을 함께 적습니다.' },
  { label: '책임·기준', strength: '역할과 절차를 정해 일을 유지하는 쪽', risk: '책임을 혼자 떠안거나 기준을 너무 엄격하게 적용하는 점', action: '반드시 지킬 기준과 조정 가능한 절차를 구분합니다.' },
  { label: '학습·검토', strength: '자료를 모으고 충분히 이해한 뒤 판단하는 쪽', risk: '검토가 길어져 실행 시점을 놓치는 점', action: '추가로 확인할 항목과 결정을 마칠 시점을 함께 정합니다.' },
];

export function interpretChart(c: Chart) {
  const me = GAN_EL[c.dGan];
  const hourKnown = c.hGan !== null && c.hZhi !== null;
  const branches = [c.yZhi, c.mZhi, c.dZhi, ...(hourKnown ? [c.hZhi!] : [])];
  const stems = [c.yGan, c.mGan, c.dGan, ...(hourKnown ? [c.hGan!] : [])];
  const counts = [0, 0, 0, 0, 0];
  const visible = stems.flatMap((gan, i) => i === 2 ? [] : [{
    position: `${POS[i]}간`, gan, group: groupOf(me, GAN_EL[gan]),
    star: starOf(me, c.dGan % 2 === 0, GAN_EL[gan], gan % 2 === 0),
  }]);
  visible.forEach(v => counts[v.group]++);
  branches.forEach(zhi => counts[groupOf(me, ZHI_EL[zhi])]++);
  const hidden = branches.map((zhi, i) => ({
    position: `${POS[i]}지`, zhi,
    stems: HIDDEN_STEMS[zhi].map(gan => ({ gan, group: groupOf(me, GAN_EL[gan]),
      star: starOf(me, c.dGan % 2 === 0, GAN_EL[gan], gan % 2 === 0) })),
  }));
  const roots = hidden.filter(b => b.stems.some(s => GAN_EL[s.gan] === me));
  const monthMain = HIDDEN_STEMS[c.mZhi].at(-1)!;
  const monthGroup = groupOf(me, GAN_EL[monthMain]);
  const monthStar = starOf(me, c.dGan % 2 === 0, GAN_EL[monthMain], monthMain % 2 === 0);
  const leaders = counts.flatMap((n, i) => n === Math.max(...counts) ? [i] : []);
  const exposedHelp = visible.filter(v => v.group === 0 || v.group === 4).length;
  const monthHelp = monthGroup === 0 || monthGroup === 4;
  // 세 근거의 일치 여부만 표현한다. 신강/신약·용신 판정 또는 능력 점수가 아니다.
  const support = Number(monthHelp) + Number(roots.length > 0) + Number(exposedHelp > 0);
  const supportLabel = support === 3 ? '받침 근거가 함께 있는 구성' : support === 0 ? '받침 근거를 신중히 보는 구성' : '받침과 소모를 함께 보는 구성';
  const hiddenOnly = ELEMENTS.flatMap((_, el) => c.dist[el] === 0 && hidden.some(b => b.stems.some(s => GAN_EL[s.gan] === el)) ? [el] : []);
  const unobserved = ELEMENTS.flatMap((_, el) => c.dist[el] === 0 && !hidden.some(b => b.stems.some(s => GAN_EL[s.gan] === el)) ? [el] : []);
  const evidence = `월지 ${ZHI[c.mZhi]}의 본기 ${GAN[monthMain]}(${monthStar}), 같은 오행을 품은 지지 ${roots.length}곳, 드러난 비겁·인성 ${exposedHelp}자리`;
  const summary = `${leaders.map(i => `${GROUPS[i]}(${THEMES[i].label})`).join('·')} 주제가 ${leaders.length > 1 ? '같은 비중으로 나타납니다' : '상대적으로 자주 나타납니다'}. ${SEASONS[c.mZhi]}의 월지와 지장간을 함께 보면 ${supportLabel}으로 풀이합니다.`;
  const tensions: ReadingNote[] = [];
  const pair = (a: number, b: number, title: string, body: string, action: string) => {
    if (counts[a] && counts[b]) tensions.push({ title, body, action, evidence: `${GROUPS[a]} ${counts[a]}자리 · ${GROUPS[b]} ${counts[b]}자리 (일간 제외, 지지는 대표 오행)` });
  };
  pair(1, 4, '빠른 실행과 신중한 검토', '식상은 표현과 실행, 인성은 학습과 검토라는 서로 다른 역할로 읽습니다. 익숙한 일에서는 빠르게 움직이고, 낯선 일에서는 확인을 늘리는 모습으로 함께 나타날 수 있습니다.', '초안은 먼저 만들고, 공개하거나 확정하기 전에 검토 시간을 따로 둡니다.');
  pair(0, 3, '자율성과 책임 의식', '비겁의 자기 기준과 관성의 역할·규칙이 함께 있습니다. 방법을 고를 때는 자율성을, 공동의 약속을 지킬 때는 책임을 중시하는 것으로 나누어 읽습니다.', '맡은 범위 안에서는 자율적으로 진행하고, 범위를 바꾸는 결정은 함께 확인합니다.');
  pair(1, 3, '새로운 제안과 절차 준수', '식상의 표현과 관성의 기준이 함께 보입니다. 새 방법을 제안하는 단계와 승인된 절차를 따라야 하는 단계를 구분하면 두 풀이를 함께 이해할 수 있습니다.', '제안할 때는 대안을 열어 두고, 실행 전에 필요한 승인과 기준을 확인합니다.');
  if (counts[2]) tensions.push({ title: '성과 지향과 감당할 범위',
    body: support === 3 ? '성과를 살피는 재성과 자신을 받치는 근거가 함께 있습니다. 목표를 추진하는 성향과 일이 늘 때 범위를 조절해야 한다는 주의점은 동시에 적용됩니다.' : '성과를 살피는 재성이 있어도 일을 감당하는 근거는 따로 살펴야 합니다. 성과에 관심이 있다는 풀이가 큰 규모를 감당한다는 뜻은 아닙니다.',
    evidence: `재성 ${counts[2]}자리 · ${evidence}`, action: '할 수 있는 일과 지금 맡을 수 있는 일을 나누고, 여력이 확인된 범위부터 진행합니다.' });
  if (!tensions.length) tensions.push({ title: '강점과 주의점의 적용 조건', body: '같은 성향도 일이 익숙하고 여유가 있을 때와 일정이 촉박할 때 다르게 나타날 수 있습니다. 한쪽 풀이를 성격 전체로 확정하지 않습니다.', evidence, action: THEMES[leaders[0]].action });
  return { version: '1', hourKnown, counts, visible, hidden, roots, monthMain, monthGroup, monthStar,
    season: SEASONS[c.mZhi], leaders, support, supportLabel, hiddenOnly, unobserved, evidence, summary,
    label: leaders.length > 1 ? '복합 성향' : THEMES[leaders[0]].label,
    themes: leaders.map(i => ({ group: GROUPS[i], ...THEMES[i] })), tensions };
}

export function periodReading(rel: string) {
  const idx = RELS.indexOf(rel);
  const rows = [
    ['주도·협력의 주제', '자기 기준과 협력 관계를 살피는 흐름으로 풀이합니다.', '역할과 결정권을 확인합니다.'],
    ['표현·실행의 주제', '설명과 실행에 힘을 쓰는 흐름으로 풀이합니다.', '실행한 뒤 검토할 시간을 남깁니다.'],
    ['성과·관리의 주제', '목표와 자원 배분을 살피는 흐름으로 풀이합니다.', '목표에 필요한 조건을 점검합니다.'],
    ['책임·점검의 주제', '규칙과 부담을 살피는 흐름으로 풀이합니다.', '기한과 책임 범위를 확인합니다.'],
    ['학습·준비의 주제', '자료와 준비 상태를 살피는 흐름으로 풀이합니다.', '확인한 내용을 다음 행동으로 연결합니다.'],
  ];
  const r = rows[idx] ?? ['해석 보류', '기간의 기준 정보가 없어 흐름을 확정하지 않습니다.', '기준 날짜를 확인합니다.'];
  return { label: r[0], body: r[1], action: r[2] };
}

export const elementName = (el: number) => ELEMENTS[el];
