// 선행특허 항목 데이터 모델
export interface PriorArtItem {
  id: string;
  title: string;
  applicant: string;
  number: string;
  year: number;
  ipc: string[];
  url: string;
  keyClaims?: string;
  diffPoints?: string[];
  note?: string;
  score?: number;
  scoreReason?: string;
}

// 발명 정보
export interface InventionInfo {
  title: string;
  summary: string;
  technicalField: string;
  purpose: string;
}

// 키워드 및 IPC
export interface Keywords {
  korean: string[];
  english: string[];
  japanese: string[];
  ipc: string[];
  cpc: string[];
}

// 검색 쿼리
export interface SearchQuery {
  database: 'kipris' | 'uspto' | 'jplatpat' | 'google-patents';
  url: string;
  queryString: string;
}

// 앱 상태
export interface AppState {
  currentStep: number;
  apiKey: string;
  inventionInfo: InventionInfo | null;
  keywords: Keywords | null;
  searchQueries: SearchQuery[];
  priorArtItems: PriorArtItem[];
  selectedItems: string[];
  
  // Actions
  setCurrentStep: (step: number) => void;
  setApiKey: (key: string) => void;
  setInventionInfo: (info: InventionInfo) => void;
  setKeywords: (keywords: Keywords) => void;
  addSearchQuery: (query: SearchQuery) => void;
  addPriorArtItem: (item: PriorArtItem) => void;
  updatePriorArtItem: (id: string, updates: Partial<PriorArtItem>) => void;
  deletePriorArtItem: (id: string) => void;
  toggleSelectedItem: (id: string) => void;
  setPriorArtItems: (items: PriorArtItem[]) => void;
}

