import type { InventionInfo, Keywords } from '../types';
import type {
  ClaimElement,
  ClaimMapState,
  ClaimMapping,
  ElementCategory,
  ElementSearchStrategy,
  InventionElement,
  PatentDocument,
  ReferencePatentAnalysis,
  RelevanceAssessment,
} from '../types/claim-map';

export const EMPTY_PATENT_DOCUMENT: PatentDocument = {
  fileName: '',
  title: '',
  applicant: '',
  applicationNumber: '',
  publicationNumber: '',
  registrationNumber: '',
  pageCount: 0,
  extractedText: '',
  claimsText: '',
};

export const EMPTY_CLAIM_MAP: ClaimMapState = {
  processVersion: 2,
  inventionElements: [],
  referencePatents: [],
  reportSnapshots: [],
  searchStrategies: [],
};

export function createReferencePatent(
  document: PatentDocument = { ...EMPTY_PATENT_DOCUMENT },
): ReferencePatentAnalysis {
  return {
    id: `patent-${crypto.randomUUID()}`,
    document,
    sourceHash: '',
    status: 'idle',
    claimElements: [],
    mappings: [],
    updatedAt: new Date().toISOString(),
  };
}

export const BCR_SAMPLE_INVENTION: InventionInfo = {
  title: '센서 융합과 디지털 트윈 기반의 자가 진단형 로봇 스마트 액추에이터',
  technicalField: '산업용 로봇, 스마트 액추에이터, 센서 융합, 디지털 트윈, 예지보전',
  purpose:
    '토크, 전류, 진동 및 온도 데이터를 통합 분석하여 부품 열화를 조기에 감지하고 제어 파라미터와 안전 한계를 자동 보정한다.',
  summary:
    '중공 구조를 갖는 모터와 감속기, 출력 토크를 측정하는 토크센서, 전류·진동·온도 센서 및 엣지 제어부를 포함한다. 복수 센서 데이터를 시간 동기화하고 디지털 트윈의 정상 거동 예측값과 실제 측정값의 잔차를 분석하여 감속기 마모, 백래시, 베어링 이상과 과부하를 진단한다. 이상 점수와 잔여 수명을 계산하고, 진단 결과에 따라 토크 한계와 제어 파라미터를 자동 보정하며 유지보수 정보를 외부 생산관리 시스템에 전송한다.',
};

export const BCR_SAMPLE_CLAIMS = `청구항 1
적층형으로 형성된 전자회로를 갖는 전장부; 모터 및 감속기를 구비하며, 중공의 내부 공간을 갖는 구동부; 상기 구동부의 일측에 설치되어 토크 값을 측정하는 토크센서부; 및 상기 토크센서부로부터 측정된 토크 값을 획득하여, 상기 모터에 대한 제어명령을 산출하는 제어부를 포함하고, 상기 제어부는 획득한 상기 토크 값 기반으로 임피던스를 감소시키는 참조토크 값을 산출하는 토크제어유닛; 참조토크 값을 참조전류 값으로 변환시키는 토크전류변환유닛; 및 전류제어 알고리즘이 내장된 전류제어유닛을 포함하며, 가상 스마트 액추에이터의 거동을 실제 스마트 액추에이터의 거동과 비교하여 보조 제어입력 값을 산출하는 제2토크제어유닛을 더 포함한다.

청구항 2
제1항에 있어서, 토크센서부는 구동부의 중공 내부 공간의 개방 부분을 덮을 수 있도록 형성된다.

청구항 3
제2항에 있어서, 토크센서부는 전선 케이블이 통과할 수 있도록 일측에 관통구가 형성된다.

청구항 4
제3항에 있어서, 구동부의 중공 내부 공간을 관통하며 일단이 토크센서부와 관통구를 통과하도록 연결되는 파이프부를 더 포함한다.

청구항 5
삭제

청구항 6
제1항에 있어서, 전류제어유닛은 참조전류 값을 피드백하여 자속기준제어(Field Oriented Control) 기반으로 전류를 제어한다.

청구항 7
삭제

청구항 8
제1항에 있어서, 제1토크제어유닛의 제어입력 값은 제2토크제어유닛에서 산출된 보조 제어입력 값을 포함한다.

청구항 9
제8항에 있어서, 제2토크제어유닛은 가상 스마트 액추에이터의 거동을 모의 실험하는 시뮬레이션유닛과 모의 거동과 실제 모션을 비교해 보조 입력을 생성하는 모델추종제어유닛을 포함한다.

청구항 10
제9항에 있어서, 가상 스마트 액추에이터는 제1토크제어유닛에 의해 조절된 대역폭을 가지는 시스템에 대해 구현된다.`;

