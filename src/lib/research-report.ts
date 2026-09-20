import type { ClaimMapState, InventionInfo, ReferencePatentAnalysis } from '../types';

export interface ResearchReportData {
  generatedAt: string;
  scope: 'user-provided-documents';
  inventionInfo: InventionInfo | null;
  inventionElements: ClaimMapState['inventionElements'];
  searchStrategies: ClaimMapState['searchStrategies'];
  patents: ReferencePatentAnalysis[];
}

const gradeLabel = {
  very_high: '매우 높음',
  high: '높음',
  medium: '중간',
  low: '낮음',
  review_required: '검토 필요',
};

const matchLabel = {
  identical: '동일',
  partial: '부분 일치',
  functional: '기능 유사',
  different: '차이 있음',
  unknown: '확인 불가',
};

export function buildResearchReport(
  inventionInfo: InventionInfo | null,
  claimMap: ClaimMapState,
  includedPatentIds: string[],
): ResearchReportData {
  return {
    generatedAt: new Date().toISOString(),
    scope: 'user-provided-documents',
    inventionInfo,
    inventionElements: claimMap.inventionElements,
    searchStrategies: claimMap.searchStrategies,
    patents: claimMap.referencePatents.filter((patent) => includedPatentIds.includes(patent.id)),
  };
}

export function createReportSourceHash(claimMap: ClaimMapState, includedPatentIds: string[]): string {
  const source = JSON.stringify({
    inventionElements: claimMap.inventionElements,
    patents: claimMap.referencePatents
      .filter((patent) => includedPatentIds.includes(patent.id))
      .map((patent) => ({
        id: patent.id,
        updatedAt: patent.updatedAt,
        mappings: patent.mappings,
        confirmedAt: patent.confirmedAt,
      })),
  });
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function researchReportToMarkdown(report: ResearchReportData): string {
  const lines: string[] = [
    '# 선행특허 리서치 요약 리포트',
    '',
    '> **조사 방식:** 사용자 제공 문서 비교  ',
    '> **조사 범위:** 외부 특허 데이터베이스 검색 미포함',
    '',
    `- 생성일: ${new Date(report.generatedAt).toLocaleString('ko-KR')}`,
    `- 비교 문서: ${report.patents.length}건`,
    '',
    '## 1. 조사 대상 발명',
    '',
    `- **명칭:** ${report.inventionInfo?.title || '미입력'}`,
    `- **기술분야:** ${report.inventionInfo?.technicalField || '미입력'}`,
    `- **목적:** ${report.inventionInfo?.purpose || '미입력'}`,
    '',
    report.inventionInfo?.summary || '발명 요약이 입력되지 않았습니다.',
    '',
    '## 2. 발명 구성요소',
    '',
    '| ID | 구성요소 | 유형 | 중요도 | 원문 근거 |',
    '|---|---|---|---|---|',
    ...report.inventionElements.map((element) => `| ${element.id} | ${element.name} | ${element.category} | ${element.importance} | ${element.sourceQuote.replace(/\|/g, '\\|')} |`),
    '',
    '## 3. 예시 특허 관련성 요약',
    '',
    '| 특허 | 출원번호 | 관련성 | 점수 | 검토 상태 |',
    '|---|---|---|---:|---|',
    ...report.patents.map((patent) => `| ${patent.document.title || '제목 미입력'} | ${patent.document.applicationNumber || '-'} | ${gradeLabel[patent.relevance?.grade || 'review_required']} | ${patent.relevance?.score ?? '-'} | ${patent.status === 'completed' ? '사용자 확정' : '초안'} |`),
    '',
    '## 4. 발명요소 × 특허 비교',
    '',
    `| 발명요소 | ${report.patents.map((patent) => patent.document.title || '예시 특허').join(' | ')} |`,
    `|---|${report.patents.map(() => '---').join('|')}|`,
    ...report.inventionElements.map((element) => {
      const cells = report.patents.map((patent) => {
        const mapping = patent.mappings.find((item) => item.inventionElementId === element.id);
        if (!mapping) return '미분석';
        const claims = mapping.evidenceQuotes.map((evidence) => `청구항 ${evidence.claimNumber}`).join(', ');
        return `${matchLabel[mapping.matchLevel]}${claims ? ` (${claims})` : ''}`;
      });
      return `| ${element.id} ${element.name} | ${cells.join(' | ')} |`;
    }),
    '',
  ];

  report.patents.forEach((patent, patentIndex) => {
    lines.push(`## ${patentIndex + 5}. 특허별 청구항 분석 - ${patent.document.title || '제목 미입력'}`, '');
    lines.push(`- 출원인: ${patent.document.applicant || '-'}`);
    lines.push(`- 출원번호: ${patent.document.applicationNumber || '-'}`);
    lines.push(`- 관련성: ${gradeLabel[patent.relevance?.grade || 'review_required']} (${patent.relevance?.score ?? '산출 불가'}점)`);
    lines.push(`- 상태: ${patent.status === 'completed' ? '사용자 확정' : '초안'}`, '');
    lines.push('| 발명요소 | 일치 수준 | 대응 청구항 | 분석 의견 |', '|---|---|---|---|');
    patent.mappings.forEach((mapping) => {
      const element = report.inventionElements.find((item) => item.id === mapping.inventionElementId);
      const claims = mapping.evidenceQuotes.map((evidence) => `청구항 ${evidence.claimNumber}`).join(', ') || '직접 근거 없음';
      lines.push(`| ${element?.id || ''} ${element?.name || ''} | ${matchLabel[mapping.matchLevel]} | ${claims} | ${mapping.rationale.replace(/\|/g, '\\|')} |`);
    });
    lines.push('');
    patent.mappings.flatMap((mapping) => mapping.evidenceQuotes.map((evidence) => ({ mapping, evidence }))).forEach(({ mapping, evidence }) => {
      const element = report.inventionElements.find((item) => item.id === mapping.inventionElementId);
      lines.push(`- **${element?.id} · 청구항 ${evidence.claimNumber}:** “${evidence.quote}”`);
    });
    lines.push('');
  });

  lines.push('## 추가 조사 개념', '');
  report.searchStrategies.forEach((strategy) => {
    const element = report.inventionElements.find((item) => item.id === strategy.inventionElementId);
    lines.push(`- **${element?.id || ''} ${element?.name || ''}:** ${[...strategy.korean, ...strategy.english, ...strategy.ipcCandidates].join(', ')}`);
  });
  lines.push('');

  lines.push(
    '## 조사 한계와 전문가 확인사항',
    '',
    '- 본 리포트는 사용자가 제공한 문서만 비교했으며 외부 특허 데이터베이스 검색을 수행하지 않았다.',
    '- 관련성 점수는 조사 우선순위를 위한 지표이며 신규성, 진보성, 권리범위 또는 침해를 확정하지 않는다.',
    '- 최종 판단 전에는 특허 원문, 심사 이력, 법적 상태 및 관할 법률을 특허 전문가와 확인해야 한다.',
    '',
  );
  return lines.join('\n');
}
