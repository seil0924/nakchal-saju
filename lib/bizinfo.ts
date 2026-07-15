// lib/bizinfo.ts — 사업자정보 단일 소스 (푸터·약관·환불·요금안내 공용)
export const BIZ = {
  company: '나인굿즈',
  ceo: '오세일',
  bizNo: '535-21-01704',
  address: '대전광역시 서구 가장로31 글로리빌 403호',
  email: 'ohselie24@naver.com',
  tel: '010-2131-1924',
  built: '자체제작(독립몰)',
};
// 통신판매업 신고 전 단계 — 신고번호는 표기에서 제외(추후 신고 후 추가).
export const bizFooterLine = () =>
  `${BIZ.company} · 대표 ${BIZ.ceo} · 사업자등록번호 ${BIZ.bizNo} · ${BIZ.address} · 고객센터 ${BIZ.email} · ${BIZ.tel}`;
