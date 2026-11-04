export const REPORT_TIMEOUT_MS = 30000;

/** 결과가 오면 즉시 반환한다. 실패·지연 시 폼을 유지하고 다시 시도할 수 있게 한다. */
export async function requestReading<T>(body: unknown, controller: AbortController): Promise<T> {
  const timer = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);
  try {
    const response = await fetch('/api/report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.error === 'birth_invalid') throw new Error('생년월일과 양력·음력 선택을 다시 확인해주세요.');
      if (data.error === 'time_invalid') throw new Error('태어난 시간을 입력하거나 ‘모름’을 골라주세요.');
      if (data.error === 'related_date_invalid') throw new Error('회사 설립일이나 상대방의 날짜를 다시 확인해주세요. 선택한 달에 있는 날짜여야 합니다.');
      throw new Error('결과를 불러오지 못했습니다. 입력 내용은 그대로입니다. 잠시 후 다시 눌러주세요.');
    }
    if (!data.reportId || !Array.isArray(data.sections) || !data.hero) throw new Error('결과를 불러오지 못했습니다. 입력 내용은 그대로입니다. 다시 시도해주세요.');
    return data as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error('응답이 늦어지고 있습니다. 입력 내용은 그대로입니다. 잠시 후 다시 시도해주세요.');
    if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('연결을 확인해주세요. 입력 내용은 그대로이니 다시 시도할 수 있습니다.');
    throw error;
  } finally { clearTimeout(timer); }
}
