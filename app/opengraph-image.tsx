// app/opengraph-image.tsx — 모든 라우트의 기본 공유 카드.
//
// 페이지에서 openGraph 를 선언하면 Next 는 부모 것을 합치지 않고 통째로 갈아치운다.
// 그래서 CEO 100장·택일·용어사전 등 14개 경로에 og:image 가 아예 없었고,
// 카카오톡·네이버 블로그에 붙이면 빈 카드가 떴다. 공유로 퍼뜨릴 계획이 여기서 죽고 있었다.
// 파일 규칙(opengraph-image)은 metadata 선언과 별개로 하위 세그먼트 전체에 적용된다.
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '낙찰사주 — 會社 사주 전문';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf';

export default async function Image() {
  let fonts: any[] = [];
  try {
    const d = await fetch(FONT).then(r => r.arrayBuffer());
    fonts = [{ name: 'Pretendard', data: d, weight: 700 as const }];
  } catch { /* 폰트를 못 받아도 카드는 나와야 한다 */ }

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg,#3f6be0,#2646a3)', padding: '72px 84px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 34 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, height: 90, borderRadius: 20, border: '3px solid rgba(255,255,255,0.85)', color: '#ffffff', fontSize: 52, background: '#2f56c4' }}>落</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 26, letterSpacing: 4 }}>運七技三 · 會社 사주 전문</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', color: '#fff', fontSize: 62, lineHeight: 1.28, fontWeight: 700 }}>
          <div style={{ display: 'flex' }}>대표와 회사의 사주,</div>
          <div style={{ display: 'flex' }}>오늘의 낙찰 사정률부터</div>
        </div>
        <div style={{ color: '#d9e4fb', fontSize: 30, marginTop: 30 }}>만세력으로 짚는 회사 사주 · 30초 무료</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, background: '#b3382c' }} />
      </div>
    ),
    { ...size, fonts },
  );
}

