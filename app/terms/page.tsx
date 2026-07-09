import Link from 'next/link';
export const metadata = { title: '이용약관 · 낙찰사주' };

export default function Terms() {
  return (
    <div className="app">
      <div className="hero"><div className="k">運 七 技 三</div><h1>이용약관</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p></div>
      <div className="wrap">
        <div className="card" style={{ lineHeight: 1.75, fontSize: 13.5, color: '#3a3f47' }}>
          <p><b>제1조 (목적)</b><br />본 약관은 ‘낙찰사주’(이하 “서비스”)가 제공하는 명리 기반 참고 정보 서비스의 이용 조건을 정합니다.</p>
          <p style={{ marginTop: 12 }}><b>제2조 (서비스의 성격)</b><br />본 서비스가 제공하는 사정률·궁합·운세는 <b>재미로 보는 명리 기반 참고 정보</b>이며, 실제 입찰 투찰금액 산정의 근거로 사용할 수 없습니다. 서비스는 결과의 정확성이나 특정 결과를 보증하지 않습니다.</p>
          <p style={{ marginTop: 12 }}><b>제3조 (유료 콘텐츠·결제)</b><br />전체 리포트 등 유료 콘텐츠는 결제 완료 후 열람할 수 있습니다. 디지털 콘텐츠의 특성상 열람(잠금 해제) 이후에는 관련 법령이 정한 범위에서 청약철회·환불이 제한될 수 있습니다.</p>
          <p style={{ marginTop: 12 }}><b>제4조 (책임의 제한)</b><br />이용자가 본 서비스의 정보를 근거로 내린 판단과 그 결과에 대한 책임은 이용자 본인에게 있습니다.</p>
          <p style={{ marginTop: 12, color: '#8d8672', fontSize: 12 }}>※ 본 약관은 배포용 초안입니다. 실제 서비스 개시 전 법률 검토가 필요합니다.</p>
        </div>
      </div>
    </div>
  );
}
