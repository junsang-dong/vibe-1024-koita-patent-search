import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, FileInput, GitCompareArrows, LayoutGrid, ListChecks } from 'lucide-react';
import StepHeader from '../components/StepHeader';
import PatentInputPanel from '../components/claim-map/PatentInputPanel';
import ElementReviewPanels from '../components/claim-map/ElementReviewPanels';
import ClaimMapTable from '../components/claim-map/ClaimMapTable';
import MultiPatentComparison from '../components/claim-map/MultiPatentComparison';
import PatentListRail from '../components/reference-patents/PatentListRail';
import { useAppStore } from '../stores/useAppStore';
import {
  BCR_SAMPLE_CLAIMS,
  BCR_SAMPLE_DOCUMENT,
  BCR_SAMPLE_INVENTION,
  calculateRelevance,
  createClaimMappings,
  createReferencePatent,
  createSearchStrategies,
  extractKiprisPatentMetadata,
  extractInventionElements,
  findClaimsText,
  mergeStrategiesIntoKeywords,
  parseClaimElements,
} from '../lib/claim-map';
import { deletePatentSource, hashFile, savePatentSource } from '../lib/indexed-db';
import { pickPdfFile } from '../lib/pdf-file';
import type { ClaimElement, ClaimMapping, InventionElement, PatentDocument, ReferencePatentAnalysis } from '../types';

type WorkspaceSection = 'input' | 'elements' | 'mapping' | 'comparison';

const sectionItems: Array<{ id: WorkspaceSection; label: string; icon: typeof FileInput }> = [
  { id: 'input', label: '문서 입력', icon: FileInput },
  { id: 'elements', label: '요소 검토', icon: ListChecks },
  { id: 'mapping', label: '청구항 맵', icon: GitCompareArrows },
  { id: 'comparison', label: '관련성 비교', icon: LayoutGrid },
];

