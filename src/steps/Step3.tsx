import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Plus, Clipboard } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import { useAppStore } from '../stores/useAppStore';
import { generateSearchLinks } from '../lib/search';
import type { PriorArtItem } from '../types';

export default function Step3() {
  const navigate = useNavigate();
  const { keywords, searchQueries, addSearchQuery, addPriorArtItem, setCurrentStep } = useAppStore();

  const [pasteText, setPasteText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    applicant: '',
    number: '',
    year: new Date().getFullYear(),
    ipc: '',
    url: '',
  });

  useEffect(() => {
    setCurrentStep(3);

    // 검색 링크 자동 생성
    if (keywords && searchQueries.length === 0) {
      const allKeywords = [...keywords.korean, ...keywords.english].slice(0, 10);
      const links = generateSearchLinks(allKeywords, keywords.ipc);
      links.forEach((link) => addSearchQuery(link));
    }
  }, [keywords, searchQueries, addSearchQuery, setCurrentStep]);

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePasteAnalysis = () => {
    if (!pasteText.trim()) return;

    // 간단한 파싱 (실제로는 더 정교한 파싱이 필요)
    const lines = pasteText.split('\n').filter((line) => line.trim());
    
    if (lines.length > 0) {
      alert('붙여넣은 텍스트를 분석했습니다. 하단의 "특허 추가" 버튼으로 개별 항목을 입력해주세요.');
      setPasteText('');
    }
  };

  const handleAddItem = () => {
    if (!newItem.title || !newItem.number) {
      alert('제목과 특허번호는 필수입니다.');
      return;
    }

    const item: PriorArtItem = {
      id: `patent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newItem.title,
      applicant: newItem.applicant,
      number: newItem.number,
      year: newItem.year,
      ipc: newItem.ipc.split(',').map((s) => s.trim()).filter(Boolean),
      url: newItem.url,
    };

    addPriorArtItem(item);
    
    // 폼 리셋
    setNewItem({
      title: '',
      applicant: '',
      number: '',
      year: new Date().getFullYear(),
      ipc: '',
      url: '',
    });
    setShowAddForm(false);
    
    alert('특허가 추가되었습니다!');
  };

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        stepNumber={3}
        title="검색 실행"
        description="생성된 검색 링크로 특허 데이터베이스를 조회하고, 결과를 추가하세요"
        canGoBack={true}
        canGoNext={true}
        onNext={() => navigate('/step4')}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 검색 링크 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔗 검색 도구 딥링크</h2>
            <p className="text-sm text-gray-600 mb-4">
              각 링크를 클릭하여 특허 데이터베이스를 검색하세요. 
              검색 결과는 아래 영역에 수동으로 추가할 수 있습니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchQueries.map((query, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-4 hover:border-primary-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {query.database === 'kipris' && '🇰🇷 KIPRIS (한국)'}
                        {query.database === 'uspto' && '🇺🇸 USPTO (미국)'}
                        {query.database === 'jplatpat' && '🇯🇵 J-PlatPat (일본)'}
                        {query.database === 'google-patents' && '🌐 Google Patents'}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 break-all">
                        {query.queryString.slice(0, 80)}
                        {query.queryString.length > 80 && '...'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenLink(query.url)}
                      className="flex-shrink-0 ml-2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="새 탭에서 열기"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 클리핑 패드 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">📋 클리핑 패드</h2>
                <p className="text-sm text-gray-600">검색 결과를 붙여넣으면 AI가 분석합니다 (향후 지원 예정)</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Clipboard className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="검색 결과의 서지사항을 복사하여 붙여넣으세요&#10;&#10;예:&#10;발명의 명칭: ...&#10;출원번호: ...&#10;출원인: ..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm font-mono"
            />

            <button
              onClick={handlePasteAnalysis}
              disabled={!pasteText.trim()}
              className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              분석하기
            </button>
          </div>

          {/* 특허 수동 추가 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">➕ 특허 추가</h2>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 특허 추가
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="border border-gray-300 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      발명의 명칭 *
                    </label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      특허번호 *
                    </label>
                    <input
                      type="text"
                      value={newItem.number}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, number: e.target.value }))}
                      placeholder="예: KR10-2020-0123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      출원인
                    </label>
                    <input
                      type="text"
                      value={newItem.applicant}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, applicant: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      출원년도
                    </label>
                    <input
                      type="number"
                      value={newItem.year}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, year: parseInt(e.target.value) || 2024 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IPC (쉼표로 구분)
                    </label>
                    <input
                      type="text"
                      value={newItem.ipc}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, ipc: e.target.value }))}
                      placeholder="예: G06F, H04L"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="url"
                      value={newItem.url}
                      onChange={(e) => setNewItem((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              💡 검색 결과에서 관련성이 높아 보이는 특허를 수동으로 추가하세요. 
              다음 단계에서 AI가 자동으로 점수를 매기고 순위를 정렬합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

