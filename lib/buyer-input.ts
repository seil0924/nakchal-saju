// Shared by checkout, purchase lookup and server validation.
export const normName = (v: string) => String(v ?? '').normalize('NFC').replace(/\s+/g, '').slice(0, 20);
export function normPhone(v: string): string {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('82') && d.length >= 11) d = '0' + d.slice(2);
  return d;
}
export const validPhone = (d: string) => /^01[016789]\d{7,8}$/.test(d);
export function buyerInputError(name: string, phone: string): string {
  if (!normName(name)) return '결제할 때 사용할 성함을 입력해주세요.';
  if (!validPhone(normPhone(phone))) return '휴대폰 번호를 끝까지 확인해주세요. 예: 010-1234-5678';
  return '';
}
