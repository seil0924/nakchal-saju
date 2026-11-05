/** Share cancellation is intentional; other failures must offer a usable fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt('자동 복사가 지원되지 않습니다. 아래 내용을 선택해 직접 복사해주세요.', text);
    return false;
  }
}

export async function shareLink(data: { title: string; text: string; url: string }, copyOnly = false) {
  if (!copyOnly && navigator.share) {
    try { await navigator.share(data); return; }
    catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }
  }
  if (await copyText(`${data.text}\n${data.url}`)) {
    window.alert('공유 문구와 링크를 복사했어요. 카카오톡이나 문자에 붙여넣어 보내세요.');
  }
}

export function reportShareText(title: string, summary?: string) {
  return `[낙찰사주] ${title}${summary ? `\n${summary}` : ''}\n명리 기반 참고 풀이입니다. 사정률이나 낙찰 확률을 예측하지 않습니다.`;
}
