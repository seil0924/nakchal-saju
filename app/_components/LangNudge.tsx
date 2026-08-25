'use client';
// 영어권에서 온 사람에게 영어판이 있다고 알려 주는 띠.
//
// 자동 리다이렉트는 하지 않는다. 구글이 명시적으로 말리는 짓이고, 크롤러가 주로 미국에서 오기 때문에
// 미국 접속을 영어로 튕기면 구글봇이 한국어 페이지를 못 본다. 색인이 138개뿐인 지금은 자해다.
// 판단은 사람에게 남기고, 우리는 문만 보여 준다.
//
// 나라 판정은 서버가 아니라 브라우저에서 한다. Vercel 의 국가 헤더를 읽으면 페이지가 요청마다
// 새로 그려져 정적 캐시가 깨진다 — 띠 하나 띄우자고 치를 값이 아니다.
import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'nakchal_lang_nudge';

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
    <div className="lnudge" lang="en" role="note">
      <span>This page is in Korean. There is an English BaZi calculator.</span>
      <Link href="/en/bazi" hrefLang="en" onClick={close}>Open it</Link>
      <button type="button" onClick={close} aria-label="Dismiss">×</button>
    </div>
  );
}
