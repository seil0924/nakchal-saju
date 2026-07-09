import Link from 'next/link';
export const metadata = { title: '개인정보처리방침 · 낙찰사주' };

export default function Privacy() {
  return (
    <div className="app">
      <div className="hero"><div className="k">運 七 技 三</div><h1>개인정보처리방침</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p></div>
      <div className="wrap">
        <div className="card" style={{ lineHeight: 1.75, fontSize: 13.5, color: '#3a3f47' }}>
          <p><b>1. 수집 항목</b><br />로그인 시 카카오 계정 식별자, 리포트 산출을 위한 생년월일·시(선택)·성별(선택), 관계 진단 입력(발주처·법인·상대 설립일 등, 선택), 결제 시 결제 대행사(포트원)를 통한 결제 정보.</p>
          <p style={{ marginTop: 12 }}><b>2. 이용 목적</b><br />사주 리포트 산출·제공, 결제 처리 및 유료 콘텐츠 제공, 서비스 개선.</p>
          <p style={{ marginTop: 12 }}><b>3. 보관·파기</b><br />생년월일 등 입력값은 리포트 재열람을 위해 보관하며, 이용자가 삭제를 요청하거나 회원 탈퇴 시 지체 없이 파기합니다.</p>
          <p style={{ marginTop: 12 }}><b>4. 제3자 제공·처리 위탁</b><br />결제 처리를 위해 포트원(PortOne) 등 결제대행사에, 인증·저장을 위해 Supabase에 필요한 범위에서 위탁·제공될 수 있습니다.</p>
          <p style={{ marginTop: 12 }}><b>5. 이용자 권리</b><br />이용자는 자신의 개인정보 열람·정정·삭제를 요청할 수 있습니다.</p>
          <p style={{ marginTop: 12, color: '#8d8672', fontSize: 12 }}>※ 본 방침은 배포용 초안입니다. 실제 서비스 개시 전 개인정보 보호법 검토가 필요합니다.</p>
        </div>
      </div>
    </div>
  );
}
