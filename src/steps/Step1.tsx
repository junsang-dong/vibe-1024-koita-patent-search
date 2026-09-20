import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepHeader from '../components/StepHeader';
import { useAppStore } from '../stores/useAppStore';
import type { InventionInfo } from '../types';

export default function Step1() {
  const navigate = useNavigate();
  const { inventionInfo, setInventionInfo, setCurrentStep } = useAppStore();

  const [formData, setFormData] = useState<InventionInfo>({
    title: '',
    summary: '',
    technicalField: '',
    purpose: '',
  });

  useEffect(() => {
    setCurrentStep('define');
    if (inventionInfo) {
      setFormData(inventionInfo);
    }
  }, [inventionInfo, setCurrentStep]);

  const handleChange = (field: keyof InventionInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (formData.title && formData.summary) {
      setInventionInfo(formData);
      navigate('/claim-map');
    } else {
      alert('발명의 명칭과 요약은 필수 입력 항목입니다.');
    }
  };

  const canGoNext = formData.title.trim() !== '' && formData.summary.trim() !== '';

  return (
    <div className="flex flex-col h-full">
      <StepHeader
        step="define"
        title="목표 정의"
        description="선행특허 조사를 위한 발명 정보를 입력해주세요"
        canGoBack={false}
        canGoNext={canGoNext}
        onNext={handleNext}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 발명의 명칭 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              발명의 명칭 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 블록체인 기반 전자투표 시스템"
            />
          </div>

          {/* 기술분야 */}
          <div>
            <label htmlFor="technicalField" className="block text-sm font-medium text-gray-700 mb-2">
              기술분야
            </label>
            <input
              type="text"
              id="technicalField"
              value={formData.technicalField}
              onChange={(e) => handleChange('technicalField', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 블록체인, 암호화, 전자투표"
            />
          </div>

          {/* 발명의 목적 */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              발명의 목적
            </label>
            <textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => handleChange('purpose', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 투표의 투명성과 보안성을 높이고, 부정 투표를 방지하며, 실시간 개표가 가능하도록 함"
            />
          </div>

          {/* 발명의 요약 */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              발명의 요약 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="발명의 핵심 내용을 상세히 작성해주세요. 구성요소, 동작 방식, 기대 효과 등을 포함하면 더 정확한 키워드를 도출할 수 있습니다."
            />
            <p className="mt-2 text-sm text-gray-500">
              💡 상세할수록 더 정확한 선행특허 조사가 가능합니다.
            </p>
          </div>

          {/* 도움말 카드 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📌 작성 가이드</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 발명의 <strong>핵심 구성요소</strong>를 명확히 기재하세요</li>
              <li>• <strong>기술적 특징</strong>과 <strong>동작 원리</strong>를 포함하세요</li>
              <li>• 기존 기술과의 <strong>차별점</strong>이 있다면 언급하세요</li>
              <li>• 영문 기술 용어가 있다면 함께 작성하면 좋습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
