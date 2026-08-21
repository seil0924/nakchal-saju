'use client';
// 발주처 관계지도.
// 명식이 없으면 99곳이 오행 방위를 떠다니고 가운데가 비어 있다 — 그 빈자리가 입력 동기다.
// 명식이 있으면 상위 20곳만 남기고, 가장 가까운 5곳은 잠근다(점수는 공개, 정체만 가림).
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CLIENTS } from '@/lib/clients';
import { chartFromInput } from '@/lib/preview';
import { sget } from '@/lib/scope';
import { migrateLegacy, peopleOf } from '@/lib/people';
import {
  rankBalju, splitForMap, dominantOh, fitOf,
  OH_COLOR, OH_TEXT, OH_HANJA, OH_NAME, type BaljuFit,
} from '@/lib/balju-map';

const VB = 460, C = 230;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

type Me = { gan: number; ji: number; name: string };

// 저장소가 두 벌이다. 통합본(nakchal_people_v1, date)이 정본이고
// 구버전(nakchal_self_v1, birth)은 아직 남아 있는 기기가 있다. 둘 다 본다.
function readMe(): Me | null {
  try {
    migrateLegacy();
    const self = peopleOf('self')[0];
    if (self?.date) {
      const c = chartFromInput(self.date, self.time ?? null, self.cal ?? 'solar', !!self.leap);
      if (c) return { gan: c.dGan, ji: c.dZhi, name: (self.name || '대표님').trim() };
    }
    const raw = sget('nakchal_self_v1');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || !list.length) return null;
    const p = list[0];
    const date = p?.date || p?.birth;          // 구버전은 birth 로 저장돼 있다
    if (!date) return null;
    const c = chartFromInput(date, p.time ?? null, p.cal ?? 'solar', !!(p.leap ?? p.isLeap));
    if (!c) return null;
    return { gan: c.dGan, ji: c.dZhi, name: (p.name || '대표님').trim() };
  } catch { return null; }
}

// 입력 전 — 오행 다섯 방위. 노드마다 주기·지연·진폭을 달리해 규칙적으로 안 보이게 한다.
function driftNodes() {
  return CLIENTS.map((c, i) => {
    const year = Number(c.date.slice(0, 4));
    const oh = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4][((year - 4) % 10 + 10) % 10];
    return { name: c.name, core: !!c.core, oh, i };
  }).map((n, k, arr) => {
    const grp = arr.filter(x => x.oh === n.oh);
    const idx = grp.indexOf(n);
    const base = -Math.PI / 2 + n.oh * 2 * Math.PI / 5;
    const ring = 104 + (idx % 5) * 26;
    const a = base + ((idx / Math.max(1, grp.length)) - 0.5) * 1.02;
    return {
      ...n,
      x: C + ring * Math.cos(a),
      y: C + ring * Math.sin(a),
      dur: 6.2 + ((k * 7) % 9) * 0.55,
      delay: ((k * 13) % 20) * 0.35,
      amp: 3.5 + ((k * 5) % 4) * 1.4,
    };
  });
}

