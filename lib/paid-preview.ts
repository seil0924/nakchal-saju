// 무료 응답에 허용한 발췌만 담는다. 유료 본문/HTML 전체를 넣지 않는다.
export type PaidPreview = {
  cat: 'daepyo' | 'sajeong';
  sectionMk: string;
  question: string;
  reason: string;
  excerptTitle: string;
  excerpt: string;
  next: string[];
};
