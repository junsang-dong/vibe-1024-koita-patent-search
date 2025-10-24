import { useNavigate } from 'react-router-dom';
import { Target, Key, Search, Filter, FileText, ArrowRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Target,
    title: '목표 정의',
    description: '발명 정보와 조사 목적을 입력합니다',
    color: 'blue',
  },
  {
    id: 2,
    icon: Key,
    title: '키워드 도출',
    description: 'AI가 검색 키워드와 IPC 코드를 생성합니다',
    color: 'green',
  },
  {
    id: 3,
    icon: Search,
    title: '검색 실행',
    description: '특허 데이터베이스에서 선행특허를 검색합니다',
    color: 'purple',
  },
  {
    id: 4,
    icon: Filter,
    title: '스크리닝',
    description: '관련성에 따라 특허를 분석하고 순위를 매깁니다',
    color: 'orange',
  },
  {
    id: 5,
    icon: FileText,
    title: '요약 리포트',
    description: '최종 결과를 요약하고 내보냅니다',
    color: 'red',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            선행특허 조사 워크플로우
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI 기반 5단계 마법사로 체계적인 선행특허 조사를 수행하세요
          </p>
          <button
            onClick={() => navigate('/step1')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            조사 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* 단계 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/step${step.id}`)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-sm font-semibold text-gray-500 mb-2">STEP {step.id}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 기능 소개 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🤖 AI 기반 분석</h3>
              <p className="text-gray-600">
                OpenAI GPT를 활용하여 키워드 도출, 특허 랭킹, 요약 리포트를 자동 생성합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 다국적 검색</h3>
              <p className="text-gray-600">
                KIPRIS, USPTO, J-PlatPat, Google Patents 등 주요 특허 데이터베이스를 지원합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 스마트 스코어링</h3>
              <p className="text-gray-600">
                키워드 매칭, IPC 적합도, 연도 가중치 등을 종합하여 관련성 점수를 계산합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📥 다양한 내보내기</h3>
              <p className="text-gray-600">
                CSV, JSON, Markdown 형식으로 결과를 내보내고, PDF 인쇄도 지원합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ 사용 전 안내사항</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• AI 기능 사용을 위해서는 OpenAI API 키가 필요합니다 (2단계에서 입력)</li>
            <li>• API 키는 브라우저 세션에만 저장되며, 서버로 전송되지 않습니다</li>
            <li>• 본 도구는 특허 전문가의 검토를 대체할 수 없으며, 참고용으로만 사용하세요</li>
            <li>• 각 특허 데이터베이스의 이용약관을 준수해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

