import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

export async function extractPdfText(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<PdfExtractionResult> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? `${item.str}${item.hasEOL ? '\n' : ' '}` : ''))
      .join('')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    pages.push(`[페이지 ${pageNumber}]\n${text}`);
    onProgress?.(Math.round((pageNumber / pdf.numPages) * 100));
  }

  return { text: pages.join('\n\n'), pageCount: pdf.numPages };
}
