// GET /rss.xml — 칼럼 RSS(2026-10-27).
// 네이버 서치어드바이저는 RSS 로 새 글을 빨리 걷어 간다. 사이트맵만 있고 RSS 가 없어,
// 예약 공개되는 칼럼이 네이버에 늦게 잡혔다. 공개 시각이 지난 글만 싣는다(getAllColumns 가 거른다).
import { getAllColumns } from '@/lib/column';

export const revalidate = 3600;   // 예약 글이 한 시간 안에 실리게

const BASE = 'https://nakchalsaju.com';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// 'YYYY-MM-DD' 는 한국 날짜다. 그날 오전 9시(KST)로 찍는다.
const rfc822 = (ymd: string) => new Date(`${ymd}T09:00:00+09:00`).toUTCString();

export async function GET() {
  const cols = getAllColumns().slice(0, 50);
  const items = cols.map(c => `    <item>
      <title>${esc(c.title)}</title>
      <link>${BASE}/column/${encodeURIComponent(c.slug)}</link>
      <guid isPermaLink="true">${BASE}/column/${encodeURIComponent(c.slug)}</guid>
      <description>${esc(c.description || '')}</description>
      <pubDate>${rfc822(c.date)}</pubDate>
${(c.tags || []).map(t => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
