// 신뢰 앵커 — 지어낸 후기·감수자·적중률 대신, 엔진이 실제로 하는 계산을 공개.
// 감수·후기·복기는 정직한 '상태'로 표기(실값이 채워지면 켜짐).
export default function TrustStrip() {
  return (
    <div className="trust no-print">
      <div className="trhd"><span className="trseal">士</span><b>낙찰사주를 믿어도 되나요</b></div>
      <div className="trmethod">
        <div className="trm"><b>천문(天文) 절기 계산</b><span>입춘·12절을 고정표가 아니라 태양황경으로 판정 — 경계에 태어난 사주도 정확히 가릅니다</span></div>
        <div className="trm"><b>시(時) 정밀 보정</b><span>진태양시(경도)·서머타임 이력·야자시까지 반영해 시주를 바로잡습니다</span></div>
        <div className="trm"><b>음·양력 자동 변환</b><span>1900~2100 음력·윤달을 자동 환산 — 입력만 하면 됩니다</span></div>
        <div className="trm"><b>스스로 복기하는 구조</b><span>공개 개찰 결과와 대조해 예측을 되짚는 구조 — 근거 없는 장담 대신 검증을 지향합니다</span></div>
      </div>
      <div className="trdisc">명리 기반 <b>참고 정보</b>입니다 · 투찰금액 산정 근거가 아닙니다</div>
    </div>
  );
}
