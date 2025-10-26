import { Link, useNavigate } from 'react-router-dom';
import { 
  Target, 
  Key, 
  Search, 
  Filter, 
  FileText, 
  Home,
  Settings,
} from 'lucide-react';

const navItems = [
  { id: 1, icon: Target, label: '목표 정의', path: '/step1' },
  { id: 2, icon: Key, label: '키워드 도출', path: '/step2' },
  { id: 3, icon: Search, label: '검색 실행', path: '/step3' },
  { id: 4, icon: Filter, label: '스크리닝', path: '/step4' },
  { id: 5, icon: FileText, label: '요약 리포트', path: '/step5' },
];

interface WizardNavProps {
  currentStep: number;
}

export default function WizardNav({ currentStep }: WizardNavProps) {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <Home className="w-6 h-6" />
          <span>IP-GPS 선행특허 조사</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentStep;
          const isCompleted = item.id < currentStep;
          const isAccessible = item.id <= currentStep;

          return (
            <button
              key={item.id}
              onClick={() => isAccessible && navigate(item.path)}
              disabled={!isAccessible}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
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
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
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

      <div className="p-4 border-t border-gray-800">
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

