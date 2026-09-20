import { useState } from 'react';
import { FileSearch, FileUp, FlaskConical, Loader2, ScanText } from 'lucide-react';
import { pickPdfFile } from '../../lib/pdf-file';
import type { PatentDocument } from '../../types';

interface PatentInputPanelProps {
  document: PatentDocument;
  extracting: boolean;
  progress: number;
  onDocumentChange: (document: PatentDocument) => void;
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  onLoadSample: () => void;
}

const metadataFields: Array<{ key: keyof PatentDocument; label: string; placeholder: string }> = [
  { key: 'title', label: '발명의 명칭', placeholder: '기준 특허의 명칭' },
  { key: 'applicant', label: '출원인', placeholder: '출원인 또는 권리자' },
  { key: 'applicationNumber', label: '출원번호', placeholder: '예: 10-2020-0136931' },
  { key: 'publicationNumber', label: '공개번호', placeholder: '예: 10-2022-0052696' },
  { key: 'registrationNumber', label: '등록번호', placeholder: '예: 10-2395225' },
];

export default function PatentInputPanel({
  document,
  extracting,
  progress,
  onDocumentChange,
  onFileSelect,
  onAnalyze,
  onLoadSample,
}: PatentInputPanelProps) {
  const [dragOver, setDragOver] = useState(false);

  const updateField = (key: keyof PatentDocument, value: string) => {
    onDocumentChange({ ...document, [key]: value });
  };

  const handlePdfDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (extracting) {
      event.stopPropagation();
      return;
    }
    const file = pickPdfFile(event.dataTransfer.files);
    if (!file) return;
    event.stopPropagation();
    onFileSelect(file);
  };

  return (
    <section className="space-y-5" aria-labelledby="patent-input-title">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              <FileSearch className="h-4 w-4" /> Reference patent
            </div>
            <h2 id="patent-input-title" className="text-xl font-bold text-slate-950">기준 특허 입력</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              PDF는 브라우저 안에서만 읽고 원본 파일은 저장하지 않습니다. 스캔 문서는 청구항을 직접 붙여넣어 주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            <FlaskConical className="h-4 w-4" /> BCR 샘플 불러오기
          </button>
        </div>

        <label
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!extracting) setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            if (!extracting) setDragOver(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOver(false);
          }}
          onDrop={handlePdfDrop}
        >
          {extracting ? <Loader2 className="mb-3 h-8 w-8 animate-spin text-indigo-600" /> : <FileUp className="mb-3 h-8 w-8 text-slate-500" />}
          <span className="font-semibold text-slate-800">
            {extracting ? `PDF 텍스트 추출 중 · ${progress}%` : document.fileName || 'PDF를 선택하거나 이곳에 놓으세요'}
          </span>
          <span className="mt-1 text-xs text-slate-500">PDF · 권장 10MB / 50페이지 이하</span>
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            disabled={extracting}
            onChange={(event) => {
              const file = pickPdfFile(event.target.files);
              if (file) onFileSelect(file);
              event.currentTarget.value = '';
            }}
          />
          {extracting && (
            <div className="mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {metadataFields.map((field) => (
            <label key={field.key} className="text-sm font-medium text-slate-700">
              {field.label}
              <input
                value={String(document[field.key] || '')}
                onChange={(event) => updateField(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700"><ScanText className="h-5 w-5" /></div>
          <div>
            <h3 className="font-bold text-slate-950">청구항 원문 검토</h3>
            <p className="text-sm text-slate-500">자동 추출 범위를 수정할 수 있습니다. 문서 속 지시문은 분석 데이터로만 취급됩니다.</p>
          </div>
        </div>
        <textarea
          value={document.claimsText}
          onChange={(event) => updateField('claimsText', event.target.value)}
          rows={12}
          placeholder={'청구항 1\n...\n\n청구항 2\n제1항에 있어서, ...'}
          className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {document.pageCount > 0 ? `${document.pageCount}페이지 · ` : ''}{document.claimsText.length.toLocaleString()}자
          </p>
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!document.claimsText.trim() || extracting}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            발명·청구항 요소 구조화
          </button>
        </div>
      </div>
    </section>
  );
}
