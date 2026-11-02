import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';

/** 입력·결과·저장한 리포트에서 같은 열람 범위를 안내한다. */
export default function TaekilAccess({ unlocked = false }: { unlocked?: boolean }) {
  return (
    <section className="taekil-access" aria-label="투찰 택일 무료·유료 열람 범위">
      <div className="taekil-access-grid">
        <div>
          <b>무료로 확인</b>
          <p>기본 명식 · 오늘의 해석과 시진<br />오늘부터 7일 흐름 · 30일 안의 길일 개수</p>
        </div>
        <div>
          <b>{unlocked ? '30일 전체 열람 중' : `${won(CAT_INFO.sajeong.price)} · 결제 후 추가`}</b>
          <p>나머지 23일을 포함한 30일 전체 흐름<br />명리 기준 길일 날짜와 길일별 시진</p>
        </div>
      </div>
      <p className="taekil-access-note">{unlocked ? '열린 날짜와 시간대는 아래에서 확인할 수 있습니다.' : '무료 결과를 먼저 보고 구매를 선택하세요. 표시 금액은 부가세 포함입니다.'}</p>
    </section>
  );
}
