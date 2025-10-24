// GPT API 래퍼 - 런타임 키 사용, 스트리밍 지원

export interface GPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GPTStreamOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export class GPTClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async complete(
    messages: GPTMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async stream(
    messages: GPTMessage[],
    callbacks: GPTStreamOptions
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      callbacks.onError?.(new Error(error.error?.message || `API request failed: ${response.status}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError?.(new Error('No response body'));
      return;
    }

    const decoder = new TextDecoder();
    let fullText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices[0]?.delta?.content || '';
              if (token) {
                fullText += token;
                callbacks.onToken?.(token);
              }
            } catch (e) {
              // Ignore parsing errors for individual chunks
            }
          }
        }
      }

      callbacks.onComplete?.(fullText);
    } catch (error) {
      callbacks.onError?.(error instanceof Error ? error : new Error('Stream error'));
    }
  }
}

// 프롬프트 템플릿
export const PROMPTS = {
  generateKeywords: (inventionSummary: string) => `
당신은 특허 검색 전문가입니다. 아래 발명 요약을 분석하여 선행특허 조사에 필요한 키워드와 분류 코드를 추출해주세요.

발명 요약:
${inventionSummary}

다음 형식의 JSON으로 응답해주세요:
{
  "korean": ["키워드1", "키워드2", ...], // 최대 20개
  "english": ["keyword1", "keyword2", ...], // 최대 20개
  "japanese": ["キーワード1", "キーワード2", ...], // 최대 20개
  "ipc": ["G06F", "H04L", ...], // IPC 코드 최대 10개
  "cpc": ["G06F16/00", "H04L29/00", ...] // CPC 코드 최대 10개
}

키워드는 핵심 기술, 구성요소, 용도, 효과를 포함하고, 동의어와 상위/하위 개념도 고려해주세요.
`,

  rankPriorArt: (candidates: string, inventionContext: string) => `
당신은 특허 심사관입니다. 아래 선행특허 후보들을 분석하여 관련성이 높은 순으로 순위를 매기고, 각각에 점수와 근거를 제시해주세요.

발명 컨텍스트:
${inventionContext}

선행특허 후보:
${candidates}

다음 기준으로 평가해주세요:
1. 기술적 유사성 (핵심 구성요소 일치도)
2. IPC/CPC 분류 적합도
3. 청구항 범위 중복도
4. 인용 횟수 및 중요도

JSON 배열로 응답해주세요:
[
  {
    "id": "특허번호",
    "score": 85,
    "reason": "평가 근거 (핵심 구성요소 3개 일치, IPC 동일, 청구항 1 중복 가능성)",
    "matchedKeywords": ["키워드1", "키워드2"],
    "riskLevel": "high" | "medium" | "low"
  },
  ...
]
`,

  generateSummary: (selectedPatents: string) => `
당신은 특허 분석가입니다. 선정된 선행특허들을 분석하여 종합 요약 리포트를 작성해주세요.

선정된 선행특허:
${selectedPatents}

다음 구조로 Markdown 형식의 리포트를 작성해주세요:

# 선행특허 조사 요약 리포트

## 1. 핵심 선행특허 목록
(각 특허의 번호, 제목, 출원인, 핵심 청구항 3줄 요약)

## 2. 기술 분야 분석
(IPC/CPC 분포, 주요 출원인, 연도별 트렌드)

## 3. 차별성 분석
(신규 발명과의 차별 포인트 5개, 각각에 대해 선행특허와 비교)

## 4. FTO 체크리스트
- [ ] 권리 범위 저촉 가능성: 상/중/하
- [ ] 회피 설계 필요성: 필수/권장/불필요
- [ ] 추가 조사 필요 영역
- [ ] 라이센스 협의 대상

## 5. 권장사항
(특허 출원 전략, 추가 조사 방향, 리스크 완화 방안)
`,
};

// 에러 핸들링 및 재시도 로직
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Rate limit 에러인 경우 백오프
      if (lastError.message.includes('429') || lastError.message.includes('rate')) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      throw lastError;
    }
  }

  throw lastError!;
}

