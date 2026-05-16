// ================================================================
// DIGIT PATTERNS — 7 baris × 5 kolom = 35 piksel
// 1 = menyala, 0 = mati
// ================================================================
const TARGET = [
  0,1,1,1,0,
  0,0,0,0,1,
  0,0,0,0,1,
  0,1,1,1,0,
  0,0,0,0,1,
  0,0,0,0,1,
  0,1,1,1,0
]; // Digit "3"

const VAR_A = [
  0,1,1,1,1,
  0,0,0,0,1,
  0,0,0,0,1,
  0,1,1,1,1,
  0,0,0,0,1,
  0,0,0,0,1,
  0,1,1,1,1
];

const VAR_B = [
  1,1,1,1,0,
  0,0,0,0,1,
  0,0,0,0,1,
  0,1,1,1,0,
  0,0,0,0,1,
  0,0,0,0,1,
  1,1,1,1,0
];

// ================================================================
// DATA KONFIGURASI
// ================================================================
const MAX_EPOCH = 10;

const VERDICTS = [
  {t:'PALSU!', s:'Keyakinan palsu: 96%', c:'#ff2d55'},
  {t:'PALSU!', s:'Keyakinan palsu: 91%', c:'#ff2d55'},
  {t:'PALSU',  s:'Keyakinan palsu: 82%', c:'#ff5020'},
  {t:'PALSU',  s:'Keyakinan palsu: 71%', c:'#ff6e10'},
  {t:'PALSU?', s:'Keyakinan palsu: 60%', c:'#ff9000'},
  {t:'RAGU...', s:'Keyakinan palsu: 54%', c:'#ffc000'},
  {t:'NYATA?', s:'Keyakinan palsu: 47%', c:'#90e040'},
  {t:'NYATA?', s:'Keyakinan palsu: 44%', c:'#50dd60'},
  {t:'NYATA!', s:'Keyakinan palsu: 41%', c:'#20cc70'},
  {t:'NYATA!', s:'Keyakinan palsu: 38%', c:'#00d4b4'},
  {t:'50 / 50', s:'Tidak bisa dibedakan — Keseimbangan Nash tercapai!', c:'#00d4b4'},
];

const LOGS = [
  'Epoch <b>0</b> — Generator memulai dari <b>noise acak</b>. Setiap piksel dipilih secara random, belum ada pola.',
  'Epoch <b>1</b> — Generator mengirim output pertamanya. <span>Discriminator langsung mengenali kepalsuan</span> dengan keyakinan tinggi.',
  'Epoch <b>2</b> — Sinyal balik diterima Generator. Ia mulai tahu arah mana yang harus diperbaiki.',
  'Epoch <b>3</b> — Struktur awal mulai terbentuk. Beberapa piksel sudah di posisi yang benar, tapi masih banyak noise.',
  'Epoch <b>4</b> — Generator semakin memahami pola digit. <span>Discriminator mulai perlu kerja lebih keras</span>.',
  'Epoch <b>5</b> — Titik tengah training. Generator sudah bisa membuat bentuk yang "mendekati" angka 3.',
  'Epoch <b>6</b> — Discriminator <span>mulai ragu</span>. Output Generator cukup meyakinkan untuk membingungkan.',
  'Epoch <b>7</b> — Generator semakin dominan. Pola hampir sempurna, Discriminator hampir tidak bisa membedakan.',
  'Epoch <b>8</b> — Persaingan memanas. Kedua model terus saling meningkatkan kemampuan.',
  'Epoch <b>9</b> — Output Generator sangat mirip asli. Discriminator hampir tidak bisa dipercaya lagi.',
  'Epoch <b>10</b> — <span>⚖️ Keseimbangan Nash tercapai!</span> Discriminator 50/50 — tidak bisa lagi membedakan nyata vs palsu.',
];

const SPEEDS = {1: 2800, 2: 1600, 3: 800};

// ================================================================
// STATE
// ================================================================
let epoch = 0;
let isRunning = false;
let isPaused = false;
let stepOnce = false;
let timer = null;
let gLoss = [];
let dLoss = [];
let curGrid = [];

