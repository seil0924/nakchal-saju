'use client';
import { useState } from 'react';

type Section = { mk: string; free: boolean; t: string; html: string };
type Gauge = { dir: string; band: [string, string]; pos: number; precise?: string };
type Result = { reportId: string; title: string; gauge: Gauge; sections: Section[] };

export default function Home() {
  const [f, setF] = useState({
    name: '오세일', birth: '1972-03-18', time: '09:20', knowTime: true,
    cal: 'solar' as 'solar' | 'lunar', leap: false,
    client: '', legal: '', partner: '', ally: '', worry: '',
  });
  const [res, setRes] = useState<Result | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));

  async function run() {
    setBusy(true); setUnlocked(false);
    const body = {
      name: f.name, birth: f.birth, time: f.knowTime ? f.time : null,
      cal: f.cal, leap: f.leap,
      client: f.client || null, legal: f.legal || null, partner: f.partner || null, ally: f.ally || null,
      worry: f.worry,
    };
    const r = await fetch('/api/report', { method: 'POST', body: JSON.stringify(body) }).then(x => x.json());
    setRes(r); setBusy(false);
    setTimeout(() => document.getElementById('rep')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  async function pay() {
    if (!res) return;
    setBusy(true);
    // ① 서버가 금액 확정
    const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: res.reportId }) }).then(x => x.json());

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
    if (storeId && channelKey) {
      // ②-A 실서비스: 포트원 브라우저 SDK로 결제창 호출 → 웹훅이 서버에서 재검증
      const PortOne = (await import('@portone/browser-sdk/v2')).default;
      const r = await PortOne.requestPayment({
        storeId, channelKey,
        paymentId: prep.paymentId,
        orderName: prep.orderName ?? '낙찰사주 전체 리포트',
        totalAmount: prep.amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'EASY_PAY',
      });
      if (r?.code) { setBusy(false); alert('결제가 취소되었습니다.'); return; }
      // 웹훅이 비동기로 도착 → 잠깐 폴링 후 유료 리포트 요청
    } else {
      // ②-B 데모: 결제창 대신 mock-confirm (실서비스는 포트원 웹훅이 대신)
      await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
    }

    // ③ 유료 리포트 재요청 (결제 검증되면 200, 아니면 402)
    let full: any = null;
    for (let i = 0; i < 6; i++) {
      const resp = await fetch('/api/report/paid?id=' + res.reportId);
      if (resp.ok) { full = await resp.json(); break; }
      await new Promise(r => setTimeout(r, 700)); // 웹훅 도착 대기
    }
    if (!full) { setBusy(false); alert('결제 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.'); return; }
    setRes({ ...res, ...full }); setUnlocked(true); setModal(false); setBusy(false);
  }

  const seg = (on: boolean) => 'seg-b' + (on ? ' on' : '');

  return (
    <div className="app">
      <div className="hero">
        <div className="k">運 七 技 三</div>
        <h1>낙찰사주 · 작동 엔진</h1>
        <p>서버 게이팅 MVP — 유료 정밀값은 결제 검증 후 서버에서만 계산</p>
      </div>
      <div className="wrap">
        <div className="card">
          <div className="st"><span className="b" />내 정보</div>

          <label>대표님 성함 <span className="opt">(선택)</span></label>
          <input value={f.name} maxLength={12} onChange={e => set('name', e.target.value)} />

          <label>달력</label>
          <div className="seg">
            <button className={seg(f.cal === 'solar')} onClick={() => set('cal', 'solar')}>양력</button>
            <button className={seg(f.cal === 'lunar')} onClick={() => set('cal', 'lunar')}>음력</button>
          </div>
          {f.cal === 'lunar' && (
            <div>
              <div className="seg" style={{ marginTop: 8 }}>
                <button className={seg(!f.leap)} onClick={() => set('leap', false)}>평달</button>
                <button className={seg(f.leap)} onClick={() => set('leap', true)}>윤달</button>
              </div>
              <div className="note">※ 음력은 자동으로 양력 환산 후 만세력 계산 (1900~2100)</div>
            </div>
          )}

          <label>생년월일</label>
          <input type="date" value={f.birth} onChange={e => set('birth', e.target.value)} />

          <label>태어난 시간을 아시나요?</label>
          <div className="seg">
            <button className={seg(f.knowTime)} onClick={() => set('knowTime', true)}>예</button>
            <button className={seg(!f.knowTime)} onClick={() => set('knowTime', false)}>아니오 (삼주)</button>
          </div>
          {f.knowTime && (
            <div>
              <label>태어난 시각</label>
              <input type="time" value={f.time} onChange={e => set('time', e.target.value)} />
              <div className="tsnote">✓ 진태양시 −30분 자동 보정 (한국 경도 기준)</div>
            </div>
          )}

          <div className="subhd">관계·법인 진단 <span>(선택)</span></div>
          <label>발주처 설립일 <span className="opt">· 발주처 궁합</span></label>
          <input type="date" value={f.client} onChange={e => set('client', e.target.value)} />
          <label>법인 설립일 <span className="opt">· 법인 운세</span></label>
          <input type="date" value={f.legal} onChange={e => set('legal', e.target.value)} />
          <label>동업 상대 생년월일 <span className="opt">· 동업 궁합</span></label>
          <input type="date" value={f.partner} onChange={e => set('partner', e.target.value)} />
          <label>협정 상대 회사 설립일 <span className="opt">· 협정 궁합</span></label>
          <input type="date" value={f.ally} onChange={e => set('ally', e.target.value)} />

          <label>지금 고민되는 입찰·결정 <span className="opt">(선택)</span></label>
          <textarea value={f.worry} maxLength={200} onChange={e => set('worry', e.target.value)}
            placeholder="예) 이번에 도로공사 큰 건 넣을지 고민입니다" />

          <button className="go" onClick={run} disabled={busy}>{busy ? '짚는 중…' : '내 사주 리포트 뽑기 →'}</button>
          <div className="note">※ 재미로 보는 명리 기반 참고 정보. 실제 투찰금액 산정 근거로 사용 불가.</div>
        </div>

        {res && (
          <div id="rep">
            <div className="rephd">{res.title}</div>
            <div id="acc">
              {res.sections.map((sec, i) => {
                const open = sec.free || (unlocked && sec.html);
                const locked = !sec.free && !unlocked;
                return (
                  <div key={i} className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')}>
                    <div className="hd">
                      <div className="mk">{sec.mk}</div>
                      <div className="ti">{sec.t}</div>
                      {sec.free ? <span className="lb free">무료</span>
                        : unlocked ? <span className="lb free">열림</span>
                        : <span className="lb">🔒</span>}
                      <div className="cv">▾</div>
                    </div>
                    <div className="bd">
                      {sec.html
                        ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                        : <p style={{ color: '#a99f88' }}>🔒 결제 후 열람 가능한 섹션입니다.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {!unlocked && (
              <div className="cta" onClick={() => setModal(true)}>
                전체 리포트 열기
                <small>첫 열람 990원 · 전체 섹션 + 소수점 정밀값</small>
              </div>
            )}
            {unlocked && res.gauge.precise && (
              <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b> 공개</div>
            )}
            <div className="disc">
              만세력·십성·오행 상성으로 결정론적으로 산출한 명리 기반 참고 정보입니다.<br />
              실제 투찰금액 산정의 근거로 사용할 수 없습니다.
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet">
            <div className="grip" />
            <h3>전체 리포트 잠금 해제</h3>
            <div className="price"><span className="p">990원</span><span className="o">1,900원</span></div>
            <div className="plan">첫 열람 특가 · 전체 섹션 + 궁합 + 소수점 정밀값</div>
            <div className="pay kakao on2">카카오페이</div>
            <div className="pay toss">토스페이</div>
            <div className="pay">신용/체크카드</div>
            <button className="paygo" onClick={pay} disabled={busy}>{busy ? '결제 처리중…' : '990원 결제하기'}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
            <div className="msec">🔒 데모: 결제 확정을 서버(store)에서 시뮬레이션 · 실서비스는 포트원 웹훅 재검증</div>
          </div>
        </div>
      )}
    </div>
  );
}
