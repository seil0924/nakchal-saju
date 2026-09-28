// app/api/track/route.ts — 익명 조회 계측.
// 누가 봤는지는 저장하지 않는다. 무엇을(kind·slug) 언제 봤는지만 남긴다.
// IP·UA·쿠키를 기록하지 않으므로 개인정보가 쌓이지 않는다.
// 중복 억제는 클라이언트에서 하루 1회로 제한한다(lib/track.ts).
//
// ★봇을 거른다 — 왜 필요했는지 남겨 둔다.
//   칼럼 133회, 나와 닮은 CEO 116회가 찍혔는데 사이트맵의 그 계열 URL 수가 각각 124개, 101개였다.
//   사람은 칼럼 124편에 고르게 흩어지지 않는다. URL 하나당 한 번씩 찍힌 그 모양은
//   크롤러가 사이트맵을 훑은 자국이다. 서치콘솔 클릭 수와도 전혀 맞지 않았다.
//   lib/track.ts 의 중복 방지는 localStorage 라 크롤러에는 통하지 않는다 — 올 때마다 새 방문자가 된다.
//   그래서 여기서 막는다. UA 는 판별에만 쓰고 저장하지 않는다(개인정보는 그대로 안 쌓인다).
//
//   ★2026-09-28 — 그 규칙이 'naver' 라는 낱말만 보고 **네이버 앱으로 들어온 진짜 손님**까지
//   전부 버리고 있었다. GA 1위 유입이 네이버인데 관리자 조회수는 비어 있던 이유다.
//   판별은 lib/bot.ts 로 옮기고 크롤러 이름을 정확히 적는다.
import { NextResponse } from 'next/server';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';
import { isSrc } from '@/lib/track-src';
import { isBotRequest } from '@/lib/bot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = new Set(['reading', 'ceo', 'column', 'balju', 'home',
  'product', 'glossary', 'why', 'saju', 'region', 'industry', 'taekil', 'tool']);

export async function POST(req: Request) {
  try {
    if (!adminEnabled()) return NextResponse.json({ ok: false }, { status: 204 });
    // 봇이면 조용히 무시한다. 200 을 돌려줘야 크롤러가 재시도하지 않는다.
    if (isBotRequest(req.headers.get('user-agent'), req.headers.get('sec-fetch-site'))) return NextResponse.json({ ok: true, skipped: 'bot' });

    const body = await req.json().catch(() => null);
    const kind = typeof body?.kind === 'string' ? body.kind : '';
    if (!KINDS.has(kind)) return NextResponse.json({ ok: false }, { status: 400 });

    const rawSlug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    // 슬러그는 길이·문자를 제한해 쓰레기 값이 쌓이지 않게 한다.
    const slug = rawSlug && rawSlug.length <= 80 && /^[\w가-힣.-]+$/.test(rawSlug) ? rawSlug : null;

    // 유입원은 클라이언트가 정해서 보낸다(document.referrer 는 서버에서 볼 수 없다).
    // 목록에 없는 값은 버린다 — 남이 보내는 값이라 그대로 저장하면 표가 오염된다.
    const src = isSrc(body?.src) ? body.src : null;

    // src 컬럼은 마이그레이션(supabase/page_views_src.sql)을 돌려야 생긴다.
    // 아직 없는 환경에서 통째로 실패하면 계측 자체가 멎으므로, 실패하면 src 없이 한 번 더 넣는다.
    const sb = supabaseAdmin();
    const { error } = await sb.from('page_views').insert({ kind, slug, src });
    if (error) await sb.from('page_views').insert({ kind, slug });
    return NextResponse.json({ ok: true });
  } catch {
    // 계측 실패가 사용자 화면에 영향을 주면 안 된다.
    return NextResponse.json({ ok: false });
  }
}
