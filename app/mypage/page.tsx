import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authEnabled, currentUserRole } from '@/lib/supabase/server';
import LogoutButton from './LogoutButton';

export const metadata = { title: '마이페이지 · 낙찰사주' };

const Gear = () => (<svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1z" /></svg>);

export default async function MyPage() {
  let name = '대표님', email = '', provider = '', admin = false;
  if (authEnabled()) {
    const { user, role, profile } = await currentUserRole() as any;
    if (!user) redirect('/login');
    name = (profile?.name ? profile.name + ' 대표님' : '대표님');
    email = profile?.email ?? user.email ?? '';
    provider = user.app_metadata?.provider ?? '';
    admin = role === 'admin';
  } else {
    name = '대표님'; email = '데모 모드 (로그인 미설정)'; provider = 'kakao';
  }
  const provKo: Record<string, string> = { kakao: '카카오', naver: '네이버', google: '구글' };
  return (
    <div className="app home">
      <div className="topbar"><div className="logo"><span className="s">士</span>마이페이지</div><div className="ic"><Gear /></div></div>
      <div style={{ padding: '0 16px 24px' }}>
        <div className="profcard" style={{ marginTop: 14 }}>
          <div className="pav">士</div>
          <div>
            <div className="pn">{name}{provider && <span className={'provbadge ' + provider}>{provKo[provider] ?? provider}</span>}</div>
            <div className="ps">{email || '회사 정보 미입력'}</div>
          </div>
        </div>
        <div className="mychips">
          <div className="c"><div className="k">구독</div><div className="v">무료</div></div>
          <div className="c"><div className="k">보관 리포트</div><div className="v">0건</div></div>
          <div className="c"><div className="k">등록 회사</div><div className="v">0곳</div></div>
        </div>

        <div className="sechd"><span className="t"><span className="b" />내 정보</span></div>
        <div className="setrow">
          <Link href="/reading">대표 사주 정보<span className="r">입력·수정 ›</span></Link>
          <Link href="/reading">회사(법인) 정보<span className="r">설립일·상호 ›</span></Link>
          <Link href="/reading">회사 주소·방위<span className="r">개운 방위 ›</span></Link>
        </div>

        <div className="sechd"><span className="t"><span className="b" />이용</span></div>
        <div className="setrow">
          <Link href="/reading">구독 관리<span className="r">›</span></Link>
          <Link href="/vault">보관함<span className="r">›</span></Link>
          <Link href="/ritual">투찰 부적 리추얼<span className="r">吉 ›</span></Link>
          {admin && <Link href="/admin" style={{ color: 'var(--navy)' }}>관리자 페이지<span className="r">운영자 ›</span></Link>}
        </div>

        <div className="sechd"><span className="t"><span className="b" />고객</span></div>
        <div className="setrow">
          <Link href="/terms">이용약관 · 면책<span className="r">›</span></Link>
          <Link href="/privacy">개인정보 처리방침<span className="r">›</span></Link>
          <a href="mailto:help@nakchal-saju.example.com">고객센터<span className="r">문의 ›</span></a>
          <LogoutButton />
        </div>
      </div>
      <div className="tab">
        <Link href="/"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</Link>
        <Link href="/balju"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</Link>
        <Link className="fab" href="/reading"><span className="fi">士</span><span className="fl">오늘 전망</span></Link>
        <Link href="/vault"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</Link>
        <a className="on"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>마이</a>
      </div>
    </div>
  );
}
