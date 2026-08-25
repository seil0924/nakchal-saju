'use client';
// 영어권에서 온 사람에게 영어판이 있다고 알려 주는 띠.
//
// 자동 리다이렉트는 하지 않는다. 구글이 명시적으로 말리는 짓이고, 크롤러가 주로 미국에서 오기 때문에
// 미국 접속을 영어로 튕기면 구글봇이 한국어 페이지를 못 본다. 색인이 138개뿐인 지금은 자해다.
// 판단은 사람에게 남기고, 우리는 문만 보여 준다.
//
// 나라 판정은 서버가 아니라 브라우저에서 한다. Vercel 의 국가 헤더를 읽으면 페이지가 요청마다
// 새로 그려져 정적 캐시가 깨진다 — 띠 하나 띄우자고 치를 값이 아니다.
// 스타일도 여기 두었다. 이것 하나 때문에 164KB 짜리 전역 CSS 를 건드릴 이유가 없다.
import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';

const KEY = 'nakchal_lang_nudge';

const wrap: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
  padding: '9px 14px', background: '#1c1c1d', color: '#efeae0',
  fontSize: 12.5, lineHeight: 1.5,
};
const go: CSSProperties = {
  color: '#f0d79a', fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 3,
};
const x: CSSProperties = {
  marginLeft: 'auto', border: 0, background: 'none', cursor: 'pointer',
  color: 'rgba(239,234,224,.7)', fontSize: 17, lineHeight: 1, padding: '2px 4px',
};

export default function LangNudge() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === 'off') return;
      const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
      // 한국어가 목록 어디에도 없을 때만 띄운다. 해외 사는 한국인에게 영어를 들이밀지 않는다.
      if (langs.some(l => l.toLowerCase().startsWith('ko'))) return;
      setShow(true);
    } catch { /* 저장소가 막혀 있으면 그냥 넘어간다 */ }
  }, []);

  function close() {
    setShow(false);
    try { localStorage.setItem(KEY, 'off'); } catch { /* noop */ }
  }

  if (!show) return null;
  return (
    <div style={wrap} lang="en" role="note">
      <span>This page is in Korean. There is an English BaZi calculator.</span>
      <Link href="/en/bazi" hrefLang="en" style={go} onClick={close}>Open it</Link>
      <button type="button" onClick={close} aria-label="Dismiss" style={x}>×</button>
    </div>
  );
}
