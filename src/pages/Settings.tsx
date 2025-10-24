import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function Settings() {
  const navigate = useNavigate();
  const { apiKey, setApiKey } = useAppStore();
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    setApiKey(tempApiKey);
    alert('API 키가 저장되었습니다.');
  };

  const handleClear = () => {
    if (confirm('모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          홈으로
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">설정</h1>

        {/* API 키 설정 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔑 OpenAI API 키</h2>
          <p className="text-sm text-gray-600 mb-4">
            AI 기능(키워드 생성, 특허 랭킹, 요약 생성)을 사용하려면 OpenAI API 키가 필요합니다.
            키는 브라우저 세션에만 저장되며 외부로 전송되지 않습니다.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 키
              </label>
              <div className="flex gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 API 키 발급:</strong>{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                OpenAI 플랫폼
              </a>
              에서 발급받을 수 있습니다.
            </p>
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🗂️ 데이터 관리</h2>
          <p className="text-sm text-gray-600 mb-4">
            저장된 모든 조사 데이터와 설정을 초기화할 수 있습니다.
          </p>

          <button
            onClick={handleClear}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            모든 데이터 초기화
          </button>
        </div>

        {/* 정보 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">📌 개인정보 보호</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• API 키는 브라우저 sessionStorage에만 저장됩니다</li>
            <li>• 조사 데이터는 localStorage에 저장되며 서버로 전송되지 않습니다</li>
            <li>• 브라우저 캐시를 지우면 모든 데이터가 삭제됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

