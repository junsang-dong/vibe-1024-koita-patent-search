import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, 
  GitCompareArrows,
  FileText, 
  Home,
  Settings,
} from 'lucide-react';
import type { ProcessStep } from '../types';

const navItems = [
  { id: 'define' as const, icon: Target, label: '목표 정의', path: '/define' },
  { id: 'claim-map' as const, icon: GitCompareArrows, label: '청구항 맵', path: '/claim-map' },
  { id: 'report' as const, icon: FileText, label: '요약 리포트', path: '/report' },
];

interface WizardNavProps {
  currentStep: ProcessStep;
}

export default function WizardNav({ currentStep }: WizardNavProps) {
  const navigate = useNavigate();
  const currentIndex = navItems.findIndex((item) => item.id === currentStep);

  return (
    <aside className="flex w-full shrink-0 flex-col bg-gray-900 text-white print:hidden md:min-h-screen md:w-64">
      <div className="hidden p-6 md:block">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Home className="w-6 h-6" />
          <span>IP-GPS 선행특허 조사</span>
        </Link>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto px-2 py-2 md:flex-1 md:flex-col md:space-y-1 md:overflow-visible md:px-4 md:py-6">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.id === currentStep;
          const isCompleted = index < currentIndex;
          const isAccessible = index <= currentIndex;

          return (
            <button
              key={item.id}
              onClick={() => isAccessible && navigate(item.path)}
              disabled={!isAccessible}
              className={`
                flex min-w-max flex-1 items-center justify-center space-x-2 rounded-lg px-3 py-2.5 transition-colors md:w-full md:flex-none md:justify-start md:space-x-3 md:px-4 md:py-3
                ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isCompleted
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : !isAccessible
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-gray-800'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium md:flex-1 md:text-left md:text-sm">{item.label}</span>
              {isCompleted && (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </nav>

      <div className="hidden border-t border-gray-800 p-4 md:block">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">설정</span>
        </button>
      </div>
    </aside>
  );
}