export default function Step2() {
  const navigate = useNavigate();
  const {
    inventionInfo,
    setInventionInfo,
    keywords,
    setKeywords,
    claimMap,
    updateClaimMap,
    setCurrentStep,
  } = useAppStore();
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('input');
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState('');
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const extractingRef = useRef(false);
  extractingRef.current = extracting;

  useEffect(() => {
    setCurrentStep('claim-map');
  }, [setCurrentStep]);

  useEffect(() => {
    const preventWindowNavigation = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    const handleWindowDrop = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes('Files')) return;
      event.preventDefault();
      if (extractingRef.current) return;
      const file = pickPdfFile(event.dataTransfer.files);
      if (!file) {
        setNotice('PDF 파일만 첨부할 수 있습니다.');
        return;
      }
      if (useAppStore.getState().claimMap.referencePatents.length >= 5) {
        setNotice('예시 특허는 최대 5건까지 추가할 수 있습니다.');
        return;
      }
      void handleDirectFileAdd(file);
    };
    window.addEventListener('dragover', preventWindowNavigation);
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragover', preventWindowNavigation);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const activePatent = useMemo(
    () => claimMap.referencePatents.find((patent) => patent.id === claimMap.activePatentId),
    [claimMap.activePatentId, claimMap.referencePatents],
  );
  const completedPatents = claimMap.referencePatents.filter((patent) => patent.status === 'completed');
  const anyAnalyzed = claimMap.referencePatents.some((patent) => patent.mappings.length > 0);
  const availableSections = {
    input: Boolean(activePatent),
    elements: Boolean(activePatent && claimMap.inventionElements.length > 0 && activePatent.claimElements.length > 0),
    mapping: Boolean(activePatent && activePatent.mappings.length > 0),
    comparison: anyAnalyzed,
  };

  const updatePatent = (id: string, updater: (patent: ReferencePatentAnalysis) => ReferencePatentAnalysis) => {
    useAppStore.setState((state) => ({
      claimMap: {
        ...state.claimMap,
        referencePatents: state.claimMap.referencePatents.map((patent) => patent.id === id ? updater(patent) : patent),
      },
    }));
  };

  const updateActivePatent = (updates: Partial<ReferencePatentAnalysis>) => {
    if (!activePatent) return;
    updatePatent(activePatent.id, (patent) => ({ ...patent, ...updates, updatedAt: new Date().toISOString() }));
  };

  const handleAddTextPatent = () => {
    if (claimMap.referencePatents.length >= 5) return;
    const patent = createReferencePatent();
    updateClaimMap({
      referencePatents: [...claimMap.referencePatents, patent],
      activePatentId: patent.id,
      selectedMappingId: undefined,
    });
    setActiveSection('input');
    setNotice('새 예시 특허 작업공간을 만들었습니다. PDF 또는 청구항 텍스트를 입력해 주세요.');
  };

  const handleAddPatent = () => {
    if (claimMap.referencePatents.length >= 5) {
      setNotice('예시 특허는 최대 5건까지 추가할 수 있습니다.');
      return;
    }
    directFileInputRef.current?.click();
  };

  const handleLoadSample = () => {
    const existing = claimMap.referencePatents.find((patent) => patent.document.applicationNumber === BCR_SAMPLE_DOCUMENT.applicationNumber);
    if (existing) {
      updateClaimMap({ activePatentId: existing.id });
      setActiveSection(existing.mappings.length > 0 ? 'mapping' : 'elements');
      setNotice('이미 추가된 BCR 샘플 특허로 이동했습니다.');
      return;
    }
    if (claimMap.referencePatents.length >= 5) {
      setNotice('예시 특허는 최대 5건까지 추가할 수 있습니다.');
      return;
    }
    const inventionElements = claimMap.inventionElements.length > 0
      ? claimMap.inventionElements
      : extractInventionElements(BCR_SAMPLE_INVENTION);
    const claimElements = parseClaimElements(BCR_SAMPLE_CLAIMS);
    const patent = createReferencePatent({ ...BCR_SAMPLE_DOCUMENT, extractedText: '' });
    patent.claimElements = claimElements;
    patent.mappings = createClaimMappings(inventionElements, claimElements);
    patent.status = 'mapping';
    if (!inventionInfo) setInventionInfo(BCR_SAMPLE_INVENTION);
    updateClaimMap({
      inventionElements,
      referencePatents: [...claimMap.referencePatents, patent],
      activePatentId: patent.id,
      selectedMappingId: undefined,
    });
    setActiveSection('elements');
    setNotice('첨부 문서에서 확인한 BCR 발명과 뉴로메카 기준 특허를 추가했습니다.');
  };

  const handleDeletePatent = async (id: string) => {
    const patent = claimMap.referencePatents.find((item) => item.id === id);
    if (!patent) return;
    if (!window.confirm(`“${patent.document.title || patent.document.fileName || '예시 특허'}”와 연결된 청구항·매핑을 삭제할까요?`)) return;
    const remaining = claimMap.referencePatents.filter((item) => item.id !== id);
    await deletePatentSource(id).catch(() => undefined);
    updateClaimMap({
      referencePatents: remaining,
      activePatentId: remaining[0]?.id,
      selectedMappingId: undefined,
    });
    setActiveSection(remaining.length > 0 ? 'input' : 'input');
    setNotice('예시 특허와 해당 분석 데이터를 삭제했습니다.');
  };

  const processFileForPatent = async (patentId: string, file: File) => {
    const targetPatent = useAppStore.getState().claimMap.referencePatents.find((patent) => patent.id === patentId);
    if (!targetPatent) return;
    if (file.size > 10 * 1024 * 1024) {
      setNotice('10MB를 초과하는 PDF입니다. 청구항 텍스트를 직접 붙여넣어 주세요.');
      return;
    }
    setExtracting(true);
    setProgress(0);
    setNotice('');
    updatePatent(patentId, (patent) => ({ ...patent, status: 'extracting', updatedAt: new Date().toISOString() }));
    try {
      const sourceHash = await hashFile(file);
      const currentPatents = useAppStore.getState().claimMap.referencePatents;
      const duplicate = currentPatents.find((patent) => patent.id !== patentId && patent.sourceHash === sourceHash);
      if (duplicate) {
        useAppStore.setState((state) => ({ claimMap: { ...state.claimMap, activePatentId: duplicate.id, referencePatents: state.claimMap.referencePatents.filter((patent) => patent.id !== patentId) } }));
        setNotice('동일한 PDF가 이미 추가되어 기존 특허로 이동했습니다.');
        return;
      }
      const { extractPdfText } = await import('../lib/pdf');
      const result = await extractPdfText(file, setProgress);
      const metadata = extractKiprisPatentMetadata(result.text);
      const claimsText = findClaimsText(result.text);
      const detectedClaimCount = parseClaimElements(claimsText).length;
      await savePatentSource(patentId, result.text);
      updatePatent(patentId, (patent) => ({
        ...patent,
        sourceHash,
        status: 'idle',
        claimElements: [],
        mappings: [],
        relevance: undefined,
        confirmedAt: undefined,
        updatedAt: new Date().toISOString(),
        document: {
          ...patent.document,
          fileName: file.name,
          pageCount: result.pageCount,
          extractedText: '',
          claimsText,
          ...metadata,
        },
      }));
      setNotice(Object.keys(metadata).length > 0
        ? `KIPRIS 서지정보와 청구항 ${detectedClaimCount}개를 추출했습니다. 원문 범위를 확인해 주세요.`
        : `PDF 텍스트와 청구항 ${detectedClaimCount}개를 추출했습니다. 원문 범위를 확인해 주세요.`);
    } catch (error) {
      updatePatent(patentId, (patent) => ({ ...patent, status: 'failed', updatedAt: new Date().toISOString() }));
      setNotice(error instanceof Error ? `PDF 추출 실패: ${error.message}` : 'PDF 텍스트를 추출하지 못했습니다.');
    } finally {
      setExtracting(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!activePatent) return;
    await processFileForPatent(activePatent.id, file);
  };

  const handleDirectFileAdd = async (file: File) => {
    if (useAppStore.getState().claimMap.referencePatents.length >= 5) {
      setNotice('예시 특허는 최대 5건까지 추가할 수 있습니다.');
      return;
    }
    const patent = createReferencePatent();
    updateClaimMap({
      referencePatents: [...useAppStore.getState().claimMap.referencePatents, patent],
      activePatentId: patent.id,
      selectedMappingId: undefined,
    });
    setActiveSection('input');
    setNotice('PDF를 예시 특허로 추가하고 텍스트를 추출하고 있습니다.');
    await processFileForPatent(patent.id, file);
  };

  const handleAnalyze = () => {
    if (!activePatent) return;
    if (!inventionInfo?.summary.trim()) {
      setNotice('자사 발명 정보가 없습니다. 목표 정의에서 발명 요약을 입력하거나 BCR 샘플을 사용해 주세요.');
      return;
    }
    const inventionElements = claimMap.inventionElements.length > 0
      ? claimMap.inventionElements
      : extractInventionElements(inventionInfo);
    const claimElements = parseClaimElements(activePatent.document.claimsText);
    if (claimElements.length === 0) {
      setNotice('청구항 번호를 찾지 못했습니다. “청구항 1” 형식으로 번호와 원문을 확인해 주세요.');
      return;
    }
    updateClaimMap({ inventionElements });
    updateActivePatent({
      status: 'review_required',
      claimElements,
      mappings: [],
      relevance: undefined,
      confirmedAt: undefined,
    });
    setActiveSection('elements');
    setNotice(`발명요소 ${inventionElements.length}개와 청구항 ${claimElements.length}개를 구조화했습니다.`);
  };

  const handleInventionChange = (inventionElements: InventionElement[]) => {
    updateClaimMap({
      inventionElements,
      referencePatents: claimMap.referencePatents.map((patent) => ({
        ...patent,
        status: patent.claimElements.length > 0 ? 'review_required' : patent.status,
        mappings: [],
        relevance: undefined,
        confirmedAt: undefined,
        updatedAt: new Date().toISOString(),
      })),
    });
    setNotice('발명요소 변경으로 모든 특허의 기존 매핑이 재검토 상태가 되었습니다.');
  };

  const handleClaimChange = (claimElements: ClaimElement[]) => {
    updateActivePatent({ status: 'review_required', claimElements, mappings: [], relevance: undefined, confirmedAt: undefined });
  };

  const handleCreateMap = () => {
    if (!activePatent) return;
    const mappings = createClaimMappings(claimMap.inventionElements, activePatent.claimElements);
    updateActivePatent({ status: 'mapping', mappings, relevance: calculateRelevance(claimMap.inventionElements, activePatent.claimElements, mappings) });
    setActiveSection('mapping');
    setNotice('청구항 대응 맵을 생성했습니다. 근거 원문과 관련성 수준을 확인해 주세요.');
  };

  const handleMappingsChange = (mappings: ClaimMapping[]) => {
    if (!activePatent) return;
    updateActivePatent({ mappings, relevance: calculateRelevance(claimMap.inventionElements, activePatent.claimElements, mappings), confirmedAt: undefined });
  };

  const handleConfirmAll = () => {
    if (!activePatent) return;
    const mappings = activePatent.mappings.map((mapping) => ({
      ...mapping,
      reviewStatus: 'confirmed' as const,
      needsReview: false,
      ...(mapping.evidenceQuotes.length === 0 && mapping.matchLevel !== 'different'
        ? { matchLevel: 'unknown' as const, riskLevel: 'hold' as const }
        : {}),
    }));
    const relevance = calculateRelevance(claimMap.inventionElements, activePatent.claimElements, mappings);
    const strategies = createSearchStrategies(claimMap.inventionElements);
    setKeywords(mergeStrategiesIntoKeywords(keywords, strategies));
    updateClaimMap({ searchStrategies: strategies, selectedMappingId: undefined });
    updateActivePatent({ status: 'completed', mappings, relevance, confirmedAt: new Date().toISOString() });
    setActiveSection('comparison');
    setNotice('이 특허의 매핑을 확정하고 통합 비교에 반영했습니다.');
  };

  const selectPatent = (id: string, openWorkspace = false) => {
    const patent = claimMap.referencePatents.find((item) => item.id === id);
    updateClaimMap({ activePatentId: id, selectedMappingId: undefined });
    if (openWorkspace && patent) {
      setActiveSection(patent.mappings.length > 0 ? 'mapping' : patent.claimElements.length > 0 ? 'elements' : 'input');
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <StepHeader
        step="claim-map"
        title="발명요소·청구항 맵"
        description="예시 특허 1~5건을 업로드하고 청구항 원문 근거로 관련성을 비교합니다"
        canGoBack
        canGoNext={completedPatents.length > 0}
        onNext={() => navigate('/report')}
      />

      <main className="flex-1 overflow-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <PatentListRail
            patents={claimMap.referencePatents}
            activePatentId={claimMap.activePatentId}
            onSelect={(id) => selectPatent(id, true)}
            onAdd={handleAddPatent}
            onAddText={handleAddTextPatent}
            onAddSample={handleLoadSample}
            onDelete={handleDeletePatent}
          />
          <input
            ref={directFileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            aria-label="PDF 예시 특허 파일 선택"
            onChange={(event) => {
              const file = pickPdfFile(event.target.files);
              if (file) void handleDirectFileAdd(file);
              event.currentTarget.value = '';
            }}
          />

          {notice && (
            <div className="flex items-start justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800" role="status" aria-live="polite">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} className="shrink-0 font-bold text-blue-600">닫기</button>
            </div>
          )}

          {claimMap.referencePatents.length === 0 ? (
            <div
              className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const file = pickPdfFile(event.dataTransfer.files);
                if (!file) {
                  setNotice('PDF 파일만 첨부할 수 있습니다.');
                  return;
                }
                void handleDirectFileAdd(file);
              }}
            >
              <LayoutGrid className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">비교할 예시 특허를 추가하세요</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">사용자가 제공한 PDF와 청구항만 분석합니다. 외부 특허 데이터베이스 검색은 포함되지 않습니다.</p>
              <div className="mt-5 flex justify-center gap-2">
                <button type="button" onClick={handleLoadSample} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700">BCR 샘플 추가</button>
                <button type="button" onClick={handleAddPatent} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">PDF 예시 특허 추가</button>
                <button type="button" onClick={handleAddTextPatent} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">텍스트 직접 입력</button>
              </div>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 bg-white px-3 py-2 rounded-xl shadow-sm">
                <div className="flex gap-1 overflow-x-auto" aria-label="청구항 맵 작업 단계">
                  {sectionItems.map((item, index) => {
                    const Icon = item.icon;
                    const enabled = availableSections[item.id];
                    const active = activeSection === item.id;
                    return (
                      <button key={item.id} type="button" disabled={!enabled} onClick={() => enabled && setActiveSection(item.id)} className={`flex min-w-max items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${active ? 'bg-indigo-600 text-white shadow-sm' : enabled ? 'text-slate-600 hover:bg-slate-100' : 'cursor-not-allowed text-slate-300'}`}>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? 'bg-white/20' : enabled ? 'bg-slate-100' : 'bg-slate-50'}`}>{index > 0 && enabled ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
                        <Icon className="h-4 w-4" /> {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activePatent && activeSection === 'input' && (
                <PatentInputPanel
                  document={activePatent.document}
                  extracting={extracting}
                  progress={progress}
                  onDocumentChange={(document: PatentDocument) => updateActivePatent({ document, status: 'idle', mappings: [], relevance: undefined, confirmedAt: undefined })}
                  onFileSelect={handleFileSelect}
                  onAnalyze={handleAnalyze}
                  onLoadSample={handleLoadSample}
                />
              )}
              {activePatent && activeSection === 'elements' && (
                <ElementReviewPanels
                  inventionElements={claimMap.inventionElements}
                  claimElements={activePatent.claimElements}
                  onInventionChange={handleInventionChange}
                  onClaimChange={handleClaimChange}
                  onCreateMap={handleCreateMap}
                />
              )}
              {activePatent && activeSection === 'mapping' && (
                <ClaimMapTable
                  inventionElements={claimMap.inventionElements}
                  claimElements={activePatent.claimElements}
                  mappings={activePatent.mappings}
                  selectedMappingId={claimMap.selectedMappingId}
                  onMappingsChange={handleMappingsChange}
                  onSelectMapping={(selectedMappingId) => updateClaimMap({ selectedMappingId })}
                  onConfirmAll={handleConfirmAll}
                />
              )}
              {activeSection === 'comparison' && (
                <MultiPatentComparison inventionElements={claimMap.inventionElements} patents={claimMap.referencePatents} onSelectPatent={(id) => selectPatent(id, true)} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
