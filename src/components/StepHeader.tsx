import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  onNext?: () => void;
}

export default function StepHeader({
  stepNumber,
  title,
  description,
  canGoBack = true,
  canGoNext = false,
  onNext,
}: StepHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (stepNumber > 1) {
      navigate(`/step${stepNumber - 1}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (stepNumber < 5) {
      navigate(`/step${stepNumber + 1}`);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
              {stepNumber}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canGoBack && stepNumber > 1 && (
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전
            </button>
          )}

          {canGoNext && (
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              다음
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

