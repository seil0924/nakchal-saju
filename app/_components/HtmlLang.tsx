// 최상위 레이아웃은 <html lang="ko"> 로 고정돼 있다.
// 경로마다 다르게 하려면 레이아웃이 요청 헤더를 읽어야 하는데, 그 순간 사이트 전체가
// 정적 파일이 되지 못하고 접속마다 서버 렌더가 된다(2026-09-21, Vercel CPU 한도를 태운 원인).
//
// 그래서 영어·중국어 페이지는 세 겹으로 언어를 알린다:
//  1) 본문 래퍼 <div lang="en"> — 스크린리더가 이 안의 글을 그 언어로 읽는다(정적 HTML 에 그대로 있다)
//  2) 아래 인라인 스크립트 — 문서를 읽어 내려가는 즉시 document.documentElement.lang 을 바꾼다
//  3) 각 페이지 metadata 의 hreflang alternates
//
// 가장 정확한 방법은 /en·/zh 를 별도 루트 레이아웃(route group)으로 두는 것인데,
// 그러려면 app/ 전체를 옮겨야 하고 전역 404 가 루트 레이아웃을 잃는다. 다섯 장 때문에 치를 값이 아니다.
export default function HtmlLang({ lang }: { lang: string }) {
  return <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(lang)}` }} />;
}
