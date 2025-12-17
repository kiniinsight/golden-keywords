'use client';

import { useState } from 'react';

type KeywordData = {
  keyword: string;
  rank: number;
  vol: number;
  comp: string;
  score: number;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData[]>([]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setData([]);

    // 콤마나 줄바꿈으로 키워드 분리
    const keywords = input.split(/,|\n/).map(k => k.trim()).filter(k => k);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords }),
      });
      
      const json = await res.json();
      if (json.result) {
        setData(json.result);
      }
    } catch (err) {
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* 헤더 섹션 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">💎 황금 키워드 탐색기</h1>
          <p className="text-gray-600">
            당신의 비즈니스, 블로그를 위한 <span className="font-bold text-indigo-600">진짜 트래픽</span>을 찾아보세요.
          </p>
        </div>

        {/* 입력 섹션 */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            분석할 키워드 입력 (콤마나 줄바꿈으로 구분)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            rows={3}
            placeholder="예: 인디해커, SaaS, 직장인 부업"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`mt-4 w-full py-3 rounded-lg font-bold text-white transition-all
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'}
            `}
          >
            {loading ? '🔍 데이터를 분석하고 있습니다...' : '🚀 키워드 분석 시작'}
          </button>
        </div>

        {/* 결과 테이블 섹션 */}
        {data.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">분석 결과 ({data.length}개)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">순위 (Rank)</th>
                    <th className="p-4 font-semibold">키워드</th>
                    <th className="p-4 font-semibold">월 조회수</th>
                    <th className="p-4 font-semibold">경쟁도</th>
                    <th className="p-4 font-semibold text-right">점수</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition">
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
                      <td className="p-4 text-gray-600">{item.vol.toLocaleString()}회</td>
                      <td className="p-4">
                        {item.comp === 'LOW' || item.comp === '낮음' ? (
                          <span className="text-green-600 font-bold">낮음</span>
                        ) : item.comp === 'MID' || item.comp === '중간' ? (
                          <span className="text-orange-500 font-bold">중간</span>
                        ) : (
                          <span className="text-red-500 font-bold">높음</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span 
                          className={`px-3 py-1 rounded-full font-bold
                            ${item.score >= 70 ? 'bg-green-100 text-green-700' : 
                              item.score >= 40 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}
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
    </div>
  );
}
