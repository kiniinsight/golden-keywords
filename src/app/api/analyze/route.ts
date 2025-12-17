// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import crypto from 'crypto';

// 설정
const CONFIG = {
  API_KEY: process.env.NAVER_API_KEY,
  SECRET_KEY: process.env.NAVER_SECRET_KEY,
  CUSTOMER_ID: process.env.NAVER_CUSTOMER_ID,
  BASE_URL: 'https://api.naver.com',
  GOOGLE_SUGGEST_URL: 'https://suggestqueries.google.com/complete/search',
};

// 유틸리티 함수
const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase();
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateSignature = (timestamp: string, method: string, uri: string) => {
  const message = `${timestamp}.${method}.${uri}`;
  return crypto
    .createHmac('sha256', CONFIG.SECRET_KEY ?? '')
    .update(message)
    .digest('base64');
};

// 구글 연관검색어 가져오기
const fetchGoogleSuggestions = async (seed: string) => {
  try {
    const { data } = await axios.get(CONFIG.GOOGLE_SUGGEST_URL, {
      params: { client: 'chrome', q: seed, hl: 'ko', gl: 'kr' },
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    // [seed, ...results]
    return [seed, ...(data[1] || [])].map((term: string, index: number) => ({
      keyword: term,
      rank: index,
    }));
  } catch (e) {
    console.error('Google Fetch Error', e);
    return [];
  }
};

// 네이버 검색량 가져오기
const fetchNaverMetrics = async (keywords: string[]) => {
  if (keywords.length === 0) return [];
  try {
    const hintQuery = keywords.map((k) => k.replace(/\s+/g, '')).join(',');
    const { data } = await axios.get(`${CONFIG.BASE_URL}/keywordstool`, {
      params: { hintKeywords: hintQuery, showDetail: 1 },
      headers: {
        'X-Timestamp': Date.now().toString(),
        'X-API-KEY': CONFIG.API_KEY,
        'X-Customer': CONFIG.CUSTOMER_ID,
        'X-Signature': generateSignature(
          Date.now().toString(),
          'GET',
          '/keywordstool'
        ),
      },
    });
    return data.keywordList;
  } catch (e) {
    console.error('Naver Fetch Error', e);
    return [];
  }
};

// POST 요청 핸들러
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const seeds: string[] = body.keywords || [];

    if (seeds.length === 0) {
      return NextResponse.json({ error: '키워드를 입력해주세요.' }, { status: 400 });
    }

    const keywordMap = new Map();

    // 1. 구글 연관검색어 수집
    for (const seed of seeds) {
      const results = await fetchGoogleSuggestions(seed);
      results.forEach((item: any) => {
        const key = normalize(item.keyword);
        // 더 높은 순위(작은 숫자)가 있으면 갱신하거나 새로 추가
        if (!keywordMap.has(key) || keywordMap.get(key).rank > item.rank) {
          keywordMap.set(key, { original: item.keyword, rank: item.rank });
        }
      });
      // API 속도 조절
      await delay(100); 
    }

    const allKeys = Array.from(keywordMap.values()).map((v) => v.original);
    
    // 2. 네이버 데이터 조회 (청크 단위 처리)
    let finalData: any[] = [];
    const chunkSize = 5;

    for (let i = 0; i < allKeys.length; i += chunkSize) {
      const chunk = allKeys.slice(i, i + chunkSize);
      const rawData = await fetchNaverMetrics(chunk);

      if (rawData) {
        rawData.forEach((item: any) => {
          const key = normalize(item.relKeyword);
          const googleData = keywordMap.get(key);
          if (googleData) {
            const vol =
              (typeof item.monthlyPcQcCnt === 'number' ? item.monthlyPcQcCnt : 0) +
              (typeof item.monthlyMobileQcCnt === 'number' ? item.monthlyMobileQcCnt : 0);
            const comp = item.compIdx;
            const rank = googleData.rank;

            // 점수 계산 로직
            let score = Math.log10(vol + 1) * 20;
            if (comp === 'HIGH' || comp === '높음') score *= 0.3;
            else if (comp === 'MID' || comp === '중간') score *= 0.7;

            if (rank === 0) score += 10;
            if (rank === 1) score += 20;
            if (rank <= 3) score += 5;

            finalData.push({
              keyword: item.relKeyword,
              rank: rank,
              vol: vol,
              comp: comp, // API 결과에 따라 'LOW', 'MID', 'HIGH' 등으로 올 수 있음
              score: Math.round(score),
            });
          }
        });
      }
      await delay(100);
    }

    // 중복 제거 및 정렬 (점수 내림차순)
    const uniqueData = Array.from(
      new Map(finalData.map((item) => [item.keyword, item])).values()
    );
    uniqueData.sort((a, b) => b.score - a.score);

    return NextResponse.json({ result: uniqueData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}