export const BCR_SAMPLE_DOCUMENT: PatentDocument = {
  fileName: 'C51 KIPRIS ROBOT ACTUATOR2.pdf',
  title: '토크 값 기반으로 모듈화된 로봇용 스마트 액추에이터',
  applicant: '주식회사 뉴로메카',
  applicationNumber: '10-2020-0136931',
  publicationNumber: '10-2022-0052696',
  registrationNumber: '10-2395225',
  pageCount: 6,
  extractedText: BCR_SAMPLE_CLAIMS,
  claimsText: BCR_SAMPLE_CLAIMS,
};

function formatKoreanPatentNumber(rawValue: string, kind: 'application' | 'publication' | 'registration'): string {
  const digits = rawValue.replace(/\D/g, '');
  if (kind === 'registration' && /^\d{9}0{4}$/.test(digits)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 9)}`;
  }
  if (/^\d{13}$/.test(digits)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return rawValue.trim();
}

export function extractKiprisPatentMetadata(text: string): Partial<PatentDocument> {
  const normalized = text.replace(/\r/g, '').replace(/\u00a0/g, ' ');
  if (!normalized.includes('국내 특허·실용신안 상세 인쇄 화면')) return {};

  const lines = normalized
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);
  const headingIndex = lines.findIndex((line) => line.includes('국내 특허·실용신안 상세 인쇄 화면'));
  const title = headingIndex >= 0 ? lines[headingIndex + 1] || '' : '';
  const applicationNumber = normalized.match(/Application No\.\s*\n\s*\(Date\)(?:\(Int'l\))?\s+(\d{9,13})/i)?.[1] || '';
  const registrationNumber = normalized.match(/Registration No\.\s*\n\s*\(Date\)\s+(\d{9,13})/i)?.[1] || '';
  const publicationNumber = normalized.match(/Unex\. Pub\. No\.\s*\n\s*\(Date\)\s*\n?\s*(\d{9,13})/i)?.[1] || '';
  const applicant = normalized.match(/Applicant\s+([\s\S]*?)(?=\n\s*(?:Translation|Submission Date|Registration No\.))/i)?.[1]
    ?.replace(/\s+/g, ' ')
    .trim() || '';

  return {
    title,
    applicant,
    applicationNumber: applicationNumber ? formatKoreanPatentNumber(applicationNumber, 'application') : '',
    publicationNumber: publicationNumber ? formatKoreanPatentNumber(publicationNumber, 'publication') : '',
    registrationNumber: registrationNumber ? formatKoreanPatentNumber(registrationNumber, 'registration') : '',
  };
}

const KNOWN_ELEMENTS: Array<Omit<InventionElement, 'id' | 'reviewStatus'>> = [
  {
    name: '중공 모터·감속기 구동부',
    description: '중공 구조를 갖는 모터와 감속기로 구성된 로봇 관절 구동부',
    category: 'mechanical',
    importance: 'required',
    sourceQuote: '중공 구조를 갖는 모터와 감속기',
    confidence: 0.96,
    needsReview: false,
  },
  {
    name: '다중 센서 계측',
    description: '출력 토크와 모터 전류, 진동, 온도를 함께 측정하는 센서군',
    category: 'sensor',
    importance: 'required',
    sourceQuote: '토크센서, 전류·진동·온도 센서',
    confidence: 0.95,
    needsReview: false,
  },
  {
    name: '센서 데이터 시간 동기화',
    description: '복수 센서의 시계열 데이터를 엣지 제어부에서 동기화',
    category: 'control',
    importance: 'required',
    sourceQuote: '복수 센서 데이터를 시간 동기화',
    confidence: 0.91,
    needsReview: false,
  },
  {
    name: '디지털 트윈 잔차 분석',
    description: '정상 거동 예측값과 실제 측정값의 잔차를 이용한 상태 진단',
    category: 'algorithm',
    importance: 'required',
    sourceQuote: '디지털 트윈의 정상 거동 예측값과 실제 측정값의 잔차를 분석',
    confidence: 0.94,
    needsReview: false,
  },
  {
    name: '열화·이상 진단',
    description: '감속기 마모, 백래시, 베어링 이상 및 과부하 추정',
    category: 'algorithm',
    importance: 'required',
    sourceQuote: '감속기 마모, 백래시, 베어링 이상과 과부하를 진단',
    confidence: 0.93,
    needsReview: false,
  },
  {
    name: '잔여 수명 예측',
    description: '이상 점수와 잔여 수명 또는 유지보수 시점 산출',
    category: 'effect',
    importance: 'technical_effect',
    sourceQuote: '이상 점수와 잔여 수명을 계산',
    confidence: 0.9,
    needsReview: false,
  },
  {
    name: '진단 기반 적응 제어',
    description: '진단 결과에 따라 토크 한계와 제어 파라미터를 자동 보정',
    category: 'control',
    importance: 'required',
    sourceQuote: '토크 한계와 제어 파라미터를 자동 보정',
    confidence: 0.92,
    needsReview: false,
  },
  {
    name: '생산관리 시스템 연계',
    description: '진단 근거와 유지보수 정보를 외부 시스템에 전송',
    category: 'integration',
    importance: 'optional',
    sourceQuote: '유지보수 정보를 외부 생산관리 시스템에 전송',
    confidence: 0.89,
    needsReview: false,
  },
];

const containsSmartActuatorTerms = (text: string) =>
  ['액추에이터', '토크', '디지털 트윈', '센서'].filter((term) => text.includes(term)).length >= 2;

export function extractInventionElements(info: InventionInfo): InventionElement[] {
  if (containsSmartActuatorTerms(`${info.title} ${info.summary}`)) {
    return KNOWN_ELEMENTS.map((element, index) => ({
      ...element,
      id: `A${index + 1}`,
      reviewStatus: 'ai',
    }));
  }

  const segments = info.summary
    .split(/[.。\n]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 12)
    .slice(0, 8);
  const categoryFor = (text: string): ElementCategory => {
    if (/센서|측정|감지/.test(text)) return 'sensor';
    if (/알고리즘|모델|예측|분석/.test(text)) return 'algorithm';
    if (/제어|보정/.test(text)) return 'control';
    if (/전송|연계|서버|시스템/.test(text)) return 'integration';
    return 'mechanical';
  };

  return segments.map((segment, index) => ({
    id: `A${index + 1}`,
    name: segment.length > 28 ? `${segment.slice(0, 28)}…` : segment,
    description: segment,
    category: categoryFor(segment),
    importance: index < 4 ? 'required' : 'optional',
    sourceQuote: segment,
    confidence: 0.68,
    needsReview: true,
    reviewStatus: 'ai',
  }));
}

const normalizeClaimsText = (text: string) =>
  text
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/청\s*구\s*항/g, '청구항')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

function normalizeKiprisClaimTable(text: string): string | undefined {
  const headerPattern = /(?:Claim\s*\n\s*)?No\.?\s*Claim\s*(?:\n\s*)?1\b/i;
  const header = headerPattern.exec(text);
  if (!header || header.index === undefined) return undefined;

  let claims = text.slice(header.index + header[0].length);
  const sectionEnd = claims.search(/(?:^|\n)\s*(?:Patent Family|DOCDB Patent Family|National R&D Project|Integrated Examination Information)\b/i);
  if (sectionEnd >= 0) claims = claims.slice(0, sectionEnd);

  claims = claims
    .replace(/\[페이지\s*\d+\]\s*/g, '\n')
    .replace(/(?:^|\n)\s*No\.?\s*Claim\s*(?=\n|$)/gi, '\n')
    .replace(/^.*KIPRIS\s+지식재산정보\s+검색\s+서비스.*$/gim, '')
    .replace(/^https?:\/\/www\.kipris\.or\.kr\/.*$/gim, '')
    .replace(/(?:^|\n)\s*\d{1,3}\s*(?=\n\s*\d{7,}(?:\s+[A-Z]\d?)?\s*(?:\n|$))/g, '\n')
    .replace(/^\s*[A-Z]{0,2}\d{7,}(?:\s+[A-Z]\d?)?\s*$/gim, '')
    .replace(/^\s*·\s*$/gm, '');

  let expectedClaimNumber = 2;
  let sequentialMarkers = 0;
  claims = claims
    .split('\n')
    .flatMap((line) => {
      const row = line.match(/^\s*(\d{1,3})(?:[ \t]+(.*))?\s*$/);
      if (!row || Number(row[1]) !== expectedClaimNumber) return [line];
      const claimNumber = expectedClaimNumber;
      expectedClaimNumber += 1;
      sequentialMarkers += 1;
      return row[2]?.trim()
        ? [`청구항 ${claimNumber}`, row[2].trim()]
        : [`청구항 ${claimNumber}`];
    })
    .join('\n');

  if (sequentialMarkers === 0) {
    // 이전 버전에서 줄바꿈 없이 저장된 KIPRIS 텍스트도 다시 분석할 수 있게 합니다.
    claims = claims
      .replace(/\s+(\d{1,3})\s+(?=제\s*\d+\s*항에 있어서|삭제(?=\s|$))/g, '\n\n청구항 $1\n');
  }

  claims = claims.replace(/\n{3,}/g, '\n\n').trim();

  return `청구항 1\n${claims}`;
}

export function findClaimsText(text: string): string {
  const normalized = normalizeClaimsText(text);
  const explicitStart = normalized.search(/청구항\s*(?:제\s*)?1\s*(?:항)?\b/);
  if (explicitStart >= 0) {
    return normalized
      .slice(explicitStart)
      .replace(/청구항\s*(?:제\s*)?(\d{1,3})\s*(?:항)?\b/g, '청구항 $1');
  }

  const kiprisClaims = normalizeKiprisClaimTable(normalized);
  if (kiprisClaims) return kiprisClaims;

  const kiprisStart = normalized.search(/(?:^|\n)\s*(?:Claim\s*)?1\s+적층형/);
  if (kiprisStart >= 0) return `청구항 ${normalized.slice(kiprisStart)}`;
  return normalized;
}

function claimName(text: string, claimNumber: number): string {
  if (/^삭제\s*$/.test(text)) return '삭제된 청구항';
  const normalized = text
    .replace(/^제\s*\d+\s*항[\s\S]{0,40}?에 있어서,?\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  const firstClause = normalized.split(/[;。.]|\n/)[0]?.trim() || `청구항 ${claimNumber}`;
  return firstClause.length > 42 ? `${firstClause.slice(0, 42)}…` : firstClause;
}

export function parseClaimElements(rawText: string): ClaimElement[] {
  const text = findClaimsText(rawText);
  const matches = [...text.matchAll(/청구항\s*(?:제\s*)?(\d{1,3})\s*(?:항)?\b/g)];
  if (matches.length === 0) return [];

  return matches.map((match, index) => {
    const claimNumber = Number(match[1]);
    const start = (match.index || 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const exactQuote = text.slice(start, end).trim();
    const parent = exactQuote.match(/^제\s*(\d+)\s*항[\s\S]{0,40}?에 있어서/);
    const deleted = /^삭제\s*$/.test(exactQuote);
    return {
      id: `C${claimNumber}.1`,
      claimNumber,
      claimType: deleted ? 'deleted' : parent ? 'dependent' : 'independent',
      parentClaimNumber: parent ? Number(parent[1]) : undefined,
      name: claimName(exactQuote, claimNumber),
      normalizedText: exactQuote.replace(/\s+/g, ' '),
      exactQuote,
      confidence: deleted || parent ? 0.97 : 0.9,
      needsReview: false,
      reviewStatus: 'ai',
    };
  });
}

const MAPPING_RULES: Record<string, { claims: number[]; level: ClaimMapping['matchLevel']; distinction: ClaimMapping['distinctiveness']; risk: ClaimMapping['riskLevel']; rationale: string }> = {
  '중공 모터·감속기 구동부': { claims: [1, 4], level: 'identical', distinction: 'low', risk: 'high', rationale: '독립항 1이 모터·감속기와 중공 내부 공간을 명시하고 청구항 4가 중공 파이프 구조를 구체화합니다.' },
  '다중 센서 계측': { claims: [1, 2, 3], level: 'partial', distinction: 'medium', risk: 'medium', rationale: '기준 특허는 토크센서를 명시하지만 전류·진동·온도 센서의 결합은 청구항에서 확인되지 않습니다.' },
  '센서 데이터 시간 동기화': { claims: [], level: 'different', distinction: 'high', risk: 'low', rationale: '복수 센서 데이터의 시간 동기화는 제공된 청구항에서 확인되지 않습니다.' },
  '디지털 트윈 잔차 분석': { claims: [1, 9, 10], level: 'functional', distinction: 'medium', risk: 'medium', rationale: '가상 액추에이터와 실제 거동의 비교는 유사하지만, 열화 진단용 잔차 분석은 명시되지 않습니다.' },
  '열화·이상 진단': { claims: [], level: 'different', distinction: 'high', risk: 'low', rationale: '마모·백래시·베어링 이상을 판단하는 구성은 제공된 청구항에서 확인되지 않습니다.' },
  '잔여 수명 예측': { claims: [], level: 'different', distinction: 'high', risk: 'low', rationale: '잔여 수명 또는 유지보수 시점 산출은 제공된 청구항에서 확인되지 않습니다.' },
  '진단 기반 적응 제어': { claims: [1, 8, 9], level: 'partial', distinction: 'medium', risk: 'medium', rationale: '모델 비교 결과를 제어입력에 반영하는 점은 유사하나 진단 결과 기반 안전 한계 보정은 확인되지 않습니다.' },
  '생산관리 시스템 연계': { claims: [], level: 'different', distinction: 'high', risk: 'low', rationale: '유지보수 정보의 외부 생산관리 시스템 전송은 제공된 청구항에서 확인되지 않습니다.' },
};

const ELEMENT_EVIDENCE_TERMS: Record<string, string[]> = {
  '중공 모터·감속기 구동부': ['중공', '모터', '감속기'],
  '다중 센서 계측': ['토크센서', '전류센서', '진동', '온도', '복수 센서'],
  '센서 데이터 시간 동기화': ['시간 동기화', '시계열 정렬', '동기화'],
  '디지털 트윈 잔차 분석': ['디지털 트윈', '정상 모델', '가상 스마트 액추에이터', '잔차', '실제 모션'],
  '열화·이상 진단': ['마모', '백래시', '베어링 이상', '이상 상태', '상태를 진단'],
  '잔여 수명 예측': ['잔여 수명', '유지보수 시점', '예지보전'],
  '진단 기반 적응 제어': ['자동 보정', '토크 한계', '제어 파라미터', '보조 제어입력'],
  '생산관리 시스템 연계': ['생산관리 시스템', '유지보수 정보', '외부 시스템', '진단 근거'],
};

function createEvidenceBasedMapping(element: InventionElement, claimElements: ClaimElement[]): ClaimMapping {
  const terms = ELEMENT_EVIDENCE_TERMS[element.name] || element.name.split(/[·\s]+/).filter((term) => term.length >= 2);
  const evidence = claimElements
    .filter((claim) => claim.claimType !== 'deleted')
    .map((claim) => ({
      claim,
      hits: terms.filter((term) => claim.normalizedText.includes(term)),
    }))
    .filter((item) => item.hits.length > 0);
  const uniqueHits = [...new Set(evidence.flatMap((item) => item.hits))];
  const coverage = uniqueHits.length / (terms.length || 1);
  const matchLevel: ClaimMapping['matchLevel'] = evidence.length === 0
    ? 'different'
    : coverage >= 0.6
      ? 'identical'
      : element.category === 'algorithm' || element.category === 'control'
        ? 'functional'
        : 'partial';
  const distinctiveness: ClaimMapping['distinctiveness'] = matchLevel === 'different'
    ? 'high'
    : matchLevel === 'identical'
      ? 'low'
      : 'medium';
  const riskLevel: ClaimMapping['riskLevel'] = matchLevel === 'identical'
    ? 'high'
    : matchLevel === 'partial' || matchLevel === 'functional'
      ? 'medium'
      : 'low';
  const claimList = evidence.map((item) => `청구항 ${item.claim.claimNumber}`).join(', ');
  const rationale = evidence.length > 0
    ? `${claimList}에서 ${uniqueHits.map((term) => `“${term}”`).join(', ')} 표현이 확인됩니다. 표현이 없는 세부 구성은 공개된 것으로 단정하지 않습니다.`
    : `${terms.map((term) => `“${term}”`).join(', ')}에 직접 대응하는 표현을 제공된 청구항에서 확인하지 못했습니다.`;
  return {
    id: `M-${element.id}`,
    inventionElementId: element.id,
    claimElementIds: evidence.map((item) => item.claim.id),
    matchLevel,
    distinctiveness,
    riskLevel,
    rationale,
    evidenceQuotes: evidence.map((item) => ({ claimNumber: item.claim.claimNumber, quote: item.claim.exactQuote })),
    confidence: evidence.length > 0 ? Math.min(0.95, 0.68 + coverage * 0.25) : 0.76,
    needsReview: true,
    reviewStatus: 'ai',
  };
}

export function createClaimMappings(
  inventionElements: InventionElement[],
  claimElements: ClaimElement[],
): ClaimMapping[] {
  const isBcrPatent = claimElements.some((claim) =>
    claim.exactQuote.includes('임피던스를 감소') && claim.exactQuote.includes('가상 스마트 액추에이터'),
  );
  return inventionElements.map((element) => {
    if (!isBcrPatent) return createEvidenceBasedMapping(element, claimElements);
    const rule = MAPPING_RULES[element.name];
    const related = rule
      ? claimElements.filter((claim) => rule.claims.includes(claim.claimNumber))
      : [];
    const hasEvidence = related.length > 0;
    return {
      id: `M-${element.id}`,
      inventionElementId: element.id,
      claimElementIds: related.map((claim) => claim.id),
      matchLevel: rule?.level || 'unknown',
      distinctiveness: rule?.distinction || 'unknown',
      riskLevel: rule?.risk || 'hold',
      rationale: rule?.rationale || '자동 대응 근거가 부족하여 사용자 검토가 필요합니다.',
      evidenceQuotes: related.map((claim) => ({
        claimNumber: claim.claimNumber,
        quote: claim.exactQuote,
      })),
      confidence: hasEvidence ? 0.86 : rule ? 0.78 : 0.45,
      needsReview: true,
      reviewStatus: 'ai',
    };
  });
}

const STRATEGY_LIBRARY: Record<string, Omit<ElementSearchStrategy, 'inventionElementId'>> = {
  '중공 모터·감속기 구동부': { korean: ['중공 액추에이터', '모터 감속기 모듈'], english: ['hollow actuator', 'hollow-shaft actuator'], japanese: ['中空アクチュエータ'], ipcCandidates: ['B25J 9/08', 'B25J 9/10'], queries: [] },
  '다중 센서 계측': { korean: ['토크센서', '다중 센서', '센서 융합'], english: ['torque sensor', 'multi-sensor fusion'], japanese: ['トルクセンサ', 'センサフュージョン'], ipcCandidates: ['B25J 19/02'], queries: [] },
  '센서 데이터 시간 동기화': { korean: ['센서 시간 동기화', '시계열 정렬'], english: ['sensor time synchronization', 'time-series alignment'], japanese: ['センサ時刻同期'], ipcCandidates: ['G05B 23/02'], queries: [] },
  '디지털 트윈 잔차 분석': { korean: ['디지털 트윈', '모델 잔차 진단'], english: ['digital twin', 'model residual diagnosis'], japanese: ['デジタルツイン', 'モデル残差診断'], ipcCandidates: ['G05B 23/02'], queries: [] },
  '열화·이상 진단': { korean: ['감속기 마모 진단', '백래시 추정', '상태 감시'], english: ['gearbox wear diagnosis', 'backlash estimation', 'condition monitoring'], japanese: ['減速機診断', '状態監視'], ipcCandidates: ['G01M 13/02'], queries: [] },
  '잔여 수명 예측': { korean: ['잔여 수명', '예지보전'], english: ['remaining useful life', 'predictive maintenance'], japanese: ['残存寿命', '予知保全'], ipcCandidates: ['G05B 23/02'], queries: [] },
  '진단 기반 적응 제어': { korean: ['적응형 토크제어', '진단 기반 제어 보정'], english: ['adaptive torque control', 'diagnosis-based control'], japanese: ['適応トルク制御'], ipcCandidates: ['B25J 9/16'], queries: [] },
  '생산관리 시스템 연계': { korean: ['유지보수 정보 전송', '생산관리 연계'], english: ['maintenance information integration', 'manufacturing execution system'], japanese: ['保全情報連携'], ipcCandidates: ['G05B 23/02'], queries: [] },
};

export function createSearchStrategies(elements: InventionElement[]): ElementSearchStrategy[] {
  return elements.map((element) => {
    const base = STRATEGY_LIBRARY[element.name] || {
      korean: [element.name],
      english: [],
      japanese: [],
      ipcCandidates: [],
      queries: [],
    };
    const koQuery = base.korean.map((term) => `"${term}"`).join(' OR ');
    const enQuery = base.english.map((term) => `"${term}"`).join(' OR ');
    return {
      ...base,
      inventionElementId: element.id,
      queries: [
        { database: 'KIPRIS', level: 'balanced', query: `(${koQuery}) AND (로봇 OR 액추에이터)` },
        { database: 'Google Patents', level: 'precise', query: `(${enQuery || koQuery}) AND (robot OR actuator)` },
      ],
    };
  });
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))];

export function mergeStrategiesIntoKeywords(
  current: Keywords | null,
  strategies: ElementSearchStrategy[],
): Keywords {
  return {
    korean: unique([...(current?.korean || []), ...strategies.flatMap((item) => item.korean)]),
    english: unique([...(current?.english || []), ...strategies.flatMap((item) => item.english)]),
    japanese: unique([...(current?.japanese || []), ...strategies.flatMap((item) => item.japanese)]),
    ipc: unique([...(current?.ipc || []), ...strategies.flatMap((item) => item.ipcCandidates)]),
    cpc: current?.cpc || [],
  };
}

export function createBcrSampleClaimMap(): ClaimMapState {
  const inventionElements = extractInventionElements(BCR_SAMPLE_INVENTION);
  const claimElements = parseClaimElements(BCR_SAMPLE_CLAIMS);
  const patent = createReferencePatent({ ...BCR_SAMPLE_DOCUMENT });
  const mappings = createClaimMappings(inventionElements, claimElements);
  const confirmedMappings = mappings.map((mapping) => ({ ...mapping, reviewStatus: 'confirmed' as const, needsReview: false }));
  patent.claimElements = claimElements;
  patent.mappings = confirmedMappings;
  patent.status = 'completed';
  patent.confirmedAt = new Date().toISOString();
  patent.relevance = calculateRelevance(inventionElements, claimElements, confirmedMappings);
  return {
    processVersion: 2,
    inventionElements,
    referencePatents: [patent],
    activePatentId: patent.id,
    reportSnapshots: [],
    searchStrategies: [],
  };
}

const matchPoints: Record<ClaimMapping['matchLevel'], number> = {
  identical: 1,
  partial: 0.65,
  functional: 0.5,
  different: 0,
  unknown: 0,
};

export function calculateRelevance(
  inventionElements: InventionElement[],
  claimElements: ClaimElement[],
  mappings: ClaimMapping[],
): RelevanceAssessment {
  const requiredIds = new Set(
    inventionElements.filter((element) => element.importance === 'required').map((element) => element.id),
  );
  const requiredMappings = mappings.filter((mapping) => requiredIds.has(mapping.inventionElementId));
  const requiredBase = requiredMappings.length || 1;
  const requiredCoverage = Math.round(
    (requiredMappings.reduce((sum, mapping) => sum + matchPoints[mapping.matchLevel], 0) / requiredBase) * 40,
  );
  const functionalSimilarity = Math.round(
    (mappings.reduce((sum, mapping) => sum + matchPoints[mapping.matchLevel], 0) / (mappings.length || 1)) * 25,
  );
  const independentIds = new Set(
    claimElements.filter((claim) => claim.claimType === 'independent').map((claim) => claim.id),
  );
  const mappingsWithIndependentEvidence = mappings.filter((mapping) =>
    mapping.claimElementIds.some((id) => independentIds.has(id)),
  ).length;
  const independentClaimEvidence = Math.round(
    (mappingsWithIndependentEvidence / (requiredMappings.length || mappings.length || 1)) * 20,
  );
  const evidenceMappings = mappings.filter((mapping) =>
    mapping.evidenceQuotes.length > 0 && mapping.claimElementIds.length > 0,
  ).length;
  const evidenceQuality = Math.round((evidenceMappings / (mappings.length || 1)) * 10);
  const reviewedMappings = mappings.filter((mapping) => mapping.reviewStatus === 'confirmed').length;
  const completeness = Math.round((reviewedMappings / (mappings.length || 1)) * 5);
  const unresolvedElementIds = mappings
    .filter((mapping) => mapping.matchLevel === 'unknown' || mapping.reviewStatus !== 'confirmed')
    .map((mapping) => mapping.inventionElementId);
  const commonElementIds = mappings
    .filter((mapping) => ['identical', 'partial', 'functional'].includes(mapping.matchLevel) && mapping.evidenceQuotes.length > 0)
    .map((mapping) => mapping.inventionElementId);
  const distinctiveElementIds = mappings
    .filter((mapping) => mapping.matchLevel === 'different')
    .map((mapping) => mapping.inventionElementId);
  const unreviewedRatio = 1 - reviewedMappings / (mappings.length || 1);
  const rawScore = requiredCoverage + functionalSimilarity + independentClaimEvidence + evidenceQuality + completeness;
  const score = mappingsWithIndependentEvidence === 0 ? Math.min(rawScore, 59) : rawScore;
  const grade = unreviewedRatio > 0.3
    ? 'review_required'
    : score >= 80
      ? 'very_high'
      : score >= 60
        ? 'high'
        : score >= 40
          ? 'medium'
          : 'low';

  return {
    score: grade === 'review_required' ? undefined : score,
    grade,
    factorScores: {
      requiredCoverage,
      functionalSimilarity,
      independentClaimEvidence,
      evidenceQuality,
      completeness,
    },
    commonElementIds,
    distinctiveElementIds,
    unresolvedElementIds,
    reviewedMappings,
    totalMappings: mappings.length,
  };
}

interface LegacyClaimMapState {
  document?: PatentDocument;
  inventionElements?: InventionElement[];
  claimElements?: ClaimElement[];
  mappings?: ClaimMapping[];
  searchStrategies?: ElementSearchStrategy[];
  selectedMappingId?: string;
  confirmedAt?: string;
}

export function normalizeClaimMap(value: unknown): ClaimMapState {
  if (!value || typeof value !== 'object') return EMPTY_CLAIM_MAP;
  const candidate = value as Partial<ClaimMapState> & LegacyClaimMapState;
  if (candidate.processVersion === 2 && Array.isArray(candidate.referencePatents)) {
    return {
      ...EMPTY_CLAIM_MAP,
      ...candidate,
      processVersion: 2,
      inventionElements: candidate.inventionElements || [],
      referencePatents: candidate.referencePatents,
      reportSnapshots: candidate.reportSnapshots || [],
      searchStrategies: candidate.searchStrategies || [],
    };
  }

  const inventionElements = candidate.inventionElements || [];
  if (!candidate.document || !candidate.document.claimsText) {
    return { ...EMPTY_CLAIM_MAP, inventionElements };
  }
  const patent = createReferencePatent(candidate.document);
  patent.claimElements = candidate.claimElements || [];
  patent.mappings = candidate.mappings || [];
  patent.confirmedAt = candidate.confirmedAt;
  patent.status = candidate.confirmedAt ? 'completed' : patent.mappings.length > 0 ? 'mapping' : 'review_required';
  patent.relevance = calculateRelevance(inventionElements, patent.claimElements, patent.mappings);
  return {
    processVersion: 2,
    inventionElements,
    referencePatents: [patent],
    activePatentId: patent.id,
    reportSnapshots: [],
    searchStrategies: candidate.searchStrategies || [],
    selectedMappingId: candidate.selectedMappingId,
  };
}
