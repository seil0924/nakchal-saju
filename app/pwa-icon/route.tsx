// GET /pwa-icon?size=192|512&pad=1 — 홈 화면 아이콘(PNG).
//
// 안드로이드 설치 배너는 192·512 PNG 를 요구한다. SVG 하나로는 안 뜨는 기기가 있다.
// 바이너리를 리포에 넣는 대신 로고를 그려서 낸다 — 색이 바뀌면 여기 한 곳만 고치면 된다.
// maskable 은 기기가 원형·둥근사각으로 잘라내므로 안쪽 여백(pad)을 더 준다.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const BLUE = '#3f6be0';
const CREAM = '#f2ede0';
const RED = '#b3382c';

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const size = Math.min(1024, Math.max(48, Number(p.get('size')) || 512));
  const maskable = p.get('pad') === '1';
  // maskable 은 바깥 20% 가 잘려 나갈 수 있다고 보고 안쪽에만 그린다.
  const inner = maskable ? size * 0.62 : size * 0.82;
  const bars = [
    { x: 0.06, y: 0.42, h: 0.46 },
    { x: 0.30, y: 0.27, h: 0.61 },
    { x: 0.54, y: 0.35, h: 0.53 },
    { x: 0.78, y: 0.14, h: 0.74 },
  ];
  const bw = inner * 0.14;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUE }}>
        <div style={{ position: 'relative', display: 'flex', width: inner, height: inner }}>
          {bars.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: b.x * inner, top: b.y * inner, width: bw, height: b.h * inner, borderRadius: bw / 2, background: CREAM }} />
          ))}
          <div style={{ position: 'absolute', left: 0.78 * inner - bw * 0.22, top: 0.14 * inner - bw * 1.32, width: bw * 1.4, height: bw * 1.4, borderRadius: bw, background: RED }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}

