// GET /api/cron/scoring — [Vercel Cron] 조달청 개찰결과 자동 채점 (스텁)
// 매일 개찰 이후 실행 → 나라장터 OpenAPI에서 당일 사정률 수집 →
// predictions.actual 채우고 predicted와 대조해 hit 계산 (공개 적중 기록).
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Vercel Cron 인증(선택): Authorization: Bearer ${CRON_SECRET}
  const key = process.env.DATA_GO_KR_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, note: 'DATA_GO_KR_KEY 미설정 — 스텁' });
  }
  // TODO: 나라장터 낙찰정보 OpenAPI 호출 → predictions 테이블 갱신
  //   const res = await fetch(`https://apis.data.go.kr/...&serviceKey=${key}`);
  //   ...predicted와 actual 대조, hit 저장...
  return NextResponse.json({ ok: true, scored: 0 });
}
