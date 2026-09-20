import { Check, CircleAlert, ExternalLink, Quote, ShieldCheck, X } from 'lucide-react';
import type { ClaimElement, ClaimMapping, InventionElement, MatchLevel, RiskLevel } from '../../types';

interface ClaimMapTableProps {
  inventionElements: InventionElement[];
  claimElements: ClaimElement[];
  mappings: ClaimMapping[];
  selectedMappingId?: string;
  onMappingsChange: (mappings: ClaimMapping[]) => void;
  onSelectMapping: (id?: string) => void;
  onConfirmAll: () => void;
}

const matchLabels: Record<MatchLevel, string> = {
  identical: '동일',
  partial: '부분 일치',
  functional: '기능 유사',
  different: '차이 있음',
  unknown: '확인 불가',
};

const riskLabels: Record<RiskLevel, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
  hold: '판단 보류',
};

const riskClasses: Record<RiskLevel, string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-emerald-100 text-emerald-700',
  hold: 'bg-slate-100 text-slate-600',
};

export default function ClaimMapTable({
  inventionElements,
  claimElements,
  mappings,
  selectedMappingId,
  onMappingsChange,
  onSelectMapping,
  onConfirmAll,
}: ClaimMapTableProps) {
  const updateMapping = (id: string, updates: Partial<ClaimMapping>) => {
    onMappingsChange(mappings.map((mapping) => mapping.id === id ? { ...mapping, ...updates, reviewStatus: 'modified' } : mapping));
  };
  const selected = mappings.find((mapping) => mapping.id === selectedMappingId);
  const reviewedCount = mappings.filter((mapping) => mapping.reviewStatus !== 'ai').length;

  return (
    <section className="space-y-5" aria-labelledby="claim-map-title">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-950 to-slate-900 p-5 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200"><ShieldCheck className="h-4 w-4" /> Evidence-linked map</div>
            <h2 id="claim-map-title" className="text-xl font-bold">청구항 구성요소 맵</h2>
            <p className="mt-1 text-sm text-slate-300">일치 수준은 관련성 검토를 돕는 지표이며 침해 또는 등록 가능성 판단이 아닙니다.</p>
          </div>
          <div className="shrink-0 rounded-xl bg-white/10 px-4 py-3 text-right">
            <div className="text-2xl font-bold">{reviewedCount}/{mappings.length}</div>
            <div className="text-xs text-slate-300">사용자 검토</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3.5">자사 발명요소</th>
                <th scope="col" className="px-4 py-3.5">대응 청구항</th>
                <th scope="col" className="px-4 py-3.5">일치 수준</th>
                <th scope="col" className="px-4 py-3.5">검토 우선도</th>
                <th scope="col" className="px-4 py-3.5">분석 근거</th>
                <th scope="col" className="px-4 py-3.5">검토</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappings.map((mapping) => {
                const invention = inventionElements.find((item) => item.id === mapping.inventionElementId);
                return (
                  <tr key={mapping.id} className="align-top hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="flex gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">{invention?.id}</span>
                        <span className="font-semibold text-slate-900">{invention?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[210px] flex-wrap gap-1.5">
                        {mapping.claimElementIds.length > 0 ? mapping.claimElementIds.map((id) => {
                          const claim = claimElements.find((item) => item.id === id);
                          return <span key={id} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">청구항 {claim?.claimNumber}</span>;
                        }) : <span className="inline-flex items-center gap-1 text-xs text-slate-500"><CircleAlert className="h-3.5 w-3.5" /> 근거 청구항 없음</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select value={mapping.matchLevel} onChange={(event) => updateMapping(mapping.id, { matchLevel: event.target.value as MatchLevel })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700">
                        {Object.entries(matchLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select value={mapping.riskLevel} onChange={(event) => updateMapping(mapping.id, { riskLevel: event.target.value as RiskLevel })} className={`rounded-lg border-0 px-2.5 py-2 text-xs font-bold ${riskClasses[mapping.riskLevel]}`}>
                        {Object.entries(riskLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                    <td className="max-w-[330px] px-4 py-4">
                      <p className="line-clamp-3 leading-5 text-slate-600">{mapping.rationale}</p>
                      <button type="button" onClick={() => onSelectMapping(mapping.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        <Quote className="h-3.5 w-3.5" /> 원문 근거 보기
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => updateMapping(mapping.id, { reviewStatus: mapping.reviewStatus === 'confirmed' ? 'ai' : 'confirmed', needsReview: mapping.reviewStatus === 'confirmed' })}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${mapping.reviewStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                      >
                        <Check className="h-3.5 w-3.5" /> {mapping.reviewStatus === 'confirmed' ? '확인됨' : '확인'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">매핑 결과를 검토했나요?</p>
          <p className="mt-1 text-sm text-slate-500">확정 후 구성요소별 다국어 키워드와 정밀 검색식을 생성합니다.</p>
        </div>
        <button type="button" onClick={onConfirmAll} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">전체 확인 및 비교 반영</button>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-label="청구항 원문 근거">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="닫기" onClick={() => onSelectMapping(undefined)} />
          <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Evidence</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">원문 근거</h3>
              </div>
              <button type="button" onClick={() => onSelectMapping(undefined)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">분석 의견</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selected.rationale}</p>
            </div>
            <div className="mt-5 space-y-4">
              {selected.evidenceQuotes.length > 0 ? selected.evidenceQuotes.map((evidence, index) => (
                <blockquote key={`${evidence.claimNumber}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">청구항 {evidence.claimNumber}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <p className="text-sm leading-7 text-slate-700">“{evidence.quote}”</p>
                </blockquote>
              )) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <CircleAlert className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-2 font-semibold text-slate-700">직접 대응하는 청구항 근거가 없습니다</p>
                  <p className="mt-1 text-sm text-slate-500">이 매핑은 차이 있음 또는 확인 불가로만 확정할 수 있습니다.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
