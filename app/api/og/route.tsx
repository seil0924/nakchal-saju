// GET /api/og — 동적 OG 카드 (먹빛·금박). ?seal=&k=&t=&s= 로 개인화.
import { ImageResponse } from 'next/og';
export const runtime = 'edge';
const FONT = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf';

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const seal = p.get('seal') || '落';
  const kicker = p.get('k') || '運七技三 · 會社 사주 전문';
  const title = (p.get('t') || '대표와 회사의 사주,\n오늘의 낙찰 사정률부터').replace(/<br\/?>/g, '\n');
  const sub = p.get('s') || '만세력으로 짚는 회사 사주 · 30초 무료';
  let fonts: any[] = [];
  try { const d = await fetch(FONT).then(r => r.arrayBuffer()); fonts = [{ name: 'Pretendard', data: d, weight: 700 as const }]; } catch {}
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg,#3f6be0,#2646a3)', padding: '72px 84px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: 20, border: '3px solid rgba(255,255,255,0.85)', color: '#ffffff', fontSize: 52, background: '#2f56c4' }}>{seal}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 26, letterSpacing: 4 }}>{kicker}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', color: '#fff', fontSize: 62, lineHeight: 1.28, fontWeight: 700 }}>
          {title.split('\n').map((line, i) => <div key={i} style={{ display: 'flex' }}>{line}</div>)}
        </div>
        <div style={{ color: '#d9e4fb', fontSize: 30, marginTop: 30 }}>{sub}</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#b3382c' }} />
      </div>
    ),
    { width: 1200, height: 630, fonts },
  );
}
