import { CheckCircle2, Copy, Database, Languages, SearchCheck } from 'lucide-react';
import { useState } from 'react';
import type { ElementSearchStrategy, InventionElement, Keywords } from '../../types';

interface SearchStrategyPanelProps {
  inventionElements: InventionElement[];
  strategies: ElementSearchStrategy[];
  keywords: Keywords | null;
  confirmedAt?: string;
}

export default function SearchStrategyPanel({ inventionElements, strategies, keywords, confirmedAt }: SearchStrategyPanelProps) {
  const [copied, setCopied] = useState('');
  const copyQuery = async (key: string, query: string) => {
    await navigator.clipboard.writeText(query);
    setCopied(key);
    window.setTimeout(() => setCopied(''), 1600);
  };

  return (
    <section className="space-y-5" aria-labelledby="strategy-title">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
          <div>
            <h2 id="strategy-title" className="text-xl font-bold text-emerald-950">검색전략이 준비되었습니다</h2>
            <p className="mt-1 text-sm text-emerald-800">확정된 구성요소의 키워드와 IPC가 기존 검색 데이터에 병합되었습니다.</p>
            {confirmedAt && <p className="mt-2 text-xs text-emerald-700">사용자 확정 · {new Date(confirmedAt).toLocaleString('ko-KR')}</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {strategies.map((strategy) => {
            const element = inventionElements.find((item) => item.id === strategy.inventionElementId);
            return (
              <article key={strategy.inventionElementId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{element?.id}</span>
                  <h3 className="font-bold text-slate-950">{element?.name}</h3>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    ['한국어', strategy.korean],
                    ['English', strategy.english],
                    ['日本語', strategy.japanese],
                  ].map(([label, terms]) => (
                    <div key={label as string} className="rounded-xl bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-bold text-slate-500">{label as string}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(terms as string[]).map((term) => <span key={term} className="rounded-md bg-white px-2 py-1 text-xs text-slate-700 shadow-sm">{term}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {strategy.queries.map((query, index) => {
                    const key = `${strategy.inventionElementId}-${index}`;
                    return (
                      <div key={key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                        <Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-500">{query.database} · {query.level}</p>
                          <code className="mt-1 block break-all text-xs leading-5 text-slate-700">{query.query}</code>
                        </div>
                        <button type="button" onClick={() => copyQuery(key, query.query)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="검색식 복사"><Copy className="h-4 w-4" /></button>
                        {copied === key && <span className="text-xs font-semibold text-emerald-600">복사됨</span>}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <Languages className="h-6 w-6 text-indigo-300" />
            <h3 className="mt-3 font-bold">통합 키워드</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><dt className="text-slate-400">한국어</dt><dd className="font-bold">{keywords?.korean.length || 0}개</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-400">영어</dt><dd className="font-bold">{keywords?.english.length || 0}개</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-400">일본어</dt><dd className="font-bold">{keywords?.japanese.length || 0}개</dd></div>
              <div className="flex items-center justify-between"><dt className="text-slate-400">IPC</dt><dd className="font-bold">{keywords?.ipc.length || 0}개</dd></div>
            </dl>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <SearchCheck className="h-6 w-6 text-blue-600" />
            <h3 className="mt-3 font-bold text-blue-950">다음 단계</h3>
            <p className="mt-2 text-sm leading-6 text-blue-800">상단의 ‘다음’ 버튼을 누르면 이 키워드로 KIPRIS와 Google Patents 검색 링크를 생성합니다.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

