// lib/reviews-db.ts — 후기 저장·조회 (서버 전용).
// 테이블은 supabase/reviews.sql 을 한 번 실행해야 생긴다. 그 전에는 조용히 빈 목록을
// 돌려주고 화면이 "아직 준비 중"이라고 말한다 — page_views·fail_reason 때와 같은 방식이다.
import 'server-only';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';
import type { Review, ReviewInput } from '@/lib/reviews';

export type ReviewRow = Review & { approved: boolean; source?: string | null };

/** 관리자가 받은 경로 — 옮겨 적은 후기는 어디서 받았는지가 남아야 한다. */
export const SOURCES = ['전화', '카카오톡', '문자', '이메일', '방문·대면', '기타'] as const;

/** 공개용 — 승인된 것만. ready=false 면 테이블이 아직 없다. */
export async function listPublicReviews(limit = 50): Promise<{ ready: boolean; rows: Review[] }> {
  if (!adminEnabled()) return { ready: false, rows: [] };
  try {
    const { data, error } = await supabaseAdmin()
      .from('reviews').select('id,nickname,biz,rating,body,created_at')
      .eq('approved', true).order('created_at', { ascending: false }).limit(limit);
    if (error) return { ready: false, rows: [] };
    return { ready: true, rows: (data ?? []) as Review[] };
  } catch { return { ready: false, rows: [] }; }
}

/** 관리자용 — 승인 대기까지 전부. */
export async function listAllReviews(limit = 200): Promise<{ ready: boolean; rows: ReviewRow[] }> {
  if (!adminEnabled()) return { ready: false, rows: [] };
  try {
    const { data, error } = await supabaseAdmin()
      .from('reviews').select('id,nickname,biz,rating,body,created_at,approved,source')
      .order('created_at', { ascending: false }).limit(limit);
    if (error) return { ready: false, rows: [] };
    return { ready: true, rows: (data ?? []) as ReviewRow[] };
  } catch { return { ready: false, rows: [] }; }
}

/** 후기 접수. 기본은 숨김(approved=false) — 관리자가 올려야 보인다. */
export async function insertReview(v: ReviewInput): Promise<boolean> {
  if (!adminEnabled()) return false;
  try {
    const { error } = await supabaseAdmin().from('reviews').insert({
      nickname: v.nickname, biz: v.biz || null, rating: v.rating, body: v.body, approved: false,
    });
    return !error;
  } catch { return false; }
}

/**
 * 관리자 직접 입력. 전화·카톡으로 받은 후기를 옮겨 적는 자리다.
 * 바로 게시(approved=true)하고, 받은 경로와 받은 날짜를 함께 남긴다.
 */
export async function insertAdminReview(
  v: ReviewInput, source: string, receivedAt?: string,
): Promise<boolean> {
  if (!adminEnabled()) return false;
  try {
    const row: Record<string, unknown> = {
      nickname: v.nickname, biz: v.biz || null, rating: v.rating, body: v.body,
      approved: true, source: source || '기타',
    };
    // 받은 날짜를 주면 그날로 박는다 — 오늘로 찍히면 언제 받은 후기인지 사라진다.
    if (receivedAt && /^\d{4}-\d{2}-\d{2}$/.test(receivedAt)) row.created_at = `${receivedAt}T09:00:00+09:00`;
    const { error } = await supabaseAdmin().from('reviews').insert(row);
    return !error;
  } catch { return false; }
}

export async function deleteReview(id: number): Promise<boolean> {
  if (!adminEnabled()) return false;
  try {
    const { error } = await supabaseAdmin().from('reviews').delete().eq('id', id);
    return !error;
  } catch { return false; }
}

export async function setApproved(id: number, approved: boolean): Promise<boolean> {
  if (!adminEnabled()) return false;
  try {
    const { error } = await supabaseAdmin().from('reviews').update({ approved }).eq('id', id);
    return !error;
  } catch { return false; }
}
