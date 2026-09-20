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
import type { ClaimMapState, ProcessStep } from './claim-map';

export interface AppState {
  currentStep: ProcessStep;
  apiKey: string;
  inventionInfo: InventionInfo | null;
  keywords: Keywords | null;
  searchQueries: SearchQuery[];
  priorArtItems: PriorArtItem[];
  selectedItems: string[];
  claimMap: ClaimMapState;
  
  // Actions
  setCurrentStep: (step: ProcessStep) => void;
  setApiKey: (key: string) => void;
  setInventionInfo: (info: InventionInfo) => void;
  setKeywords: (keywords: Keywords) => void;
  addSearchQuery: (query: SearchQuery) => void;
  setSearchQueries: (queries: SearchQuery[]) => void;
  addPriorArtItem: (item: PriorArtItem) => void;
  updatePriorArtItem: (id: string, updates: Partial<PriorArtItem>) => void;
  deletePriorArtItem: (id: string) => void;
  toggleSelectedItem: (id: string) => void;
  setPriorArtItems: (items: PriorArtItem[]) => void;
  setClaimMap: (claimMap: ClaimMapState) => void;
  updateClaimMap: (updates: Partial<ClaimMapState>) => void;
  resetClaimMap: () => void;
}

export type {
  AnalysisStatus,
  ClaimElement,
  ClaimMapState,
  ClaimMapping,
  ClaimType,
  Distinctiveness,
  ElementCategory,
  ElementImportance,
  ElementSearchStrategy,
  InventionElement,
  MatchLevel,
  PatentDocument,
  ProcessStep,
  ReferencePatentAnalysis,
  RelevanceAssessment,
  RelevanceGrade,
  ReportSnapshot,
  ReviewStatus,
  RiskLevel,
} from './claim-map';
