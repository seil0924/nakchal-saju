// 낙찰사주 캐릭터 — 나경 거북(2026-10-20).
// 등딱지가 풍수 나침반(나경)이고 등에 입찰서 봉투를 진 네 발 거북이다.
// 원본은 Desktop\낙찰사주_캐릭터\상세페이지(+추가20종), 프롬프트는 같은 폴더의 생성프롬프트.txt.
//
// 처음 만든 표정 세트는 거북이 두 발로 서 있어서 뺐다(2026-10-20 대표 지적).
// 새 그림은 모두 네 발로 선 거북이고, 가로 3:2 장면이다. 바탕이 연한 하늘빛(#f3f6fc)이라
// 둥근 모서리 카드로 놓는다.
export type MascotArt =
  | 'welcome' | 'think' | 'milestone' | 'opportunity' | 'crossroad'
  | 'growth' | 'client' | 'office' | 'timing' | 'consult' | 'team' | 'safe' | 'season';

const ALT: Record<MascotArt, string> = {
  welcome: '문을 열고 맞이하는 낙찰사주 거북',
  think: '돋보기로 결과를 살피는 낙찰사주 거북',
  milestone: '별이 걸린 아치 아래에 선 낙찰사주 거북',
  opportunity: '망원경으로 기회를 찾는 낙찰사주 거북',
  crossroad: '갈림길에서 방향을 고르는 낙찰사주 거북',
  growth: '새싹에 물을 주는 낙찰사주 거북',
  client: '발주처 건물로 걸어가는 낙찰사주 거북',
  office: '사무실 도면 위에서 자리를 고르는 낙찰사주 거북',
  timing: '다리를 건너 금빛 동전으로 가는 낙찰사주 거북',
  consult: '책상에서 결과를 살피는 낙찰사주 거북',
  team: '탁자에 둘러앉은 낙찰사주 거북들',
  safe: '우산 아래에 선 낙찰사주 거북',
  season: '사계절 사이에 선 낙찰사주 거북',
};

export default function Mascot({ art, width = 360, className = '', decorative = false, eager = false }: {
  art: MascotArt; width?: number; className?: string; decorative?: boolean; eager?: boolean;
}) {
  return (
    <img
      className={'mascot' + (className ? ' ' + className : '')}
      src={`/char/${art}.webp`}
      width={width}
      height={Math.round(width * 2 / 3)}
      alt={decorative ? '' : ALT[art]}
      aria-hidden={decorative || undefined}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}
