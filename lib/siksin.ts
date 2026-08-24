// lib/siksin.ts — 식신생재(食神生財) 판정.
//
// 식신생재는 '내가 만들어낸 것이 돈으로 이어지는' 구조다.
// 관(官)으로 자리를 얻어 버는 것도, 겁재로 남과 다퉈 뺏는 것도 아니다.
// 시공·제조·용역으로 먹고사는 대표님들 이야기라 우리 손님과 결이 맞는다.
//
// 판정 원칙: 있다/없다를 딱 자르지 않는다. 고전도 그렇게 안 잘랐다.
// 식상과 재성이 있는가, 서로 닿아 있는가, 천간에 드러났는가, 일간이 감당하는가 —
// 이 네 가지를 각각 보여주고 종합을 네 단계로만 말한다.
import { GAN_EL, ZHI_EL } from '@/lib/manse-core';

export const GAN_KO = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const ZHI_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
const PILLAR = ['년', '월', '일', '시'] as const;

export type Star =
  | '비견' | '겁재' | '식신' | '상관' | '편재'
  | '정재' | '편관' | '정관' | '편인' | '정인';

// 일간 오행·음양을 기준으로 상대 글자의 십성을 낸다.
// 오행은 상생 차례(목0 화1 토2 금3 수4)로 놓여 있어 +1이 내가 낳는 것, +2가 내가 이기는 것이다.
export function starOf(meEl: number, meYang: boolean, el: number, yang: boolean): Star {
  const same = meYang === yang;
  if (el === meEl) return same ? '비견' : '겁재';
  if ((meEl + 1) % 5 === el) return same ? '식신' : '상관';
  if ((meEl + 2) % 5 === el) return same ? '편재' : '정재';
  if ((el + 2) % 5 === meEl) return same ? '편관' : '정관';
  return same ? '편인' : '정인';
}

export type Chart8 = {
  yGan: number; yZhi: number; mGan: number; mZhi: number;
  dGan: number; dZhi: number; hGan: number | null; hZhi: number | null;
};

export type Slot = {
  star: Star; pillar: number; stem: boolean;
  ch: string;      // 한글 글자 (갑·자)
  where: string;   // 년간·월지 같은 자리 이름
};

// 여덟 글자 중 일간을 뺀 일곱 자리의 십성. 일간은 나 자신이라 십성이 없다.
export function starsOf(c: Chart8): Slot[] {
  const meEl = GAN_EL[c.dGan];
  const meYang = c.dGan % 2 === 0;
  const out: Slot[] = [];
  const put = (pillar: number, stem: boolean, idx: number | null | undefined) => {
    if (idx === null || idx === undefined) return;
    const el = stem ? GAN_EL[idx] : ZHI_EL[idx];
    const yang = idx % 2 === 0;
    out.push({
      star: starOf(meEl, meYang, el, yang),
      pillar, stem,
      ch: stem ? GAN_KO[idx] : ZHI_KO[idx],
      where: PILLAR[pillar] + (stem ? '간' : '지'),
    });
  };
  put(0, true, c.yGan); put(0, false, c.yZhi);
  put(1, true, c.mGan); put(1, false, c.mZhi);
  put(2, false, c.dZhi);
  put(3, true, c.hGan); put(3, false, c.hZhi);
  return out;
}

const HELP: Star[] = ['비견', '겁재', '정인', '편인'];
const helps = (s: Slot) => HELP.includes(s.star);

export type Strength = {
  ryeong: boolean;   // 득령 — 태어난 달이 나를 돕는가
  ji: boolean;       // 득지 — 앉은 자리가 나를 돕는가
  se: boolean;       // 득세 — 나머지 글자에서 내 편이 절반을 넘는가
  count: number;     // 셋 중 몇을 얻었나
  strong: boolean;
  help: number; drain: number;
};

// 옛 방식 그대로 득령·득지·득세 셋을 본다. 글자를 저울에 다는 것보다
// 이 셋이 훨씬 덜 흔들리고, 대표님께 설명하기도 이 편이 낫다.
// 격국을 제대로 잡는 계산은 아니다 — 감당 여부를 가늠하는 눈금이고, 화면에도 그렇게 쓴다.
export function strengthOf(slots: Slot[]): Strength {
  const month = slots.find(s => s.pillar === 1 && !s.stem);
  const day = slots.find(s => s.pillar === 2 && !s.stem);
  const rest = slots.filter(s => s !== month && s !== day);
  const restHelp = rest.filter(helps).length;
  const ryeong = !!month && helps(month);
  const ji = !!day && helps(day);
  const se = rest.length > 0 && restHelp * 2 > rest.length;
  const count = (ryeong ? 1 : 0) + (ji ? 1 : 0) + (se ? 1 : 0);
  return {
    ryeong, ji, se, count,
    strong: count >= 2,
    help: slots.filter(helps).length,
    drain: slots.filter(s => !helps(s)).length,
  };
}

export type SiksinKind = '식신생재' | '상관생재' | '식상생재' | null;
export type Level = 'clear' | 'yes' | 'weak' | 'none';

