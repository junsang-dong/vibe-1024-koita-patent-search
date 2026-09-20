import type { ProcessStep } from '../types';

interface ProgressBarProps {
  currentStep: ProcessStep;
}

const steps = [
  { id: 'define' as const, number: 1, name: '목표 정의' },
  { id: 'claim-map' as const, number: 2, name: '청구항 맵' },
  { id: 'report' as const, number: 3, name: '요약 리포트' },
];

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  return (
    <div className="bg-white border-b border-gray-200 px-3 py-3 print:hidden sm:px-6 sm:py-4">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const completed = stepIdx < currentIndex;
              const active = step.id === currentStep;
              return (
              <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm
                        ${
                          completed
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : active
                            ? 'border-primary-600 bg-white text-primary-600'
                            : 'border-gray-300 bg-white text-gray-500'
                        }
                      `}
                    >
                      {completed ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`
                        mt-1.5 text-[10px] font-medium whitespace-nowrap sm:mt-2 sm:text-xs
                        ${completed || active ? 'text-primary-600' : 'text-gray-500'}
                      `}
                    >
                      {step.name}
                    </span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div
                      className={`
                        ml-2 h-0.5 w-full sm:ml-4
                        ${completed ? 'bg-primary-600' : 'bg-gray-300'}
                      `}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
