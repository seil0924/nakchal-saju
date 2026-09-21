// app/reading — 서버 껍데기. 실제 화면은 ReadingForm(클라이언트)이 그린다.
//
// ?cat= 은 폼이 브라우저에서 읽는다. 서버에서 읽으면(searchParams) 이 화면이 정적 파일이 되지 못해
// 접속 한 번마다 서버가 다시 그린다 — 사이트에서 제일 많이 열리는 화면이라 비용이 컸다(2026-09-21).
// 상품별 제목·공유 카드는 상세페이지(/product/<상품>)가 맡는다. 그쪽은 미리 만들어 둔 정적 페이지다.
import type { Metadata } from 'next';
import { ogCard, ogCardUrl } from '@/lib/og';
import ReadingForm from './ReadingForm';

const BASE = 'https://nakchalsaju.com';
const T = '오늘, 넣을 날인가 — 대표 사주로 보는 투찰 택일';
const D = '생년월일만 넣으면 30초. 대표님 사주와 오늘 일진으로 오늘의 흐름을 짚어 드립니다. 회원가입 없이 무료로 시작.';
const CARD = { seal: '擇', k: '運七技三 · 오늘의 택일', t: '오늘, 넣을 날인가', s: '생년월일만 · 30초 · 무료로 시작' };

export const metadata: Metadata = {
  title: T, description: D,
  alternates: { canonical: '/reading' },
  openGraph: { title: T, description: D, url: BASE + '/reading', type: 'website', locale: 'ko_KR', siteName: '낙찰사주', images: ogCard(CARD) },
  twitter: { card: 'summary_large_image', title: T, description: D, images: [ogCardUrl(CARD)] },
};

export default function ReadingPage() {
  return <ReadingForm />;
}
