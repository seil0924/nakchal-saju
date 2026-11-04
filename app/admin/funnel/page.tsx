import { getFunnelStats } from '@/lib/admin-funnel';
import { kstStamp } from '@/lib/admin-format';
export const dynamic = 'force-dynamic';
const SOURCE = { ceo: '닮은 CEO', sajang: '대표가 될 사주일까', direct: '직접 진입·기타' };
const STAGES = [
  ['entry_result','유입 결과'], ['bridge_click','이어 보기'], ['input_view','정보 확인'], ['free_result','무료 결과'],
  ['preview_view','미리보기 노출'], ['checkout_open','구매 확인창'], ['payment_start','결제 시도'], ['paid','결제 완료'], ['paid_open','유료 풀이 열림'],
] as const;
const LABEL: Record<string,string> = Object.fromEntries(STAGES);
export default async function FunnelPage() {
  const s = await getFunnelStats();
  return <><div className="atop"><div><h1>구매 전환 흐름</h1><div className="sub">최근 7일 · 같은 풀이 여정의 같은 단계는 한 번만 집계</div></div></div>
    <div className="abody">
      <div className="acard" style={{padding:20,lineHeight:1.8}}>
        <p>닮은 CEO·대표 유형에서 시작한 흐름과 직접 들어온 흐름을 나눠 봅니다. 대표 사주와 투찰 택일을 집계합니다.</p>
        <p>숫자는 사람 수가 아닌 <b>풀이 여정 수</b>입니다. ‘미리보기 노출’은 카드가 화면에 보인 경우이며, 읽었다는 뜻은 아닙니다. 결제 완료는 서버의 실제 결제 기록으로 확인합니다.</p>
        <p>관리자 기기와 알려진 봇은 제외합니다. 이벤트에는 이름·생년월일·연락처·리포트 접근 토큰을 넣지 않습니다.</p>
        <p>이 기능을 배포한 뒤부터 기록합니다. {s.first ? `현재 조회 기간의 첫 기록: ${kstStamp(s.first)}` : '아직 관측된 여정이 없습니다.'}</p>
        {!s.ready && <p role="alert">전환 기록을 읽지 못했습니다. 데이터 연결 상태를 확인해주세요.</p>}
        {!s.paidReady && s.ready && <p role="alert">결제 원장을 읽지 못해 완료 수를 표시하지 않습니다. 0건을 뜻하지 않습니다.</p>}
      </div>
      {s.ready && s.rows.map(row => <section key={row.source+row.cat}>
        <div className="atop"><div><h2 style={{fontSize:18}}>{SOURCE[row.source]} · {row.cat==='daepyo'?'대표 사주':'투찰 택일'}</h2></div></div>
        <div className="acard" style={{overflowX:'auto'}}><table><thead><tr>{STAGES.map(([id,label])=><th key={id}>{label}</th>)}</tr></thead>
          <tbody><tr>{STAGES.map(([id])=><td key={id}>{id==='paid'&&!s.paidReady?'확인 불가':row.counts[id]}</td>)}</tr></tbody></table></div>
        <div className="acard"><table><thead><tr><th>단계</th><th>다음 단계 관측</th><th>전환율</th><th>다음 단계 미관측</th></tr></thead><tbody>
          {row.transitions.map(t=><tr key={t.from}><td>{LABEL[t.from]} → {LABEL[t.to]}</td><td>{!s.paidReady&&(t.to==='paid'||t.from==='paid')?'확인 불가':`${t.advanced} / ${t.total}`}</td><td>{!s.paidReady&&(t.to==='paid'||t.from==='paid')?'—':t.total?`${(100*t.advanced/t.total).toFixed(1)}%`:'—'}</td><td>{!s.paidReady&&(t.to==='paid'||t.from==='paid')?'—':t.missing}</td></tr>)}
        </tbody></table></div>
        <p style={{padding:'4px 16px',fontSize:13}}>구매 확인창 닫기 {row.counts.checkout_close} · 결제 취소 {row.counts.payment_cancel} · 확인 중 {row.counts.payment_pending} · 오류 {row.counts.payment_error}</p>
      </section>)}
      <p style={{padding:16,lineHeight:1.8}}>‘다음 단계 미관측’에는 아직 진행 중인 경우, 다음 날 돌아오는 경우, 기록 전송이 막힌 경우도 포함됩니다. 이탈을 확정하지 않습니다. 취소·확인 중·오류는 발생 이력으로, 이후 결제가 완료된 여정에도 남습니다. 단계를 건너뛰면 뒤 단계의 관측 수가 앞 단계보다 많을 수 있습니다.</p>
    </div></>;
}
