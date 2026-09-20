import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Download, FileJson, FileText, MessageCircleHeart, Printer, RefreshCw, Save, ShieldAlert } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import { useAppStore } from '../stores/useAppStore';
import { downloadFile } from '../lib/export';
import { buildResearchReport, createReportSourceHash, researchReportToMarkdown } from '../lib/research-report';

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

export default function Step5() {
  const navigate = useNavigate();
  const { inventionInfo, claimMap, updateClaimMap, setCurrentStep } = useAppStore();
  const analyzable = useMemo(
    () => claimMap.referencePatents.filter((patent) => patent.mappings.length > 0),
    [claimMap.referencePatents],
  );
  const [includedIds, setIncludedIds] = useState<string[]>(() =>
    analyzable.filter((patent) => patent.status === 'completed').map((patent) => patent.id),
  );
  const [satisfaction, setSatisfaction] = useState(() => Number(localStorage.getItem('research-report-satisfaction') || 0));

  useEffect(() => {
    setCurrentStep('report');
  }, [setCurrentStep]);

  useEffect(() => {
    if (includedIds.length === 0 && analyzable.length > 0) {
      setIncludedIds(analyzable.map((patent) => patent.id));
    }
  }, [analyzable, includedIds.length]);

  const report = useMemo(
    () => buildResearchReport(inventionInfo, claimMap, includedIds),
    [claimMap, includedIds, inventionInfo],
  );
  const sourceHash = createReportSourceHash(claimMap, includedIds);
  const latestSnapshot = claimMap.reportSnapshots.at(-1);
  const reportNeedsRefresh = Boolean(latestSnapshot && latestSnapshot.sourceVersionHash !== sourceHash);

  const togglePatent = (id: string) => {
    setIncludedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const saveSnapshot = () => {
    if (includedIds.length === 0) return;
    updateClaimMap({
      reportSnapshots: [
        ...claimMap.reportSnapshots,
        {
          id: `report-${crypto.randomUUID()}`,
          createdAt: new Date().toISOString(),
          includedPatentIds: includedIds,
          sourceVersionHash: sourceHash,
        },
      ],
    });
  };

  const exportMarkdown = () => {
    saveSnapshot();
    downloadFile(researchReportToMarkdown(report), 'prior-art-research-summary.md', 'text/markdown;charset=utf-8');
  };

  const exportJson = () => {
    saveSnapshot();
    downloadFile(JSON.stringify(report, null, 2), 'prior-art-research-summary.json', 'application/json;charset=utf-8');
  };

  const commonCount = new Set(report.patents.flatMap((patent) => patent.relevance?.commonElementIds || [])).size;
  const distinctiveCount = new Set(report.patents.flatMap((patent) => patent.relevance?.distinctiveElementIds || [])).size;

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <StepHeader
        step="report"
        title="선행특허 리서치 요약 리포트"
        description="사용자가 제공한 예시 특허의 청구항 비교 결과를 근거 중심으로 정리합니다"
        canGoBack
        canGoNext={false}
      />

      <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 print:overflow-visible print:p-0">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <p className="font-bold text-amber-950">조사 방식: 사용자 제공 문서 비교</p>
                <p className="mt-1 text-sm text-amber-800">외부 특허 데이터베이스 검색은 포함되지 않았습니다. 관련성 점수는 법률적 위험도가 아닙니다.</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-800">범위 제한 리포트</span>
          </div>

          {analyzable.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">리포트에 포함할 분석 결과가 없습니다</h2>
              <p className="mt-2 text-sm text-slate-600">청구항 맵에서 예시 특허 1건 이상의 매핑을 생성하고 확정해 주세요.</p>
              <button type="button" onClick={() => navigate('/claim-map')} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">청구항 맵으로 이동</button>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Report scope</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">포함할 예시 특허 선택</h2>
                    <p className="mt-1 text-sm text-slate-500">미확정 분석도 포함할 수 있지만 리포트에는 ‘초안’으로 표시됩니다.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={saveSnapshot} disabled={includedIds.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"><Save className="h-4 w-4" /> 스냅샷 저장</button>
                    <button type="button" onClick={exportMarkdown} disabled={includedIds.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"><Download className="h-4 w-4" /> Markdown</button>
                    <button type="button" onClick={exportJson} disabled={includedIds.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700"><FileJson className="h-4 w-4" /> JSON</button>
                    <button type="button" onClick={() => window.print()} disabled={includedIds.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"><Printer className="h-4 w-4" /> 인쇄</button>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {analyzable.map((patent) => (
                    <label key={patent.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${includedIds.includes(patent.id) ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
                      <input type="checkbox" checked={includedIds.includes(patent.id)} onChange={() => togglePatent(patent.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600" />
                      <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-900">{patent.document.title || '제목 미입력 특허'}</span><span className="mt-1 block text-xs text-slate-500">{patent.status === 'completed' ? '사용자 확정' : '초안'} · {patent.relevance?.score ?? '–'}점</span></span>
                    </label>
                  ))}
                </div>
                {reportNeedsRefresh && <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800"><RefreshCw className="h-4 w-4" />저장된 스냅샷 이후 분석 데이터가 변경되었습니다.</div>}
              </section>

              {includedIds.length > 0 && (
                <article className="space-y-6 print:space-y-4">
                  <header className="overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm print:rounded-none">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Prior art research summary</p>
                    <h1 className="mt-2 text-2xl font-bold">{inventionInfo?.title || '조사 대상 발명'}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{inventionInfo?.purpose || inventionInfo?.summary}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-bold">{report.patents.length}</div><div className="text-xs text-slate-300">비교 특허</div></div>
                      <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-bold">{claimMap.inventionElements.length}</div><div className="text-xs text-slate-300">발명요소</div></div>
                      <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-bold">{commonCount}</div><div className="text-xs text-slate-300">공통 요소</div></div>
                      <div className="rounded-xl bg-white/10 p-3"><div className="text-2xl font-bold">{distinctiveCount}</div><div className="text-xs text-slate-300">차별 요소</div></div>
                    </div>
                  </header>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" /><h2 className="text-lg font-bold text-slate-950">특허별 관련성 요약</h2></div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {report.patents.map((patent) => (
                        <div key={patent.id} className="rounded-xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3"><h3 className="line-clamp-2 font-bold text-slate-900">{patent.document.title || '제목 미입력 특허'}</h3>{patent.status === 'completed' ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />}</div>
                          <p className="mt-1 text-xs text-slate-500">{patent.document.applicationNumber || patent.document.fileName}</p>
                          <div className="mt-4 flex items-end justify-between"><div><span className="text-3xl font-bold text-indigo-700">{patent.relevance?.score ?? '–'}</span><span className="text-xs text-slate-500"> / 100</span></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">{gradeLabel[patent.relevance?.grade || 'review_required']}</span></div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${patent.relevance?.score || 0}%` }} /></div>
                          {patent.relevance && (
                            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                              <div className="flex justify-between gap-2"><dt>필수 요소</dt><dd className="font-bold">{patent.relevance.factorScores.requiredCoverage}/40</dd></div>
                              <div className="flex justify-between gap-2"><dt>기능 원리</dt><dd className="font-bold">{patent.relevance.factorScores.functionalSimilarity}/25</dd></div>
                              <div className="flex justify-between gap-2"><dt>독립항</dt><dd className="font-bold">{patent.relevance.factorScores.independentClaimEvidence}/20</dd></div>
                              <div className="flex justify-between gap-2"><dt>근거 품질</dt><dd className="font-bold">{patent.relevance.factorScores.evidenceQuality}/10</dd></div>
                              <div className="col-span-2 flex justify-between gap-2"><dt>검토 완결성</dt><dd className="font-bold">{patent.relevance.factorScores.completeness}/5</dd></div>
                            </dl>
                          )}
                          <p className="mt-3 text-xs text-slate-500">{patent.status === 'completed' ? `사용자 확정 · ${patent.confirmedAt ? new Date(patent.confirmedAt).toLocaleDateString('ko-KR') : ''}` : '초안 · 사용자 검토 필요'}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-bold text-slate-950">발명요소 × 특허 비교</h2><p className="mt-1 text-sm text-slate-500">직접 근거가 있는 판단에는 청구항 번호를 함께 표시합니다.</p></div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">발명요소</th>{report.patents.map((patent) => <th key={patent.id} className="max-w-56 px-4 py-3"><span className="line-clamp-2">{patent.document.title}</span></th>)}</tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {claimMap.inventionElements.map((element) => (
                            <tr key={element.id}><th className="px-4 py-4"><span className="mr-2 text-indigo-600">{element.id}</span>{element.name}</th>{report.patents.map((patent) => { const mapping = patent.mappings.find((item) => item.inventionElementId === element.id); return <td key={patent.id} className="px-4 py-4"><span className="font-semibold text-slate-800">{mapping ? matchLabel[mapping.matchLevel] : '미분석'}</span>{mapping && mapping.evidenceQuotes.length > 0 && <span className="mt-1 block text-xs text-indigo-600">청구항 {mapping.evidenceQuotes.map((item) => item.claimNumber).join(', ')}</span>}</td>; })}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {report.patents.map((patent) => (
                    <section key={patent.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:break-before-page">
                      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Patent claim chart</p><h2 className="mt-1 text-lg font-bold text-slate-950">{patent.document.title}</h2><p className="mt-1 text-xs text-slate-500">{patent.document.applicant} · {patent.document.applicationNumber}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">관련성 {patent.relevance?.score ?? '–'}점</span></div>
                      <div className="mt-4 space-y-3">{patent.mappings.map((mapping) => { const element = claimMap.inventionElements.find((item) => item.id === mapping.inventionElementId); return <div key={mapping.id} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-indigo-700">{element?.id}</span><span className="font-semibold text-slate-900">{element?.name}</span><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">{matchLabel[mapping.matchLevel]}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{mapping.rationale}</p>{mapping.evidenceQuotes.map((evidence, index) => <blockquote key={`${evidence.claimNumber}-${index}`} className="mt-3 border-l-2 border-indigo-300 pl-3 text-xs leading-5 text-slate-600"><strong>청구항 {evidence.claimNumber}</strong> · “{evidence.quote}”</blockquote>)}</div>; })}</div>
                    </section>
                  ))}

                  {claimMap.searchStrategies.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-950">추가 조사 개념</h2>
                      <p className="mt-1 text-sm text-slate-500">차별 요소와 판단 보류 항목을 외부 데이터베이스에서 별도로 확인할 때 사용할 출발점입니다.</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {claimMap.searchStrategies.map((strategy) => {
                          const element = claimMap.inventionElements.find((item) => item.id === strategy.inventionElementId);
                          return (
                            <div key={strategy.inventionElementId} className="rounded-xl bg-slate-50 p-4">
                              <p className="text-sm font-bold text-slate-900"><span className="mr-2 text-indigo-600">{element?.id}</span>{element?.name}</p>
                              <div className="mt-2 flex flex-wrap gap-1.5">{[...strategy.korean, ...strategy.english, ...strategy.ipcCandidates].map((term) => <span key={term} className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 shadow-sm">{term}</span>)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 print:hidden">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <MessageCircleHeart className="mt-0.5 h-6 w-6 text-indigo-600" />
                        <div><h2 className="font-bold text-indigo-950">새 리서치 흐름은 만족스러웠나요?</h2><p className="mt-1 text-sm text-indigo-700">평가는 이 브라우저에만 저장되며 외부로 전송되지 않습니다.</p></div>
                      </div>
                      <div className="flex gap-2" aria-label="이용 만족도">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <button key={score} type="button" aria-label={`${score}점`} onClick={() => { setSatisfaction(score); localStorage.setItem('research-report-satisfaction', String(score)); }} className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition ${satisfaction === score ? 'bg-indigo-600 text-white' : 'border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100'}`}>{score}</button>
                        ))}
                      </div>
                    </div>
                    {satisfaction > 0 && <p className="mt-3 text-xs font-semibold text-indigo-700">{satisfaction}점으로 저장했습니다. 감사합니다.</p>}
                  </section>

                  <footer className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
                    <h2 className="font-bold text-slate-950">조사 한계와 전문가 확인사항</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5"><li>사용자가 제공한 문서만 비교했으며 외부 특허 데이터베이스 검색을 수행하지 않았습니다.</li><li>관련성은 조사 우선순위이며 신규성·진보성·침해 또는 등록 가능성을 확정하지 않습니다.</li><li>최종 판단 전 특허 원문, 심사 이력, 법적 상태를 특허 전문가와 확인해야 합니다.</li></ul>
                  </footer>
                </article>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
