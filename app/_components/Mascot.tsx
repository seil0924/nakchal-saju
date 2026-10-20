// 낙찰사주 캐릭터 — 나경 거북(2026-10-20).
// 등딱지가 풍수 나침반(나경)이고 등에 입찰서 봉투를 진 거북이다. 원본은 Desktop\낙찰사주_캐릭터, Figma 「낙찰사주 브랜드 캐릭터」.
// 그림 바탕이 흰색이라 mix-blend-mode: multiply 로 겹친다. 흰 바탕·연회색 바탕 어디에 놓아도 네모가 보이지 않는다.
export type MascotPose = 'hi' | 'think' | 'caution' | 'empty' | 'yay';

const ALT: Record<MascotPose, string> = {
  hi: '인사하는 낙찰사주 거북',
  think: '명식을 계산하는 낙찰사주 거북',
  caution: '조심하라고 알려 주는 낙찰사주 거북',
  empty: '빈 봉투를 들여다보는 낙찰사주 거북',
  yay: '기뻐하는 낙찰사주 거북',
};

export default function Mascot({ pose, size = 120, className = '', decorative = false }: {
  pose: MascotPose; size?: number; className?: string; decorative?: boolean;
}) {
  return (
    <img
      className={'mascot' + (className ? ' ' + className : '')}
      src={`/char/${pose}.webp`}
      width={size}
      height={size}
      alt={decorative ? '' : ALT[pose]}
      aria-hidden={decorative || undefined}
      loading="lazy"
      decoding="async"
    />
  );
}
