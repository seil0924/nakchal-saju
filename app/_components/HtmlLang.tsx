'use client';
import { useEffect } from 'react';

// 최상위 레이아웃은 lang="ko" 로 고정돼 있다(요청 헤더를 읽으면 사이트 전체가 정적 파일이 되지 못한다).
// 영어·중국어 페이지는 이 조각을 넣어 자기 언어로 바꾼다.
export default function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const prev = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => { document.documentElement.lang = prev; };
  }, [lang]);
  return null;
}
