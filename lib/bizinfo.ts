// lib/bizinfo.ts — 사업자정보 단일 소스 (푸터·약관·환불·요금안내 공용)
// ⚠️ 아래 대괄호 [ ] 값을 실제 사업자 정보로 교체하세요 (KCP/전자상거래법 필수).
export const BIZ = {
  company: '[상호]',
  ceo: '[대표자명]',
  bizNo: '[사업자등록번호]',
  mailOrderNo: '[통신판매업 신고번호]',
  address: '[사업장 주소]',
  email: 'help@nakchal-saju.example.com',
  tel: '[고객센터 전화]',
  built: '자체제작(독립몰)',
};
export const bizFooterLine = () =>
  `${BIZ.company} · 대표 ${BIZ.ceo} · 사업자등록번호 ${BIZ.bizNo} · 통신판매업신고 ${BIZ.mailOrderNo} · ${BIZ.address} · 고객센터 ${BIZ.email}`;
