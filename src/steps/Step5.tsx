import { useState, useEffect } from 'react';
import { FileDown, FileText, FileJson, Loader2, Printer } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import TagChips from '../components/TagChips';
import { useAppStore } from '../stores/useAppStore';
import { GPTClient, PROMPTS } from '../lib/gpt';
import { downloadCSV, downloadJSON, downloadMarkdown } from '../lib/export';

export default function Step5() {
  const {
    priorArtItems,
    selectedItems,
    inventionInfo,
    keywords,
    apiKey,
    setCurrentStep,
  } = useAppStore();

  const [aiSummary, setAiSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const selectedPatents = priorArtItems.filter((item) =>
    selectedItems.length > 0 ? selectedItems.includes(item.id) : true
  );

  const handleGenerateSummary = async () => {
    if (!apiKey) {
      alert('AI 요약을 위해 API 키가 필요합니다. 2단계로 돌아가 설정해주세요.');
      return;
    }

    if (selectedPatents.length === 0) {
      alert('요약할 특허가 없습니다.');
      return;
    }

    setLoading(true);

    try {
      const client = new GPTClient(apiKey);

      const patentsText = selectedPatents
        .map(
          (item, idx) =>
            `${idx + 1}. [${item.number}] ${item.title}\n` +
            `   출원인: ${item.applicant || '-'}\n` +
            `   출원년도: ${item.year}\n` +
            `   IPC: ${item.ipc.join(', ')}\n` +
            `   점수: ${item.score || '-'}\n` +
            `   URL: ${item.url}`
        )
        .join('\n\n');

      const prompt = PROMPTS.generateSummary(patentsText);

      const response = await client.complete(
        [
          { role: 'system', content: '당신은 특허 분석가입니다.' },
          { role: 'user', content: prompt },
        ],
        { maxTokens: 3000 }
      );

      setAiSummary(response);
    } catch (err) {
      alert(`AI 요약 생성 중 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    downloadCSV(selectedPatents);
  };

  const handleExportJSON = () => {
    downloadJSON(selectedPatents);
  };

  const handleExportMarkdown = () => {
    downloadMarkdown(inventionInfo, keywords, selectedPatents, aiSummary);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        stepNumber={5}
        title="요약 및 리포트"
        description="선행특허 조사 결과를 요약하고 다양한 형식으로 내보내세요"
        canGoBack={true}
        canGoNext={false}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* AI 요약 생성 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">🤖 AI 분석 요약</h2>
                <p className="text-sm text-gray-600">
                  선택된 {selectedPatents.length}건의 특허를 종합 분석한 리포트를 생성합니다
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loading || selectedPatents.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '요약 생성'
                )}
              </button>
            </div>

            {aiSummary && (
              <div className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4">
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: aiSummary
                      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />'),
                  }}
                />
              </div>
            )}
          </div>

          {/* 내보내기 옵션 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📥 내보내기</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleExportCSV}
                disabled={selectedPatents.length === 0}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">CSV</span>
                <span className="text-xs text-gray-500">Excel용</span>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={selectedPatents.length === 0}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileJson className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">JSON</span>
                <span className="text-xs text-gray-500">데이터 포맷</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                disabled={selectedPatents.length === 0}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileDown className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Markdown</span>
                <span className="text-xs text-gray-500">리포트</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={selectedPatents.length === 0}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">인쇄</span>
                <span className="text-xs text-gray-500">PDF 변환</span>
              </button>
            </div>
          </div>

          {/* 결과 요약 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 조사 결과 요약</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {selectedPatents.length}
                </div>
                <div className="text-sm text-blue-900">분석된 특허</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {keywords?.korean.length || 0}
                </div>
                <div className="text-sm text-green-900">사용된 키워드</div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {selectedPatents.filter((p) => (p.score || 0) >= 70).length}
                </div>
                <div className="text-sm text-purple-900">고위험 특허 (70점 이상)</div>
              </div>
            </div>

            {/* 특허 목록 미리보기 */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">선택된 특허 목록</h3>
            <div className="space-y-3">
              {selectedPatents.slice(0, 10).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                      {item.score !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-xs text-gray-600">
                      {item.number} · {item.applicant} · {item.year}
                    </p>
                    {item.ipc.length > 0 && (
                      <div className="mt-2">
                        <TagChips tags={item.ipc.slice(0, 3)} readOnly color="gray" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {selectedPatents.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  ...외 {selectedPatents.length - 10}건
                </p>
              )}
            </div>
          </div>

          {/* 완료 메시지 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              🎉 선행특허 조사가 완료되었습니다!
            </h3>
            <p className="text-sm text-green-800 mb-4">
              위의 내보내기 버튼을 사용하여 결과를 저장하거나 공유할 수 있습니다.
            </p>
            <p className="text-xs text-green-700">
              ⚠️ 본 리포트는 AI 보조 도구로 생성되었습니다. 최종 판단은 특허 전문가의 검토가 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

