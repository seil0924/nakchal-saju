// GET /pwa-icon?size=192|512&pad=1 — 홈 화면 아이콘(PNG).
//
// 안드로이드 설치 배너는 192·512 PNG 를 요구한다. SVG 하나로는 안 뜨는 기기가 있다.
// 바이너리를 리포에 넣는 대신 로고를 그려서 낸다 — 색이 바뀌면 여기 한 곳만 고치면 된다.
// maskable 은 기기가 원형·둥근사각으로 잘라내므로 안쪽 여백을 더 준다.
//
// 좌표는 100 기준이고, 그린 것이 6~94 를 채우도록 잡았다. 처음엔 원본 SVG 비율을
// 그대로 옮겼다가 아이콘이 한쪽으로 쏠렸다 — 로고는 여백을 품고 있고 아이콘은 아니다.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const BLUE = '#3f6be0';
const CREAM = '#f2ede0';
const RED = '#b3382c';

// x, y(위), h — 넷 다 아래쪽 0.94 에서 끝난다.
const BARS = [
  { x: 0.11, y: 0.54, h: 0.40 },
  { x: 0.33, y: 0.36, h: 0.58 },
  { x: 0.55, y: 0.46, h: 0.48 },
  { x: 0.77, y: 0.28, h: 0.66 },
];
const BW = 0.12;      // 막대 너비
const DOT = 0.16;     // 점 지름
const DOT_X = 0.75;   // 가장 높은 막대(0.77) 위 중앙
const DOT_Y = 0.06;

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const size = Math.min(1024, Math.max(48, Number(p.get('size')) || 512));
  const maskable = p.get('pad') === '1';
  // maskable 은 바깥 20% 가 잘려 나갈 수 있다고 보고 안쪽에만 그린다.
  const inner = maskable ? size * 0.60 : size * 0.80;
  const bw = inner * BW;

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUE }}>
        <div style={{ position: 'relative', display: 'flex', width: inner, height: inner }}>
          {BARS.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: b.x * inner, top: b.y * inner, width: bw, height: b.h * inner, borderRadius: bw / 2, background: CREAM }} />
          ))}
          <div style={{ position: 'absolute', left: DOT_X * inner, top: DOT_Y * inner, width: DOT * inner, height: DOT * inner, borderRadius: (DOT * inner) / 2, background: RED }} />
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
