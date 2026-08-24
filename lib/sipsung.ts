// lib/sipsung.ts — 십성 구조 판정을 한 그릇에 담는다.
//
// 등급(level)과 소식(tone)을 따로 둔다. 식신생재는 뚜렷할수록 반가운 소식이지만,
// 재다신약은 뚜렷할수록 조심할 소식이다. 둘을 한 눈금으로 묶으면 화면이 거짓말을 한다.
import { starsOf, strengthOf, judgeSiksin, type Chart8, type Slot, type Strength, type Level } from '@/lib/siksin';

export type Pattern = 'siksin' | 'jaeda' | 'jesal';
export type Tone = 'good' | 'warn' | 'flat';

export type Verdict = {
  pattern: Pattern;
  level: Level;
  tone: Tone;
  tag: string;
  headline: string;
  body: string;
  groups: { title: string; list: Slot[] }[];
  strength: Strength;
  notes: string[];
};

export const PATTERN_LABEL: Record<Pattern, string> = {
  siksin: '식신생재', jaeda: '재다신약', jesal: '식신제살',
};

// ── 재다신약(財多身弱) — 돈은 보이는데 담을 그릇이 얇다 ──
export function judgeJaeda(c: Chart8): Verdict {
  const slots = starsOf(c);
  const strength = strengthOf(slots);
  const jae = slots.filter(s => s.star === '정재' || s.star === '편재');
  const bi = slots.filter(s => s.star === '비견' || s.star === '겁재');
  const in_ = slots.filter(s => s.star === '정인' || s.star === '편인');
  const monthJae = jae.some(s => s.pillar === 1 && !s.stem);
  const notes: string[] = [];

  let level: Level;
  if (jae.length >= 3 && !strength.strong) level = 'clear';
  else if (jae.length >= 2 && !strength.strong) level = monthJae ? 'clear' : 'yes';
  else if (jae.length >= 2) level = 'weak';
  else level = 'none';

  const heavy = level === 'clear' || level === 'yes';
  const tone: Tone = heavy ? 'warn' : 'good';
  const tag = level === 'clear' ? '해당함' : level === 'yes' ? '기운 있음' : level === 'weak' ? '아님' : '아님';

  if (jae.length) notes.push(`명식에 재성이 ${jae.length}자리 있습니다 — ${jae.map(s => s.where).join('·')}.`);
  else notes.push('명식에 재성이 없습니다. 재다신약과는 반대쪽 구조입니다.');
  if (monthJae) notes.push('태어난 달이 재성입니다. 재가 가장 무거운 자리에 앉아 있어 부담이 큽니다.');
  if (heavy) {
    notes.push(bi.length
      ? `비겁이 ${bi.length}자리 있습니다. 재다신약에는 같이 짊어질 사람이 약입니다 — 동업·직원·조합이 여기에 해당합니다.`
      : '비겁이 없습니다. 혼자 다 지려는 자리라 벌수록 몸이 상합니다. 사람을 쓰는 것이 곧 처방입니다.');
    notes.push(in_.length
      ? '인성이 있어 배움·자격·문서가 버팀목이 됩니다. 면허와 실적을 쌓아 두면 재를 담는 그릇이 커집니다.'
      : '인성이 얇습니다. 자격·면허·문서를 갖추는 쪽으로 힘을 쓰면 그릇이 커집니다.');
  }
  notes.push(strength.strong
    ? `일간이 ${[strength.ryeong && '득령', strength.ji && '득지', strength.se && '득세'].filter(Boolean).join('·')}으로 버팁니다.`
    : '일간이 얇습니다. 득령·득지·득세 중 하나도 온전히 얻지 못했습니다.');

  const HEAD: Record<Level, string> = {
    clear: '재다신약이 뚜렷합니다',
    yes: '재다신약 기운이 있습니다',
    weak: '재는 많으나 일간이 버팁니다',
    none: '재다신약은 아닙니다',
  };
  const BODY: Record<Level, string> = {
    clear: '돈이 보이는 자리는 많은데 그것을 담을 힘이 얇습니다. 벌이가 없어서가 아니라 벌수록 힘에 부치는 형태라, 규모를 키우기 전에 같이 질 사람과 갖출 자격부터 챙기는 편이 낫습니다.',
    yes: '재성이 여럿인데 일간이 넉넉하지 않습니다. 판을 벌리는 속도보다 받치는 힘을 먼저 키우는 쪽이 안전합니다.',
    weak: '재성이 여럿이지만 일간이 그것을 감당합니다. 재다신약이 아니라 오히려 벌이를 담을 그릇이 되는 자리입니다.',
    none: '재성이 많지 않습니다. 돈에 눌리는 구조는 아닙니다.',
  };

  return {
    pattern: 'jaeda', level, tone, tag,
    headline: HEAD[level], body: BODY[level],
    groups: [
      { title: '재성', list: jae },
      { title: '비겁', list: bi },
      { title: '인성', list: in_ },
    ],
    strength, notes,
  };
}

