import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProcessStep } from '../types';

interface StepHeaderProps {
  step: ProcessStep;
  title: string;
  description: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  onNext?: () => void;
}

export default function StepHeader({
  step,
  title,
  description,
  canGoBack = true,
  canGoNext = false,
  onNext,
}: StepHeaderProps) {
  const navigate = useNavigate();
  const steps: Array<{ id: ProcessStep; path: string; number: number }> = [
    { id: 'define', path: '/define', number: 1 },
    { id: 'claim-map', path: '/claim-map', number: 2 },
    { id: 'report', path: '/report', number: 3 },
  ];
  const stepIndex = steps.findIndex((item) => item.id === step);
  const stepNumber = steps[stepIndex]?.number || 1;

  const handleBack = () => {
    if (stepIndex > 0) {
      navigate(steps[stepIndex - 1].path);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (stepIndex < steps.length - 1) {
      navigate(steps[stepIndex + 1].path);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 print:hidden sm:px-6 sm:py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold">
              {stepNumber}
            </span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">{title}</h1>
              <p className="mt-1 hidden text-sm text-gray-600 sm:block">{description}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center space-x-2 sm:space-x-3">
          {canGoBack && stepIndex > 0 && (
            <button
              onClick={handleBack}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-4 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">이전</span>
            </button>
          )}

          {canGoNext && (
            <button
              onClick={handleNext}
              className="inline-flex items-center rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">다음</span>
              <ArrowRight className="h-4 w-4 sm:ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