export type Siksin = {
  kind: SiksinKind;
  level: Level;
  score: number;
  headline: string;
  body: string;
  sik: Slot[]; sang: Slot[]; jae: Slot[];
  adjacent: boolean;   // 식상과 재성이 붙어 있다
  bothStem: boolean;   // 둘 다 천간에 드러났다
  doosik: boolean;     // 편인이 천간에서 식신을 친다(도식)
  strength: Strength;
  notes: string[];
};

export function judgeSiksin(c: Chart8): Siksin {
  const slots = starsOf(c);
  const sik = slots.filter(s => s.star === '식신');
  const sang = slots.filter(s => s.star === '상관');
  const jae = slots.filter(s => s.star === '정재' || s.star === '편재');
  const out = [...sik, ...sang];
  const strength = strengthOf(slots);

  // 붙어 있는가 — 같은 기둥이거나 이웃 기둥이면 기운이 건너간다고 본다.
  let adjacent = false;
  for (const o of out) for (const j of jae) if (Math.abs(o.pillar - j.pillar) <= 1) adjacent = true;
  const bothStem = out.some(s => s.stem) && jae.some(s => s.stem);
  // 도식(倒食) — 천간의 편인이 천간의 식신을 친다. 밥그릇을 엎는다는 뜻이다.
  const doosik = slots.some(s => s.star === '편인' && s.stem) && sik.some(s => s.stem);

  const kind: SiksinKind = sik.length && sang.length ? '식상생재'
    : sik.length ? '식신생재' : sang.length ? '상관생재' : null;

  const notes: string[] = [];

  if (!out.length || !jae.length) {
    if (!out.length) notes.push('명식에 식신도 상관도 없습니다. 내 손에서 나온 결과물로 버는 형태보다, 자리나 사람을 통해 버는 쪽에 가깝습니다.');
    if (!jae.length) notes.push('명식에 재성이 없습니다. 재주는 있으나 그것이 곧바로 돈으로 이어지는 통로가 원국에 안 보입니다.');
    return {
      kind, level: 'none', score: 0,
      headline: '식신생재는 서 있지 않습니다',
      body: '식신생재는 만드는 기운(식상)과 취하는 기운(재성)이 함께 있어야 섭니다. 지금 명식은 한쪽이 비어 있습니다.',
      sik, sang, jae, adjacent: false, bothStem: false, doosik: false, strength, notes,
    };
  }

  let score = sik.length ? 3 : 2;   // 식신이 상관보다 이 구조에 곧다
  score += 2;                        // 재성이 있다
  if (adjacent) score += 2;
  if (bothStem) score += 1;
  if (jae.length >= 2) score += 1;   // 재성에 뿌리가 있다
  if (doosik) score -= 3;
  if (!strength.strong) score -= 2;

  const level: Level = score >= 8 ? 'clear' : score >= 6 ? 'yes' : score >= 4 ? 'weak' : 'none';

  const first = out[0];
  if (adjacent) notes.push(`${first.where}의 ${first.star}과 ${jae[0].where}의 ${jae[0].star}가 가까이 붙어 있어 기운이 건너갑니다.`);
  else notes.push('식상과 재성이 서로 떨어져 있습니다. 재주와 돈벌이가 한 줄로 이어지기까지 시간이 걸리는 편입니다.');
  if (bothStem) notes.push('둘 다 천간에 드러나 있어 남 눈에도 보이는 구조입니다.');
  if (jae.length >= 2) notes.push('재성이 여럿이라 벌이가 한 갈래로만 오지 않습니다.');
  if (doosik) notes.push('다만 천간의 편인이 식신을 칩니다. 옛말로 도식(倒食) — 벌어들일 판에 생각이 앞서 손을 늦추는 일이 잦습니다.');
  notes.push(strength.strong
    ? `일간이 ${[strength.ryeong && '득령', strength.ji && '득지', strength.se && '득세'].filter(Boolean).join('·')}으로 버팁니다. 벌어들이는 것을 담을 그릇은 됩니다.`
    : '일간이 얇은 편입니다. 벌 구조는 서 있으나 혼자 다 짊어지면 몸이 먼저 상합니다 — 사람을 쓰고 나눠야 남습니다.');

  const HEAD: Record<Level, string> = {
    clear: `${kind}가 뚜렷하게 서 있습니다`,
    yes: `${kind} 구조가 있습니다`,
    weak: `${kind}의 재료는 있으나 약합니다`,
    none: '식신생재로 보기는 어렵습니다',
  };
  const BODY: Record<Level, string> = {
    clear: '내 손에서 나온 것이 곧장 돈으로 이어지는 자리입니다. 남의 자리를 빌리거나 경쟁으로 뺏는 방식보다, 직접 만들어 파는 쪽에서 힘이 붙습니다.',
    yes: '만들어서 버는 결이 명식에 있습니다. 크게 벌리기보다 잘하는 것 하나를 깊게 파는 편이 유리합니다.',
    weak: '재료는 갖췄으나 이어지는 힘이 약합니다. 대운·세운에서 식상이나 재성이 들어올 때 비로소 터지는 형태입니다.',
    none: '이 구조로 버는 형태는 아닙니다. 다른 통로를 봐야 합니다.',
  };

  return {
    kind, level,  score,
    headline: HEAD[level], body: BODY[level],
    sik, sang, jae, adjacent, bothStem, doosik, strength, notes,
  };
}
