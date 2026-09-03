// app/reading — 서버 껍데기. 실제 화면은 ReadingForm(클라이언트)이 그린다.
//
// **왜 껍데기가 필요한가.** ?cat=daeun 으로 들어와도 제목이 "오늘, 넣을 날인가 — 투찰 택일"
// 이었다. h1 은 "회사 대운"인데 탭 제목과 공유 카드에는 딴 상품 이름이 나갔다.
// layout 은 searchParams 를 못 받아서 카테고리를 알 수 없다 — page 만 받는다.
// 그래서 metadata 는 여기서 만들고, 폼은 예전 그대로 클라이언트에 맡긴다.
import type { Metadata } from 'next';
import { CAT_INFO, isCatKey } from '@/lib/report-categories';
import { ogCard, ogCardUrl } from '@/lib/og';
import ReadingForm from './ReadingForm';

const BASE = 'https://nakchalsaju.com';
const FALLBACK = {
  t: '오늘, 넣을 날인가 — 대표 사주로 보는 투찰 택일',
  d: '생년월일만 넣으면 30초. 대표님 사주와 오늘 일진으로 오늘의 흐름을 짚어 드립니다. 회원가입 없이 무료로 시작.',
  seal: '擇', k: '運七技三 · 오늘의 택일', s: '생년월일만 · 30초 · 무료로 시작',
};

export async function generateMetadata(
  { searchParams }: { searchParams: { cat?: string } },
): Promise<Metadata> {
  const cat = searchParams?.cat;
  const c = isCatKey(cat) ? CAT_INFO[cat] : null;

  const title = c ? `${c.name} — ${c.lead.split(' — ')[0]}` : FALLBACK.t;
  const description = c ? `${c.lead} 생년월일만 넣으면 30초, 명식과 방향은 무료로 먼저 보실 수 있습니다.` : FALLBACK.d;
  // canonical 은 쿼리를 살린다. cat 마다 내용이 다른 페이지라 하나로 합치면 서로를 먹는다.
  const canonical = c ? `/reading?cat=${cat}` : '/reading';
  const card = { seal: c ? c.hanja : FALLBACK.seal, k: c ? c.kicker : FALLBACK.k, t: c ? c.name : '오늘, 넣을 날인가', s: c ? '30초 · 무료로 시작' : FALLBACK.s };

  return {
    title, description,
    alternates: { canonical },
    openGraph: {
      title, description, url: BASE + canonical, type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
      images: ogCard(card),
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogCardUrl(card)] },
  };
}

export default function ReadingPage() {
  return <ReadingForm />;
}
