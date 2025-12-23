import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '황금 키워드 채굴기 - 네이버/구글 검색량 & 경쟁강도 무료 조회',
  description: '블로그, 스마트스토어 상위노출을 위한 꿀통 키워드를 3초 만에 찾으세요. 월간 검색량과 경쟁 강도를 실시간으로 분석해 드립니다. 100% 무료.',
  keywords: ['황금키워드', '키워드마스터', '블랙키위', '웨어이즈포스트', '스마트스토어키워드', '블로그키워드', '경쟁강도'],
  openGraph: {
    title: '💎 황금 키워드 채굴기 (무료)',
    description: '돈이 되는 키워드, 아직도 감으로 잡으시나요? 데이터로 검증된 상위 1% 키워드를 지금 바로 확인하세요.',
    url: 'https://golden-keywords.vercel.app', // 혹은 워드프레스 페이지 URL로 설정해도 좋음
    siteName: '황금 키워드 채굴기',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // public 폴더에 썸네일 이미지 하나 넣어두면 최고
        width: 1200,
        height: 630,
        alt: '황금 키워드 분석 예시 화면',
      },
    ],
  },
  robots: {
    index: true, 
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
