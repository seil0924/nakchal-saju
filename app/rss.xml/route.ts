// GET /rss.xml — 칼럼 RSS(2026-10-27).
// 네이버 서치어드바이저는 RSS 로 새 글을 빨리 걷어 간다. 사이트맵만 있고 RSS 가 없어,
// 예약 공개되는 칼럼이 네이버에 늦게 잡혔다. 공개 시각이 지난 글만 싣는다(getAllColumns 가 거른다).
// 네이버는 이미지가 든 본문 전체를 권장한다(서치어드바이저 도움말). 요약만 싣던 것을 본문 전체로 바꿨다(2026-10-27).
// 본문이 크면 제출이 제한될 수 있어 최근 30편만 싣는다.
import { getAllColumns, getColumn } from '@/lib/column';

export const revalidate = 3600;   // 예약 글이 한 시간 안에 실리게

const BASE = 'https://nakchalsaju.com';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 본문 안의 /column/a.png, /reading 같은 상대 주소를 절대 주소로. RSS 를 읽는 쪽은 우리 도메인을 모른다.
const absolutize = (html: string) => html.replace(/(src|href)="\/(?!\/)/g, `$1="${BASE}/`);
// CDATA 안에서 ']]>' 가 나오면 끊긴다.
const cdata = (s: string) => `<![CDATA[${s.replace(/\]\]>/g, ']]]]><![CDATA[>')}]]>`;
// 'YYYY-MM-DD' 는 한국 날짜다. 그날 오전 9시(KST)로 찍는다.
const rfc822 = (ymd: string) => new Date(`${ymd}T09:00:00+09:00`).toUTCString();

// 대표 이미지 + 본문 + 원문 링크. 본문을 못 읽으면 요약 링크만.
function body(slug: string, cover?: string): string {
  const post = getColumn(slug);
  const url = `${BASE}/column/${encodeURIComponent(slug)}`;
  if (!post) return `<p><a href="${url}">원문 보기</a></p>`;
  const img = cover ? `<p><img src="${cover.startsWith('http') ? cover : BASE + cover}" alt="${esc(post.title)}" /></p>
` : '';
  return img + absolutize(post.html) + `
<p><a href="${url}">낙찰사주에서 원문 보기</a></p>`;
}

export async function GET() {
  const cols = getAllColumns().slice(0, 30);
  const items = cols.map(c => `    <item>
      <title>${esc(c.title)}</title>
      <link>${BASE}/column/${encodeURIComponent(c.slug)}</link>
      <guid isPermaLink="true">${BASE}/column/${encodeURIComponent(c.slug)}</guid>
      <description>${esc(c.description || '')}</description>
      <content:encoded>${cdata(body(c.slug, c.cover))}</content:encoded>
      <pubDate>${rfc822(c.date)}</pubDate>
${(c.tags || []).map(t => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>낙찰사주 칼럼</title>
    <link>${BASE}/column</link>
    <description>입찰·수주 대표를 위한 입찰 실무와 회사 사주 칼럼</description>
    <language>ko</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
${cols[0] ? `    <lastBuildDate>${rfc822(cols[0].date)}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } });
}
