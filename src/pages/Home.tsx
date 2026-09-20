import { useNavigate } from 'react-router-dom';
import { Target, GitCompareArrows, FileText, ArrowRight, Files, Scale, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';

const steps = [
  {
    id: 1,
    icon: Target,
    title: '목표 정의',
    description: '발명 정보와 조사 목적을 입력합니다',
    path: '/define',
  },
  {
    id: 2,
    icon: GitCompareArrows,
    title: '청구항 맵',
    description: '예시 특허 1~5건의 청구항을 원문 근거로 비교합니다',
    path: '/claim-map',
  },
  {
    id: 3,
    icon: FileText,
    title: '요약 리포트',
    description: '공통·차별 요소와 관련성을 요약하고 내보냅니다',
    path: '/report',
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
            IP-GPS 선행특허 조사
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            IP-GPS v1.0: AI 기반의 선행특허 조사 및 보고서 생성 서비스
          </p>
          <p className="text-base text-gray-500 mb-8">
            사용자 제공 특허를 청구항 원문 근거로 비교하는 3단계 조사 워크플로우
          </p>
          <button
            onClick={() => navigate('/define')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg"
          >
            조사 시작하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>

        {/* 단계 설명 */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(step.path)}
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
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900"><Files className="h-5 w-5 text-indigo-600" /> 다중 문서 비교</h3>
              <p className="text-gray-600">
                PDF 또는 청구항 텍스트 형식의 예시 특허를 최대 5건까지 한 프로젝트에서 비교합니다.
              </p>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900"><ShieldCheck className="h-5 w-5 text-indigo-600" /> 원문 근거 연결</h3>
              <p className="text-gray-600">
                모든 긍정적 관련성 판단에 청구항 번호와 정확한 원문 인용을 연결합니다.
              </p>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900"><Scale className="h-5 w-5 text-indigo-600" /> 설명 가능한 관련성</h3>
              <p className="text-gray-600">
                필수 요소, 동작 원리, 독립항 근거와 검토 완결성을 분리해 관련성 점수를 계산합니다.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📥 다양한 내보내기</h3>
              <p className="text-gray-600">
                JSON, Markdown 형식으로 결과를 내보내고 PDF 인쇄와 리포트 스냅샷을 지원합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 사용 안내 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ 사용 전 안내사항</h3>
          <ul className="text-sm text-yellow-800 space-y-2">
            <li>• 본 워크플로우는 사용자가 제공한 문서만 비교하며 외부 특허 검색을 수행하지 않습니다</li>
            <li>• PDF 원본은 저장하지 않고 추출 텍스트와 분석 상태만 로컬에 보관합니다</li>
            <li>• 본 도구는 특허 전문가의 검토를 대체할 수 없으며, 참고용으로만 사용하세요</li>
            <li>• 각 특허 데이터베이스의 이용약관을 준수해주세요</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
