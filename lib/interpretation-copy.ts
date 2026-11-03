import 'server-only';
import { GAN, ZHI } from './manse-core';
import type { Chart, Seun, Sajeong } from './engine';
import type { Section } from './report-copy';
import { GROUPS, elementName, interpretChart, periodReading } from './saju-interpretation';

const escape = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
const p = (...texts: string[]) => texts.map(t => `<p>${escape(t)}</p>`).join('');
const cards = (rows: { title: string; body: string }[]) => `<div class="interpretation-cards">${rows.map(r => `<div class="interpretation-card"><h3>${escape(r.title)}</h3>${p(r.body)}</div>`).join('')}</div>`;

/** 공통 분석 결과로 모든 대표 사주 장을 작성한다. 결제 게이팅은 buildReport에서 수행한다. */
export function representativeSections(c: Chart, s: Sajeong, seun?: Seun, year?: number): Omit<Section, 'free'>[] {
  const a = interpretChart(c);
  const annual = periodReading(seun?.rel ?? '');
  const daily = periodReading(s.rel);
  const yearLabel = year ? `${year}년` : '선택 연도';
  const hourNote = a.hourKnown
    ? '입력한 생년월일과 시간을 기준으로 네 기둥을 풀이합니다.'
    : '태어난 시간을 몰라 시주를 제외한 세 기둥만 풀이합니다. 시간이 확인되면 기운의 비중과 종합 해석이 달라질 수 있습니다.';
  const scope = '전통 명리의 상징을 정해진 규칙으로 풀이한 참고 정보입니다. 성격·능력·수익이나 낙찰 결과를 확정하지 않습니다.';
  const note = (text: string) => `<p class="interpretation-note">${escape(text)}</p>`;
  const groupEvidence = GROUPS.map((g, i) => `${g} ${a.counts[i]}자리`).join(' · ');
  const foundation = a.support === 3
    ? '월지의 관계, 지장간의 같은 오행, 드러난 비겁·인성이 함께 확인됩니다. 자신의 기준을 유지하는 근거가 겹친 것으로 읽되, 맡는 일의 양까지 판단하지는 않습니다.'
    : a.support === 0
      ? '월지의 관계, 지장간의 같은 오행, 드러난 비겁·인성에서 받침 근거가 확인되지 않습니다. 능력이 부족하다고 단정하지 않고, 준비와 도움을 확보하는 조건을 먼저 살피는 풀이입니다.'
      : '자신을 받치는 근거가 일부 확인됩니다. 받침과 표현·성과·책임에 쓰는 힘을 함께 살펴야 하므로, 한 가지 개수만으로 강하거나 약하다고 확정하지 않습니다.';
  const hiddenRows = a.hidden.map(b => ({ title: `${b.position} ${ZHI[b.zhi]}`,
    body: b.stems.map((v, i) => `${GAN[v.gan]}(${v.star}${i === b.stems.length - 1 ? ', 본기' : ''})`).join(' · ') }));
  const missing = [
    a.hiddenOnly.length ? `표면에서는 보이지 않는 ${a.hiddenOnly.map(elementName).join('·')} 기운이 지장간에는 있습니다. 이 기운을 완전히 없다고 풀이하지 않습니다.` : '표면에 없는 오행 중 지장간에서 새로 확인되는 오행은 없습니다.',
    a.unobserved.length ? `${a.unobserved.map(elementName).join('·')} 기운은 확인한 글자와 지장간에 나타나지 않습니다. 관련 능력이나 기회가 없다는 뜻은 아닙니다.` : '지장간까지 살피면 다섯 오행이 모두 확인됩니다. 이것만으로 균형이 좋다고 단정하지 않습니다.',
  ];
  return [
    { mk: '器', tier: 'free', t: '일간과 태어난 달을 함께 본 기본 성향', html:
      note(hourNote) + p(`나를 나타내는 일간은 ${GAN[c.dGan]}(${elementName(c.dayMasterEl)})입니다.`, a.summary) +
      cards([{ title: `태어난 달 · ${a.season}`, body: `절기를 기준으로 계산한 월지는 ${ZHI[c.mZhi]}입니다. 그 안의 중심 기운인 ${GAN[a.monthMain]}(${a.monthStar})를 함께 읽습니다. 양력 월 숫자로 계절을 정하지 않습니다.` },
        { title: a.supportLabel, body: foundation }]) + note(scope) },
    { mk: '診', tier: 'free', t: `사주 구성으로 본 ${a.label}`, html:
      p(a.leaders.length > 1 ? '가장 많이 나타난 관계가 동률입니다. 한 가지 유형으로 정하지 않고 아래 성향을 함께 읽습니다.' : '일간을 제외한 글자의 관계에서 상대적으로 자주 나타난 주제를 살핍니다.') +
      cards(a.themes.map(t => ({ title: `${t.group} · ${t.label}`, body: `강점으로 읽는 부분은 ${t.strength}입니다. 부담이 커질 때에는 ${t.risk}을 살핍니다. ${t.action}` }))) + note(groupEvidence) },
    { mk: '軸', tier: 'free', t: '해석의 근거 · 겉의 글자와 안의 기운', html: cards([
      { title: '겉으로 드러난 관계', body: a.visible.map(v => `${v.position} ${GAN[v.gan]}(${v.star})`).join(' · ') },
      { title: '같은 오행을 품은 자리', body: a.roots.length ? `${a.roots.map(b => `${b.position} ${ZHI[b.zhi]}`).join('·')}의 지장간에 일간과 같은 오행이 있습니다. 뿌리의 존재를 확인한 것이며, 개수를 힘의 점수로 환산하지 않습니다.` : '확인한 지장간에서 일간과 같은 오행은 보이지 않습니다. 월지와 다른 글자의 도움을 별도로 살핍니다.' },
      { title: '함께 살핀 근거', body: a.evidence },
    ]) + note('표면 개수는 지지의 대표 오행을 한 번씩 셉니다. 지장간은 별도로 살피며, 표면 개수에 중복해서 더하지 않습니다.') },
    { mk: '核', tier: 'free', t: '종합 해석 · 기본 성향과 시기별 흐름', html: cards([
      { title: '기본 성향 · 태어난 사주', body: a.summary },
      { title: `${yearLabel} · ${annual.label}`, body: `${annual.body} ${annual.action}` },
      { title: `오늘 · ${daily.label}`, body: `${daily.body} ${daily.action}` },
    ]) + p(seun && seun.rel !== s.rel
      ? `${yearLabel}과 오늘은 서로 다른 주제를 강조합니다. 연간 풀이를 모든 날에 그대로 적용하지 않고, 오늘의 점검 사항을 따로 살핍니다.`
      : '기본 성향은 일을 대하는 방식, 기간별 흐름은 그 시기에 살필 주제입니다. 같은 주제가 겹쳐도 결과가 보장되거나 효과가 배가되는 뜻은 아닙니다.') +
      note('연간·오늘의 흐름은 해당 기간의 천간과 일간의 오행 관계를 기준으로 한 간단한 풀이입니다. 전체 사주의 합·충이나 용신을 확정한 해석은 아닙니다.') },
    { mk: '五', tier: 'full', t: '오행 상세 · 지장간까지 함께 본 구성', teaser: '표면에서 보이지 않는 기운이 지장간에 있는지, 태어난 달과 어떤 관계인지 확인합니다.', html:
      p(`표면 ${a.hourKnown ? '8' : '6'}글자의 분포는 ${c.dist.map((n, i) => `${elementName(i)} ${n}`).join(' · ')}입니다. 개수는 관찰한 구성으로, 좋고 나쁨의 순위가 아닙니다.`) +
      cards(hiddenRows) + p(...missing, `월지 ${ZHI[c.mZhi]}의 본기 ${GAN[a.monthMain]}의 관계는 ${a.monthStar}입니다. ${foundation}`) +
      note('지장간 표는 여기·중기·정기 순서로 표시하며, 본기는 중심 기운입니다. 유파별 표와 적용 방식에 차이가 있어 여기서는 일수별 강도나 용신을 계산하지 않습니다.') },
    { mk: '決', tier: 'full', t: '함께 읽는 풀이 · 강점과 주의점의 조건', teaser: '빠른 실행과 신중함처럼 달라 보이는 풀이를 상황별로 나누고, 내 구성에 해당하는 적용 방법을 살핍니다.', html:
      p('아래 항목은 실제로 함께 나타난 관계를 골라 정리한 것입니다. 성향의 역할, 적용되는 상황, 실천 방법을 나누어 읽습니다.') +
      a.tensions.map(t => `<div class="interpretation-card"><h3>${escape(t.title)}</h3>${p(t.body)}${note(`근거: ${t.evidence}`)}${p(`적용 방법: ${t.action}`)}</div>`).join('') },
    { mk: '人', tier: 'full', t: '협업 · 성향을 역할로 나누는 방법', teaser: '주도권·표현·책임이 협업에서 어떻게 드러나는지, 역할을 나눌 때 확인할 항목을 살핍니다.', html:
      cards([
        { title: '주도권과 협력', body: a.counts[0] >= 2 ? '비겁이 여러 자리에 있어 자기 기준과 동료 관계를 함께 살피는 구성입니다. 의견을 제시하는 역할과 최종 결정권을 나누면 기준의 충돌을 줄이는 데 도움이 됩니다.' : '비겁이 표면에서 두드러지지 않습니다. 독립성이나 협업 능력이 부족하다는 뜻은 아니며, 실제로 편한 역할을 대화로 확인합니다.' },
        { title: '설명과 합의', body: a.counts[1] ? '식상이 보여 표현과 실행을 협업의 자원으로 읽습니다. 설명을 많이 하는 것과 상대가 이해하는 것은 별개이므로 합의한 내용을 짧게 남깁니다.' : '표면에서 식상이 확인되지 않아 표현 방식을 단정하지 않습니다. 말이나 문서 중 편한 방식을 정해 역할을 공유합니다.' },
        { title: '책임의 범위', body: a.counts[3] ? '관성이 있어 기준과 책임을 살핍니다. 책임감이 모든 일을 혼자 맡아야 한다는 뜻은 아니므로, 담당자와 완료 기준을 함께 정합니다.' : '표면에 관성이 없다는 이유로 책임감이 없다고 해석하지 않습니다. 실제 업무에서는 담당자와 완료 기준을 명시합니다.' },
      ]) + note('오행이 부족하다는 이유만으로 특정 성향의 사람을 채용하거나 배제하지 않습니다.') },
    { mk: '財', tier: 'full', t: '성과 · 목표와 준비를 함께 살피는 방법', teaser: '재성의 존재와 일을 감당하는 조건을 나누어 읽고, 목표를 정할 때 함께 확인할 항목을 정리합니다.', html:
      p(`재성은 표면에서 ${a.counts[2]}자리 확인됩니다. 이는 성과와 자원 관리라는 해석 주제이며 재산의 크기나 수익 전망을 나타내지 않습니다.`, foundation) +
      cards([{ title: '목표를 실행으로 연결하는 조건', body: a.counts[1] && a.counts[2] ? '식상과 재성이 함께 있어 결과물을 성과로 연결하는 주제를 살핍니다. 실제로 성과가 되는지는 요구 사항, 완성도, 검수 조건을 확인해야 합니다.' : '표면의 식상과 재성이 모두 확인되지는 않습니다. 결과물을 성과로 연결하는 능력의 유무를 단정하지 않고, 실제 작업과 검수 과정을 기준으로 확인합니다.' },
        { title: '목표를 늘리기 전 확인', body: '준비된 인력, 소요 시간, 현재 맡은 일을 먼저 적습니다. 관심이나 의욕이 크더라도 여력이 부족하면 범위를 나누어 진행합니다.' }]) },
    { mk: '方', tier: 'full', t: '일상 적용 · 부족한 개수보다 필요한 조건', teaser: '자주 나타난 성향을 일상에서 활용하고 과해지는 상황을 조절하는 방법을 살핍니다.', html:
      cards(a.themes.map(t => ({ title: t.label, body: `${t.action} 특히 ${t.risk}이 나타나는지 실제 경험과 대조합니다.` }))) +
      p(...missing) + note('색·숫자·방향으로 부족한 오행을 채우면 결과가 좋아진다고 단정하지 않습니다. 환경과 업무 방식은 실제 필요를 기준으로 선택합니다.') },
    { mk: '士', tier: 'full', t: '마무리 · 내 풀이를 적용하는 순서', teaser: '기본 성향과 시기별 풀이를 한 번에 적용하는 순서를 정리합니다.', html:
      cards([{ title: '1. 기본 성향의 조건 확인', body: `${a.summary} ${a.themes.map(t => t.action).join(' ')}` },
        { title: '2. 시기별 점검 항목 구분', body: `${yearLabel}은 ${annual.label}, 오늘은 ${daily.label}로 풀이합니다. 장기 계획과 당일 점검 항목을 구분합니다.` },
        { title: '3. 실제 경험과 대조', body: '풀이가 경험과 맞지 않으면 억지로 끼워 맞추지 않습니다. 일정, 준비 상태, 상대와의 합의처럼 확인할 수 있는 조건을 먼저 살핍니다.' }]) + note(hourNote) + note(scope) },
  ];
}
