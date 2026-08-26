import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { TYCOONS, tycoonSlug } from '@/lib/tycoon';

export const metadata: Metadata = {
  title: '나와 닮은 세계적 CEO는?',
  description: '생년월일만 넣으면 30초. 잡스·록펠러·샤넬 등 세계 거장 100인 중 당신의 사주와 가장 닮은 대표를 무료로 찾아 드립니다.',
  alternates: { canonical: '/ceo' },
  openGraph: {
    title: '나와 닮은 세계적 CEO는? · 낙찰사주',
    description: '세계 거장 100인 중, 당신의 사주와 가장 닮은 대표는 누구일까요?',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: [{ url: '/api/og?seal=%E9%8F%A1&k=%E9%8F%A1%20%C2%B7%20%EB%8B%AE%EC%9D%80%20%EC%82%AC%EC%A3%BC&t=%EB%82%98%EC%99%80%20%EB%8B%AE%EC%9D%80%20%EC%84%B8%EA%B3%84%EC%A0%81%20CEO%EB%8A%94%3F&s=%EA%B1%B0%EC%9E%A5%20100%EC%9D%B8%20%C3%97%20%EB%82%B4%20%EC%82%AC%EC%A3%BC%20%C2%B7%2030%EC%B4%88%20%EB%AC%B4%EB%A3%8C', width: 1200, height: 630, alt: '나와 닮은 세계적 CEO — 낙찰사주' }],
  },
};

// 거장 100인 색인. /ceo 는 입력 폼뿐이라 상세 100장으로 가는 링크가 하나도 없었다 —
// 그래서 구글이 몇 장밖에 못 찾았고, 정작 그 페이지들이 사이트에서 클릭률이 제일 높다.
// 목록을 여기 두면 상세 페이지(같은 layout)에는 안 나오고 인덱스에서만 크롤링 진입점이 생긴다.
function TycoonIndex() {
  return (
    <nav aria-label="세계 거장 100인" style={{ padding: '4px 18px 28px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '18px 0 4px' }}>
        세계 거장 100인
      </h2>
      <p style={{ fontSize: 12.5, color: '#6f6650', lineHeight: 1.6, margin: '0 0 12px' }}>
        이름을 누르면 그 사람의 명식과 이야기를 볼 수 있습니다. 대표님과 닮은 정도는 위에서 생년월일만 넣으면 30초입니다.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {TYCOONS.map(t => (
          <Link key={t.name} href={`/ceo/${tycoonSlug(t.name)}`}
            style={{ fontSize: 12.5, fontWeight: 700, color: '#2f56c4', background: '#faf6ec',
              border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' }}>
            {t.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function CeoLayout({ children }: { children: React.ReactNode }) {
  // 미들웨어가 넘긴 경로로 인덱스인지 상세인지 가른다. 상세에는 이미 다른 거장 칩이 있다.
  const isIndex = (headers().get('x-nk-path') || '') === '/ceo';
  return (
    <>
      {children}
      {isIndex ? (
        <>
          {/* .app 이 min-height:100vh 라 목록 앞에 355px 짜리 빈 구멍이 생긴다.
              목록이 붙으면 화면은 이미 넘치니 인덱스에서만 풀어 준다. */}
          {/* .home.app 이 0-2-0 이라 .app 하나로는 못 이긴다. 클래스를 겹쳐 특이도를 맞추고 순서로 이긴다. */}
          <style>{`.home.app,.app.app{min-height:auto}`}</style>
          <TycoonIndex />
        </>
      ) : null}
    </>
  );
}
