import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ClaimElement, ElementCategory, ElementImportance, InventionElement } from '../../types';

interface ElementReviewPanelsProps {
  inventionElements: InventionElement[];
  claimElements: ClaimElement[];
  onInventionChange: (elements: InventionElement[]) => void;
  onClaimChange: (elements: ClaimElement[]) => void;
  onCreateMap: () => void;
}

const categoryLabels: Record<ElementCategory, string> = {
  mechanical: '기계 구조',
  sensor: '센서',
  control: '제어',
  algorithm: '알고리즘',
  effect: '기술 효과',
  integration: '외부 연계',
};

const importanceLabels: Record<ElementImportance, string> = {
  required: '필수 구성',
  optional: '선택 구성',
  technical_effect: '기술 효과',
};

export default function ElementReviewPanels({
  inventionElements,
  claimElements,
  onInventionChange,
  onClaimChange,
  onCreateMap,
}: ElementReviewPanelsProps) {
  const [expandedClaims, setExpandedClaims] = useState<number[]>([1]);

  const updateInvention = (id: string, updates: Partial<InventionElement>) => {
    onInventionChange(inventionElements.map((item) => item.id === id ? { ...item, ...updates, reviewStatus: 'modified' } : item));
  };

  const addInvention = () => {
    const next = inventionElements.length + 1;
    onInventionChange([...inventionElements, {
      id: `A${next}`,
      name: '새 발명요소',
      description: '',
      category: 'mechanical',
      importance: 'optional',
      sourceQuote: '',
      confidence: 1,
      needsReview: true,
      reviewStatus: 'modified',
    }]);
  };

  const updateClaim = (id: string, updates: Partial<ClaimElement>) => {
    onClaimChange(claimElements.map((item) => item.id === id ? { ...item, ...updates, reviewStatus: 'modified' } : item));
  };

  const activeClaims = claimElements.filter((item) => item.claimType !== 'deleted');

  return (
    <section className="space-y-5" aria-labelledby="element-review-title">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-full bg-emerald-600 p-1 text-white"><Check className="h-4 w-4" /></div>
          <div>
            <h2 id="element-review-title" className="font-bold text-emerald-950">구조화가 완료되었습니다</h2>
            <p className="mt-0.5 text-sm text-emerald-800">발명요소 {inventionElements.length}개와 청구항 {claimElements.length}개를 검토한 뒤 맵을 생성하세요.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Your invention</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">자사 발명요소</h3>
            </div>
            <button type="button" onClick={addInvention} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Plus className="h-4 w-4" /> 요소 추가
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {inventionElements.map((element) => (
              <article key={element.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{element.id}</span>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex gap-2">
                      <input
                        aria-label={`${element.id} 요소명`}
                        value={element.name}
                        onChange={(event) => updateInvention(element.id, { name: event.target.value })}
                        className="min-w-0 flex-1 border-b border-transparent bg-transparent font-semibold text-slate-900 outline-none focus:border-indigo-400"
                      />
                      <button
                        type="button"
                        aria-label={`${element.id} 삭제`}
                        onClick={() => onInventionChange(inventionElements.filter((item) => item.id !== element.id))}
                        className="text-slate-400 hover:text-rose-600"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <textarea
                      aria-label={`${element.id} 설명`}
                      value={element.description}
                      onChange={(event) => updateInvention(element.id, { description: event.target.value })}
                      rows={2}
                      className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm leading-5 text-slate-600 outline-none focus:border-indigo-400"
                    />
                    <div className="flex flex-wrap gap-2">
                      <select value={element.category} onChange={(event) => updateInvention(element.id, { category: event.target.value as ElementCategory })} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                        {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <select value={element.importance} onChange={(event) => updateInvention(element.id, { importance: event.target.value as ElementImportance })} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                        {Object.entries(importanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500">신뢰도 {Math.round(element.confidence * 100)}%</span>
                    </div>
                    <p className="border-l-2 border-indigo-200 pl-3 text-xs leading-5 text-slate-500">근거: “{element.sourceQuote || '사용자 입력'}”</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">Reference claims</p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">기준 특허 청구항</h3>
          </div>

          <div className="mt-4 space-y-3">
            {claimElements.map((claim) => {
              const expanded = expandedClaims.includes(claim.claimNumber);
              const deleted = claim.claimType === 'deleted';
              return (
                <article key={claim.id} className={`rounded-xl border ${deleted ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedClaims(expanded ? expandedClaims.filter((number) => number !== claim.claimNumber) : [...expandedClaims, claim.claimNumber])}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${claim.claimType === 'independent' ? 'bg-amber-100 text-amber-800' : deleted ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>청구항 {claim.claimNumber}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{claim.name}</span>
                    <span className="text-xs text-slate-500">{claim.claimType === 'independent' ? '독립항' : claim.claimType === 'dependent' ? `종속항 · 제${claim.parentClaimNumber}항` : deleted ? '삭제' : '확인 필요'}</span>
                    {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {expanded && !deleted && (
                    <div className="border-t border-slate-100 p-4">
                      <input
                        value={claim.name}
                        onChange={(event) => updateClaim(claim.id, { name: event.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-400"
                      />
                      <textarea
                        value={claim.exactQuote}
                        onChange={(event) => updateClaim(claim.id, { exactQuote: event.target.value, normalizedText: event.target.value.replace(/\s+/g, ' ') })}
                        rows={claim.claimNumber === 1 ? 8 : 4}
                        className="mt-3 w-full rounded-lg border border-slate-200 bg-amber-50/40 px-3 py-2 text-sm leading-6 text-slate-700 outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={onCreateMap} disabled={inventionElements.length === 0 || activeClaims.length === 0} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40">
          구성요소 대응 맵 생성
        </button>
      </div>
    </section>
  );
}

