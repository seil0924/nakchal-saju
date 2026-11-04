import { NextResponse } from 'next/server';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';
import { isBotRequest } from '@/lib/bot';
import { cleanJourney, EVENTS, encodeEvent, FUNNEL_KIND } from '@/lib/funnel';
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  // Next의 내부 URL과 외부 호스트가 다른 프록시 환경에서도 실제 요청 호스트로 비교한다.
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
  if (origin) {
    try { if (new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 }); }
    catch { return NextResponse.json({ ok: false }, { status: 403 }); }
  }
  if (isBotRequest(req.headers.get('user-agent'), req.headers.get('sec-fetch-site'))) return new Response(null, { status: 204 });
  try {
    const body = await req.text();
    if (body.length > 512) return NextResponse.json({ ok: false }, { status: 400 });
    const value = JSON.parse(body), journey = cleanJourney(value.journey);
    // paid는 받지 않는다. 관리자 집계에서 실제 결제 원장과 대조한다.
    if (!journey || !EVENTS.includes(value.event)) return NextResponse.json({ ok: false }, { status: 400 });
    if (!adminEnabled()) return new Response(null, { status: 204 });
    const { error } = await supabaseAdmin().from('page_views').insert({ kind: FUNNEL_KIND, slug: encodeEvent(journey, value.event) });
    return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
  } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
}
