export type ElementCategory =
  | 'mechanical'
  | 'sensor'
  | 'control'
  | 'algorithm'
  | 'effect'
  | 'integration';

export type ElementImportance = 'required' | 'optional' | 'technical_effect';
export type ClaimType = 'independent' | 'dependent' | 'deleted' | 'unknown';
export type MatchLevel = 'identical' | 'partial' | 'functional' | 'different' | 'unknown';
export type Distinctiveness = 'high' | 'medium' | 'low' | 'unknown';
export type RiskLevel = 'high' | 'medium' | 'low' | 'hold';
export type ReviewStatus = 'ai' | 'confirmed' | 'modified';
export type AnalysisStatus =
  | 'idle'
  | 'extracting'
  | 'review_required'
  | 'mapping'
  | 'completed'
  | 'failed';
export type ProcessStep = 'define' | 'claim-map' | 'report';
export type RelevanceGrade = 'very_high' | 'high' | 'medium' | 'low' | 'review_required';

export interface PatentDocument {
  fileName: string;
  title: string;
  applicant: string;
  applicationNumber: string;
  publicationNumber: string;
  registrationNumber: string;
  pageCount: number;
  extractedText: string;
  claimsText: string;
}

export interface InventionElement {
  id: string;
  name: string;
  description: string;
  category: ElementCategory;
  importance: ElementImportance;
  sourceQuote: string;
  confidence: number;
  needsReview: boolean;
  reviewStatus: ReviewStatus;
}

export interface ClaimElement {
  id: string;
  claimNumber: number;
  claimType: ClaimType;
  parentClaimNumber?: number;
  name: string;
  normalizedText: string;
  exactQuote: string;
  confidence: number;
  needsReview: boolean;
  reviewStatus: ReviewStatus;
}

export interface ClaimMapping {
  id: string;
  inventionElementId: string;
  claimElementIds: string[];
  matchLevel: MatchLevel;
  distinctiveness: Distinctiveness;
  riskLevel: RiskLevel;
  rationale: string;
  evidenceQuotes: Array<{ claimNumber: number; quote: string }>;
  confidence: number;
  needsReview: boolean;
  reviewStatus: ReviewStatus;
}

export interface ElementSearchStrategy {
  inventionElementId: string;
  korean: string[];
  english: string[];
  japanese: string[];
  ipcCandidates: string[];
  queries: Array<{
    database: 'KIPRIS' | 'Google Patents';
    level: 'broad' | 'balanced' | 'precise';
    query: string;
  }>;
}

export interface RelevanceAssessment {
  score?: number;
  grade: RelevanceGrade;
  factorScores: {
    requiredCoverage: number;
    functionalSimilarity: number;
    independentClaimEvidence: number;
    evidenceQuality: number;
    completeness: number;
  };
  commonElementIds: string[];
  distinctiveElementIds: string[];
  unresolvedElementIds: string[];
  reviewedMappings: number;
  totalMappings: number;
}

export interface ReferencePatentAnalysis {
  id: string;
  document: PatentDocument;
  sourceHash: string;
  status: AnalysisStatus;
  claimElements: ClaimElement[];
  mappings: ClaimMapping[];
  relevance?: RelevanceAssessment;
  confirmedAt?: string;
  updatedAt: string;
}

export interface ReportSnapshot {
  id: string;
  createdAt: string;
  includedPatentIds: string[];
  sourceVersionHash: string;
}

export interface ClaimMapState {
  processVersion: 2;
  inventionElements: InventionElement[];
  referencePatents: ReferencePatentAnalysis[];
  activePatentId?: string;
  reportSnapshots: ReportSnapshot[];
  searchStrategies: ElementSearchStrategy[];
  selectedMappingId?: string;
}
