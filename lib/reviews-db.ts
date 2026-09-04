// lib/reviews-db.ts — 후기 저장·조회 (서버 전용).
//
// **왜 실패 사유를 들고 다니는가.** 처음엔 실패하면 조용히 빈 목록을 돌려줬다. 그랬더니
// 후기가 접수는 되는데 관리자 화면에는 안 보이는 상태에서, 화면이 "표가 아직 없습니다"만
// 말하고 진짜 이유를 삼켰다. 무엇이 틀렸는지 못 보면 고칠 수가 없다.
// 그래서 이제 why 를 같이 돌려주고, 관리자 화면이 그걸 그대로 띄운다.
import 'server-only';
import { adminEnabled, supabaseAdmin } from '@/lib/supabase/admin';
import type { Review, ReviewInput } from '@/lib/reviews';

export type ReviewRow = Review & { approved: boolean; source?: string | null };

/** 관리자가 받은 경로 — 옮겨 적은 후기는 어디서 받았는지가 남아야 한다. */
export const SOURCES = ['전화', '카카오톡', '문자', '이메일', '방문·대면', '기타'] as const;

const NO_KEY = 'Supabase 서비스 키가 이 환경에 없습니다 (SUPABASE_SERVICE_ROLE_KEY).';

/** 공개용 — 승인된 것만. ready=false 면 why 에 이유가 담긴다. */
export async function listPublicReviews(limit = 50): Promise<{ ready: boolean; rows: Review[]; why: string }> {
  if (!adminEnabled()) return { ready: false, rows: [], why: NO_KEY };
  try {
    const { data, error } = await supabaseAdmin()
      .from('reviews').select('id,nickname,biz,rating,body,created_at')
      .eq('approved', true).order('created_at', { ascending: false }).limit(limit);
    if (error) return { ready: false, rows: [], why: error.message };
    return { ready: true, rows: (data ?? []) as Review[], why: '' };
  } catch (e: any) { return { ready: false, rows: [], why: String(e?.message || e) }; }
}

/**
 * 관리자용 — 승인 대기까지 전부.
 * source 는 나중에 붙인 컬럼이라, 그것 때문에 조회가 통째로 실패하면 안 된다.
 * 실패하면 source 를 빼고 한 번 더 시도한다 — 후기 목록이 컬럼 하나에 인질로 잡히지 않게.
 */
export async function listAllReviews(limit = 200): Promise<{ ready: boolean; rows: ReviewRow[]; why: string }> {
  if (!adminEnabled()) return { ready: false, rows: [], why: NO_KEY };
  const run = async (cols: string) => supabaseAdmin()
    .from('reviews').select(cols).order('created_at', { ascending: false }).limit(limit);
  try {
    let { data, error } = await run('id,nickname,biz,rating,body,created_at,approved,source');
    let why = '';
    if (error) {
      why = `source 컬럼 없이 다시 읽었습니다 — supabase/reviews-source.sql 을 아직 안 돌리신 듯합니다. (${error.message})`;
      ({ data, error } = await run('id,nickname,biz,rating,body,created_at,approved'));
      if (error) return { ready: false, rows: [], why: error.message };
    }
    return { ready: true, rows: (data ?? []) as unknown as ReviewRow[], why };
  } catch (e: any) { return { ready: false, rows: [], why: String(e?.message || e) }; }
}

/** 후기 접수. 기본은 숨김(approved=false) — 관리자가 올려야 보인다. */
export async function insertReview(v: ReviewInput): Promise<{ ok: boolean; why: string }> {
  if (!adminEnabled()) return { ok: false, why: NO_KEY };
  try {
    const { error } = await supabaseAdmin().from('reviews').insert({
      nickname: v.nickname, biz: v.biz || null, rating: v.rating, body: v.body, approved: false,
    });
    if (error) console.error('[review] insert 실패:', error.message);
    return { ok: !error, why: error?.message || '' };
  } catch (e: any) {
    console.error('[review] insert 예외:', e?.message);
    return { ok: false, why: String(e?.message || e) };
  }
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
