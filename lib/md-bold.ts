// 한글 본문의 **굵게** 를 marked 에 넘기기 전에 <strong> 으로 바꾼다.
// CommonMark 는 닫는 ** 앞이 문장부호이고 뒤가 글자면 굵게로 안 본다 — `**흐름(절기)**을` 이 별표째 화면에 나갔다
// (칼럼 21편 31곳, 2026-09-14). 한 줄 안에서만 짝을 찾고, 코드 칸(`…`)은 건드리지 않는다.
export function boldToStrong(md: string): string {
  return md.split('\n').map(line => {
    if (/^\s{4}|^\s*```/.test(line)) return line;
    return line.split(/(`[^`]*`)/).map(part => part.startsWith('`') ? part
      : part.replace(/\*\*(?=\S)([^*\n]+?)(?<=\S)\*\*/g, '<strong>$1</strong>')).join('');
  }).join('\n');
}
