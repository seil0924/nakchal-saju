// lib/bot.ts — 조회 계측에서 사람과 로봇을 가른다.
//
// 왜 이 파일이 따로 있나(2026-09-28):
//   예전 규칙은 UA 에 naver·daum·google 이라는 낱말이 들어가면 로봇으로 봤다.
//   그런데 네이버 앱 안의 브라우저는 UA 끝에 'NAVER(inapp; search; ...)' 를 붙인다 —
//   즉 네이버 검색으로 들어온 **진짜 손님이 전부 로봇으로 걸러지고 있었다.**
//   GA 에는 네이버 유입이 1위로 찍히는데 우리 관리자 조회수는 비어 있던 이유다.
//   그래서 크롤러는 이름을 정확히 적어 거른다. 애매하면 사람으로 본다 —
//   사람을 못 세는 것이 로봇을 조금 세는 것보다 나쁘다.
//
// 봇을 걸러야 하는 이유는 그대로다: 크롤러가 사이트맵을 한 번 훑으면 칼럼 124편에
// 한 번씩 찍혀, 사람이 읽은 것처럼 보이는 숫자가 만들어진다(2026-08-27).

// 자기를 밝히는 크롤러·스크래퍼. 이름을 정확히 적는다.
const BOT = new RegExp([
  // 검색엔진
  'googlebot', 'googleother', 'google-inspectiontool', 'storebot-google', 'adsbot-google',
  'mediapartners-google', 'feedfetcher-google', 'apis-google', 'google-read-aloud',
  'bingbot', 'bingpreview', 'adidxbot', 'yeti', 'naverbot', 'daumoa', 'yandexbot',
  'baiduspider', 'duckduckbot', 'applebot', 'petalbot', 'seznambot', 'exabot', 'sogou',
  // AI·수집
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web', 'anthropic-ai',
  'ccbot', 'perplexitybot', 'perplexity-user', 'bytespider', 'amazonbot', 'meta-externalagent',
  // SEO 도구
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'rogerbot', 'screaming frog',
  // 메신저·SNS 미리보기 (사람이 아니라 링크 카드 생성기)
  'facebookexternalhit', 'twitterbot', 'linkedinbot', 'slackbot', 'discordbot',
  'telegrambot', 'whatsapp', 'embedly', 'skypeuripreview', 'kakaotalk-scrap',
  'pinterest', 'vkshare', 'quora link preview', 'redditbot',
  // 자동화·감시 도구
  'headlesschrome', 'phantomjs', 'puppeteer', 'playwright', 'lighthouse', 'chrome-lighthouse',
  'pingdom', 'uptimerobot', 'statuscake', 'site24x7', 'newrelicpinger',
  // 스크립트 클라이언트
  'curl/', 'wget/', 'python-requests', 'python-urllib', 'axios/', 'node-fetch',
  'go-http-client', 'okhttp', 'java/', 'libwww-perl', 'scrapy',
  // 남은 일반형 — 위에 없는 크롤러도 대개 이 낱말을 쓴다
  'crawler', 'spider', 'slurp', '\\bbot\\b', 'bot/', 'bot;',
].join('|'), 'i');

/**
 * 계측에서 뺄 요청인가.
 * @param ua        User-Agent 헤더 (판별에만 쓰고 저장하지 않는다)
 * @param secSite   sec-fetch-site 헤더 — 진짜 브라우저의 fetch/sendBeacon 에는 붙는다
 */
export function isBotRequest(ua: string | null | undefined, secSite?: string | null): boolean {
  const s = (ua || '').trim();
  if (!s) return true;                 // UA 없는 요청은 사람으로 보지 않는다
  if (BOT.test(s)) return true;
  if (!secSite) return true;           // 브라우저가 붙이는 헤더가 없으면 스크립트다
  return false;
}
