# nakchal-saju
마지막 갱신: 2026-08-14

## 이게 뭔가
공공입찰·수주 대표 대상 회사 사주 서비스(nakchalsaju.com). Next.js 14 + Supabase + KCP, Vercel 배포(main push = 배포).

## 지금 상태
- 전 상품 990원 통일 완료(constants·report-categories·report-copy·테스트). KCP 결제모달 990원 라이브 확인.
- 디자인: KRDS 기반 리브랜딩 완료. 브라이트 블루 #3F6BE0(500)/#2F56C4(600)/#2646A3(700), 주 #B3382C, 먹 #1E2124.
- 적용 파일: app/krds-normalize.css(팔레트+정규화+다크영역 스윕2, layout.tsx서 globals 뒤 import), globals.css 끝 감청블록(변수는 normalize가 최종 오버라이드), app/icon.svg·page.tsx·DesktopSidebar·IntroSplash 로고=사주 4기둥+주점 심볼.
- 라이브 검증: 홈/요금/리딩 computed --navy=#3f6be0, CEO밴드·서브히어로·CTA·일진카드 블루. 롤링배너(HeroCarousel)는 의도적으로 미변경.

## 다음에 할 일
- [ ] 스플래시 라이브 육안 확인(세션당 1회라 시크릿창 필요)
- [ ] 남은 골드 잔재 스윕3: .cbseal 테두리, bok 페이지 금색 텍스트류, .sec .mk 배경
- [ ] GSC 칼럼 색인 요청 / 사이트맵 분리 / 내부링크 강화 (기존 pending)
- [ ] og.png·hero 포스터 이미지가 구 브라운 톤 — 파랑 리브랜드에 맞춰 재생성 검토

## 결정
- 2026-08-14 전 상품 990원 — 이유: 오픈 초기 전환 극대화, 복채는 자율 유지
- 2026-08-14 KRDS 토큰 채택(공공누리) — 이유: 신뢰·60대 가독성, AI스러움 제거
- 2026-08-14 감청 #1F2D4D → 브라이트 블루 #3F6BE0 — 이유: 사용자가 탁한 남색 기각, 스와치 지정
- 2026-08-14 로고 士 인장 → 4기둥+주점(四柱印) 오리지널 — 이유: 사주+낙찰 의미, A안 확정

## 이 PC에만 있는 것
- C:/Users/ohsel/Downloads/krds-foundation-tokens.css (KRDS 원본 846줄)
- C:/Users/ohsel/Downloads/nakchalsaju-*.html 시안 4종, nakchalsaju-theme-test-3pass.xlsx (감청 시절 테스트시트)

## 작업 로그
- 2026-08-14: 990원 통일→검증 / KRDS 정규화 레이어 / 로고·파비콘·스플래시 교체 / 블루 리브랜딩 스윕1·2 배포 검증

