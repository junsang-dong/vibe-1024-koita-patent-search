import { spawn } from 'node:child_process';
import { rm } from 'node:fs/promises';
import process from 'node:process';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const debugPort = 9332;
const profilePath = `/private/tmp/kipris-pdf-check-${process.pid}`;
const fixtures = [
  {
    path: '/private/tmp/pdfs/C51 KIPRIS ROBOT ACTUATOR1.pdf',
    title: '액추에이터 유닛, 이를 포함한 로봇 및 감속기 장치',
    applicant: '삼성전자주식회사',
    applicationNumber: '10-2013-0119441',
    publicationNumber: '10-2015-0040655',
    registrationNumber: '10-2061693',
    claimNumbers: Array.from({ length: 20 }, (_, index) => index + 1),
    independentClaims: [1, 8, 12, 20],
    deletedClaims: [4, 15],
  },
  {
    path: '/private/tmp/pdfs/C51 KIPRIS ROBOT ACTUATOR2.pdf',
    title: '토크 값 기반으로 모듈화된 로봇용 스마트 액추에이터',
    applicant: '주식회사 뉴로메카',
    applicationNumber: '10-2020-0136931',
    publicationNumber: '10-2022-0052696',
    registrationNumber: '10-2395225',
    claimNumbers: Array.from({ length: 10 }, (_, index) => index + 1),
    independentClaims: [1],
    deletedClaims: [5, 7],
  },
  {
    path: '/private/tmp/pdfs/C51 KIPRIS ROBOT ACTUATOR3.pdf',
    title: '소형 전기 유압식 선형 액추에이터 및 전기 유압 구동식 댁스트러스 로봇 핸드',
    applicant: '선전 스페리칼 플루이드 파워 테크놀로지 컴퍼니 리미티드',
    applicationNumber: '20-2022-7000021',
    publicationNumber: '20-2022-0001460',
    registrationNumber: '20-0499860',
    claimNumbers: Array.from({ length: 11 }, (_, index) => index + 1),
    independentClaims: [1, 9, 11],
    deletedClaims: [5, 6],
  },
  {
    path: '/private/tmp/pdfs/C51 KIPRIS ROBOT ACTUATOR4.pdf',
    title: '로봇의 회전 관절용 3자유도 액추에이터',
    applicant: '한양대학교 에리카산학협력단 (주)라컴텍',
    applicationNumber: '10-2010-0008567',
    publicationNumber: '10-2011-0088858',
    registrationNumber: '10-1204088',
    claimNumbers: Array.from({ length: 12 }, (_, index) => index + 1),
    independentClaims: [1],
    deletedClaims: [6],
  },
];

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-background-networking',
  '--disable-component-update',
  '--no-first-run',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profilePath}`,
  '--window-size=1440,1200',
  'about:blank',
], { stdio: 'ignore' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getDebuggerTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json();
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

async function waitFor(expression, description) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${description}`);
}

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:5171/define' });
  await waitFor(`document.body?.innerText.includes('목표 정의')`, 'the define step');

  const setValue = async (selector, value) => {
    const changed = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, ${JSON.stringify(value)}); element.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
    if (!changed) throw new Error(`Input not found: ${selector}`);
  };
  await setValue('#title', '로봇 액추에이터 비교 분석');
  await setValue('#technicalField', '로봇 액추에이터');
  await setValue('#purpose', '복수 기준 특허의 관련성을 비교한다.');
  await setValue('#summary', '모터와 감속기, 센서 및 제어부를 포함하는 로봇 액추에이터의 구조와 제어 기술을 분석한다.');
  await evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent.includes('다음')).click()`);
  await waitFor(`document.body?.innerText.includes('예시 특허 0/5')`, 'the claim-map step');

  const results = [];
  for (const fixture of fixtures) {
    await evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent.includes('PDF 예시 특허 추가')).click()`);
    const documentNode = await send('DOM.getDocument');
    const inputNode = await send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: 'input[aria-label="PDF 예시 특허 파일 선택"]' });
    if (!inputNode.nodeId) throw new Error('Direct PDF input was not found');
    await send('DOM.setFileInputFiles', { nodeId: inputNode.nodeId, files: [fixture.path] });
    await waitFor(`document.querySelector('input[placeholder="기준 특허의 명칭"]')?.value === ${JSON.stringify(fixture.title)}`, fixture.title);

    const parsed = await evaluate(`(async () => {
      const claimModule = await import('/src/lib/claim-map.ts');
      const value = (placeholder) => document.querySelector('input[placeholder="' + placeholder + '"]')?.value || '';
      const claimsText = document.querySelector('textarea')?.value || '';
      const claims = claimModule.parseClaimElements(claimsText);
      return {
        title: value('기준 특허의 명칭'),
        applicant: value('출원인 또는 권리자'),
        applicationNumber: value('예: 10-2020-0136931'),
        publicationNumber: value('예: 10-2022-0052696'),
        registrationNumber: value('예: 10-2395225'),
        claimNumbers: claims.map((claim) => claim.claimNumber),
        independentClaims: claims.filter((claim) => claim.claimType === 'independent').map((claim) => claim.claimNumber),
        deletedClaims: claims.filter((claim) => claim.claimType === 'deleted').map((claim) => claim.claimNumber),
        claimNames: claims.map((claim) => claim.name),
        polluted: claims.some((claim) => /KIPRIS|kipris\\.or\\.kr|(^|\\n)\\s*[A-Z]{0,2}\\d{7,}(?:\\s+[A-Z]\\d?)?\\s*($|\\n)/m.test(claim.exactQuote)),
      };
    })()`);

    for (const key of ['title', 'applicant', 'applicationNumber', 'publicationNumber', 'registrationNumber']) {
      if (parsed[key] !== fixture[key]) throw new Error(`${fixture.path}: ${key} mismatch: ${parsed[key]} !== ${fixture[key]}`);
    }
    if (JSON.stringify(parsed.claimNumbers) !== JSON.stringify(fixture.claimNumbers)) {
      throw new Error(`${fixture.path}: claim numbers mismatch: ${JSON.stringify(parsed.claimNumbers)}`);
    }
    for (const key of ['independentClaims', 'deletedClaims']) {
      if (JSON.stringify(parsed[key]) !== JSON.stringify(fixture[key])) {
        throw new Error(`${fixture.path}: ${key} mismatch: ${JSON.stringify(parsed[key])}`);
      }
    }
    if (parsed.polluted) throw new Error(`${fixture.path}: claim text contains KIPRIS or citation-table artifacts`);
    await evaluate(`[...document.querySelectorAll('button')].find((button) => button.textContent.includes('발명·청구항 요소 구조화')).click()`);
    await waitFor(`document.body?.innerText.includes(${JSON.stringify(`청구항 ${fixture.claimNumbers.length}개를 구조화했습니다`)})`, `${fixture.claimNumbers.length} analyzed claims`);
    results.push({ file: fixture.path.split('/').at(-1), ...parsed });
  }

  process.stdout.write(`${JSON.stringify({ ok: true, results })}\n`);
} finally {
  socket.close();
  chrome.kill('SIGTERM');
  await delay(150);
  await rm(profilePath, { recursive: true, force: true });
}
