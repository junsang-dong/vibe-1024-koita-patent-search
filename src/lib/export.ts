import type { PriorArtItem, InventionInfo, Keywords } from '../types';

// CSV 내보내기
export function exportToCSV(items: PriorArtItem[]): string {
  const headers = ['번호', '제목', '출원인', '특허번호', '출원년도', 'IPC', '점수', 'URL', '비고'];
  const rows = items.map((item, index) => [
    (index + 1).toString(),
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.applicant.replace(/"/g, '""')}"`,
    item.number,
    item.year.toString(),
    `"${item.ipc.join(', ')}"`,
    item.score?.toString() || '',
    item.url,
    `"${(item.note || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return '\uFEFF' + csv; // UTF-8 BOM for Excel
}

// JSON 내보내기
export function exportToJSON(items: PriorArtItem[]): string {
  return JSON.stringify(items, null, 2);
}

// Markdown 리포트 생성
export function generateMarkdownReport(
  inventionInfo: InventionInfo | null,
  keywords: Keywords | null,
  items: PriorArtItem[],
  summary?: string
): string {
  const date = new Date().toLocaleDateString('ko-KR');
  
  let md = `# 선행특허 조사 리포트\n\n`;
  md += `**조사일:** ${date}\n\n`;
  md += `---\n\n`;

  // 1. 발명 정보
  if (inventionInfo) {
    md += `## 1. 발명 개요\n\n`;
    md += `### 발명의 명칭\n${inventionInfo.title}\n\n`;
    md += `### 기술분야\n${inventionInfo.technicalField}\n\n`;
    md += `### 발명의 목적\n${inventionInfo.purpose}\n\n`;
    md += `### 발명의 요약\n${inventionInfo.summary}\n\n`;
  }

  // 2. 검색 키워드
  if (keywords) {
    md += `## 2. 검색 키워드 및 분류코드\n\n`;
    
    if (keywords.korean.length > 0) {
      md += `### 한국어 키워드\n${keywords.korean.join(', ')}\n\n`;
    }
    
    if (keywords.english.length > 0) {
      md += `### 영어 키워드\n${keywords.english.join(', ')}\n\n`;
    }
    
    if (keywords.ipc.length > 0) {
      md += `### IPC 분류코드\n${keywords.ipc.join(', ')}\n\n`;
    }
  }

  // 3. 선행특허 목록
  md += `## 3. 발견된 선행특허 (${items.length}건)\n\n`;
  
  items
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .forEach((item, index) => {
      md += `### ${index + 1}. ${item.title}\n\n`;
      md += `- **특허번호:** ${item.number}\n`;
      md += `- **출원인:** ${item.applicant}\n`;
      md += `- **출원년도:** ${item.year}\n`;
      md += `- **IPC:** ${item.ipc.join(', ')}\n`;
      if (item.score) {
        md += `- **관련성 점수:** ${item.score}/100\n`;
      }
      if (item.scoreReason) {
        md += `- **평가 근거:** ${item.scoreReason}\n`;
      }
      md += `- **URL:** ${item.url}\n`;
      
      if (item.keyClaims) {
        md += `\n**핵심 청구항:**\n${item.keyClaims}\n`;
      }
      
      if (item.diffPoints && item.diffPoints.length > 0) {
        md += `\n**차별성 포인트:**\n`;
        item.diffPoints.forEach((point) => {
          md += `- ${point}\n`;
        });
      }
      
      if (item.note) {
        md += `\n**비고:** ${item.note}\n`;
      }
      
      md += `\n---\n\n`;
    });

  // 4. GPT 생성 요약
  if (summary) {
    md += `## 4. AI 분석 요약\n\n`;
    md += summary;
    md += `\n\n`;
  }

  // 5. 결론
  md += `## 5. 종합 의견\n\n`;
  md += `총 ${items.length}건의 선행특허가 발견되었습니다.\n\n`;
  
  const highScoreItems = items.filter((item) => (item.score || 0) >= 70);
  if (highScoreItems.length > 0) {
    md += `**높은 관련성 (70점 이상):** ${highScoreItems.length}건\n`;
    md += `- 특히 주의가 필요한 특허: ${highScoreItems.map(item => item.number).join(', ')}\n\n`;
  }

  md += `\n---\n\n`;
  md += `*본 리포트는 AI 보조 도구를 활용하여 생성되었습니다. 최종 판단은 전문가의 검토가 필요합니다.*\n`;

  return md;
}

// 파일 다운로드 트리거
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 편의 함수들
export function downloadCSV(items: PriorArtItem[], filename = 'prior-art-search.csv') {
  const csv = exportToCSV(items);
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

export function downloadJSON(items: PriorArtItem[], filename = 'prior-art-search.json') {
  const json = exportToJSON(items);
  downloadFile(json, filename, 'application/json');
}

export function downloadMarkdown(
  inventionInfo: InventionInfo | null,
  keywords: Keywords | null,
  items: PriorArtItem[],
  summary?: string,
  filename = 'prior-art-report.md'
) {
  const md = generateMarkdownReport(inventionInfo, keywords, items, summary);
  downloadFile(md, filename, 'text/markdown;charset=utf-8');
}

