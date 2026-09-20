import { AlertTriangle, CheckCircle2, FileText, Scale } from 'lucide-react';
import type { InventionElement, ReferencePatentAnalysis, RelevanceGrade } from '../../types';

interface MultiPatentComparisonProps {
  inventionElements: InventionElement[];
  patents: ReferencePatentAnalysis[];
  onSelectPatent: (id: string) => void;
}

const gradeLabels: Record<RelevanceGrade, string> = {
  very_high: '매우 높음',
  high: '높음',
  medium: '중간',
  low: '낮음',
  review_required: '검토 필요',
};

const matchLabel = {
  identical: '동일',
  partial: '부분',
  functional: '기능 유사',
  different: '미공개',
  unknown: '확인 필요',
};

const matchClass = {
  identical: 'bg-rose-100 text-rose-700',
  partial: 'bg-amber-100 text-amber-800',
  functional: 'bg-blue-100 text-blue-700',
  different: 'bg-emerald-100 text-emerald-700',
  unknown: 'bg-slate-100 text-slate-600',
};

export default function MultiPatentComparison({ inventionElements, patents, onSelectPatent }: MultiPatentComparisonProps) {
  const analyzed = patents.filter((patent) => patent.mappings.length > 0);
  return (
    <section className="space-y-5" aria-labelledby="comparison-title">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-950 to-slate-900 p-5 text-white">
        <div className="flex items-start gap-3">
          <Scale className="mt-0.5 h-6 w-6 text-indigo-300" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Cross-patent comparison</p>
            <h2 id="comparison-title" className="mt-1 text-xl font-bold">예시 특허 관련성 비교</h2>
            <p className="mt-1 text-sm text-slate-300">관련성은 조사 우선순위이며 침해·등록 가능성에 대한 법률적 위험도가 아닙니다.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {patents.map((patent) => (
          <button key={patent.id} type="button" onClick={() => onSelectPatent(patent.id)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <FileText className="h-5 w-5 shrink-0 text-indigo-600" />
              {patent.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
            </div>
            <h3 className="mt-3 line-clamp-2 min-h-12 font-bold text-slate-950">{patent.document.title || '제목 미입력 특허'}</h3>
            <p className="mt-1 text-xs text-slate-500">{patent.document.applicationNumber || patent.document.fileName || '서지정보 확인 필요'}</p>
            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
              <div><span className="text-3xl font-bold text-indigo-700">{patent.relevance?.score ?? '–'}</span><span className="ml-1 text-xs text-slate-500">/ 100</span></div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{gradeLabels[patent.relevance?.grade || 'review_required']}</span>
            </div>
          </button>
        ))}
      </div>

      {analyzed.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">자사 발명요소</th>
                  {analyzed.map((patent) => <th key={patent.id} className="max-w-52 px-4 py-3.5"><span className="line-clamp-2">{patent.document.title || '예시 특허'}</span></th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventionElements.map((element) => (
                  <tr key={element.id}>
                    <th className="px-4 py-4 font-semibold text-slate-900"><span className="mr-2 text-indigo-600">{element.id}</span>{element.name}</th>
                    {analyzed.map((patent) => {
                      const mapping = patent.mappings.find((item) => item.inventionElementId === element.id);
                      return (
                        <td key={patent.id} className="px-4 py-4">
                          {mapping ? <span className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${matchClass[mapping.matchLevel]}`}>{matchLabel[mapping.matchLevel]}{mapping.evidenceQuotes.length > 0 ? ` · 청구항 ${mapping.evidenceQuotes[0].claimNumber}` : ''}</span> : <span className="text-xs text-slate-400">미분석</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

