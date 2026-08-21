// app/api/track/route.ts — 익명 조회 계측.
// 누가 봤는지는 저장하지 않는다. 무엇을(kind·slug) 언제 봤는지만 남긴다.
// IP·UA·쿠키를 기록하지 않으므로 개인정보가 쌓이지 않는다.
// 중복 억제는 클라이언트에서 하루 1회로 제한한다(lib/track.ts).
import { NextResponse } from 'next/server';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = new Set(['reading', 'ceo', 'column', 'balju', 'home']);

export async function POST(req: Request) {
  try {
    if (!adminEnabled()) return NextResponse.json({ ok: false }, { status: 204 });

    const body = await req.json().catch(() => null);
    const kind = typeof body?.kind === 'string' ? body.kind : '';
    if (!KINDS.has(kind)) return NextResponse.json({ ok: false }, { status: 400 });

    const rawSlug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    // 슬러그는 길이·문자를 제한해 쓰레기 값이 쌓이지 않게 한다.
    const slug = rawSlug && rawSlug.length <= 80 && /^[\w가-힣.-]+$/.test(rawSlug) ? rawSlug : null;

    await supabaseAdmin().from('page_views').insert({ kind, slug });
    return NextResponse.json({ ok: true });
  } catch {
    // 계측 실패가 사용자 화면에 영향을 주면 안 된다.
    return NextResponse.json({ ok: false });
  }
}
