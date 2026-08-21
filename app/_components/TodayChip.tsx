'use client';
// 홈에서 "지금 이 사이트"를 보여주는 블록.
// 일진 · 절기 D-day · 오늘의 택일 · 이번 주 택일 · 최근 발행 · 이어보기.
// 방문자 수를 지어내지 않는다. 대신 매일 실제로 달라지는 값과 실제 발행 이력을 앞에 둔다.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { chartFromInput, GAN, ZHI } from '@/lib/preview';
import { nextSolarTerm, todayTaekil, stampNow, type NextTerm, type Taekil } from '@/lib/today-live';
import { sget } from '@/lib/scope';

type Day = { label: string; dow: string; tk: Taekil; today: boolean };
type Live = { date: string; gz: string; term: NextTerm | null; tk: Taekil; stamp: string; week: Day[] };
type Recent = { slug: string; title: string; date: string };

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const p2 = (v: number) => String(v).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

function ago(raw: string): string {
  const t = new Date(raw.replace(' ', 'T'));
  if (isNaN(t.getTime())) return '';
  const days = Math.floor((Date.now() - t.getTime()) / 86400000);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return days + '일 전';
  if (days < 30) return Math.floor(days / 7) + '주 전';
  return Math.floor(days / 30) + '개월 전';
}

export default function TodayChip() {
  const [live, setLive] = useState<Live | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const n = new Date();
      const c = chartFromInput(ymd(n), null, 'solar', false);
      if (c) {
        // 오늘부터 7일치 택일 — 매일 한 칸씩 밀리므로 화면이 늘 다르다.
        const week: Day[] = [];
        for (let k = 0; k < 7; k++) {
          const d = new Date(n.getFullYear(), n.getMonth(), n.getDate() + k);
          const cc = chartFromInput(ymd(d), null, 'solar', false);
          if (!cc) continue;
          week.push({
            label: String(d.getDate()),
            dow: DOW[d.getDay()],
            tk: todayTaekil(cc.mZhi, cc.dZhi, cc.dGan),
            today: k === 0,
          });
        }
        setLive({
          date: `${n.getFullYear()}년 ${n.getMonth() + 1}월 ${n.getDate()}일`,
          gz: GAN[c.dGan] + ZHI[c.dZhi],
          term: nextSolarTerm(n),
          tk: todayTaekil(c.mZhi, c.dZhi, c.dGan),
          stamp: stampNow(n),
          week,
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

    // 최근 발행 — 칼럼 로더가 server-only라 엔드포인트로 받는다.
    fetch('/api/recent')
      .then(r => (r.ok ? r.json() : null))
      .then(j => { if (j) { setRecent(j.items || []); setTotal(j.total || 0); } })
      .catch(() => {});
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

        {live.week.length > 0 && (
          <div className="tl-week">
            {live.week.map((d, i) => (
              <div className={'tw-d v-' + d.tk.verdict + (d.today ? ' now' : '')} key={i}>
                <span className="tw-dw">{d.dow}</span>
                <span className="tw-n">{d.label}</span>
                <span className="tw-k" aria-hidden="true">{d.tk.key}</span>
              </div>
            ))}
          </div>
        )}

        <div className="tl-stamp">만세력 {live.stamp} · 건제십이신 기준 · 초록은 길, 붉은색은 조심</div>
      </div>

      {resume && (
        <Link className="tl-resume" href="/reading">
          <span className="tlr-k" aria-hidden="true">繼</span>
          <span className="tlr-t"><b>{resume}</b> 님 명식으로 이어보기</span>
          <span className="tlr-go" aria-hidden="true">→</span>
        </Link>
      )}

      {recent.length > 0 && (
        <div className="tl-recent">
          <div className="trc-hd"><i />최근 발행<em>총 {total}편</em></div>
          {recent.map(r => (
            <Link className="trc-i" key={r.slug} href={`/column/${r.slug}`}>
              <span className="trc-t">{r.title}</span>
              <span className="trc-d">{ago(r.date)}</span>
            </Link>
          ))}
          <Link className="trc-all" href="/column">칼럼 전체 보기 →</Link>
        </div>
      )}
    </>
  );
}
