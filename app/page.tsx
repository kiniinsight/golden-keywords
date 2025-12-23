'use client';

import { useState } from 'react';

// 데이터 타입 정의
type KeywordData = {
  keyword: string;
  rank: number;
  vol: number;
  comp: string;
  score: number;
};

// ✨ 로딩 애니메이션 컴포넌트
const MiningLoader = ({ message }: { message: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative">
        {/* 뒤광채 효과 */}
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
        {/* 메인 아이콘 */}
        <div className="relative text-6xl animate-bounce">💎</div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
          황금 키워드 채굴 중...
        </h3>
        {/* 실시간 변경되는 로그 메시지 */}
        <p className="text-indigo-200 font-mono text-sm">
          &gt; {message}<span className="animate-blink">_</span>
        </p>
      </div>

      {/* 진행바 데코레이션 */}
      <div className="mt-6 w-64 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-progress"></div>
      </div>
      
      <style jsx>{`
        @keyframes blink { 50% { opacity: 0; } }
        .animate-blink { animation: blink 1s step-end infinite; }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress { animation: progress 1.5s infinite linear; }
      `}</style>
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('시스템 초기화 중...');

  // 로딩 메시지 목록
  const loadingMessages = [
    "Google 연관 검색어 수집 중...",
    "잠재 트래픽 데이터 분석 중...",
    "네이버 광고 API 접속 시도...",
    "경쟁 강도 계산 중...",
    "황금 키워드 필터링 중...",
    "데이터 정렬 및 시각화 중..."
  ];

  // ✨ [핵심] 실시간 키워드 개수 계산 및 제한 확인
  // 콤마(,)나 줄바꿈(\n)으로 쪼개고 빈 값은 제거한 뒤 개수 셈
  const keywordsList = input.split(/,|\n/).map(k => k.trim()).filter(k => k);
  const keywordCount = keywordsList.length;
  const isOverLimit = keywordCount > 3; // 3개 초과 여부

  const handleAnalyze = async () => {
    // 입력값이 없거나 3개를 초과하면 실행 막음
    if (!input.trim()) return;
    if (isOverLimit) {
      alert('키워드는 한 번에 최대 3개까지만 분석 가능합니다.');
      return;
    }
    
    setLoading(true);
    setData([]);

    // 로딩 메시지 롤링 효과
    let msgIndex = 0;
    setLoadingMsg(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIndex]);
    }, 800);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: keywordsList }),
      });
      
      const json = await res.json();
      if (json.result) {
        setData(json.result);
      } else if (json.error) {
        alert(json.error);
      }
    } catch (err) {
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* 로딩 오버레이 */}
      {loading && <MiningLoader message={loadingMsg} />}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">💎 황금 키워드 탐색기</h1>
          <p className="text-gray-600">
            당신의 비즈니스, 블로그를 위한 <span className="font-bold text-indigo-600">진짜 트래픽</span>을 찾아보세요.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 transition-all hover:shadow-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            분석할 키워드 입력 (콤마나 줄바꿈으로 구분)
          </label>
          
          <textarea
            className={`w-full border rounded-lg p-3 transition resize-none outline-none
              ${isOverLimit 
                ? 'border-red-500 ring-2 ring-red-200 focus:ring-red-500' // 3개 넘으면 빨간 경고
                : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'    // 평소엔 파란색
              }
            `}
            rows={3}
            placeholder="예: 인디해커, SaaS, 직장인 부업"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* ✨ 실시간 카운터 및 경고 문구 */}
          <div className="flex justify-between items-center mt-2 px-1">
             <span className={`text-xs font-bold transition-colors duration-200 ${isOverLimit ? 'text-red-600 animate-pulse' : 'text-gray-500'}`}>
               {isOverLimit ? '🚨 최대 3개까지만 입력 가능합니다.' : '※ 한 번에 최대 3개까지 분석 가능'}
             </span>
             <span className={`text-sm font-mono font-bold ${isOverLimit ? 'text-red-600' : 'text-gray-400'}`}>
               {keywordCount} / 3
             </span>
          </div>

          <button
            onClick={handleAnalyze}
            // 로딩 중이거나, 3개를 넘었거나, 입력값이 없으면 버튼 비활성화
            disabled={loading || isOverLimit || keywordCount === 0}
            className={`mt-4 w-full py-3 rounded-lg font-bold text-white transition-all transform active:scale-[0.98]
              ${(loading || isOverLimit || keywordCount === 0)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
              }
            `}
          >
            🚀 키워드 분석 시작
          </button>
        </div>

        {/* 결과 테이블 */}
        {data.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">분석 결과 ({data.length}개)</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Score순 정렬됨</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">순위</th>
                    <th className="p-4 font-semibold">키워드</th>
                    <th className="p-4 font-semibold">월 조회수</th>
                    <th className="p-4 font-semibold">경쟁도</th>
                    <th className="p-4 font-semibold text-right">점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition duration-150">
                      <td className="p-4 text-gray-500">
                        {item.rank === 0 ? (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">SEED</span>
                        ) : item.rank <= 3 ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{item.rank}위</span>
                        ) : (
                          `${item.rank}위`
                        )}
                      </td>
                      <td className="p-4 font-bold text-gray-800 text-base">{item.keyword}</td>
                      <td className="p-4 text-gray-600">{item.vol.toLocaleString()}</td>
                      <td className="p-4">
                        {item.comp === 'LOW' || item.comp === '낮음' ? (
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">낮음</span>
                        ) : item.comp === 'MID' || item.comp === '중간' ? (
                          <span className="text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded">중간</span>
                        ) : (
                          <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">높음</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span 
                          className={`px-3 py-1 rounded-full font-bold
                            ${item.score >= 70 ? 'bg-green-100 text-green-700 ring-1 ring-green-400' : 
                              item.score >= 40 ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-400' : 'bg-gray-100 text-gray-600'}
                          `}
                        >
                          {item.score}점
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 페이드인 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
