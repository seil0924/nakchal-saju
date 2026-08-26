// lib/og.ts — 공유 카드(og:image) 주소 만들기.
//
// Next 는 페이지가 openGraph 를 선언하면 부모 것을 합치지 않고 통째로 갈아치운다.
// 그래서 images 를 빠뜨린 페이지는 og:image 가 아예 없어지고, 카카오톡·네이버 블로그에
// 붙였을 때 빈 카드가 뜬다. 실제로 14개 경로가 그 상태였다 — CEO 100장과 택일 전부 포함.
// 페이지마다 이 함수를 부르면 그 페이지에 맞는 카드가 나온다. 규칙은 여기 한 곳에만 둔다.
export type OgCard = { seal?: string; k?: string; t: string; s?: string };

export function ogCard(o: OgCard) {
  const q = new URLSearchParams();
  if (o.seal) q.set('seal', o.seal);
  if (o.k) q.set('k', o.k);
  q.set('t', o.t);
  if (o.s) q.set('s', o.s);
  return [{
    url: '/api/og?' + q.toString(),
    width: 1200,
    height: 630,
    alt: o.t.replace(/\n/g, ' '),
  }];
}

// 트위터 카드는 문자열 배열만 받는다.
export function ogCardUrl(o: OgCard): string {
  return ogCard(o)[0].url;
}

