import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import process from 'node:process';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const debugPort = 9331;
const outputDir = new URL('../tmp/', import.meta.url);
const profilePath = `/private/tmp/c51-browser-check-${process.pid}`;
await mkdir(outputDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-background-networking',
  '--disable-component-update',
  '--no-first-run',
  '--remote-debugging-port=' + debugPort,
  '--user-data-dir=' + profilePath,
  '--window-size=1440,1200',
  'about:blank',
], { stdio: 'ignore' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getDebuggerTarget() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json`);
      const targets = await response.json();
      const target = targets.find((item) => item.type === 'page');
      if (target) return target;
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }
  throw new Error('Chrome debugging target was not available');
}

const target = await getDebuggerTarget();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let requestId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  requestId += 1;
  const id = requestId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitForText(text) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await evaluate(`document.body?.innerText.includes(${JSON.stringify(text)})`)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for: ${text}`);
}

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const clickButton = async (label) => {
    const clicked = await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((item) => item.textContent.includes(${JSON.stringify(label)})); if (!button) return false; button.click(); return true; })()`);
    if (!clicked) throw new Error(`Button not found: ${label}`);
  };
  const setValue = async (selector, value) => {
    const changed = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    if (!changed) throw new Error(`Input not found: ${selector}`);
  };

  await send('Page.navigate', { url: 'http://127.0.0.1:5171/define' });
  await waitForText('목표 정의');
  await setValue('#title', '센서 융합과 디지털 트윈 기반의 자가 진단형 로봇 스마트 액추에이터');
  await setValue('#technicalField', '산업용 로봇, 스마트 액추에이터, 센서 융합, 디지털 트윈');
  await setValue('#purpose', '복수 센서로 액추에이터의 상태를 진단하고 유지보수 시점을 예측한다.');
  await setValue('#summary', '중공 구조를 갖는 모터와 감속기, 출력 토크를 측정하는 토크센서, 전류·진동·온도 센서 및 엣지 제어부를 포함한다. 복수 센서 데이터를 시간 동기화하고 디지털 트윈의 정상 거동 예측값과 실제 측정값의 잔차를 분석하여 감속기 마모와 백래시를 진단한다. 이상 점수와 잔여 수명을 계산하고 진단 결과에 따라 토크 한계와 제어 파라미터를 자동 보정한다.');
  await clickButton('다음');
  await waitForText('예시 특허 0/5');
  await clickButton('PDF 예시 특허 추가');

  const documentNode = await send('DOM.getDocument');
  const inputNode = await send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: 'input[aria-label="PDF 예시 특허 파일 선택"]' });
  if (!inputNode.nodeId) throw new Error('Direct PDF file input was not found');
  await send('DOM.setFileInputFiles', {
    nodeId: inputNode.nodeId,
    files: ['/Users/jmac/Documents/ChatGPT/goorm-260920-patent-search/xref/C51 KIPRIS ROBOT ACTUATOR2.pdf'],
  });
  await waitForText('KIPRIS 기준 특허를 확인했습니다');
  await clickButton('발명·청구항 요소 구조화');
  await waitForText('발명요소 8개와 청구항 10개');

  await clickButton('구성요소 대응 맵 생성');
  await waitForText('청구항 구성요소 맵');
  await clickButton('전체 확인 및 비교 반영');
  await waitForText('예시 특허 관련성 비교');

  await clickButton('텍스트 직접 입력');
  await waitForText('새 예시 특허 작업공간');
  await setValue('input[placeholder="기준 특허의 명칭"]', '다중 센서 기반 로봇 액추에이터 상태 감시 장치');
  await setValue('input[placeholder="예: 10-2020-0136931"]', '10-2024-0000001');
  await setValue('textarea', 'Claim\nNo. Claim\n1 모터 및 감속기를 포함하는 로봇 액추에이터; 출력 토크를 측정하는 토크센서; 진동 및 온도를 측정하는 복수 센서; 센서 측정값으로 이상 상태를 판정하는 제어부를 포함한다.\n2\n제1항에 있어서, 상기 제어부는 정상 모델과 측정값의 차이를 이용하여 감속기 상태를 진단한다.');
  await clickButton('발명·청구항 요소 구조화');
  await waitForText('청구항 2개를 구조화했습니다');
  await clickButton('구성요소 대응 맵 생성');
  await clickButton('전체 확인 및 비교 반영');
  await waitForText('예시 특허 관련성 비교');

  let extraPdfClaims = true;
  if (process.env.EXTRA_PDF) {
    await clickButton('PDF 예시 특허 추가');
    const refreshedDocument = await send('DOM.getDocument');
    const directInput = await send('DOM.querySelector', { nodeId: refreshedDocument.root.nodeId, selector: 'input[aria-label="PDF 예시 특허 파일 선택"]' });
    if (!directInput.nodeId) throw new Error('Direct PDF file input was not found for the extra PDF');
    await send('DOM.setFileInputFiles', { nodeId: directInput.nodeId, files: [process.env.EXTRA_PDF] });
    await waitForText('PDF 텍스트를 추출했습니다');
    await clickButton('발명·청구항 요소 구조화');
    await waitForText('청구항 12개를 구조화했습니다');
    extraPdfClaims = await evaluate(`document.body.innerText.includes('청구항 12개를 구조화했습니다')`);
  }

  await clickButton('다음');
  await waitForText('선행특허 리서치 요약 리포트');
  await waitForText('다중 센서 기반 로봇 액추에이터 상태 감시 장치');
  await evaluate(`document.querySelector('button[aria-label="5점"]').click()`);
  await waitForText('5점으로 저장했습니다');

  const counts = await evaluate(`({ patents: document.body.innerText.includes('비교 특허') && document.body.innerText.includes('2'), scope: document.body.innerText.includes('외부 특허 데이터베이스 검색은 포함되지 않았습니다'), report: document.querySelectorAll('article section').length, satisfaction: localStorage.getItem('research-report-satisfaction') === '5' })`);
  const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL('claim-map-browser-check.png', outputDir), Buffer.from(screenshot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await writeFile(new URL('claim-map-mobile-check.png', outputDir), Buffer.from(mobileScreenshot.data, 'base64'));
  const legacyPersistedState = {
    version: 1,
    state: {
      currentStep: 2,
      inventionInfo: { title: '레거시 발명', technicalField: '', purpose: '', summary: '레거시 마이그레이션 확인용 발명 요약입니다.' },
      claimMap: {
        analysisStatus: 'review_required',
        document: { fileName: 'legacy.pdf', title: '레거시 기준 특허', applicant: '', applicationNumber: '10-LEGACY', publicationNumber: '', registrationNumber: '', pageCount: 1, extractedText: '', claimsText: '청구항 1\n레거시 청구항 원문' },
        inventionElements: [],
        claimElements: [{ id: 'C1.1', claimNumber: 1, claimType: 'independent', name: '레거시 청구항', normalizedText: '레거시 청구항 원문', exactQuote: '레거시 청구항 원문', confidence: 1, needsReview: false, reviewStatus: 'confirmed' }],
        mappings: [],
        searchStrategies: [],
      },
    },
  };
  await evaluate(`localStorage.setItem('patent-search-storage', ${JSON.stringify(JSON.stringify(legacyPersistedState))}); location.href = '/claim-map'`);
  await waitForText('예시 특허 1/5');
  const migration = await evaluate(`document.body.innerText.includes('레거시 기준 특허')`);
  process.stdout.write(JSON.stringify({ ok: true, ...counts, migration, extraPdfClaims }) + '\n');
} finally {
  socket.close();
  chrome.kill('SIGTERM');
  await delay(150);
  await rm(profilePath, { recursive: true, force: true });
}
