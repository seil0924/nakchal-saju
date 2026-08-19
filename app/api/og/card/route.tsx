// GET /api/og/card — 익명 공유 카드(부적/대표유형). ?score=&type=&note=&up=1
// 개인정보(이름·생일·입찰명) 없이 오늘 점수/유형/주의 한마디만 노출.
import { ImageResponse } from 'next/og';
export const runtime = 'edge';
const FONT = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf';

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const score = (p.get('score') || '').slice(0, 6);       // '30' 또는 '공격형'
  const unit = p.get('unit') ?? '점';
  const type = (p.get('type') || '오늘의 투찰 신호').slice(0, 24);
  const note = (p.get('note') || '큰 건 앞에서 조급해질 때, 오늘 흐름부터.').slice(0, 60);
  const up = p.get('up') === '1';
  const accent = up ? '#9ab7f5' : '#ffb4a8';
  let fonts: any[] = [];
  try { const d = await fetch(FONT).then(r => r.arrayBuffer()); fonts = [{ name: 'Pretendard', data: d, weight: 700 as const }]; } catch {}
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#3f6be0,#2646a3)', padding: '64px 72px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: 18, border: '3px solid rgba(255,255,255,0.85)', color: '#ffffff', fontSize: 46, background: '#2f56c4', marginBottom: 26 }}>落</div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 26, letterSpacing: 6, marginBottom: 14 }}>落札四柱 · 오늘의 신호</div>
        <div style={{ display: 'flex', alignItems: 'baseline', color: accent, fontSize: 132, fontWeight: 700, lineHeight: 1 }}>
          {score}<span style={{ fontSize: 46, marginLeft: 6 }}>{unit}</span>
        </div>
        <div style={{ color: '#fff', fontSize: 40, fontWeight: 700, marginTop: 18 }}>{type}</div>
        <div style={{ color: '#d9e4fb', fontSize: 28, marginTop: 20, textAlign: 'center', maxWidth: 760, lineHeight: 1.4 }}>{note}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, marginTop: 34 }}>nakchalsaju.com · 내 오늘 흐름도 보기</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#b3382c' }} />
      </div>
    ),
    { width: 1080, height: 1080, fonts },
  );
}
