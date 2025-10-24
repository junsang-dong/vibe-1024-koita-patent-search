import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Loader2, TrendingUp } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import TagChips from '../components/TagChips';
import { useAppStore } from '../stores/useAppStore';
import { GPTClient, PROMPTS } from '../lib/gpt';
import { calculateOverallScore } from '../lib/search';

export default function Step4() {
  const navigate = useNavigate();
  const {
    priorArtItems,
    keywords,
    inventionInfo,
    apiKey,
    updatePriorArtItem,
    deletePriorArtItem,
    toggleSelectedItem,
    selectedItems,
    setCurrentStep,
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [weights, setWeights] = useState({
    keyword: 30,
    ipc: 30,
    year: 20,
    similarity: 20,
  });

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const handleCalculateScores = () => {
    if (!keywords || !inventionInfo) {
      alert('키워드와 발명 정보가 필요합니다.');
      return;
    }

    priorArtItems.forEach((item) => {
      const score = calculateOverallScore(
        item,
        {
          keywords: [...keywords.korean, ...keywords.english],
          targetIPC: keywords.ipc,
          referenceText: inventionInfo.summary,
        },
        {
          keyword: weights.keyword / 100,
          ipc: weights.ipc / 100,
          year: weights.year / 100,
          similarity: weights.similarity / 100,
        }
      );

      updatePriorArtItem(item.id, { score });
    });

    alert('점수 계산이 완료되었습니다!');
  };

  const handleAIRanking = async () => {
    if (!apiKey) {
      alert('AI 분석을 위해 API 키가 필요합니다. 2단계로 돌아가 설정해주세요.');
      return;
    }

    if (priorArtItems.length === 0) {
      alert('분석할 특허가 없습니다.');
      return;
    }

    setLoading(true);

    try {
      const client = new GPTClient(apiKey);
      
      const candidatesText = priorArtItems
        .map(
          (item, idx) =>
            `${idx + 1}. [${item.number}] ${item.title} (${item.applicant}, ${item.year}) - IPC: ${item.ipc.join(', ')}`
        )
        .join('\n');

      const inventionContext = inventionInfo
        ? `제목: ${inventionInfo.title}\n요약: ${inventionInfo.summary}`
        : '발명 정보 없음';

      const prompt = PROMPTS.rankPriorArt(candidatesText, inventionContext);

      const response = await client.complete([
        { role: 'system', content: '당신은 특허 심사관입니다.' },
        { role: 'user', content: prompt },
      ]);

      // JSON 파싱
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const rankings = JSON.parse(jsonMatch[0]);

        rankings.forEach((ranking: any) => {
          const item = priorArtItems.find((p) => p.number === ranking.id);
          if (item) {
            updatePriorArtItem(item.id, {
              score: ranking.score,
              scoreReason: ranking.reason,
            });
          }
        });

        alert('AI 랭킹이 완료되었습니다!');
      } else {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      alert(`AI 랭킹 중 오류 발생: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = [...priorArtItems].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        stepNumber={4}
        title="스크리닝 및 랭킹"
        description="수집한 선행특허를 분석하고 관련성에 따라 순위를 매기세요"
        canGoBack={true}
        canGoNext={true}
        onNext={() => navigate('/step5')}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 도구 모음 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 분석 도구</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 가중치 조정 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">가중치 조정 (로컬 스코어링)</h3>
                <div className="space-y-3">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {key === 'keyword' && '키워드 매칭'}
                          {key === 'ipc' && 'IPC 적합도'}
                          {key === 'year' && '연도 가중치'}
                          {key === 'similarity' && '유사도'}
                        </span>
                        <span className="font-semibold text-gray-900">{value}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) =>
                          setWeights((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCalculateScores}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  점수 계산
                </button>
              </div>

              {/* AI 랭킹 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 기반 랭킹</h3>
                <p className="text-sm text-gray-600 mb-4">
                  GPT가 특허 전문가 관점에서 각 특허를 평가하고 점수를 부여합니다.
                  기술적 유사성, IPC 적합도, 청구항 범위를 종합 분석합니다.
                </p>
                <button
                  onClick={handleAIRanking}
                  disabled={loading || priorArtItems.length === 0}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    '🤖 AI로 랭킹 생성'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 특허 목록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                📊 선행특허 목록 ({priorArtItems.length}건)
              </h2>
            </div>

            <div className="p-6">
              {sortedItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>아직 추가된 특허가 없습니다.</p>
                  <p className="text-sm mt-2">3단계로 돌아가 특허를 추가해주세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-all ${
                        selectedItems.includes(item.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelectedItem(item.id)}
                            className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                              {item.score !== undefined && (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    item.score >= 70
                                      ? 'bg-red-100 text-red-800'
                                      : item.score >= 50
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {item.score}점
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>
                                <span className="font-medium">특허번호:</span> {item.number}
                              </p>
                              <p>
                                <span className="font-medium">출원인:</span> {item.applicant || '-'}
                              </p>
                              <p>
                                <span className="font-medium">출원년도:</span> {item.year}
                              </p>
                              {item.ipc.length > 0 && (
                                <div className="mt-2">
                                  <TagChips tags={item.ipc} readOnly color="gray" />
                                </div>
                              )}
                              {item.scoreReason && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  <span className="font-medium">평가 근거:</span> {item.scoreReason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="링크 열기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('이 특허를 삭제하시겠습니까?')) {
                                deletePriorArtItem(item.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-sm text-primary-900">
                ✅ {selectedItems.length}건의 특허가 선택되었습니다. 
                다음 단계에서 선택된 특허들에 대한 요약 리포트를 생성할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

