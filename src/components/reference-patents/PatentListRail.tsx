import { CheckCircle2, CircleAlert, FilePlus2, FileText, FlaskConical, Keyboard, Loader2, Trash2 } from 'lucide-react';
import type { ReferencePatentAnalysis } from '../../types';

interface PatentListRailProps {
  patents: ReferencePatentAnalysis[];
  activePatentId?: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onAddText: () => void;
  onAddSample: () => void;
  onDelete: (id: string) => void;
}

const statusMeta = {
  idle: { label: '입력 대기', icon: FileText, className: 'text-slate-500' },
  extracting: { label: '추출 중', icon: Loader2, className: 'text-blue-600' },
  review_required: { label: '검토 필요', icon: CircleAlert, className: 'text-amber-700' },
  mapping: { label: '맵 검토', icon: CircleAlert, className: 'text-indigo-600' },
  completed: { label: '확정 완료', icon: CheckCircle2, className: 'text-emerald-700' },
  failed: { label: '처리 실패', icon: CircleAlert, className: 'text-rose-600' },
};

export default function PatentListRail({ patents, activePatentId, onSelect, onAdd, onAddText, onAddSample, onDelete }: PatentListRailProps) {
  const atLimit = patents.length >= 5;
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="예시 특허 목록">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Reference patents</p>
          <h2 className="mt-1 font-bold text-slate-950">예시 특허 {patents.length}/5</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onAddSample} disabled={atLimit} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-40">
            <FlaskConical className="h-4 w-4" /> BCR 샘플 추가
          </button>
          <button type="button" onClick={onAddText} disabled={atLimit} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
            <Keyboard className="h-4 w-4" /> 텍스트 직접 입력
          </button>
          <button type="button" onClick={onAdd} disabled={atLimit} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">
            <FilePlus2 className="h-4 w-4" /> PDF 예시 특허 추가
          </button>
        </div>
      </div>

      {patents.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <FileText className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">비교할 예시 특허를 추가하세요</p>
          <p className="mt-1 text-xs text-slate-500">PDF 또는 청구항 텍스트 · 최대 5건</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {patents.map((patent, index) => {
            const meta = statusMeta[patent.status];
            const StatusIcon = meta.icon;
            const active = patent.id === activePatentId;
            return (
              <div key={patent.id} className={`group relative rounded-xl border p-3 transition ${active ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}>
                <button type="button" onClick={() => onSelect(patent.id)} className="w-full text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">특허 {index + 1}</span>
                    {patent.relevance?.score !== undefined && <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-indigo-700 shadow-sm">{patent.relevance.score}점</span>}
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">{patent.document.title || patent.document.fileName || '새 예시 특허'}</p>
                  <span className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${meta.className}`}><StatusIcon className={`h-3.5 w-3.5 ${patent.status === 'extracting' ? 'animate-spin' : ''}`} />{meta.label}</span>
                </button>
                <button type="button" onClick={() => onDelete(patent.id)} aria-label={`${patent.document.title || '예시 특허'} 삭제`} className="absolute bottom-2 right-2 rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
