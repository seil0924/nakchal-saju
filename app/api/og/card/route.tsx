// GET /api/og/card — 익명 공유 카드(부적/대표유형). ?score=&type=&note=&up=1
// 개인정보(이름·생일·입찰명) 없이 오늘 점수/유형/주의 한마디만 노출.
import { ImageResponse } from 'next/og';
export const runtime = 'edge';
const FONT = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.ttf';

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const score = (p.get('score') || '').slice(0, 6);       // '30' 또는 '공격형'
  const unit = p.get('unit') ?? '점';
  const type = (p.get('type') || '오늘의 투찰 신호').slice(0, 24);
  const note = (p.get('note') || '큰 건 앞에서 조급해질 때, 오늘 흐름부터.').slice(0, 60);
  const up = p.get('up') === '1';
  const accent = up ? '#e3c27a' : '#e79a86';
  let fonts: any[] = [];
  try { const d = await fetch(FONT).then(r => r.arrayBuffer()); fonts = [{ name: 'Pretendard', data: d, weight: 700 as const }]; } catch {}
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#14110c,#221b13)', padding: '64px 72px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 84, height: 84, borderRadius: 18, border: '3px solid #e3c27a', color: '#f6e7c8', fontSize: 46, background: 'linear-gradient(135deg,#a5241f,#7d1d12)', marginBottom: 26 }}>士</div>
        <div style={{ color: '#cbb98f', fontSize: 26, letterSpacing: 6, marginBottom: 14 }}>落札四柱 · 오늘의 신호</div>
        <div style={{ display: 'flex', alignItems: 'baseline', color: accent, fontSize: 132, fontWeight: 700, lineHeight: 1 }}>
          {score}<span style={{ fontSize: 46, marginLeft: 6 }}>{unit}</span>
        </div>
        <div style={{ color: '#fff', fontSize: 40, fontWeight: 700, marginTop: 18 }}>{type}</div>
        <div style={{ color: '#d8cdb4', fontSize: 28, marginTop: 20, textAlign: 'center', maxWidth: 760, lineHeight: 1.4 }}>{note}</div>
        <div style={{ color: '#8a7f66', fontSize: 24, marginTop: 34 }}>nakchalsaju.com · 내 오늘 흐름도 보기</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: 'linear-gradient(90deg,#a5862f,#e3c27a,#a5862f)' }} />
      </div>
    ),
    { width: 1080, height: 1080, fonts },
  );
}
