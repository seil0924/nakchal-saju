import type { MetadataRoute } from 'next';

// app/manifest.ts — 홈 화면에 추가할 수 있게 한다.
//
// '오늘의 사정률'은 매일 볼 이유가 있는 제품인데, 다시 부르는 길이 하나도 없었다.
// 알림톡이나 메일은 계정과 심사가 필요해 당장 못 붙인다. 홈 화면 아이콘은 계정이 필요 없다.
// start_url 을 홈이 아니라 /reading 으로 둔다 — 아이콘을 누르면 바로 오늘 것이 뜨게.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '낙찰사주 — 대표와 회사의 사주',
    short_name: '낙찰사주',
    description: '오늘의 낙찰 사정률, 회사 사주, 발주처 궁합, 택일. 만세력으로 짚습니다.',
    start_url: '/reading?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#3f6be0',
    lang: 'ko',
    categories: ['business', 'productivity', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      // ?v=2 — 첫 판이 한쪽으로 쏠려 있었다. 엣지 캐시가 옛 그림을 물고 있어 주소를 바꾼다.
      { src: '/pwa-icon?size=192&v=2', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon?size=512&v=2', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon?size=512&pad=1&v=2', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: '오늘의 사정률', short_name: '사정률', url: '/reading' },
      { name: '택일 — 좋은 날 고르기', short_name: '택일', url: '/taekil' },
      { name: '보관함', short_name: '보관함', url: '/vault' },
    ],
  };
}

