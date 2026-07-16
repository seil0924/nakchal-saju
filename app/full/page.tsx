import Link from 'next/link';

export const metadata = {
  title: '전체 리포트 — 대표의 사주 열여덟 장 · 낙찰사주',
  description: '견적은 틀린 게 없는데 큰 건만 비껴간다면 — 그건 실력이 아니라 명식(命式)의 구조입니다. 대표와 회사의 사주 열여덟 장, 통째로 폅니다.',
};

// 욕구를 긁는 체크리스트 — 40~70대 입찰 대표의 실제 통점
const PAINS = [
  '견적 산출은 틀린 게 없는데, 이상하게 큰 건만 번번이 비껴간다',
  '실력은 자신 있는데 「운이 없다」는 말을 올해 몇 번이나 했다',
  '큰 개찰 날 아침 — 안 믿는다면서도 괜히 신경이 쓰인다',
  '동업·컨소시엄 제안, 사람은 좋은데 어딘가 찜찜하다',
  '잘 나가다 한 번씩 크게 꺾이는 패턴이 자꾸 반복된다',
  '직원들에게 「차갑다·고집 세다」 소리를 듣는데, 그 속은 아무도 모른다',
];

const TOC: [string, string, string][] = [
  ['器', '그릇', '대표님이 어떤 그릇으로 태어났는가'],
  ['鏡', '닮은 사주', '세계 거장 100인 중 누구와 같은 뼈대인가'],
  ['診', '유형 진단', '공격·관계·안정·분석형 — 위기의 약점까지'],
  ['符', '신살', '명식에 새겨진 특수 부호 — 괴강·백호·역마'],
  ['率', '사정률', '오늘 유리한가, 불리한가 — 시진별 창(窓)까지'],
  ['擇', '택일', '이달의 투찰 길일 캘린더 — 넣을 날, 접을 날'],
  ['曆', '사업운 캘린더', '계약·채용·발표에 좋은 날, 조심할 날'],
  ['五', '오행', '넘치는 기운과 텅 빈 자리 — 평생의 숙제'],
  ['決', '승부 기질', '밀어붙일 때와 접을 때 — 투찰의 심법'],
  ['人', '사람', '오해받는 이유, 곁에 사람을 남기는 법'],
  ['財', '재물', '언제 쥐고 언제 풀 것인가 — 새는 곳까지'],
  ['法', '법인', '회사가 대표님을 밀어주는가, 누르는가'],
  ['運', '대운', '회사의 10년 흐름 — 지금 어디쯤 와 있는가'],
  ['處', '발주처 궁합', '그 발주처, 나와 맞는 판인가'],
  ['同', '동업 궁합', '지분·결정권을 어떻게 나눠야 안 깨지는가'],
  ['協', '협정 궁합', '주관사·관재수 — 계약 전 반드시 짚을 것'],
  ['方', '방위', '기운을 돋우는 방면, 피해야 할 방면'],
  ['士', '마무리', '홀로 벼려온 날카로움을 무기로 바꾸는 한마디'],
];

const FAQ: [string, string][] = [
  ['사주, 솔직히 안 믿는 편입니다.',
    '믿으실 필요 없습니다. 이건 점(占)이 아니라 만세력·명리 데이터로 만든 의사결정 보조입니다. 오늘의 흐름과 유리한 시간대를 「참고」로 드릴 뿐, 최종 결정은 언제나 대표님 몫입니다. 안 믿는 대표님일수록, 무료 구간만 먼저 열어 보시길 권합니다.'],
  ['안 맞으면 어떡합니까?',
    '그래서 결제 전에 무료로 원국·사정률 방향·닮은 CEO까지 먼저 열어 보시게 해 뒀습니다. 무료에서 「이거 물건이네」 싶을 때만, 필요한 풀이만 낱개로 결제하십시오. 묶음으로 크게 사실 필요 없습니다.'],
  ['태어난 시간을 모릅니다.',
    '괜찮습니다. 시(時)를 몰라도 삼주(三柱)로 계산해 드립니다. 아시면 더 정밀해질 뿐, 몰라도 대부분의 풀이는 그대로 나옵니다.'],
  ['이걸로 투찰 금액을 정해도 됩니까?',
    '아닙니다. 그렇게 쓰셔서도 안 됩니다. 사정률·택일은 명리 기반 참고 정보이지 투찰금액 산정 근거가 아닙니다. 금액은 늘 대표님의 견적과 판단으로 정하시고, 이건 「언제·어떻게」의 참고로만 쓰십시오.'],
  ['개인정보는 안전합니까?',
    '사주 산출에 필요한 생년월일과 결과만 사용합니다. 결제 카드정보는 저장하지 않으며 결제대행사(PG)가 처리합니다. 자세한 내용은 개인정보처리방침에 두었습니다.'],
];

