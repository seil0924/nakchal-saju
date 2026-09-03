// POST /api/review — 후기 접수.
// JS 없이 동작하는 일반 form POST 를 받는다(그래서 응답이 JSON 이 아니라 303 리다이렉트다).
// 접수된 글은 approved=false 로 들어가고, 관리자가 /admin/reviews 에서 올려야 공개된다.
import { NextResponse } from 'next/server';
import { validateReview } from '@/lib/reviews';
import { insertReview } from '@/lib/reviews-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const back = (req: Request, q: string) =>
  NextResponse.redirect(new URL(`/review?${q}`, req.url), 303);

export async function POST(req: Request) {
  try {
    const f = await req.formData();

    // 허니팟 — 사람 눈에 안 보이는 칸이라 채워져 있으면 봇이다.
    // 조용히 성공한 척 돌려보낸다(막혔다는 걸 알려주면 우회한다).
    if (String(f.get('company') || '').trim()) return back(req, 'sent=1');

    const v = validateReview({
      nickname: f.get('nickname'), biz: f.get('biz'),
      rating: f.get('rating'), body: f.get('body'),
    });
    if (!v.ok || !v.value) return back(req, `err=${encodeURIComponent(v.reason)}`);

    const ok = await insertReview(v.value);
    return back(req, ok ? 'sent=1' : 'err=' + encodeURIComponent('지금은 접수가 안 됩니다. 잠시 후 다시 시도해 주세요.'));
  } catch {
    return back(req, 'err=' + encodeURIComponent('접수 중 문제가 생겼습니다.'));
  }
}