// ── 식신제살(食神制殺) — 누르는 힘을 내 실력으로 막는다 ──
export function judgeJesal(c: Chart8): Verdict {
  const slots = starsOf(c);
  const strength = strengthOf(slots);
  const sal = slots.filter(s => s.star === '편관');
  const sik = slots.filter(s => s.star === '식신');
  const sang = slots.filter(s => s.star === '상관');
  const notes: string[] = [];

  let adjacent = false;
  for (const a of sik) for (const b of sal) if (Math.abs(a.pillar - b.pillar) <= 1) adjacent = true;
  const bothStem = sik.some(s => s.stem) && sal.some(s => s.stem);

  let level: Level;
  if (!sal.length || !sik.length) level = 'none';
  else if (adjacent && (bothStem || strength.strong)) level = 'clear';
  else if (adjacent || bothStem) level = 'yes';
  else level = 'weak';

  const tone: Tone = level === 'clear' || level === 'yes' ? 'good' : level === 'none' && sal.length ? 'warn' : 'flat';
  const tag = level === 'clear' ? '뚜렷함' : level === 'yes' ? '있음' : level === 'weak' ? '약함' : '없음';

  if (!sal.length) notes.push('명식에 편관(칠살)이 없습니다. 누르는 힘 자체가 약하니 막을 일도 적습니다.');
  else notes.push(`편관이 ${sal.length}자리 있습니다 — ${sal.map(s => s.where).join('·')}. 나를 시험하는 큰 판, 관재·감사·발주처의 압박이 여기에 해당합니다.`);
  if (sal.length && !sik.length) {
    notes.push(sang.length
      ? '식신은 없고 상관이 있습니다. 눌리는 힘을 맞받아치는 형태라 결과는 나오지만 부딪힘이 큽니다 — 상관합살보다 식신제살이 조용합니다.'
      : '식신이 없어 눌리는 힘을 실력으로 받아내기 어렵습니다. 인성(자격·문서)으로 돌려 푸는 쪽이 낫습니다.');
  }
  if (sal.length && sik.length) {
    notes.push(adjacent ? '식신과 편관이 가까이 붙어 있어 실제로 막아냅니다.' : '식신과 편관이 서로 떨어져 있습니다. 막는 손이 늦게 닿습니다.');
    if (bothStem) notes.push('둘 다 천간에 드러나 있어 남 눈에도 보이는 형태입니다.');
  }
  notes.push(strength.strong ? '일간이 버티는 편이라 압박을 받아낼 체력이 됩니다.' : '일간이 얇아 오래 버티기는 어렵습니다. 기한을 끄는 싸움은 피하는 편이 낫습니다.');

  const HEAD: Record<Level, string> = {
    clear: '식신제살이 뚜렷합니다',
    yes: '식신제살 구조가 있습니다',
    weak: '식신과 편관이 있으나 멀리 있습니다',
    none: sal.length ? '편관은 있으나 막을 식신이 없습니다' : '식신제살로 볼 자리가 아닙니다',
  };
  const BODY: Record<Level, string> = {
    clear: '나를 누르는 힘을 내 실력으로 눌러 넘기는 자리입니다. 관재·감사·까다로운 발주처를 실무로 정면 돌파하는 형태라, 남에게 맡기기보다 직접 챙길 때 풀립니다.',
    yes: '누르는 힘과 막는 힘이 함께 있습니다. 압박이 와도 실무로 갚아 나가는 편이 통합니다.',
    weak: '재료는 있으나 막는 손이 멀리 있습니다. 압박이 올 때 대응이 한 박자 늦기 쉬우니 미리 준비해 두는 편이 낫습니다.',
    none: sal.length
      ? '누르는 힘은 있는데 그것을 실력으로 받아낼 식신이 없습니다. 정면으로 부딪히기보다 자격·문서·사람으로 돌려 푸는 쪽이 낫습니다.'
      : '나를 크게 누르는 편관이 명식에 없습니다. 이 구조로 볼 자리가 아닙니다.',
  };

  return {
    pattern: 'jesal', level, tone, tag,
    headline: HEAD[level], body: BODY[level],
    groups: [
      { title: '편관', list: sal },
      { title: '식신', list: sik },
      { title: '상관', list: sang },
    ],
    strength, notes,
  };
}

// 식신생재는 이미 siksin.ts 가 판정한다. 화면이 쓰는 모양으로만 맞춰 준다.
export function siksinVerdict(c: Chart8): Verdict {
  const r = judgeSiksin(c);
  const tone: Tone = r.level === 'clear' || r.level === 'yes' ? 'good' : 'flat';
  const tag = r.level === 'clear' ? '뚜렷함' : r.level === 'yes' ? '있음' : r.level === 'weak' ? '약함' : '없음';
  return {
    pattern: 'siksin', level: r.level, tone, tag,
    headline: r.headline, body: r.body,
    groups: [
      { title: '식신', list: r.sik },
      { title: '상관', list: r.sang },
      { title: '재성', list: r.jae },
    ],
    strength: r.strength, notes: r.notes,
  };
}

export function verdictFor(pattern: Pattern, c: Chart8): Verdict {
  if (pattern === 'jaeda') return judgeJaeda(c);
  if (pattern === 'jesal') return judgeJesal(c);
  return siksinVerdict(c);
}