// ================================================================
// GRID FUNCTIONS
// ================================================================
function buildGrid(id, pattern, type) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  pattern.forEach((v, i) => {
    const d = document.createElement('div');
    d.className = 'px ' + (type === 'real' ? (v ? 'px-r-on' : 'px-r-off') : (v ? 'px-on' : 'px-off'));
    if (type !== 'real') d.id = 'gp' + i;
    el.appendChild(d);
  });
}

function updateGen(pattern) {
  pattern.forEach((v, i) => {
    const el = document.getElementById('gp' + i);
    if (el) el.className = 'px ' + (v ? 'px-on' : 'px-off');
  });
}

function buildMini(pattern) {
  const wrap = document.createElement('div');
  wrap.className = 'mini-pgrid';
  pattern.forEach(v => {
    const d = document.createElement('div');
    d.className = 'mpx ' + (v ? 'mpx-on' : 'mpx-off');
    wrap.appendChild(d);
  });
  return wrap;
}

// ================================================================
// TRAINING LOGIC
// ================================================================
function makeNoise() {
  return Array(35).fill(0).map(() => Math.random() > .5 ? 1 : 0);
}

function generateEpochOutput(ep) {
  const acc = 0.25 + (ep / MAX_EPOCH) * 0.73;
  return TARGET.map(t => Math.random() < acc ? t : (Math.random() > .5 ? 1 : 0));
}

function getAccPct(ep) {
  return Math.round(25 + (ep / MAX_EPOCH) * 73);
}

function getLossPoint(ep) {
  const r = () => Math.random() * .12;
  return {
    g: Math.max(0.04, 2.55 - (ep / MAX_EPOCH) * 1.95 + r()),
    d: Math.min(0.98, 0.07 + (ep / MAX_EPOCH) * 0.63 + r() * .5)
  };
}

