import { describe, it, expect } from 'vitest';
import { isBotRequest } from '../bot';

const S = 'same-origin';
const people: [string, string][] = [
  ['네이버 앱 안드로이드', 'Mozilla/5.0 (Linux; Android 14; SM-S911N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 NAVER(inapp; search; 2000; 12.5.0)'],
  ['네이버 앱 아이폰', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 NAVER(inapp; search; 2000; 12.5.0; 15E148)'],
  ['카카오톡 인앱', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.4.5'],
  ['다음 앱', 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36 DaumApps/6.4.0'],
  ['삼성 인터넷', 'Mozilla/5.0 (Linux; Android 14; SM-S911N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36'],
  ['아이폰 사파리', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'],
  ['윈도우 크롬', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'],
  ['맥 사파리', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'],
];
const bots: [string, string][] = [
  ['구글봇', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
  ['네이버 예티', 'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)'],
  ['다음 다음오아', 'Mozilla/5.0 (compatible; Daumoa/4.0; +http://cs.daum.net/faq/15/4118.html)'],
  ['빙봇', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
  ['카카오 링크 미리보기', 'Mozilla/5.0 (compatible; kakaotalk-scrap/1.0; +https://devtalk.kakao.com)'],
  ['페이스북 미리보기', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'],
  ['우리 점검 로봇', 'Mozilla/5.0 (Linux; Android 10) HeadlessChrome/131.0.0.0 Safari/537.36'],
  ['컬', 'curl/8.7.1'],
  ['GPT봇', 'Mozilla/5.0 (compatible; GPTBot/1.1; +https://openai.com/gptbot)'],
];

describe('isBotRequest — 사람은 세고 로봇은 뺀다', () => {
  it.each(people)('사람: %s', (_l, ua) => { expect(isBotRequest(ua, S)).toBe(false); });
  it.each(bots)('로봇: %s', (_l, ua) => { expect(isBotRequest(ua, S)).toBe(true); });
  it('UA 가 없으면 사람으로 보지 않는다', () => {
    expect(isBotRequest('', S)).toBe(true);
    expect(isBotRequest(null, S)).toBe(true);
  });
  it('브라우저가 붙이는 sec-fetch-site 가 없으면 스크립트다', () => {
    expect(isBotRequest(people[0][1], null)).toBe(true);
    expect(isBotRequest(people[0][1], 'same-origin')).toBe(false);
  });
});
