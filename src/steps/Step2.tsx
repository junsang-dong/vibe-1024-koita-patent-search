import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import TagChips from '../components/TagChips';
import { useAppStore } from '../stores/useAppStore';
import { GPTClient, PROMPTS } from '../lib/gpt';
import type { Keywords } from '../types';

export default function Step2() {
  const navigate = useNavigate();
  const { inventionInfo, keywords, setKeywords, setCurrentStep, apiKey, setApiKey } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const [formData, setFormData] = useState<Keywords>({
    korean: [],
    english: [],
    japanese: [],
    ipc: [],
    cpc: [],
  });

  const [newKeyword, setNewKeyword] = useState({
    korean: '',
    english: '',
    japanese: '',
    ipc: '',
    cpc: '',
  });

  useEffect(() => {
    setCurrentStep(2);
    if (keywords) {
      setFormData(keywords);
    }
  }, [keywords, setCurrentStep]);

  const handleGenerateKeywords = async () => {
    if (!inventionInfo) {
      alert('먼저 1단계에서 발명 정보를 입력해주세요.');
      navigate('/step1');
      return;
    }

    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = new GPTClient(apiKey);
      const prompt = PROMPTS.generateKeywords(inventionInfo.summary);
      
      const response = await client.complete([
        { role: 'system', content: '당신은 특허 검색 전문가입니다.' },
        { role: 'user', content: prompt },
      ]);

      // JSON 파싱
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setFormData({
          korean: parsed.korean || [],
          english: parsed.english || [],
          japanese: parsed.japanese || [],
          ipc: parsed.ipc || [],
          cpc: parsed.cpc || [],
        });
      } else {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '키워드 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = (type: keyof Keywords) => {
    const value = newKeyword[type].trim();
    if (value && !formData[type].includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], value],
      }));
      setNewKeyword((prev) => ({ ...prev, [type]: '' }));
    }
  };

  const handleRemoveKeyword = (type: keyof Keywords, keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((k) => k !== keyword),
    }));
  };

  const handleNext = () => {
    const hasKeywords = 
      formData.korean.length > 0 || 
      formData.english.length > 0 || 
      formData.ipc.length > 0;

    if (hasKeywords) {
      setKeywords(formData);
      navigate('/step3');
    } else {
      alert('최소 1개 이상의 키워드나 IPC 코드를 입력해주세요.');
    }
  };

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    setShowApiKeyInput(false);
  };

  const canGoNext = 
    formData.korean.length > 0 || 
    formData.english.length > 0 || 
    formData.ipc.length > 0;

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        stepNumber={2}
        title="키워드 및 IPC 도출"
        description="검색에 사용할 키워드와 특허 분류 코드를 생성하거나 입력하세요"
        canGoBack={true}
        canGoNext={canGoNext}
        onNext={handleNext}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* API 키 입력 */}
          {showApiKeyInput && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">🔑 OpenAI API 키 입력</h3>
              <p className="text-sm text-yellow-800 mb-3">
                AI 키워드 생성을 위해 OpenAI API 키가 필요합니다. 
                키는 세션에만 저장되며 서버로 전송되지 않습니다.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={saveApiKey}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* AI 생성 버튼 */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">키워드 생성</h2>
              <p className="text-sm text-gray-600">AI가 발명 요약을 분석하여 키워드를 제안합니다</p>
            </div>
            <button
              onClick={handleGenerateKeywords}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI로 생성
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              ❌ {error}
            </div>
          )}

          {/* 한국어 키워드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              한국어 키워드
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword.korean}
                onChange={(e) => setNewKeyword((prev) => ({ ...prev, korean: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword('korean')}
                placeholder="키워드 입력 후 Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleAddKeyword('korean')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.korean.length > 0 && (
              <TagChips
                tags={formData.korean}
                onRemove={(tag) => handleRemoveKeyword('korean', tag)}
                color="blue"
              />
            )}
          </div>

          {/* 영어 키워드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              영어 키워드
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword.english}
                onChange={(e) => setNewKeyword((prev) => ({ ...prev, english: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword('english')}
                placeholder="Keyword (Enter to add)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleAddKeyword('english')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.english.length > 0 && (
              <TagChips
                tags={formData.english}
                onRemove={(tag) => handleRemoveKeyword('english', tag)}
                color="green"
              />
            )}
          </div>

          {/* 일본어 키워드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              일본어 키워드
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword.japanese}
                onChange={(e) => setNewKeyword((prev) => ({ ...prev, japanese: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword('japanese')}
                placeholder="キーワード"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleAddKeyword('japanese')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.japanese.length > 0 && (
              <TagChips
                tags={formData.japanese}
                onRemove={(tag) => handleRemoveKeyword('japanese', tag)}
                color="purple"
              />
            )}
          </div>

          {/* IPC 코드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPC 분류코드
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword.ipc}
                onChange={(e) => setNewKeyword((prev) => ({ ...prev, ipc: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword('ipc')}
                placeholder="예: G06F, H04L"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleAddKeyword('ipc')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.ipc.length > 0 && (
              <TagChips
                tags={formData.ipc}
                onRemove={(tag) => handleRemoveKeyword('ipc', tag)}
                color="gray"
              />
            )}
          </div>

          {/* CPC 코드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPC 분류코드
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword.cpc}
                onChange={(e) => setNewKeyword((prev) => ({ ...prev, cpc: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword('cpc')}
                placeholder="예: G06F16/00"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => handleAddKeyword('cpc')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.cpc.length > 0 && (
              <TagChips
                tags={formData.cpc}
                onRemove={(tag) => handleRemoveKeyword('cpc', tag)}
                color="gray"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

