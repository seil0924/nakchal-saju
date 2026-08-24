// lib/taek-report.ts — 자리 사주(宅) 유료 섹션 본문.
//
// 좌표를 받지 않는다. /jari 에서 이미 잰 방위각과 거리만 넘겨받는다.
// 브이월드 이용조건상 지오코더 응답은 저장할 수 없는데, 리포트는 보관함에 남는다.
// 각도와 거리는 우리가 낸 값이라 남겨도 된다 — 이 구분이 이 파일의 존재 이유다.
import { DIR8, dirOf, yearCaution, favorDir, nextClearYear, moveDays } from '@/lib/taek-map';
import { guaOf, houseHarmony, biboFor, deskAdvice } from '@/lib/taek-house';
import { OH_HANJA, OH_NAME } from '@/lib/balju-map';

export type JariInput = {
  deg?: number | null;      // 지금 자리 → 옮길 자리 방위각(도)
  km?: number | null;       // 두 자리 사이 거리
  door?: number | null;     // 출입문 방위 0~7
  desk?: number | null;     // 대표 자리 방위 0~7
  from?: string;            // 대표님이 적어 넣은 지금 자리
  to?: string;              // 옮길 자리
};

// 시진 — 하루를 열둘로 나눈 옛 시간.
const SIJIN = [
  ['자시', '23:00~01:00'], ['축시', '01:00~03:00'], ['인시', '03:00~05:00'], ['묘시', '05:00~07:00'],
  ['진시', '07:00~09:00'], ['사시', '09:00~11:00'], ['오시', '11:00~13:00'], ['미시', '13:00~15:00'],
  ['신시', '15:00~17:00'], ['유시', '17:00~19:00'], ['술시', '19:00~21:00'], ['해시', '21:00~23:00'],
];

// 그날 일지와 육합(六合)을 이루는 시진. 子丑·寅亥·卯戌·辰酉·巳申·午未 여섯 짝이다.
export function hourFor(dZhi: number): { idx: number; name: string; span: string; night: boolean } {
  const i = ((dZhi % 12) + 12) % 12;
  const p = (13 - i) % 12;
  const [name, span] = SIJIN[p];
  // 밤 시진이 걸리는 날이 절반쯤 된다. 좋은 시라고 새벽에 짐을 옮길 수는 없으니 따로 알린다.
  const night = p <= 2 || p >= 10;
  return { idx: p, name, span, night };
}

const esc = (s: string) => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
const cut = (s: string | undefined, n = 40) => esc((s || '').trim()).slice(0, n);

export type TaekSection = { t: string; html: string; teaser: string };

