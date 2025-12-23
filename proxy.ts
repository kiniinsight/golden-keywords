import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  // 루트(/)와 모든 경로를 포함하되, 정적 파일은 제외
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};

export async function proxy(request: NextRequest) {
  console.log('프록시/프록시/프록시/프록시/프록시')
  
  const referer = request.headers.get('referer');
  const { pathname } = request.nextUrl;
  
  // 허용할 도메인 (예: 내 워드프레스 주소)
  const ALLOWED_ORIGIN = 'zucchinicorp.com'; 
  // 차단 시 보낼 곳 (만약 루트 자체가 막혀야 한다면, 외부 사이트나 에러페이지로 보내야 합니다)
  const DESTINATION_URL = 'https://zucchinicorp.com/golden-keywords'

  // ✅ [추가됨] '/vip'로 시작하는 모든 경로는 검사 없이 통과 (프리패스)
  if (pathname.startsWith('/vip')) {
    console.log('✨ VIP 경로 접속: 통과');
    return NextResponse.next();
  }

  // [중요] 루트(/) 경로에 접속했을 때의 로직
  if (pathname === '/') {
    // 리퍼러가 없거나, 허용된 도메인이 포함되어 있지 않다면 차단
    if (!referer || !referer.includes(ALLOWED_ORIGIN)) {
      console.log('⛔ 차단: 허용되지 않은 접근입니다.');
      return NextResponse.redirect(DESTINATION_URL);
    }
  }

  // 리퍼러가 올바르면 그대로 페이지를 보여줌
  return NextResponse.next();
}
