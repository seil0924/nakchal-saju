// 인물 명식 카드 두 장 — 명식 표·오행, 십성·신살. 거장 상세(/ceo/<이름>)가 쓴다.
// 검색으로 "○○ 사주"를 치고 들어온 사람이 원하는 것을 먼저 다 보여 준다. 묻는 것은 그다음이다.
import { EL_HEX } from '@/lib/preview';
import { josa } from '@/lib/josa';
import type { TycoonFacts } from '@/lib/tycoon-facts';
import './person.css';

const ELC = ['木', '火', '土', '金', '水'];
const ELKO = ['나무', '불', '흙', '쇠', '물'];

export default function PersonChart({ name, f, timeNote = '태어난 시는 알려지지 않아 시주는 비웠습니다.' }: { name: string; f: TycoonFacts; timeNote?: string }) {
  const maxD = Math.max(1, ...f.dist);
  return (
    <>
      <div className="pc-card">
        <div className="pc-h">{name}의 명식(命式)</div>
        <div className="tyw" role="table" aria-label={`${name} 명식`}>
          {[...f.pillars, null].map((p, i) => (
            <div key={i} className={'tyw-c' + (p?.pos === '일주' ? ' day' : '') + (p ? '' : ' none')} role="cell">
              <span className="tyw-p">{p ? p.pos : '시주'}</span>
              {p ? (
                <>
                  <b style={{ background: EL_HEX[p.ganEl] }}>{p.gan}</b>
                  <b style={{ background: EL_HEX[p.zhiEl] }}>{p.zhi}</b>
                </>
              ) : (
                <><i>?</i><i>?</i></>
              )}
            </div>
          ))}
        </div>
        <p className="pc-s">
          일간 <b>{f.elName}({ELKO[f.el]})</b> · 대표 유형 <b>{f.type}</b>, {f.desc} 그릇입니다. {timeNote}
        </p>
        <div className="pc-sub">
          <div className="pc-lab">오행이 몇 자씩 앉았는가 <span>· 삼주 기준</span></div>
          <div className="pc-el">
            {f.dist.map((n, i) => (
              <div key={i} className={n ? '' : 'zero'}>
                <b>{ELC[i]}</b>
                <i><em style={{ width: `${Math.round((n / maxD) * 100)}%` }} /></i>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pc-card">
        <div className="pc-h">십성으로 본 구조</div>
        <div className="pc-sip">
          {['비겁', '식상', '재성', '관성', '인성'].map((k, i) => (
            <div key={k} className={f.sipTop === k ? 'on' : ''}>
              <span>{k}</span><b>{f.sip[i]}</b>
            </div>
          ))}
        </div>
        <p className="pc-p">
          가장 두터운 것은 <b>{f.sipTop}</b>입니다. {f.sipBiz} 오행으로는 <b>{f.strong}</b>{josa(f.strong, '이')} 가장 많고, <b>{f.weak}</b>{josa(f.weak, '이')} {f.weakZero ? '비어 있습니다' : '가장 적습니다'}.
        </p>
        {f.sinsal.length > 0 && (
          <div className="pc-sub">
            <div className="pc-lab">명식에 새겨진 신살</div>
            {f.sinsal.map(s => (
              <p key={s.name} className="pc-p"><b>{s.name}</b>: {s.head}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