export function taekSection(
  j: JariInput,
  weakEl: number,
  dZhi: number,
  year: number,
  from: Date = new Date(),
): TaekSection {
  const P: string[] = [];
  const el = ((weakEl % 5) + 5) % 5;
  const elTxt = `<b>${OH_HANJA[el]}(${OH_NAME[el]})</b>`;

  // ── 지금 자리 ──
  const hasHouse = j.door != null && j.desk != null;
  const h = hasHouse ? houseHarmony(j.door as number, j.desk as number) : null;
  if (h) {
    P.push(`<p><b>${esc(h.title)}</b> ${esc(h.body)}</p>`);
    if (h.level === 'good') {
      P.push('<p>이 배치는 손대지 않아도 됩니다. 자리를 바꾸는 것보다 <b>지금 자리를 지키는 편</b>이 낫습니다.</p>');
    } else if (h.line) {
      P.push(`<p>문과 자리가 <b>일직선</b>입니다. 문을 열 때마다 드나드는 기운이 대표님 등이나 정면으로 곧장 닿습니다. 자리를 옆으로 한 칸만 물려도 직선이 깨집니다 — 벽을 뚫는 공사보다 <b>책상을 옮기는 쪽</b>이 먼저입니다.</p>`);
    } else {
      const g = guaOf(j.desk as number);
      const same = DIR8.filter((_, i) => guaOf(i).sataek === h.door.sataek).join('·');
      P.push(`<p>지금 자리는 ${esc(g.dir)}(${esc(g.gua)})이라 문과 사택이 갈립니다. 같은 사택은 <b>${esc(same)}</b>입니다 — 이 넷 중 한 쪽으로 책상을 돌리는 것이 가장 적은 비용으로 맞추는 길입니다.</p>`);
    }
  }

  // ── 모자란 기운과 자리 ──
  const adv = deskAdvice(el);
  P.push(`<p>대표님 명식에서 가장 얇은 기운은 ${elTxt}입니다. 이 기운은 <b>${esc(adv.main.dir)}</b>쪽에서 들어옵니다. 창이나 구조 때문에 어렵다면 <b>${esc(adv.alt.dir)}</b>도 같은 결입니다. 자리를 통째로 옮기기 어려우면 <b>바라보는 방향</b>만이라도 그쪽으로 두십시오.</p>`);

  // ── 비보 물건 ──
  const bibo = biboFor(el, h ?? undefined);
  P.push('<p><b>사무실에 두면 좋은 것</b> — 값이 아니라 놓는 자리가 값을 합니다.</p>');
  for (const b of bibo) {
    P.push(`<div class="ssrow"><b>${esc(b.item)}</b> · ${esc(b.where)}<br /><span>${esc(b.why)}</span></div>`);
  }

  // ── 옮길 자리 ──
  if (j.deg != null && Number.isFinite(j.deg)) {
    const { idx, name } = dirOf(j.deg as number);
    const c = yearCaution(year);
    const fav = favorDir(el);
    const isDae = idx === c.daejanggun, isSam = idx === c.samsal;
    const isFav = idx === fav.main || idx === fav.alt;
    const clear = (isDae || isSam) ? nextClearYear(idx, year + 1) : null;
    const where = j.from && j.to ? `${cut(j.from)}에서 ${cut(j.to)}으로 — ` : '';
    const dist = j.km != null && Number.isFinite(j.km) ? ` <b>${Math.round((j.km as number) * 10) / 10}km</b>` : '';
    P.push(`<p><b>옮길 자리는 ${esc(name)}쪽입니다.</b> ${where}지금 자리에서 ${esc(name)}으로 ${Math.round((j.deg as number) * 10) / 10}도,${dist} 떨어져 있습니다.</p>`);
    if (isDae || isSam) {
      const which = isDae && isSam ? '대장군방(大將軍方)과 삼살방(三殺方)이 겹치는 자리' : isDae ? '대장군방(大將軍方)' : '삼살방(三殺方)';
      P.push(`<p>${year}년 기준으로 ${esc(name)}쪽은 <b>${which}</b>입니다. 예부터 이 해에는 이 방면으로 크게 움직이지 말라고 보았습니다. 다만 이것은 <b>못 간다는 뜻이 아니라 서두르지 말라는 뜻</b>입니다. 계약이 이미 잡혀 있다면 못 갈 이유로 삼지 마시고, 아직 고르는 중이라면 한 번 더 견주어 보시라는 정도로 읽으십시오.</p>`);
      if (clear) P.push(`<p>이 방면은 <b>${clear}년</b>에 풀립니다. 급하지 않은 이전이라면 그해로 미루는 것도 방법입니다.</p>`);
    } else if (isFav) {
      P.push(`<p>${esc(name)}쪽은 대표님께 모자란 ${elTxt} 기운이 들어오는 방면이고, ${year}년에 조심하라 본 방면에도 걸리지 않습니다. <b>결이 맞는 이전</b>입니다.</p>`);
    } else {
      P.push(`<p>${esc(name)}쪽은 ${year}년에 조심하라 본 방면이 아닙니다. 대표님 기운을 특별히 채워 주는 쪽도 아니니, <b>방위 때문에 미룰 이유는 없는 자리</b>로 보시면 됩니다.</p>`);
    }
    P.push(`<p>참고로 ${year}년에 예부터 조심하라 본 방면은 대장군방 <b>${esc(DIR8[c.daejanggun])}</b>, 삼살방 <b>${esc(DIR8[c.samsal])}</b>입니다.</p>`);
  } else {
    P.push('<p>옮길 곳 주소를 아직 넣지 않으셨습니다. 자리 사주 화면에서 두 주소를 넣으면 방위와 거리까지 함께 봅니다.</p>');
  }

  // ── 택일 ──
  const days = moveDays(from, 90);
  P.push('<p><b>앞으로 석 달, 옮기기 좋은 날</b> — 건제십이신의 만(滿)·정(定)·성(成)·개(開)에 드는 날만 골랐습니다. 성(成)이 가장 힘이 실립니다.</p>');
  for (const d of days) {
    P.push(`<div class="ssrow"><b>${d.month}월 ${d.day}일 (${d.dow})</b> · ${d.ganji} · ${d.key}(${d.name})<br /><span>${esc(d.why)}</span></div>`);
  }

  const hr = hourFor(dZhi);
  P.push(`<p>시간은 대표님 일지와 육합을 이루는 <b>${esc(hr.name)} ${esc(hr.span)}</b>가 결이 맞습니다.${hr.night ? ' 다만 밤 시진이라 실제로 짐을 옮기기는 어렵습니다. 그럴 때는 <b>해 뜬 뒤부터 오후 세 시 전</b>에 마치는 것으로 갈음하십시오 — 옛 기록도 이사는 양기가 남아 있을 때 끝내라 하였습니다.' : ' 이 시간대에 짐을 다 들이고 마치면 됩니다.'}</p>`);

  P.push('<p class="note">방위는 두 자리의 대권 방위각으로, 택일은 절기로 잡은 월지와 일지의 건제십이신으로 가렸습니다. 대장군방·삼살방은 <b>예부터 조심하라 본 자리</b>일 뿐 금기가 아닙니다. 계약·임대 조건이 먼저이고, 이 글은 그 위에 얹는 참고입니다.</p>');

  const teaser = h
    ? `${h.title} — 지금 자리에 둘 물건 ${bibo.length}가지와, 옮길 자리의 방위·거리·이사 택일 ${days.length}일을 함께 봅니다.`
    : `옮길 자리의 방위와 거리, 이사에 좋은 날 ${days.length}일, 사무실에 둘 물건까지 짚어 드립니다.`;

  return { t: '자리 사주 — 지금 자리와 옮길 자리', html: P.join('\n'), teaser };
}
