'use client';
// 결제창을 닫고 리포트가 아닌 화면(발주처 찾기·복채)으로 돌아왔을 때 한 줄로 알린다(2026-10-23).
// 예전엔 패스 결제를 취소하면 아무 말 없이 홈으로 떨어져, 돈이 나갔는지조차 알 수 없었다.
// 리포트 화면은 자기 안내가 따로 있어 여기서는 건너뛴다.
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PayNotice() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!pathname || pathname.startsWith('/report/')) return;
    const u = new URL(window.location.href);
    if (u.searchParams.get('paid') !== '0') return;
    setShow(true);
    // 새로고침·공유 때 다시 뜨지 않게 주소에서 지운다
    u.searchParams.delete('paid'); u.searchParams.delete('why');
    window.history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
  }, [pathname]);
  if (!show) return null;
  return (
    <div className="paytoast">
      <p className="paynote cancel" role="status">
        결제를 마치지 않았습니다. 돈은 나가지 않았습니다. 다시 하시려면 결제 버튼을 한 번 더 눌러 주세요.
        <button type="button" onClick={() => setShow(false)} style={{ marginLeft: 8, background: 'none', border: 0, color: 'inherit', textDecoration: 'underline', font: 'inherit', cursor: 'pointer' }}>닫기</button>
      </p>
    </div>
  );
}