// ================================================================
// ANIMATION HELPERS
// ================================================================
function animPacket(id, cls) {
  return new Promise(res => {
    const el = document.getElementById(id);
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => { el.classList.remove(cls); res(); }, 870);
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function getDelay() { return SPEEDS[document.getElementById('spdSlider').value] || 1600; }

function setVerdict(ep) {
  const v = VERDICTS[Math.min(ep, VERDICTS.length - 1)];
  const box = document.getElementById('verdBox');
  box.style.borderColor = v.c;
  const m = document.getElementById('verdMain');
  m.textContent = v.t;
  m.style.color = v.c;
  document.getElementById('verdSub').textContent = v.s;
}

// ================================================================
// LOSS CHART
// ================================================================
function drawChart() {
  const canvas = document.getElementById('cvs');
  const W = canvas.offsetWidth || 800;
  const H = 95;
  canvas.width = W * devicePixelRatio;
  canvas.height = H * devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  [0, .25, .5, .75, 1].forEach(v => {
    const y = H - v * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });

  if (gLoss.length < 1) return;

  const toX = i => (i / MAX_EPOCH) * W;
  const toY = v => H - Math.min(1, v / 3.0) * H;

  function plotLine(data, color) {
    if (data.length < 1) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    data.forEach((v, i) => i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)));
    ctx.stroke();
    data.forEach((v, i) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(toX(i), toY(v), 3.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  plotLine(gLoss, '#00d4b4');
  plotLine(dLoss, '#ff7a30');
}

// ================================================================
// MAIN EPOCH RUNNER
// ================================================================
async function runEpoch() {
  if (isPaused && !stepOnce) return;
  if (epoch > MAX_EPOCH) { finishAll(); return; }

  const doStep = stepOnce;
  stepOnce = false;

  document.getElementById('genPanel').classList.add('is-thinking');
  document.getElementById('epochNum').textContent = epoch;
  document.getElementById('progFill').style.width = (epoch / MAX_EPOCH * 100) + '%';
  document.getElementById('statusLog').innerHTML = LOGS[epoch] || '';

  curGrid = generateEpochOutput(epoch);
  updateGen(curGrid);

  const acc = getAccPct(epoch);
  document.getElementById('accFill').style.width = acc + '%';
  document.getElementById('accTxt').textContent = '~' + acc + '%';

  document.getElementById('genPanel').classList.remove('is-thinking');

  await wait(280);
  await animPacket('pktFwd', 'run-fwd');

  setVerdict(epoch);
  await wait(480);
  await animPacket('pktBwd', 'run-bwd');

  const lp = getLossPoint(epoch);
  gLoss.push(lp.g);
  dLoss.push(lp.d);
  drawChart();

  await wait(200);
  epoch++;

  if (doStep) {
    isPaused = true;
    document.getElementById('btnPause').textContent = '▶ Lanjut';
    return;
  }

  if (!isPaused && epoch <= MAX_EPOCH) {
    timer = setTimeout(runEpoch, getDelay() * .25);
  } else if (epoch > MAX_EPOCH) {
    finishAll();
  }
}

function finishAll() {
  isRunning = false;
  document.getElementById('btnStart').disabled = true;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnStep').disabled = true;
  document.getElementById('progFill').style.width = '100%';
}

// ================================================================
// BUTTON HANDLERS
// ================================================================
function startTraining() {
  if (isRunning && !isPaused) return;
  isRunning = true;
  isPaused = false;
  stepOnce = false;
  document.getElementById('btnStart').disabled = true;
  document.getElementById('btnPause').disabled = false;
  document.getElementById('btnStep').disabled = false;
  document.getElementById('btnPause').textContent = '⏸ Jeda';
  runEpoch();
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  document.getElementById('btnPause').textContent = isPaused ? '▶ Lanjut' : '⏸ Jeda';
  if (!isPaused) runEpoch();
}

function manualStep() {
  if (epoch > MAX_EPOCH) return;
  if (!isRunning) {
    isRunning = true;
    document.getElementById('btnStart').disabled = true;
    document.getElementById('btnPause').disabled = false;
  }
  isPaused = false;
  stepOnce = true;
  runEpoch();
}

function resetAll() {
  clearTimeout(timer);
  epoch = 0;
  isRunning = false;
  isPaused = false;
  stepOnce = false;
  gLoss = [];
  dLoss = [];

  document.getElementById('btnStart').disabled = false;
  document.getElementById('btnPause').disabled = true;
  document.getElementById('btnStep').disabled = false;
  document.getElementById('btnPause').textContent = '⏸ Jeda';
  document.getElementById('epochNum').textContent = '0';
  document.getElementById('progFill').style.width = '0%';
  document.getElementById('accFill').style.width = '28%';
  document.getElementById('accTxt').textContent = '~28%';
  document.getElementById('genPanel').classList.remove('is-thinking');
  document.getElementById('verdBox').style.borderColor = 'var(--bdr)';
  document.getElementById('verdMain').textContent = '—';
  document.getElementById('verdMain').style.color = 'var(--text)';
  document.getElementById('verdSub').textContent = 'Belum ada training';
  document.getElementById('statusLog').innerHTML = 'Klik <b>▶ Mulai Training</b> untuk memulai simulasi, atau gunakan <b>→ Step</b> untuk maju satu epoch.';

  curGrid = makeNoise();
  buildGrid('genGrid', curGrid, 'gen');
  drawChart();
}

function updateSpeedLabel() {
  const lbls = {1:'Lambat', 2:'Normal', 3:'Cepat'};
  document.getElementById('spdLbl').textContent = lbls[document.getElementById('spdSlider').value] || 'Normal';
}

// ================================================================
// INIT
// ================================================================
curGrid = makeNoise();
buildGrid('genGrid', curGrid, 'gen');
buildGrid('realGrid', TARGET, 'real');

const strip = document.getElementById('dsStrip');
const dsWrap = document.createElement('div');
dsWrap.style.cssText = 'display:flex;gap:5px;';
[TARGET, VAR_A, VAR_B].forEach(p => dsWrap.appendChild(buildMini(p)));
strip.appendChild(dsWrap);

drawChart();
window.addEventListener('resize', drawChart);