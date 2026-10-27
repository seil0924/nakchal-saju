// lib/column-next.ts — 칼럼을 다 읽은 대표님이 바로 다음에 누를 곳(2026-10-27).
//
// 예전엔 모든 칼럼 맨 아래에 같은 '오늘, 넣을 날인가 보기' 버튼 하나가, 관련 글 목록보다 아래에 있었다.
// 사정률 글을 읽은 사람과 동업 글을 읽은 사람이 같은 버튼을 봤다. 검색으로 들어와 글만 읽고 나가는 길이었다.
// 글의 제목과 태그로 주제를 가려, 그 주제에 맞는 무료 입구 하나(파란 버튼)와 둘째 길 하나를 고른다.
// 위에서부터 먼저 맞는 규칙을 쓴다. 순서가 곧 우선순위다(이전 글이 '계약'이란 말을 담아도 자리 사주가 먼저).
import { CLIENTS } from './clients';

export type NextStep = { href: string; title: string; sub: string };

const S = {
  sajeong: { href: '/reading?cat=sajeong', title: '오늘의 투찰 택일 무료로 보기', sub: '오늘 넣을 날인지, 앞으로 30일 중 길일은 언제인지' },
  balju: { href: '/balju', title: '발주처 궁합', sub: `공공기관 ${CLIENTS.length}곳의 설립일과 대표님 사주를 맞춰 봅니다` },
  gunghap: { href: '/reading?cat=gunghap', title: '동업·협정 궁합 무료로 보기', sub: '공동수급 상대와 손이 맞는지, 지분 다툼이 날 결인지' },
  gosa: { href: '/gosa', title: '착공 고사 축문 만들기', sub: '회사명·공사명만 넣으면 날짜 간지까지 채워 인쇄' },
  jari: { href: '/jari', title: '자리 사주 무료로 보기', sub: '지금 사무실의 문·책상 방위와 옮길 곳의 방위' },
  calendar: { href: '/reading?cat=calendar', title: '사업운 캘린더', sub: '이달 계약·발표에 좋은 날과 조심할 날을 달력으로' },
  daeun: { href: '/reading?cat=daeun', title: '회사 대운 무료로 보기', sub: '법인 설립일로 보는 회사의 큰 흐름' },
  daepyo: { href: '/reading?cat=daepyo', title: '대표 사주 무료로 보기', sub: '대표님 명식으로 승부 기질과 비어 있는 자리를' },
} satisfies Record<string, NextStep>;

const taekil = (slug: string, label: string): NextStep =>
  ({ href: `/taekil/${encodeURIComponent(slug)}`, title: `${label} 택일`, sub: '앞으로 고를 만한 날을 달력으로 봅니다' });

// 입찰 실무 글을 가르는 말. 사정률·예정가격처럼 대표님이 매주 검색하는 낱말들.
const BID = /입찰|투찰|낙찰|사정률|예정가격|기초금액|적격심사|보증금|공고|나라장터|조달|A값|복수예비|개찰|다수공급자|MAS|직접생산|지역제한|추정가격|추정금액|하자보수|하자담보|하도급|전자입찰|업역|종심제|협상에 의한|부정당|계약일반조건|경쟁제품|수의계약|계약금액|설계변경|물가변동|실적|시공능력|선금|기성|원가|유찰/;

// 주제는 제목으로 가린다. 태그는 제목에서 안 잡힐 때만 본다.
// 모든 글에 '낙찰사주' 태그가 붙어 있어 태그까지 섞으면 '낙찰' 이 전부를 입찰 글로 만들었다. 상호 태그는 뺀다.
export function nextSteps(title: string, tags: string[] = []): [NextStep, NextStep] {
  const tg = tags.filter(x => x !== '낙찰사주').join(' ');
  if (/사무실|이사 날|이사날|사옥|방위\(/.test(title)) return [S.jari, taekil('사무실이전', '사무실 이전')];
  // 2027 일간별 사업운은 '대표님 명식' 이야기다. 태그의 동업·파트너에 끌려가지 않게 먼저.
  if (/2027|정미년|신년운|세운/.test(title) && !/입찰/.test(title)) return [S.daepyo, S.sajeong];
  if (/동업|공동수급협정|공동도급 실무|지분|파트너|공동대표|각자대표|사업 궁합/.test(title)) return [S.gunghap, S.balju];
  if (/착공|기공식|고사/.test(title)) return [S.gosa, S.calendar];
  if (/발주처/.test(title)) return [S.balju, S.sajeong];
  // '회사 사주는 무엇으로 보나 · 법인 설립등기일, 사업자등록일, 개업일' 이 개업일 택일로 가지 않게 먼저 본다
  if (/회사 사주/.test(title)) return [S.daeun, taekil('법인설립일', '법인설립일')];
  if (/택일 총정리/.test(title)) return [S.calendar, taekil('개업일', '개업일')];
  if (/개업/.test(title)) return [taekil('개업일', '개업일'), S.calendar];
  if (/법인설립|설립일|설립등기/.test(title)) return [taekil('법인설립일', '법인설립일'), S.daeun];
  if (/계약일|도장|계약하면/.test(title)) return [taekil('계약일', '계약일'), S.sajeong];
  if (BID.test(title)) return [S.sajeong, S.balju];
  if (/택일|채용|면접|취임/.test(title)) return [S.calendar, S.sajeong];
  if (/교운기|대운|법인명|상호/.test(title)) return [S.daeun, S.daepyo];
  // 제목으로 못 가리면 태그로 한 번 더(입찰 실무 태그가 붙은 사주 글 등)
  if (/공공입찰|나라장터|예정가격|적격심사|사정률|투찰/.test(tg)) return [S.sajeong, S.daepyo];
  return [S.daepyo, S.sajeong];
}
