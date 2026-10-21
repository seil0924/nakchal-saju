import Link from 'next/link';
import { TYCOONS, tycoonSlug, isKorean } from '@/lib/tycoon';

// 거장 색인. /ceo 는 입력 폼뿐이라 상세 페이지로 가는 링크가 하나도 없었다.
// 그래서 구글이 몇 장밖에 못 찾았고, 정작 그 페이지들이 사이트에서 클릭률이 제일 높다.
// 예전에는 layout 이 요청 헤더로 인덱스인지 가렸는데, 그 한 줄이 /ceo 계열을 전부 서버 렌더로 만들었다(2026-09-21).
// 이제 인덱스 페이지가 직접 이 조각을 부른다.
// 국내 창업주를 먼저 둔다(2026-10-21). 손님이 국내 대표들이다.
const chip: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: '#2f56c4', background: '#f4f5f7',
  border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
const h3: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: '#33383f', margin: '14px 0 8px' };

export default function TycoonIndex() {
  const kr = TYCOONS.filter(isKorean), world = TYCOONS.filter(t => !isKorean(t));
  return (
    <nav aria-label={`국내외 거장 ${TYCOONS.length}인`} style={{ padding: '4px 18px 28px' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', margin: '18px 0 4px' }}>
        국내외 거장 {TYCOONS.length}인
      </h2>
      <p style={{ fontSize: 13, color: '#58616a', lineHeight: 1.6, margin: '0 0 4px' }}>
        이름을 누르면 그 사람의 명식과 이야기를 볼 수 있습니다. 대표님과 닮은 정도는 위에서 생년월일만 넣으면 30초입니다.
      </p>
      {[{ label: '국내 창업주와 회장', list: kr }, { label: '해외 거장', list: world }].map(({ label, list }) => (
        <div key={label}>
          <h3 style={h3}>{label} {list.length}인</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {list.map(t => (
              <Link key={t.name} href={`/ceo/${tycoonSlug(t.name)}`} style={chip}>{t.name}</Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function TycoonIndexBlock() {
  return (
    <>
      {/* .app 이 min-height:100vh 라 목록 앞에 355px 짜리 빈 구멍이 생긴다.
          목록이 붙으면 화면은 이미 넘치니 인덱스에서만 풀어 준다. */}
      {/* .home.app 이 0-2-0 이라 .app 하나로는 못 이긴다. 클래스를 겹쳐 특이도를 맞추고 순서로 이긴다. */}
      <style>{`.home.app,.app.app{min-height:auto}`}</style>
      <TycoonIndex />
    </>
  );
}
