'use client';
// 오늘 값이 바뀌는 것만 모은 띠 — 일진 · 절기 D-day · 오늘의 택일 · 만세력 갱신 시각.
// 방문자 수를 지어내지 않고도 "매일 관리되는 사이트"라는 인상을 만드는 것이 목적이다.
// 재방문자에게는 저장된 명식으로 바로 들어가는 '이어보기'를 함께 보여준다.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chartFromInput, GAN, ZHI } from '@/lib/preview';
import { nextSolarTerm, todayTaekil, stampNow, type NextTerm, type Taekil } from '@/lib/today-live';
import { sget } from '@/lib/scope';

type Live = { date: string; gz: string; term: NextTerm | null; tk: Taekil; stamp: string };

export default function TodayChip() {
  const [live, setLive] = useState<Live | null>(null);
  const [resume, setResume] = useState<string | null>(null);

  useEffect(() => {
    try {
      const n = new Date();
      const p = (v: number) => String(v).padStart(2, '0');
      const ymd = `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
      const c = chartFromInput(ymd, null, 'solar', false);
      if (c) {
        setLive({
          date: `${n.getFullYear()}년 ${n.getMonth() + 1}월 ${n.getDate()}일`,
          gz: GAN[c.dGan] + ZHI[c.dZhi],
          term: nextSolarTerm(n),
          tk: todayTaekil(c.mZhi, c.dZhi, c.dGan),
          stamp: stampNow(n),
        });
      }
    } catch {}
    // 저장된 사람이 있으면 재방문자다 — 다시 입력시키지 않는다.
    try {
      const raw = sget('nakchal_self_v1');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const nm = list[0]?.name;
          setResume(typeof nm === 'string' && nm.trim() ? nm.trim() : '저장된 명식');
        }
      }
    } catch {}
  }, []);

  if (!live) return <div className="tlive" aria-hidden="true" />;

  return (
    <>
      <div className="tlive">
        <div className="tl-top">
          <span className="tl-gz" aria-hidden="true">{live.gz}</span>
          <div className="tl-mid">
            <span className="tl-date">{live.date}</span>
            <span className="tl-sub">{live.gz}日 · 실시간 만세력</span>
          </div>
          {live.term && (
            <span className="tl-term">
              {live.term.isToday
                ? <><b>{live.term.hanja}</b> 오늘</>
                : <><b>{live.term.hanja}</b> D-{live.term.dday}</>}
            </span>
          )}
        </div>

        <div className={'tl-tk v-' + live.tk.verdict}>
          <span className="tl-k" aria-hidden="true">{live.tk.key}</span>
          <div className="tl-tx">
            <b>오늘은 {live.tk.title}</b>
            <span>{live.tk.body}</span>
          </div>
        </div>

        <div className="tl-stamp">만세력 {live.stamp} · 건제십이신({live.tk.key}{live.tk.name}) 기준</div>
      </div>

      {resume && (
        <Link className="tl-resume" href="/reading">
          <span className="tlr-k" aria-hidden="true">繼</span>
          <span className="tlr-t"><b>{resume}</b> 님 명식으로 이어보기</span>
          <span className="tlr-go" aria-hidden="true">→</span>
        </Link>
      )}
    </>
  );
}
