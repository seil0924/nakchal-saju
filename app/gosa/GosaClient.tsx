'use client';
// 착공 고사 축문 입력·미리보기·인쇄. 계산은 lib/gosa(음력·간지·건제십이신).
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { chukmun, gosaDays, type GosaDay } from '@/lib/gosa';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const fmt = (ymd: string) => { const [y, m, d] = ymd.split('-').map(Number); return `${m}월 ${d}일(${DOW[new Date(y, m - 1, d).getDay()]})`; };
const todayYmd = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };

export default function GosaClient() {
  const [company, setCompany] = useState('');
  const [ceo, setCeo] = useState('');
  const [project, setProject] = useState('');
  const [ymd, setYmd] = useState('');
  const [days, setDays] = useState<GosaDay[]>([]);
  const [copied, setCopied] = useState(false);

  // '오늘' 은 브라우저에서 정한다(서버에서 구우면 날짜가 굳는다)
  useEffect(() => { const d = gosaDays(new Date(), 60); setDays(d); setYmd(d[0]?.ymd ?? todayYmd()); }, []);

  const c = useMemo(() => (ymd ? chukmun({ ymd, company, ceo, project }) : null), [ymd, company, ceo, project]);
  const sample = !company.trim() && !ceo.trim() && !project.trim();

  async function copy() {
    if (!c) return;
    try { await navigator.clipboard.writeText([...c.hanja, '', ...c.reading, '', c.meaning].join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* 복사가 막힌 브라우저 */ }
  }

  return (
    <>
      <section className="card gosa-form">
        <label className="gosa-f"><span>회사명</span><input value={company} onChange={e => setCompany(e.target.value)} maxLength={30} placeholder="예) 대영건설(주)" /></label>
        <label className="gosa-f"><span>대표 성함</span><input value={ceo} onChange={e => setCeo(e.target.value)} maxLength={12} placeholder="예) 홍길동" /></label>
        <label className="gosa-f"><span>공사명</span><input value={project} onChange={e => setProject(e.target.value)} maxLength={40} placeholder="예) ○○초등학교 증축공사" /></label>
        <label className="gosa-f"><span>고사 날짜</span><input type="date" value={ymd} onChange={e => e.target.value && setYmd(e.target.value)} /></label>
        {days.length > 0 && (
          <div className="gosa-days">
            <p>앞으로 60일 중 고사 지내기 좋은 날</p>
            <div className="gosa-chips">
              {days.slice(0, 12).map(d => (
                <button type="button" key={d.ymd} className={'gosa-chip' + (d.ymd === ymd ? ' on' : '')} onClick={() => setYmd(d.ymd)}>
                  <b>{fmt(d.ymd)}</b><span>{d.hanja} · {d.lunarLabel}{d.sonEopneun ? ' · 손 없는 날' : ''}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {c && (
        <section className="card gosa-out" aria-label="축문">
          {sample && <p className="gosa-sample">예시입니다. 위에 회사명과 공사명을 넣으면 바로 바뀝니다.</p>}
          <div className="gosa-paper" lang="ko">
            {c.hanja.map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <h3>한글 음독</h3>
          <div className="gosa-read">{c.reading.map((line, i) => <p key={i}>{line}</p>)}</div>
          <h3>뜻풀이</h3>
          <p className="gosa-mean">{c.meaning}</p>
          <div className="gosa-act">
            <button type="button" className="gosa-btn" onClick={() => window.print()}>인쇄하기</button>
            <button type="button" className="gosa-btn sub" onClick={copy}>{copied ? '복사했습니다' : '글자로 복사'}</button>
          </div>
          <p className="gosa-note">음력 {c.lunar.leap ? '윤' : ''}{c.lunar.m}월 {c.lunar.d}일입니다. 축문은 큰 소리로 천천히 읽고, 읽은 뒤에는 태우는 것이 관례입니다.</p>
        </section>
      )}

      <p className="gosa-cta"><Link href="/reading?cat=calendar">이달 계약·발표에 좋은 날도 보기 ›</Link></p>
    </>
  );
}
