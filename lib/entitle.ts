// lib/entitle.ts — 이 리포트를 어디까지 보여 줄 것인가. 판정은 여기 한 곳에서만 한다.
//
// 관리자는 결제 없이 전부 본다. 손볼 때마다 실제 카드로 결제를 태울 수는 없기 때문이다.
//
// 지켜야 할 선이 둘 있다.
//  1. 판정은 **서버에서 profiles.role='admin'** 으로만 한다.
//     쿼리스트링·쿠키·환경변수 스위치로 열면 그건 우회로가 아니라 구멍이다.
//  2. 관리자에게 보내는 응답에는 admin: true 를 같이 실어 화면이 "관리자로 열람 중"이라고
//     말하게 한다. 안 그러면 유료 게이팅이 고장 난 걸 고쳐진 걸로 착각하게 된다.
import 'server-only';
import { authEnabled, isAdmin } from '@/lib/supabase/server';
import { unlockLevel, hasBaljuPass } from '@/lib/store';

export type Entitlement = {
  level: number;    // 0 무료 · 1 택일팩 · 2 전체
  bpass: boolean;   // 발주처 프리미엄 패스
  admin: boolean;   // 결제가 아니라 관리자 권한으로 열린 것인가
};

export async function entitlement(reportId: string, userId?: string | null): Promise<Entitlement> {
  if (authEnabled() && (await isAdmin())) {
    return { level: 2, bpass: true, admin: true };
  }
  return {
    level: await unlockLevel(reportId),
    bpass: await hasBaljuPass(userId),
    admin: false,
  };
}

// 소유권 검사에서도 관리자는 통과시킨다. 남의 리포트를 열어 봐야 문의에 답할 수 있다.
export async function adminBypass(): Promise<boolean> {
  return authEnabled() ? await isAdmin() : false;
}

