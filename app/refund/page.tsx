import Link from 'next/link';
import { bizFooterLine } from '@/lib/bizinfo';
export const metadata = { title: '청약철회·환불 안내 · 낙찰사주' };

const SECTIONS: [string, string][] = [
  ['한눈에', '유료 리포트는 디지털 콘텐츠입니다. <열람 전>에는 결제 취소·전액 환불이 가능하고, <열람 후>에는 콘텐츠 특성상 청약철회가 제한됩니다. 결제 전 이 내용을 고지드립니다.'],
  ['1. 열람 전 (미열람) 환불', '결제 후 아직 해당 리포트를 열람하지 않았다면, 고객센터로 요청 시 전액 환불해 드립니다. 결제수단 취소 방식으로 처리되며, PG·카드사 사정에 따라 영업일 기준 수일이 소요될 수 있습니다.'],
  ['2. 열람 후 청약철회 제한', '리포트 열람(잠금 해제·콘텐츠 확인)이 개시된 경우, 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항에 따라 청약철회가 제한됩니다. 이는 즉시 소비되는 디지털 콘텐츠의 특성에 따른 것으로, 결제 화면에서 사전 동의를 받습니다. 무료 미리보기(무료 섹션·오늘의 사정률)로 충분히 확인하신 뒤 결제해 주세요.'],
  ['3. 회사 귀책·미제공 시', '결제되었으나 시스템 오류 등 회사의 귀책으로 리포트가 정상 제공되지 않은 경우, 또는 표시·광고와 현저히 다른 경우에는 열람 여부와 무관하게 관련 법령에 따라 환불해 드립니다.'],
  ['4. 복채(福債)', '복채는 받은 풀이에 대한 자율적 감사·기원의 성격이며 리포트 열람과 무관합니다. 자발적 결제의 특성상 원칙적으로 환불 대상이 아니나, 오결제 등은 고객센터로 문의해 주세요.'],
  ['5. 환불 요청 방법', '고객센터(이메일/채널)로 결제자 성함·결제일시·주문번호와 함께 요청해 주시면 확인 후 안내드립니다. 처리 현황은 요청하신 연락처로 회신드립니다.'],
];

export default function Refund() {
  return (
    <div className="app">
      <div className="hero"><div className="k">運 七 技 三</div><h1>청약철회·환불 안내</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p></div>
      <div className="wrap">
        <div className="card" style={{ lineHeight: 1.8, fontSize: 13.5, color: '#3a3f47' }}>
          {SECTIONS.map(([h, b], i) => (
            <p key={i} style={{ marginTop: i ? 14 : 0 }}><b style={{ color: 'var(--navy)' }}>{h}</b><br />{b.replace(/</g, '‹').replace(/>/g, '›')}</p>
          ))}
          <p style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #e6ddc9', fontSize: 12, color: '#6f6a5c' }}>
            {bizFooterLine()}
          </p>
          <p style={{ marginTop: 10, fontSize: 12, color: '#6f6a5c' }}>자세한 내용은 <Link href="/terms" style={{ color: 'var(--navy)' }}>이용약관</Link> 제6·7조를 따릅니다.</p>
        </div>
      </div>
    </div>
  );
}
