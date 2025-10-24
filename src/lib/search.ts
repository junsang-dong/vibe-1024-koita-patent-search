import type { SearchQuery } from '../types';

// 검색 도구별 딥링크 생성
export function generateSearchLinks(keywords: string[], _ipcCodes: string[]): SearchQuery[] {
  const queries: SearchQuery[] = [];

  // KIPRIS (한국)
  const kiprisKeywords = keywords.join(' OR ');
  queries.push({
    database: 'kipris',
    queryString: kiprisKeywords,
    url: `https://doi.org/kipris/search/total_search.do?query=${encodeURIComponent(kiprisKeywords)}`,
  });

  // USPTO (미국)
  const usptoQuery = keywords.map(k => `ABST/${k}`).join(' OR ');
  queries.push({
    database: 'uspto',
    queryString: usptoQuery,
    url: `https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html?query=${encodeURIComponent(usptoQuery)}`,
  });

  // J-PlatPat (일본)
  const jplatpatKeywords = keywords.slice(0, 3).join(' ');
  queries.push({
    database: 'jplatpat',
    queryString: jplatpatKeywords,
    url: `https://www.j-platpat.inpit.go.jp/c1800_C/AC_simple_search_quick_word?query=${encodeURIComponent(jplatpatKeywords)}`,
  });

  // Google Patents
  const googleQuery = keywords.slice(0, 5).join(' ');
  queries.push({
    database: 'google-patents',
    queryString: googleQuery,
    url: `https://patents.google.com/?q=${encodeURIComponent(googleQuery)}&oq=${encodeURIComponent(googleQuery)}`,
  });

  return queries;
}

// 간단한 텍스트 유사도 계산 (Jaccard similarity)
export function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

// TF-IDF 스타일의 간단한 키워드 매칭 점수
export function calculateKeywordScore(
  text: string,
  keywords: string[]
): number {
  const textLower = text.toLowerCase();
  let score = 0;

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const count = (textLower.match(new RegExp(keywordLower, 'g')) || []).length;
    
    // TF 계산
    const tf = count / (textLower.split(/\s+/).length || 1);
    score += tf * 100;
  }

  return Math.min(score, 100);
}

// IPC 코드 매칭 점수
export function calculateIPCScore(itemIPC: string[], targetIPC: string[]): number {
  if (itemIPC.length === 0 || targetIPC.length === 0) return 0;

  let exactMatches = 0;
  let partialMatches = 0;

  for (const ipc1 of itemIPC) {
    for (const ipc2 of targetIPC) {
      if (ipc1 === ipc2) {
        exactMatches++;
      } else if (ipc1.startsWith(ipc2.slice(0, 3)) || ipc2.startsWith(ipc1.slice(0, 3))) {
        partialMatches++;
      }
    }
  }

  const exactScore = exactMatches * 10;
  const partialScore = partialMatches * 5;

  return Math.min(exactScore + partialScore, 100);
}

// 연도 가중치 (최신일수록 높은 점수)
export function calculateYearScore(year: number, currentYear: number = new Date().getFullYear()): number {
  const age = currentYear - year;
  if (age <= 5) return 100;
  if (age <= 10) return 80;
  if (age <= 15) return 60;
  if (age <= 20) return 40;
  return 20;
}

// 종합 점수 계산
export interface ScoreWeights {
  keyword: number;
  ipc: number;
  year: number;
  similarity: number;
}

export function calculateOverallScore(
  item: {
    title: string;
    year: number;
    ipc: string[];
  },
  context: {
    keywords: string[];
    targetIPC: string[];
    referenceText: string;
  },
  weights: ScoreWeights = {
    keyword: 0.3,
    ipc: 0.3,
    year: 0.2,
    similarity: 0.2,
  }
): number {
  const keywordScore = calculateKeywordScore(item.title, context.keywords);
  const ipcScore = calculateIPCScore(item.ipc, context.targetIPC);
  const yearScore = calculateYearScore(item.year);
  const similarityScore = calculateSimilarity(item.title, context.referenceText) * 100;

  const overall =
    keywordScore * weights.keyword +
    ipcScore * weights.ipc +
    yearScore * weights.year +
    similarityScore * weights.similarity;

  return Math.round(overall);
}