export default function BaljuMap() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setMe(readMe()); setReady(true); }, []);

  const drift = useMemo(() => driftNodes(), []);
  const fit = useMemo(() => {
    if (!me) return null;
    const ranked = rankBalju({ gan: me.gan, ji: me.ji });
    const { locked, free, top } = splitForMap(ranked);
    return { ranked, locked, free, top, dom: dominantOh(top) };
  }, [me]);

  // 서버·첫 페인트에서는 지도를 비워 둔다(레이아웃만 잡아 깜빡임 방지).
  if (!ready) return <div className="bmap-wrap" aria-hidden="true" />;

  if (!fit) {
    return (
      <div className="bmap-wrap">
        <div className="bmap">
          <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="발주처 성좌도">
            {[78, 128, 178, 216].map(r => (
              <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgba(255,255,255,.06)" />
            ))}
            {drift.map((n, k) => (
              <g key={k} className="bm-fl" style={{ ['--d' as string]: `${n.dur}s`, ['--dl' as string]: `-${n.delay}s`, ['--a' as string]: `${n.amp}px` }}>
                <circle cx={n.x} cy={n.y} r={n.core ? 8.5 : 5.5} fill={OH_COLOR[n.oh]} opacity={n.core ? 0.8 : 0.46}>
                  <title>{n.name}</title>
                </circle>
              </g>
            ))}
            <circle className="bm-pulse" cx={C} cy={C} r={29} fill="none" stroke="rgba(239,234,224,.5)" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={C} y={C + 1} textAnchor="middle" fontSize={10.5} fill="rgba(239,234,224,.82)">대표님</text>
            <text x={C} y={C + 15} textAnchor="middle" fontSize={9} fill="rgba(239,234,224,.5)">자리</text>
            {OH_HANJA.map((h, i) => {
              const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
              return <text key={h} x={C + 228 * Math.cos(a)} y={C + 228 * Math.sin(a)} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={OH_COLOR[i]} style={{ fontFamily: 'var(--serif)' }}>{h}</text>;
            })}
          </svg>
          <div className="bm-cap">발주처 {CLIENTS.length}곳이 설립 오행에 따라 다섯 방위를 떠다닙니다<br />가운데 자리는 아직 비어 있습니다</div>
        </div>
        <Link className="bm-cta" href="/reading?cat=balju">
          생년월일 넣고 내 자리 채우기
          <small>30초 · 무료 · {CLIENTS.length}곳이 궁합 순으로 다시 놓입니다</small>
        </Link>
      </div>
    );
  }

  const { locked, free, top, dom } = fit;
  const pts = top.map((t, k) => {
    const d = k < 5 ? 86 + k * 7.2 : 150 + (k - 5) * 4.6;
    const a = k * GOLDEN;
    return { t, k, x: C + d * Math.cos(a), y: C + d * Math.sin(a), lock: k < 5 };
  });

  return (
    <div className="bmap-wrap">
      <div className="bmap">
        <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="발주처 궁합 지도">
          {[86, 136, 186, 216].map(r => (
            <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgba(255,255,255,.07)" />
          ))}
          <circle cx={C} cy={C} r={118} fill="rgba(179,56,44,.07)" stroke="rgba(179,56,44,.35)" strokeDasharray="5 4" />
          {pts.filter(p => !p.lock).map(p => (
            <line key={'l' + p.k} x1={C} y1={C} x2={p.x} y2={p.y} stroke={OH_COLOR[p.t.oh]} strokeWidth={1} opacity={0.22} />
          ))}
          {pts.map(p => p.lock ? (
            <g key={p.k}>
              <circle cx={p.x} cy={p.y} r={(p.t.core ? 10 : 7.5) + 3} fill="none" stroke="#b3382c" strokeWidth={1.2} strokeDasharray="3 2.5" opacity={0.85} />
              <circle cx={p.x} cy={p.y} r={p.t.core ? 10 : 7.5} fill="#3a3a3d" />
              <text x={p.x} y={p.y + 3.6} textAnchor="middle" fontSize={9.5} fontWeight={900} fill="#e6b9b3" style={{ fontFamily: 'var(--serif)' }}>封</text>
            </g>
          ) : (
            <g key={p.k}>
              <circle cx={p.x} cy={p.y} r={p.t.core ? 10 : 7.5} fill={OH_COLOR[p.t.oh]} opacity={0.95}>
                <title>{p.t.name} · 궁합 {p.t.score}</title>
              </circle>
              <text x={p.x} y={p.y - 12.5} textAnchor="middle" fontSize={8.5} fill="rgba(239,234,224,.88)">{p.t.name.slice(0, 7)}</text>
              <text x={p.x} y={p.y + 3.2} textAnchor="middle" fontSize={8} fontWeight={800} fill="#fff">{p.t.score}</text>
            </g>
          ))}
          <circle cx={C} cy={C} r={28} fill="#c79a3a" />
          <circle cx={C} cy={C} r={28} fill="none" stroke="#efeae0" strokeWidth={1.5} opacity={0.85} />
          <text x={C} y={C + 1} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">{me?.name.slice(0, 4)}</text>
          <text x={C} y={C + 14} textAnchor="middle" fontSize={8.5} fill="rgba(255,255,255,.9)">{OH_HANJA[[0, 0, 1, 1, 2, 2, 3, 3, 4, 4][me!.gan]]} 일간</text>
        </svg>
        <div className="bm-cap">
          {CLIENTS.length}곳 중 결이 맞는 <b>상위 {top.length}곳</b>만 남겼습니다 · 가까울수록 손이 맞습니다<br />
          붉은 점선 안쪽 <b className="lk">{locked.length}곳</b>이 가장 잘 맞는 자리입니다
        </div>
      </div>

      {dom && (
        <div className="bm-insight">
          대표님께는 <b style={{ color: OH_TEXT[dom.oh] }}>{OH_HANJA[dom.oh]}({OH_NAME[dom.oh]})</b> 기운 발주처가 맞습니다 — 상위 {top.length}곳 중 {dom.count}곳이 {OH_NAME[dom.oh]}입니다.
        </div>
      )}

      <div className="bm-rank">
        {top.map((t, i) => i < locked.length ? (
          <div className="bm-rk lk" key={t.slug}>
            <span className="rkn">{i + 1}</span>
            <span className="rkoh lock" aria-hidden="true">封</span>
            <span className="rkm">
              <b className="bl">{t.name}</b>
              <span className="rkt lkt">가장 결이 맞는 자리 · 잠김</span>
              <span className="rkd">설립 {t.year} {t.ganji} · {t.sip}{t.jimod ? ' · ' + t.jimod : ''}</span>
            </span>
            <span className="rks">궁합<b className="bl">{t.score}</b></span>
          </div>
        ) : (
          <Link className="bm-rk" key={t.slug} href={`/balju/${t.slug}`}>
            <span className="rkn">{i + 1}</span>
            <span className="rkoh" style={{ background: OH_COLOR[t.oh] }} aria-hidden="true">{OH_HANJA[t.oh]}</span>
            <span className="rkm">
              <b>{t.name}{t.core && <em className="core">封</em>}</b>
              <span className="rkt" style={{ color: t.color }}>{t.label} · {t.desc}</span>
              <span className="rkd">설립 {t.year} {t.ganji} · {t.sip}{t.jimod ? ' · ' + t.jimod : ''}</span>
            </span>
            <span className="rks">궁합<b>{t.score}</b></span>
          </Link>
        ))}
      </div>

      <Link className="bm-cta pay" href="/reading?cat=balju">
        가장 맞는 {locked.length}곳 열기
        <small>발주처 궁합 · {CLIENTS.length}곳 전체 순위 포함</small>
      </Link>
      <p className="bm-disc">궁합은 대표님 일간과 발주처 설립 년주의 십성·합충으로 매긴 <b>상대 적합도</b>입니다. 절대 평가나 낙찰 예측이 아닙니다.</p>
    </div>
  );
}
