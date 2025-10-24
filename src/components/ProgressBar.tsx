interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const steps = [
  { id: 1, name: '목표 정의' },
  { id: 2, name: '키워드 도출' },
  { id: 3, name: '검색 실행' },
  { id: 4, name: '스크리닝' },
  { id: 5, name: '요약 리포트' },
];

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold
                        ${
                          step.id < currentStep
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : step.id === currentStep
                            ? 'border-primary-600 bg-white text-primary-600'
                            : 'border-gray-300 bg-white text-gray-500'
                        }
                      `}
                    >
                      {step.id < currentStep ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-xs font-medium whitespace-nowrap
                        ${step.id <= currentStep ? 'text-primary-600' : 'text-gray-500'}
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`
                        ml-4 h-0.5 w-full
                        ${step.id < currentStep ? 'bg-primary-600' : 'bg-gray-300'}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

