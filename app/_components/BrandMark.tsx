// 낙찰사주 로고 — 브랜드 캐릭터 '나경 거북'(2026-10-23). 예전 파란 사각형 막대 아이콘은 30px 이라 안 보였다.
// 원본: Desktop/낙찰사주_캐릭터/시안A_나경거북.png 를 정사각형으로 잘라 public/brand/turtle-192.webp 로.
export default function BrandMark({ size = 40 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/turtle-192.webp" width={size} height={size} alt="" aria-hidden="true" className="brandmark" decoding="async" />;
}
