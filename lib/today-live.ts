// lib/today-live.ts — 오늘 값이 바뀌는 데이터.
// 사이트가 "살아 있다"는 인상은 방문자 수를 지어내서가 아니라
// 매일 실제로 달라지는 값을 앞에 두는 것으로 만든다. 전부 만세력 엔진에서 계산되며
// 서버·외부 API를 타지 않는다.
import { sunLong, jdn, GAN, ZHI } from '@/lib/manse-core';

// ── 24절기 ──────────────────────────────────────────
// 명리에서 절기는 태양 황경으로 정한다. 입춘 = 315°, 이후 15°씩 나아간다.
export const TERMS = [
  '입춘', '우수', '경칩', '춘분', '청명', '곡우',
  '입하', '소만', '망종', '하지', '소서', '대서',
  '입추', '처서', '백로', '추분', '한로', '상강',
  '입동', '소설', '대설', '동지', '소한', '대한',
] as const;

export const TERMS_HANJA = [
  '立春', '雨水', '驚蟄', '春分', '淸明', '穀雨',
  '立夏', '小滿', '芒種', '夏至', '小暑', '大暑',
  '立秋', '處暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
] as const;

// 해당 날짜가 '끝나는 시점'(23:59 KST)의 절기 구간 번호. 입춘 구간이 0.
// 정오로 재면 오후에 시작하는 절기를 하루 늦게 잡는다(입추·백로 등에서 실제로 어긋났다).
function termIndexOfDay(d: Date): number {
  const jd = jdn(d.getFullYear(), d.getMonth() + 1, d.getDate()) + (23.9833 - 9 - 12) / 24;
  const lam = sunLong(jd);
  return Math.floor(((((lam - 315) % 360) + 360) % 360) / 15);
}

export type NextTerm = { name: string; hanja: string; dday: number; isToday: boolean };

// 다음 절기까지 며칠 남았는지. 오늘이 절기면 dday 0.
// 절기 간격이 14~16일이라 20일만 훑으면 반드시 걸린다.
export function nextSolarTerm(now: Date = new Date()): NextTerm | null {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const at = (offset: number) => termIndexOfDay(new Date(base.getTime() + offset * 86400000));
  const today = at(0);

  // 어제와 구간이 다르면 오늘이 절기 당일이다.
  if (at(-1) !== today) {
    return { name: TERMS[today], hanja: TERMS_HANJA[today], dday: 0, isToday: true };
  }
  for (let k = 1; k <= 20; k++) {
    const idx = at(k);
    if (idx !== today) {
      return { name: TERMS[idx], hanja: TERMS_HANJA[idx], dday: k, isToday: false };
    }
  }
  return null;
}

// ── 건제십이신(建除十二神) ────────────────────────────
// 월지와 일지의 관계로 정해지는 전통 택일법. 월지와 같은 일지가 建이고
// 이후 除·滿·平… 순으로 돌아간다. 지어낸 규칙이 아니라 만세력에서 바로 나온다.
const JIANCHU = [
  { k: '建', n: '건', v: 'ok',   t: '시작에 힘이 실리는 날', b: '착수·등록·첫 접촉에 무난합니다. 큰 굴착·이전은 피합니다.' },
  { k: '除', n: '제', v: 'ok',   t: '묵은 것을 덜어내는 날', b: '정리·청산·하자 마무리에 맞습니다. 미뤄둔 서류를 터는 날.' },
  { k: '滿', n: '만', v: 'good', t: '채워지는 날',           b: '계약·개업·입고에 좋습니다. 결재선을 태우기 좋은 날.' },
  { k: '平', n: '평', v: 'ok',   t: '고르게 흐르는 날',      b: '큰 기복이 없습니다. 협의·조정·평탄한 실무에 적합합니다.' },
  { k: '定', n: '정', v: 'good', t: '자리가 굳는 날',        b: '계약 확정·취임·발주 확정에 유리합니다. 소송 제기는 미룹니다.' },
  { k: '執', n: '집', v: 'ok',   t: '쥐고 지키는 날',        b: '수금·채권 관리·기존 건 단속에 맞습니다. 신규 이동은 약합니다.' },
  { k: '破', n: '파', v: 'bad',  t: '깨지기 쉬운 날',        b: '큰 결정·계약·투찰은 미루는 편이 낫습니다. 정리·철거에만 씁니다.' },
  { k: '危', n: '위', v: 'bad',  t: '위태로운 날',           b: '무리한 확장·고위험 결정을 피합니다. 안전·점검에 힘을 씁니다.' },
  { k: '成', n: '성', v: 'good', t: '이루어지는 날',         b: '개업·계약·투찰 마무리에 가장 힘이 실립니다.' },
  { k: '收', n: '수', v: 'good', t: '거두는 날',             b: '수금·정산·입고·마감에 좋습니다. 벌이기보다 거둡니다.' },
  { k: '開', n: '개', v: 'good', t: '열리는 날',             b: '개업·발표·제안·첫 미팅에 좋습니다. 장례는 피합니다.' },
  { k: '閉', n: '폐', v: 'bad',  t: '닫히는 날',             b: '마감·봉인·보수에는 맞으나 새로 벌이기에는 약합니다.' },
] as const;

export type Taekil = {
  key: string; name: string; verdict: 'good' | 'ok' | 'bad';
  title: string; body: string; ganji: string;
};

// 오늘의 택일 — 월지·일지로 건제십이신을 뽑는다.
export function todayTaekil(mZhi: number, dZhi: number, dGan: number): Taekil {
  const i = ((dZhi - mZhi) % 12 + 12) % 12;
  const j = JIANCHU[i];
  return {
    key: j.k, name: j.n, verdict: j.v,
    title: j.t, body: j.b,
    ganji: GAN[dGan] + ZHI[dZhi],
  };
}

// 만세력 갱신 시각 표기용 — "관리되고 있는 사이트"라는 신호.
export function stampNow(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())} 기준`;
}
