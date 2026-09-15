// 조사 고르기 — 변수로 들어오는 낱말(회사명·오행 한자·간지·숫자) 뒤의 은/는·이/가·을/를·과/와·으로/로.
// "대한건설는", "火이 회사를" 처럼 고정 조사가 받침과 어긋나 화면에 찍혔다(2026-09-15).
// 한자는 읽는 소리로 받침을 본다(木 목 → 받침 있음, 火 화 → 없음).

const READ: Record<string, string> = {
  木: '목', 火: '화', 土: '토', 金: '금', 水: '수',
  甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무', 己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
  子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사', 午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
};
const DIGIT = '영일이삼사오육칠팔구';

/** 마지막 소리의 받침: 'none' 없음 · 'rieul' ㄹ 받침 · 'other' 그 밖의 받침 */
function tail(word: string): 'none' | 'rieul' | 'other' {
  const s = String(word ?? '').replace(/<[^>]*>/g, '').replace(/[\s)\]」』"'’.,·]+$/, '');
  let ch = s.slice(-1);
  if (READ[ch]) ch = READ[ch];
  else if (/[0-9]/.test(ch)) ch = DIGIT[+ch];
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return 'none';   // 영문·기호는 받침 없음으로 읽는다
  const jong = (code - 0xac00) % 28;
  return jong === 0 ? 'none' : jong === 8 ? 'rieul' : 'other';
}

type Particle = '은' | '는' | '이' | '가' | '을' | '를' | '과' | '와' | '으로' | '로';

/** josa('대한건설', '는') → '은' · josa('火', '이') → '가' · josa('물', '으로') → '로' */
export function josa(word: string, p: Particle): string {
  const t = tail(word);
  switch (p) {
    case '은': case '는': return t === 'none' ? '는' : '은';
    case '이': case '가': return t === 'none' ? '가' : '이';
    case '을': case '를': return t === 'none' ? '를' : '을';
    case '과': case '와': return t === 'none' ? '와' : '과';
    case '으로': case '로': return t === 'none' || t === 'rieul' ? '로' : '으로';
  }
}
