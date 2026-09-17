import type { CatKey } from '@/lib/report-categories';
import { GAN, ZHI, EL_HEX, GAN_ELc, ZHI_ELc } from '@/lib/preview';

// 상세페이지의 '결과는 이렇게 나옵니다' — 실제 결과 화면의 축소판(예시 값).
// 명식 간지·오행 색은 실제 계산값(1971-07-16생 · 壬寅 일주)을 쓴다. 점수·날짜는 예시다.
const PILS = [{ pos: '년주', g: 7, z: 11 }, { pos: '월주', g: 1, z: 7 }, { pos: '일주', g: 8, z: 2 }];
const Q = ({ n = 2 }: { n?: number }) => <b className="qv">{'?'.repeat(n)}</b>;

function Pillars() {
  return (
    <div className="pv-pils">
      {PILS.map(p => (
        <div key={p.pos} className={'pv-pil' + (p.pos === '일주' ? ' day' : '')}>
          <span>{p.pos}</span>
          <b style={{ background: EL_HEX[GAN_ELc[p.g]] }}>{GAN[p.g]}</b>
          <b style={{ background: EL_HEX[ZHI_ELc[p.z]] }}>{ZHI[p.z]}</b>
        </div>
      ))}
    </div>
  );
}

function Locked({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="pv-lock"><div className="pv-lt">{t}</div><div className="pv-ld">{children}</div></div>;
}

export default function Preview({ k }: { k: CatKey }) {
  switch (k) {
    case 'daepyo':
      return (
        <div className="pv">
          <div className="pv-card pv-row"><Pillars /><div className="pv-type"><span>대표 유형</span><b>분석형</b><em>흐름을 읽어 스며드는 대표</em></div></div>
          <div className="pv-card">
            <div className="pv-h">2026년 경영 스코어카드</div>
            {[['그릇·지속력', 3], ['권위·통솔', 2], ['자금·조달', 1], ['기획·실행', 3], ['올해의 때', 4]].map(([l, v]) => (
              <div key={l as string} className="pv-bar"><span>{l}</span><i><em style={{ width: `${(v as number) * 20}%` }} /></i><b>{v}/5</b></div>
            ))}
          </div>
          <Locked t="재물운의 형태">돈이 새는 자리는 <Q n={4} />, 굳힐 때는 <Q n={2} />월입니다</Locked>
        </div>
      );
    case 'sajeong':
      return (
        <div className="pv">
          <div className="pv-card pv-sig"><span>오늘의 투찰 택일 신호</span><b>65<small>점</small></b><em>넣을 만한 흐름 · 오전이 유리</em></div>
          <div className="pv-card">
            <div className="pv-h">이번 주 7일</div>
            <div className="pv-week">{['월', '화', '수', '목', '금', '토', '일'].map((d, i) => <div key={d} className={i === 1 || i === 3 ? 'g' : i === 5 ? 'c' : ''}><span>{d}</span><i /></div>)}</div>
          </div>
          <Locked t="이번 달 투찰 길일 6일"><Q />일 · <Q />일 · <Q />일 … 정확한 날짜와 시진</Locked>
        </div>
      );
    case 'gunghap':
      return (
        <div className="pv">
          <div className="pv-card pv-vs">
            <div><span>대표님</span><b style={{ background: EL_HEX[4] }}>壬寅</b></div>
            <div className="pv-score"><b>69</b><em>대등</em></div>
            <div><span>동업 상대</span><b style={{ background: EL_HEX[2] }}>己亥</b></div>
          </div>
          <div className="pv-card">
            <div className="pv-h">두 명식의 오행</div>
            {['木', '火', '土', '金', '水'].map((e, i) => <div key={e} className="pv-cmp"><span>{e}</span><b>{[0, 2, 2, 3, 1][i]}</b><i>:</i><b>{[0, 2, 3, 0, 1][i]}</b></div>)}
          </div>
          <Locked t="역할 분담">대표님 <Q n={4} /> × 상대 <Q n={4} /> · 장기 적합도 <Q /></Locked>
        </div>
      );
    case 'daeun': {
      const B = [['0~9', '확장'], ['10~19', '수성'], ['20~29', '수성'], ['30~39', '수확']];
      return (
        <div className="pv">
          <div className="pv-card"><div className="pv-h">대운 구간 — 지금 10~19년차</div>
            <div className="pv-blocks">{B.map(([y, t], i) => <div key={y} className={i === 1 ? 'cur' : ''}><span>{y}년차</span><b>{t}</b></div>)}</div>
          </div>
          <div className="pv-card">
            <div className="pv-h">2026년 판단 기준</div>
            {[['신규 확장', '신중'], ['차입·투자', '보류'], ['채용', '신중']].map(([a, b]) => <div key={a} className="pv-line"><span>{a}</span><b className={b === '보류' ? 'warn' : ''}>{b}</b></div>)}
          </div>
          <Locked t="앞으로 8년 중 밀어주는 해 2번"><Q n={4} />년 · <Q n={4} />년 — 확장·정비의 때</Locked>
        </div>
      );
    }
    case 'calendar':
      return (
        <div className="pv">
          <div className="pv-card"><div className="pv-h">앞으로 30일</div>
            <div className="pv-cal">{Array.from({ length: 28 }, (_, i) => <div key={i}><span>{i + 14 > 30 ? i - 16 : i + 14}</span><i className={['g', 'b', 'y', 't', 'r', 'n'][(i * 7 + 3) % 6]} /></div>)}</div>
            <div className="pv-legend"><span><i className="g" />계약</span><span><i className="b" />채용</span><span><i className="y" />발표</span><span><i className="r" />주의</span></div>
          </div>
          <Locked t="이달 핵심 3일"><Q />일 · <Q />일 · <Q />일 — 큰 건은 이 날에</Locked>
        </div>
      );
    case 'calendar_year':
      return (
        <div className="pv">
          <div className="pv-card"><div className="pv-h">남은 달의 흐름</div>
            {[['9월', '분출운', '영업·홍보를 넓게'], ['10월', '경쟁운', '조건을 한 끗 앞서'], ['11월', null, null], ['12월', null, null]].map(([m, t, d]) => (
              <div key={m as string} className="pv-line"><span>{m}</span>{t ? <><b>{t}</b><em>{d}</em></> : <><Q />운<em>결제 후 공개</em></>}</div>
            ))}
          </div>
          <Locked t="승부처">큰 계약·발표·투자를 둘 달 <Q />월 · <Q />월</Locked>
        </div>
      );
    case 'balju':
      return (
        <div className="pv">
          <div className="pv-card pv-sig"><span>한국도로공사 × 대표님</span><b>68<small>점</small></b><em>대등하게 맞서는 자리 — 조건으로 승부</em></div>
          <div className="pv-card"><div className="pv-h">궁합 순으로 다시 놓인 발주처</div>
            {[['1', '한국수자원공사', 86], ['2', '국가철도공단', 81], ['3', 'LH', 77]].map(([n, a, s]) => <div key={a as string} className="pv-line"><span>{n}</span><b>{a}</b><em>{s}점</em></div>)}
          </div>
          <Locked t="이 발주처를 대하는 3계">언제 <Q n={4} /> · 어떻게 <Q n={4} /> · 주의 신호</Locked>
        </div>
      );
    case 'ijeon':
      return (
        <div className="pv">
          <div className="pv-card pv-compass">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="88" fill="#fff" stroke="#e6e8ea" />
              {Array.from({ length: 8 }, (_, i) => { const a = (i * 45 - 90) * Math.PI / 180; return <line key={i} x1={100} y1={100} x2={100 + 88 * Math.cos(a)} y2={100 + 88 * Math.sin(a)} stroke="#e6e8ea" />; })}
              <path d="M100 100 L162 38 A88 88 0 0 1 188 100 Z" fill="#eef3fe" />
              <circle cx="100" cy="100" r="22" fill="#f4f5f7" />
              <text x="100" y="104" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1e2124">자리</text>
              <text x="100" y="24" textAnchor="middle" fontSize="12" fill="#636d77">북</text>
              <text x="178" y="104" textAnchor="middle" fontSize="12" fill="#2f56c4" fontWeight="700">동</text>
            </svg>
            <em>파란 쪽이 옮기기 좋은 방위(예시)</em>
          </div>
          <Locked t="이사 택일 — 석 달">추천 날짜 <Q />월 <Q />일 · 시진 <Q n={3} /></Locked>
        </div>
      );
  }
}