export default function FullIntro() {
  return (
    <div className="app home5">
      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="s">士</span>
          <div className="n">전체 리포트<em>大 全 書 · 十八章</em></div>
        </Link>
        <Link href="/" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>홈 ›</Link>
      </div>

      {/* 통점 히어로 (촛불·먹산수 영상) */}
      <div className="hero5">
        <video className="herovid" autoPlay muted loop playsInline poster="/fullhero-poster.jpg">
          <source src="/fullhero.mp4" type="video/mp4" />
        </video>
        <div className="wm">命</div>
        <div className="kick">運七技三</div>
        <h1>낙찰은 운이라면서,<br />왜 <b>운(運)</b>은 준비 안 하십니까</h1>
        <div className="rule" />
        <div className="sub">견적·실적·서류, 기술(技三)은 이미 갖추셨습니다. 이제 나머지 칠 할 — 운칠(運七)을 준비할 차례입니다.</div>
      </div>

      {/* 이런 대표님께 — 긁는 체크리스트 */}
      <div className="lab"><i /><span>이런 대표님께</span></div>
      <div className="painbox">
        {PAINS.map((p, i) => (
          <div key={i} className="pain"><span className="pk">✓</span>{p}</div>
        ))}
        <div className="painout">
          하나라도 뜨끔하셨다면 — 그것은 성격 탓도, 실력 탓도 아니라 <b>명식(命式)의 구조</b>입니다.<br />
          타고난 구조는 바꿀 수 없어도, <b>쓰는 법</b>은 배울 수 있습니다. 그 쓰는 법이 이 열여덟 장에 담깁니다.
        </div>
      </div>

      {/* 권위 — 감이 아니라 계산 */}
      <div className="lab"><i /><span>왜 「감」이 아니라 「계산」인가</span></div>
      <div className="auth">
        <p className="authlead">낙찰사주는 무당의 감(感)으로 찍지 않습니다. <b>천문 계산</b>으로 명식을 세웁니다.</p>
        <div className="arow"><span className="an">節</span><div><b>절기를 천문으로 계산</b>태양의 황경을 계산해 절기 경계를 잡습니다. 흔한 만세력 앱이 틀리는 절기 전후·야자시·서머타임까지 보정합니다.</div></div>
        <div className="arow"><span className="an">時</span><div><b>진태양시 −30분 보정</b>한국 경도(127.5°) 기준으로 실제 태양시를 맞춥니다. 하루가 어긋나면 사주 여덟 글자가 통째로 어긋나기 때문입니다.</div></div>
        <div className="arow"><span className="an">社</span><div><b>대표 + 법인 통합</b>대표 개인만 보지 않습니다. 회사(법인) 설립일 사주까지 함께 봐 — 회사가 대표를 밀어주는지 누르는지 읽어냅니다.</div></div>
        <p className="authout">믿고 안 믿고를 떠나 — <b>최소한 계산은 정확해야</b> 참고할 값어치가 있습니다.</p>
      </div>

      {/* 필름 밴드 — 運七 */}
      <div className="filmband">
        <video autoPlay muted loop playsInline poster="/herobg-poster.jpg"><source src="/herobg.mp4" type="video/mp4" /></video>
        <div className="fbin">
          <div className="fbk">運 七 技 三</div>
          <div className="fbt">실력(技三)은 이미 갖추셨습니다.<br />이제 남은 건 <b>운(運七)</b>입니다.</div>
        </div>
      </div>

      {/* 사용 시나리오 */}
      <div className="lab"><i /><span>개찰을 앞둔 사흘, 이렇게 씁니다</span></div>
      <div className="usecase">
        <div className="ucstep"><span className="ud">D-3</span><div><b>이번 건의 방향을 봅니다</b>전체 리포트로 사정률 방향과 승부 심법을 확인 — 정면 승부할 건인지, 접을 건인지.</div></div>
        <div className="ucstep"><span className="ud">D-1</span><div><b>날을 대조합니다</b>이달 택일 캘린더에서 개찰일이 대표님께 유리한 날인지 확인 — 아니면 다음 유리한 날로 전략 조정.</div></div>
        <div className="ucstep"><span className="ud">當日</span><div><b>시간을 맞춥니다</b>시진별 흐름에서 제출·통화에 유리한 창(窓)을 확인 — 그 시간대에 손을 씁니다.</div></div>
        <p className="ucout">맞히는 도구가 아니라, <b>결정을 돕는 도구</b>입니다.</p>
      </div>

      {/* 목차 — 열여덟 장 */}
      <div className="lab"><i /><span>열여덟 장(章) 목차</span><span className="m">항목 60여 개</span></div>
      <div className="toc">
        {TOC.map(([mk, t, d], i) => (
          <div key={i} className="tocrow">
            <span className="tmk">{mk}</span>
            <span className="ttl">{t}</span>
            <span className="tds">{d}</span>
          </div>
        ))}
      </div>

      {/* 미리보기 — 이런 깊이로 나옵니다 */}
      <div className="lab"><i /><span>이런 깊이로 나옵니다</span><span className="m">미리보기</span></div>
      <div className="fsample">
        <div className="fshd"><span className="fsmk">決</span>대표님의 승부 기질 — 밀 때와 접을 때</div>
        <p className="fstx">대표님의 승부 기질은 <b>방향이 서면 좌고우면 없이 끝을 보는</b> 쪽입니다. 일지와 십성의 기운이 겹쳐, 한번 판단이 서면 좀처럼 되돌리지 않습니다. 그 힘이 큰 건을 따내지만, 지나치면 어긋난 판에서도 물러서지 못해 손해를…</p>
        <div className="fsfade" />
        <div className="fscap">🔒 실제 리포트에서는 각 장이 이 깊이로, 대표님 명식에 맞춰 펼쳐집니다</div>
      </div>

      {/* 가격 비노출 — 무료 진입 후 결과 페이월에서만 노출 */}

      {/* FAQ — 반론 처리 */}
      <div className="lab"><i /><span>자주 묻는 질문</span></div>
      <div className="faq">
        {FAQ.map(([q, a], i) => (
          <details key={i} className="faqi">
            <summary><span className="fq">Q</span>{q}<span className="fchev">＋</span></summary>
            <div className="faqa">{a}</div>
          </details>
        ))}
      </div>

      {/* 감정의 핵 — 버팀목 (외로움을 긁고, 동행으로 갚는다) */}
      <div className="emocore">
        <video className="emovid" autoPlay muted loop playsInline poster="/herobg-poster.jpg"><source src="/why-losing-streak.mp4" type="video/mp4" /></video>
        <div className="emk">士</div>
        <p>대표님, 이 자리까지 <b>혼자</b> 오셨죠.</p>
        <p>직원도 가족도 대표님만 봅니다. 그런데 정작 대표님은 — 누구한테 기대십니까.</p>
        <p>잘 풀리면 「운이 좋았네」 하고, 안 풀리면 실력을 의심받습니다. 그 사이에서 홀로 판단하고 홀로 책임지는 밤이 얼마나 길었는지, 저는 압니다.</p>
        <div className="emrule" />
        <p>사주는 미래를 정해 드리지 않습니다. 다만 대표님이 <b>타고난 그릇이 무엇인지</b>, 오늘 바람이 <b>어느 쪽으로 부는지</b> — 그 한 가지를 곁에서 같이 봐 드립니다.</p>
        <p className="emlast">결정은 늘 대표님이 하십니다. 그 결정 앞에서 <b>혼자가 아니라는 것</b> — 참모 士가 곁에 있다는 것. 그거면 충분합니다.</p>
      </div>

      {/* 정직한 긴급성 + CTA */}
      <div style={{ padding: '22px 24px 0' }}>
        <div className="urgent">이달의 투찰 길일은 <b>이달이 지나면 사라집니다.</b> 남은 길일부터 확인하세요.</div>
        <Link className="fullcta" href="/reading">내 사주로 열어보기 <small>생년월일만 · 30초 · 무료로 시작</small></Link>
        <Link className="fullsub" href="/ceo">먼저 가볍게 — 나와 닮은 세계적 CEO 보기 (무료) →</Link>
      </div>

      <div className="foot">
        <div className="crule" />
        <div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/refund">청약철회·환불</Link>
      </div>
    </div>
  );
}
