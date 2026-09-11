// 한국 날짜. 서버(Vercel, UTC)와 브라우저(한국)가 "오늘" 을 다르게 읽으면
// 서버가 그린 택일 목록과 브라우저가 그린 목록이 달라 React 오류 #425 가 났다(2026-09-11 60명 점검,
// 한국 새벽 = 서버는 아직 어제). 오늘은 한국 기준 하나로 정하고, 날짜 문자열로 주고받는다.

export function kstYmd(d: Date = new Date()): string {
  // en-CA 는 YYYY-MM-DD 로 찍는다.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function localYmd(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// UTC 정오로 만든다 — UTC−11 ~ UTC+11 어디서 읽어도 지역 날짜와 UTC 날짜가 모두 그 날이다.
// (자정으로 만들면 한국 브라우저에서 UTC 로 읽을 때 하루 전날이 된다.)
export function dateFromYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}
