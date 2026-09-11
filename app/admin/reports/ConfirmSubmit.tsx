'use client';
// 지우기 전에 한 번 묻는 제출 버튼. 서버 액션 폼 안에 넣어 쓴다.
// 되돌릴 수 없는 버튼이라 확인 창에서 '취소' 를 누르면 제출 자체를 막는다.
export default function ConfirmSubmit({ label, message, disabled, small }: {
  label: string; message: string; disabled?: boolean; small?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}
      style={{
        fontFamily: 'inherit', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: small ? 12 : 13.5, padding: small ? '6px 10px' : '10px 16px', minHeight: small ? 32 : 40,
        borderRadius: 8, border: '1px solid ' + (disabled ? '#ddd3bd' : '#c0392b'),
        background: disabled ? '#f4f1ea' : small ? '#fff' : '#c0392b',
        color: disabled ? '#a39c8e' : small ? '#c0392b' : '#fff',
      }}
    >{label}</button>
  );
}
