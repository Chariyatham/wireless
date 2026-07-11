// ===== Week 1 — Logarithm + Decibel + Link Budget =====
// interactive ทั้งหมดของบท: ตัวเลขทุกตัวยืนยันด้วยสคริปต์แล้ว (verify_w1.mjs)
import { createStepper, makeScale, plotPath, easeInOut, mountWalk, mountRunner, mountExam } from './stepper.js';

const log10 = Math.log10;
const dB = (r) => 10 * log10(r);
const toW = (dbw) => Math.pow(10, dbw / 10);

function fmtW(p) {
  if (p >= 1e9) return (p / 1e9).toPrecision(3) + ' GW';
  if (p >= 1e6) return (p / 1e6).toPrecision(3) + ' MW';
  if (p >= 1e3) return (p / 1e3).toPrecision(3) + ' kW';
  if (p >= 1) return p.toPrecision(3) + ' W';
  if (p >= 1e-3) return (p * 1e3).toPrecision(3) + ' mW';
  if (p >= 1e-6) return (p * 1e6).toPrecision(3) + ' µW';
  if (p >= 1e-9) return (p * 1e9).toPrecision(3) + ' nW';
  return (p * 1e12).toPrecision(3) + ' pW';
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ════════════════════════════════════════════════════════════
   1 · "เลขล้นไม้บรรทัด" — ทำไมต้องมี log/dB
   ════════════════════════════════════════════════════════════ */
function scaleViz() {
  const el = document.getElementById('viz-scale');
  if (!el) return;
  const W = 680, H = 230;
  const pts = [
    { p: 1e-12, name: 'มือถือรับ\n(−90 dBm)', c: 'var(--anim)' },
    { p: 1e-6, name: '0.5 µW\n(ปลายทางโจทย์)', c: '#f0696b' },
    { p: 1e-3, name: '1 mW\n(จุดอ้าง dBm)', c: 'var(--intu)' },
    { p: 0.1, name: 'WiFi ส่ง\n(100 mW)', c: 'var(--check)' },
    { p: 50, name: 'ตัวส่งโจทย์\n(50 W)', c: 'var(--accent)' },
  ];
  const axisY = 130;
  const linX = makeScale([0, 50], [50, W - 40]);           // แกน linear 0..50 W
  const logX = makeScale([-12, 2], [50, W - 40]);          // แกน log: 10^-12 .. 10^2
  const caps = [
    'ลองวางกำลังงานที่เจอจริงในวิชานี้บน<b>ไม้บรรทัดธรรมดา</b> (0 → 50 W): ทุกค่ายกเว้น 50 W <b>กองทับกันที่ศูนย์</b> — ระยะห่าง 1 pW กับ 100 mW บนแกนนี้เล็กกว่าความหนาเส้นอีก',
    'ซูมเข้าไป 1,000 เท่า (0 → 0.05 W): 50 W กับ WiFi หลุดขอบขวาไปแล้ว แต่ 1 µW กับ 1 pW <b>ก็ยังกองที่ศูนย์เหมือนเดิม</b> — ซูมยังไงก็ไม่มีวันเห็นครบ เพราะค่าต่างกันถึง 10<sup>13</sup> เท่า',
    'เปลี่ยนกติกา: ให้<b>ระยะ 1 ช่องเท่ากับ "คูณสิบ"</b> (แกน logarithm) — ทุกค่าเรียงห่างเท่า ๆ กัน อ่านออกหมดในรูปเดียว นี่คือสิ่งที่ log ทำ: เปลี่ยน "ตัวคูณ" เป็น "ระยะทาง"',
    'ติดเบอร์กำกับช่อง: 1 W = 0, ×10 = +10, ÷10 = −10 … <b>เบอร์พวกนี้แหละคือ dBW</b> — dB ไม่ใช่สูตรลึกลับ มันคือ "เลขที่อยู่ของกำลังงานบนแกน log" แค่นั้นเอง',
  ];
  createStepper(el, {
    steps: 4, stepDuration: 2200,
    label: (s) => ['ไม้บรรทัดธรรมดา', 'ซูม ×1000', 'สลับเป็นแกน log', 'ติดเบอร์ = dB'][s],
    render(stage, step, t) {
      const zoomX = makeScale([0, 0.05], [50, W - 40]);
      let dots = '', labels = '', ticks = '';
      if (step <= 1) {
        const sx = step === 0 ? linX : zoomX;
        const max = step === 0 ? 50 : 0.05;
        for (let i = 0; i <= 5; i++) {
          const v = (max * i) / 5;
          ticks += `<line x1="${sx(v)}" y1="${axisY - 5}" x2="${sx(v)}" y2="${axisY + 5}" class="vzline"/>
            <text x="${sx(v)}" y="${axisY + 22}" text-anchor="middle" class="ticktxt">${step === 0 ? v : v.toFixed(2)} W</text>`;
        }
        pts.forEach((pt, i) => {
          const x = Math.min(sx(pt.p), W - 20);
          const off = sx(pt.p) > W - 40;
          const stackN = pts.filter((q, j) => j < i && Math.abs(sx(Math.min(q.p, max)) - Math.min(sx(pt.p), sx(max))) < 8).length;
          dots += `<circle cx="${Math.min(x, sx(max))}" cy="${axisY - 8 - stackN * 10}" r="6" fill="${pt.c}" opacity="${off ? 0.25 : 0.95}"/>`;
          if (off) labels += `<text x="${W - 22}" y="${axisY - 14 - stackN * 10}" text-anchor="end" class="viztxt" opacity="0.5">${pt.name.split('\n')[0]} →</text>`;
        });
        labels += `<text x="${sx(0) + 4}" y="${axisY - 62}" class="viztxt" fill="var(--accent-warm)">← ${step === 0 ? '4 ค่ากองอยู่ตรงนี้' : '1 pW กับ 1 µW ยังกองเหมือนเดิม'}</text>`;
      } else {
        // แกน log — ขั้น 2 ใช้ t เลื่อนจุดจากตำแหน่ง linear → log
        const k = step === 2 ? easeInOut(t) : 1;
        for (let e = -12; e <= 2; e += 2) {
          ticks += `<line x1="${logX(e)}" y1="${axisY - 5}" x2="${logX(e)}" y2="${axisY + 5}" class="vzline"/>
            <text x="${logX(e)}" y="${axisY + 22}" text-anchor="middle" class="ticktxt">10<tspan baseline-shift="super" font-size="8">${e}</tspan></text>`;
          if (step === 3) ticks += `<text x="${logX(e)}" y="${axisY + 40}" text-anchor="middle" class="ticktxt" fill="var(--accent)" font-weight="700">${e * 10} dBW</text>`;
        }
        pts.forEach((pt) => {
          const x0 = Math.min(linX(pt.p), W - 20);
          const x1 = logX(log10(pt.p));
          const x = x0 + (x1 - x0) * k;
          dots += `<circle cx="${x}" cy="${axisY - 8}" r="6" fill="${pt.c}"/>`;
          if (k > 0.7) {
            const lines = pt.name.split('\n');
            labels += `<text x="${x}" y="${axisY - 40}" text-anchor="middle" class="viztxt" opacity="${(k - 0.7) / 0.3}">${lines[0]}</text>
              <text x="${x}" y="${axisY - 26}" text-anchor="middle" class="ticktxt" opacity="${(k - 0.7) / 0.3}">${lines[1] || ''}</text>
              <line x1="${x}" y1="${axisY - 20}" x2="${x}" y2="${axisY - 14}" class="vzline" opacity="${(k - 0.7) / 0.3}"/>`;
          }
        });
        if (step === 3) labels += `<text x="${logX(0)}" y="${axisY + 58}" text-anchor="middle" class="viztxt" fill="var(--accent)">↑ 1 W = 0 dBW (จุดอ้างอิง)</text>`;
      }
      stage.innerHTML = `<svg class="svgviz" viewBox="0 0 ${W} ${H}" role="img" aria-label="เปรียบเทียบแกน linear กับแกน log">
        <line x1="40" y1="${axisY}" x2="${W - 14}" y2="${axisY}" class="vzaxis"/>
        ${ticks}${dots}${labels}
      </svg>
      <div class="stage-cap">${caps[step]}</div>`;
    },
  });
}

/* ════════════════════════════════════════════════════════════
   2 · กราฟ log 3 ฐาน (สไลด์ 2)
   ════════════════════════════════════════════════════════════ */
function logCurveViz() {
  const el = document.getElementById('viz-logcurve');
  if (!el) return;
  const W = 680, H = 300, pad = { l: 44, r: 16, t: 14, b: 30 };
  const xD = [0.05, 12], yD = [-2.4, 4];
  const sx = makeScale(xD, [pad.l, W - pad.r]);
  const sy = makeScale(yD, [H - pad.b, pad.t]);
  const curves = {
    b2: { fn: Math.log2, color: '#f0696b', name: 'log₂(x)' },
    be: { fn: Math.log, color: 'var(--check)', name: 'ln(x) — ฐาน e' },
    b10: { fn: log10, color: 'var(--accent)', name: 'log₁₀(x)' },
  };
  const axes = () => {
    let s = '';
    for (let yv = -2; yv <= 4; yv++) s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(yv)}" y2="${sy(yv)}" class="grid"/><text x="${pad.l - 7}" y="${sy(yv) + 3.5}" text-anchor="end" class="ticktxt">${yv}</text>`;
    for (const xv of [1, 2, 4, 6, 8, 10, 12]) s += `<line x1="${sx(xv)}" x2="${sx(xv)}" y1="${pad.t}" y2="${H - pad.b}" class="grid"/><text x="${sx(xv)}" y="${H - pad.b + 15}" text-anchor="middle" class="ticktxt">${xv}</text>`;
    s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(0)}" y2="${sy(0)}" class="vzaxis"/><line x1="${sx(0.05)}" x2="${sx(0.05)}" y1="${pad.t}" y2="${H - pad.b}" class="vzaxis"/>`;
    return s;
  };
  const path = (key, op = 1, wd = 2.4) => `<path d="${plotPath(curves[key].fn, 0.06, 12, sx, sy)}" fill="none" stroke="${curves[key].color}" stroke-width="${wd}" opacity="${op}"/>`;
  const dot = (x, y, c, lbl, dy = -10) => `<circle cx="${sx(x)}" cy="${sy(y)}" r="5.5" fill="${c}" stroke="var(--paper)" stroke-width="1.5"/>${lbl ? `<text x="${sx(x) + 9}" y="${sy(y) + dy}" class="viztxt" fill="${c}">${lbl}</text>` : ''}`;
  const caps = [
    'เริ่มที่จุดเดียวที่<b>ทุกฐานเห็นตรงกัน</b>: x = 1 → log = 0 เพราะ "ฐานอะไรก็ตาม ยกกำลัง 0 ได้ 1" (b⁰ = 1) — เส้นทุกสีเสียบผ่าน (1, 0)',
    'log₁₀(10) = 1 — อ่านว่า "10 ต้องยกกำลัง <b>1</b> ครั้งถึงได้ 10" · คำถามของ log คือ<b>หาเลขชี้กำลัง</b>: rise จาก 0 → 1 เมื่อ x คูณสิบ',
    'ทุกครั้งที่ x <b>คูณ 10</b> เส้นฐาน 10 ขยับขึ้น <b>+1 เท่านั้น</b>: log(1)=0 → log(10)=1 → log(100)=2 → log(1000)=3 — ตัวเลข 1, 10, 100, 1000 โตแบบระเบิด แต่ log เดินทีละก้าวเท่า ๆ กัน (คูณ → บวก)',
    'ฝั่งซ้าย: x เข้าใกล้ 0 เส้นดิ่งลง −∞ (0.1→−1, 0.01→−2, …) และ<b>ซ้ายกว่า 0 ไม่มีนิยาม</b> — เพราะ 10 ยกกำลังอะไรก็ไม่มีทางได้ 0 หรือติดลบ → เงื่อนไข x &gt; 0 ในสไลด์มาจากตรงนี้',
    'เทียบ 3 ฐาน (ตรงกราฟในสไลด์): ทุกเส้นแตะ y = 1 ตรง x = <b>ฐานของตัวเอง</b> — log₂ แตะที่ 2, ln แตะที่ e ≈ 2.72, log₁₀ แตะที่ 10 · ฐานเล็กเส้นชันกว่า (ถึง 1 เร็วกว่า)',
    'ฐานที่วิชานี้ใช้: <b>ฐาน 10 → dB</b> (บทนี้ทั้งบท) · <b>ฐาน 2 → นับบิต</b> (สูตร Shannon สัปดาห์ 3) · ฐาน e ไว้เจอในแคลคูลัส — ตัวเส้นเหมือนกันหมด ต่างแค่ "ไม้บรรทัดวัดเลขชี้กำลัง" คนละอัน',
  ];
  createStepper(el, {
    steps: 6, stepDuration: 2400,
    label: (s) => ['b⁰=1 ทุกฐาน', 'log₁₀(10)=1', '×10 → +1', 'ทำไม x>0', 'เทียบ 3 ฐาน', 'ใช้ฐานไหนตอนไหน'][s],
    render(stage, step) {
      let extra = '';
      if (step === 0) {
        extra = path('b10') + path('b2', 0.35, 1.6) + path('be', 0.35, 1.6) + dot(1, 0, 'var(--intu)', '(1, 0) — ทุกเส้นผ่านจุดนี้');
      } else if (step === 1) {
        extra = path('b10') + dot(1, 0, 'var(--intu)', '') + dot(10, 1, 'var(--accent)', 'log₁₀(10) = 1')
          + `<line x1="${sx(10)}" y1="${sy(0)}" x2="${sx(10)}" y2="${sy(1)}" class="vzdash"/><line x1="${sx(1)}" y1="${sy(0)}" x2="${sx(10)}" y2="${sy(0)}" class="vzdash"/>`;
      } else if (step === 2) {
        extra = path('b10') + dot(1, 0, 'var(--intu)', 'log(1)=0') + dot(10, 1, 'var(--accent)', 'log(10)=1')
          + `<text x="${sx(11.5)}" y="${sy(2.15)}" text-anchor="end" class="viztxt" fill="var(--accent)">log(100)=2, log(1000)=3 … (นอกจอ)</text>
             <text x="${sx(11.5)}" y="${sy(2.15) + 16}" text-anchor="end" class="ticktxt">×10 ทุกครั้ง = ขึ้นบันได +1 ทีละขั้น</text>`;
      } else if (step === 3) {
        extra = path('b10') + dot(0.1, -1, '#f0696b', 'log(0.1) = −1', 14) + dot(0.5, log10(0.5), '#f0696b', '')
          + `<text x="${sx(0.4)}" y="${sy(-2.05)}" class="viztxt" fill="#f0696b">x → 0 : ดิ่งลง −∞</text>`;
      } else if (step === 4) {
        extra = path('b2') + path('be') + path('b10')
          + `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(1)}" y2="${sy(1)}" class="vzdash"/>`
          + dot(2, 1, '#f0696b', 'log₂: แตะ 1 ที่ x=2')
          + dot(Math.E, 1, 'var(--check)', 'ln: ที่ x=e≈2.72', 16)
          + dot(10, 1, 'var(--accent)', 'log₁₀: ที่ x=10');
      } else {
        extra = path('b2') + path('be', 0.4, 1.6) + path('b10')
          + `<text x="${sx(3.1)}" y="${sy(2.9)}" class="viztxt" fill="#f0696b">ฐาน 2 → จำนวนบิต (Shannon, W3)</text>
             <text x="${sx(5)}" y="${sy(0.45)}" class="viztxt" fill="var(--accent)">ฐาน 10 → dB (บทนี้)</text>`;
      }
      const legend = `<text x="${W - pad.r - 6}" y="${pad.t + 12}" text-anchor="end" class="ticktxt">y = log_b(x) ⟺ b^y = x</text>`;
      stage.innerHTML = `<svg class="svgviz" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟลอการิทึมสามฐาน">${axes()}${extra}${legend}</svg>
      <div class="stage-cap">${caps[step]}</div>`;
    },
  });
}

/* ════════════════════════════════════════════════════════════
   3 · Quiz ตัวอย่างสไลด์ 4 → เฉลยสไลด์ 5 (กดตอบ)
   ════════════════════════════════════════════════════════════ */
function logQuiz() {
  const el = document.getElementById('logquiz');
  if (!el) return;
  const qs = [
    { q: 'log_b(1) = ?', opts: ['0', '1', 'b'], ans: 0, why: 'b⁰ = 1 เสมอ ไม่ว่าฐานอะไร → เลขชี้กำลังที่ให้ 1 คือ 0' },
    { q: 'log_b(b) = ?', opts: ['0', '1', 'b'], ans: 1, why: 'b¹ = b → ยกกำลัง 1 ครั้งพอดี' },
    { q: 'log_b(b²) = ?', opts: ['b', '2', '2b'], ans: 1, why: 'b ยก 2 ครั้งได้ b² → คำตอบคือเลขชี้กำลัง 2 (หรือใช้สมบัติยกกำลัง: 2·log_b(b) = 2·1)' },
    { q: 'log_b(bˣ) = ?', opts: ['x', 'b', 'x·b'], ans: 0, why: 'ถามตรง ๆ ว่า "b ยกกี่ครั้งได้ bˣ" — ก็ x ครั้ง · log กับยกกำลังหักล้างกัน (การผกผัน)' },
    { q: 'b^(log_b x) = ?', opts: ['b', 'log x', 'x'], ans: 2, why: 'ผกผันอีกทิศ: ยกกำลังด้วย "เลขชี้กำลังที่ให้ x" ก็ย่อมได้ x กลับมา' },
    { q: 'log_a(b) = ?', opts: ['log_b(a)', '1 / log_b(a)', '−log_b(a)'], ans: 1, why: 'จากสูตรเปลี่ยนฐาน: log_a(b) = log_b(b)/log_b(a) = 1/log_b(a) — สลับฐานกับอาร์กิวเมนต์ = กลับเศษส่วน' },
  ];
  let done = 0;
  el.innerHTML = qs.map((x, i) => `
    <div class="lq" data-i="${i}">
      <span class="lq-q">${x.q}</span>
      <span class="lq-opts">${x.opts.map((o, j) => `<button class="qc" data-j="${j}">${o}</button>`).join('')}</span>
      <div class="lq-why" hidden></div>
    </div>`).join('') + `<div class="lq-score hint">ตอบครบ 6 ข้อ = ทวนสไลด์ 4–5 จบหนึ่งรอบ</div>`;
  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.qc');
    if (!btn) return;
    const box = btn.closest('.lq');
    const q = qs[+box.dataset.i];
    if (box.dataset.done) return;
    box.dataset.done = '1';
    box.querySelectorAll('.qc').forEach((b, j) => {
      if (j === q.ans) b.classList.add('good');
      else if (b === btn) b.classList.add('bad');
      b.disabled = true;
    });
    const why = box.querySelector('.lq-why');
    why.hidden = false;
    why.innerHTML = (+btn.dataset.j === q.ans ? '✓ ถูก! ' : '✗ ยังไม่ใช่ — คำตอบคือ <b>' + q.opts[q.ans] + '</b> · ') + q.why;
    done++;
    if (done === qs.length) el.querySelector('.lq-score').innerHTML = '🎉 ครบ 6 ข้อ — ค่าพวกนี้คือ "ค่าพิเศษที่ออกสอบบ่อย" ตามสไลด์ 4–5 เป๊ะ';
  });
}

/* ════════════════════════════════════════════════════════════
   4 · บันได dBW/dBm (สไลด์ 8) — slider + สองราง
   ════════════════════════════════════════════════════════════ */
function ladderViz() {
  const el = document.getElementById('viz-ladder');
  if (!el) return;
  el.innerHTML = `
    <div class="row" style="gap:10px;align-items:center">
      <input type="range" id="ldSlider" min="-6" max="9" step="1" value="0" style="flex:1" aria-label="เลือกกำลังงาน (เลขชี้กำลังของ 10)">
      <span class="btnrow" style="margin:0">
        <button class="sbtn" data-e="-3">1 mW</button>
        <button class="sbtn" data-e="0">1 W</button>
        <button class="sbtn" data-e="2">100 W</button>
        <button class="sbtn" data-e="9">1 GW</button>
      </span>
    </div>
    <div id="ldStage"></div>
    <div class="readout">
      <div class="cell"><div class="k">กำลังจริง</div><div class="v" id="ldW">1.00 W</div></div>
      <div class="cell"><div class="k">เขียนเต็ม ๆ</div><div class="v" id="ldZeros" style="font-size:1rem">1 W</div></div>
      <div class="cell"><div class="k">dBW (เทียบ 1 W)</div><div class="v" id="ldBW">0 dBW</div></div>
      <div class="cell"><div class="k">dBm (เทียบ 1 mW)</div><div class="v" id="ldBm">+30 dBm</div></div>
    </div>
    <p class="hint" style="margin:4px 0 0">เลื่อน 1 ขั้น = <b>×10</b> → ทั้งสองรางขยับ <b>+10 พร้อมกัน</b> และช่องว่างระหว่างราง = <b>30 ตลอด</b> (เพราะ 1 W = 1,000 mW = ต่าง 3 ศูนย์)</p>`;
  const slider = el.querySelector('#ldSlider');
  const stage = el.querySelector('#ldStage');
  const W = 680, H = 150, padL = 60, padR = 30;
  const sx = makeScale([-60, 90], [padL, W - padR]);   // แกน dBW
  function render() {
    const e = +slider.value;
    const dbw = e * 10, dbm = dbw + 30;
    let ticks = '';
    for (let v = -60; v <= 90; v += 10) {
      ticks += `<line x1="${sx(v)}" y1="40" x2="${sx(v)}" y2="48" class="vzline"/>
        <text x="${sx(v)}" y="32" text-anchor="middle" class="ticktxt">${v}</text>
        <line x1="${sx(v)}" y1="100" x2="${sx(v)}" y2="108" class="vzline"/>
        <text x="${sx(v)}" y="126" text-anchor="middle" class="ticktxt">${v + 30}</text>`;
    }
    stage.innerHTML = `<svg class="svgviz" viewBox="0 0 ${W} ${H}" role="img" aria-label="บันได dBW และ dBm">
      <text x="8" y="48" class="viztxt" fill="var(--accent)">dBW</text>
      <text x="8" y="108" class="viztxt" fill="var(--accent-warm)">dBm</text>
      <line x1="${padL}" y1="44" x2="${W - padR}" y2="44" class="vzaxis"/>
      <line x1="${padL}" y1="104" x2="${W - padR}" y2="104" class="vzaxis"/>
      ${ticks}
      <line x1="${sx(dbw)}" y1="44" x2="${sx(dbw)}" y2="104" stroke="var(--intu)" stroke-width="2" stroke-dasharray="4 3"/>
      <circle cx="${sx(dbw)}" cy="44" r="7" fill="var(--accent)"/>
      <circle cx="${sx(dbw)}" cy="104" r="7" fill="var(--accent-warm)"/>
      <text x="${sx(dbw)}" y="78" text-anchor="middle" class="viztxt" fill="var(--intu)">ห่าง 30</text>
    </svg>`;
    el.querySelector('#ldW').textContent = fmtW(Math.pow(10, e));
    let z = e >= 0 ? '1' + '0'.repeat(e) : '0.' + '0'.repeat(-e - 1) + '1';
    el.querySelector('#ldZeros').textContent = z + ' W';
    el.querySelector('#ldBW').textContent = (dbw > 0 ? '+' : '') + dbw + ' dBW';
    el.querySelector('#ldBm').textContent = (dbm > 0 ? '+' : '') + dbm + ' dBm';
  }
  slider.addEventListener('input', render);
  el.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-e]');
    if (b) { slider.value = b.dataset.e; render(); }
  });
  render();
}

/* ════════════════════════════════════════════════════════════
   5 · Link budget waterfall (สไลด์ 10–13) ⭐ ตัวหลักของบท
   ════════════════════════════════════════════════════════════ */
function waterfallViz() {
  const el = document.getElementById('viz-waterfall');
  if (!el) return;
  // ตัวเลขปัดตามสไลด์ 12–13 · ค่า W ตามสไลด์ 11 (ยืนยันด้วยโปรแกรมแล้ว)
  const stages = [
    { name: 'Tx', sub: 'ตัวส่ง 50 W', db: null, acc: 17, w: '50 W' },
    { name: 'สายส่ง', sub: 'เสีย 50% (×0.5)', db: -3, acc: 14, w: '25 W' },
    { name: 'เสาส่ง', sub: 'ขยาย ×20', db: 13, acc: 27, w: '500 W' },
    { name: 'อากาศ', sub: 'เสียทาง ×10⁻¹⁰', db: -100, acc: -73, w: '5×10⁻⁸ W' },
    { name: 'เสารับ', sub: 'ขยาย ×20', db: 13, acc: -60, w: '10⁻⁶ W' },
    { name: 'สายรับ', sub: 'เสีย 50% (×0.5)', db: -3, acc: -63, w: '5×10⁻⁷ W' },
  ];
  const caps = [
    'จุดตั้งต้น: ตัวส่ง 50 W → แปลงเป็น dB ก่อนออกเดินทาง: 10·log₁₀(50) = 16.99 ≈ <b>17 dBW</b> (สไลด์ปัดเป็นจำนวนเต็ม — คลาดจริงแค่ 0.24%) · ราง dBm เริ่มที่ 47 dBm (= 17 + 30)',
    'ด่าน 1 · สายส่ง: เสียครึ่งหนึ่ง (×0.5) → 10·log(0.5) = <b>−3 dB</b> → 17 − 3 = <b>14 dBW</b> (= 25 W จริง ๆ) — สังเกต: "หายครึ่ง" กลายเป็น "ลบสาม" เฉย ๆ',
    'ด่าน 2 · เสาอากาศส่ง: ขยาย ×20 → 10·log(20) = <b>+13 dB</b> → 14 + 13 = <b>27 dBW</b> (500 W) — เสาอากาศคือฮีโร่ที่อัดกำลังก่อนออกอากาศ',
    'ด่าน 3 · อากาศ: ระยะทางกินสัญญาณไป <b>หมื่นล้านเท่า</b> (×10⁻¹⁰) = <b>−100 dB</b> → 27 − 100 = <b>−73 dBW</b> (5×10⁻⁸ W) — ด่านโหดสุดของทุก link และคือเหตุผลที่ต้องมีวิชานี้',
    'ด่าน 4 · เสาอากาศรับ: ช้อนสัญญาณกลับ ×20 = <b>+13 dB</b> → −73 + 13 = <b>−60 dBW</b> (10⁻⁶ W = 1 µW)',
    'ด่าน 5 · สายรับ: เสียครึ่งอีกรอบ = <b>−3 dB</b> → −60 − 3 = <b>−63 dBW</b> = <b>0.5 µW</b> ← คำตอบสุดท้ายที่ Rx ได้จริง',
    'ครบทาง: 17 −3 +13 −100 +13 −3 = <b>−63 dBW</b> · ราง dBm: 47 → −33 dBm (ต่างกัน 30 ตลอดเส้นทาง ใช้เช็กคำตอบตัวเองได้!) · คิดแบบวัตต์ตรง ๆ ก็ได้ 5×10⁻⁷ W เท่ากัน — แต่ dB ใช้แค่บวกลบเลขหลักเดียว',
  ];
  const W = 700, H = 340, pad = { l: 52, r: 56, t: 20, b: 58 };
  const sy = makeScale([-115, 45], [H - pad.b, pad.t]);
  const colW = (W - pad.l - pad.r) / stages.length;
  const cx = (i) => pad.l + colW * i + colW / 2;
  createStepper(el, {
    steps: 7, stepDuration: 2400,
    label: (s) => s === 0 ? 'เริ่ม: Tx 50 W' : s <= 5 ? `ด่าน ${s}/5 · ${stages[s].name}` : 'สรุปทั้งเส้นทาง',
    render(stage, step, t) {
      const upto = Math.min(step, 5);
      let g = '';
      // แกน dBW ซ้าย + dBm ขวา
      for (let v = -100; v <= 40; v += 20) {
        g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/>
          <text x="${pad.l - 7}" y="${sy(v) + 3.5}" text-anchor="end" class="ticktxt" fill="var(--accent)">${v}</text>
          <text x="${W - pad.r + 7}" y="${sy(v) + 3.5}" class="ticktxt" fill="var(--accent-warm)">${v + 30}</text>`;
      }
      g += `<text x="${pad.l - 7}" y="${pad.t - 4}" text-anchor="end" class="ticktxt" fill="var(--accent)" font-weight="700">dBW</text>
        <text x="${W - pad.r + 7}" y="${pad.t - 4}" class="ticktxt" fill="var(--accent-warm)" font-weight="700">dBm</text>
        <line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(0)}" y2="${sy(0)}" class="vzaxis" stroke-dasharray="2 4"/>`;
      for (let i = 0; i <= upto; i++) {
        const st = stages[i];
        const prev = i > 0 ? stages[i - 1].acc : st.acc;
        // แอนิเมตแท่งของขั้นปัจจุบัน
        const acc = (i === step && i > 0) ? prev + (st.acc - prev) * easeInOut(t) : st.acc;
        const hot = i === upto;
        g += `<rect x="${cx(i) - colW * 0.33}" y="${Math.min(sy(acc), sy(0))}" width="${colW * 0.66}" height="${Math.abs(sy(acc) - sy(0))}"
                class="${acc >= 0 ? 'wf-pos' : 'wf-neg'}" stroke="${hot ? 'var(--intu)' : 'var(--line-2)'}" stroke-width="${hot ? 2 : 1}" rx="4"/>`;
        g += `<line x1="${cx(i) - colW * 0.33}" x2="${cx(i) + colW * 0.33}" y1="${sy(acc)}" y2="${sy(acc)}" stroke="${st.db == null ? 'var(--accent)' : st.db >= 0 ? 'var(--check)' : '#f0696b'}" stroke-width="3"/>`;
        if (i > 0) g += `<line x1="${cx(i - 1) + colW * 0.33}" x2="${cx(i) - colW * 0.33}" y1="${sy(prev)}" y2="${sy(prev)}" class="vzdash"/>`;
        // ค่า dB ของด่าน — ด่านตก/ขึ้นแรง (|dB|>20) วางกลางทาง, ที่เหลือวางบนเส้นประเชื่อม
        if (st.db != null && (i < step || t > 0.35)) {
          const up = st.db >= 0;
          const gapX = (cx(i - 1) + cx(i)) / 2;
          const yLbl = Math.abs(st.db) > 20 ? sy((prev + st.acc) / 2) + 4 : sy(prev) + (up ? -7 : 15);
          g += `<text x="${gapX}" y="${yLbl}" text-anchor="middle" class="viztxt" font-weight="700" fill="${up ? 'var(--check)' : '#f0696b'}">${up ? '+' : ''}${st.db}</text>`;
        }
        // สะสม — เหนือยอดแท่งบวก / ชิดก้นด้านในแท่งลบ
        const accTxt = Math.round(acc);
        g += `<text x="${cx(i)}" y="${sy(acc) - 8}" text-anchor="middle" class="viztxt" font-weight="${hot ? 700 : 400}" fill="${hot ? 'var(--intu)' : 'var(--text-dim)'}">${accTxt > 0 ? '+' : ''}${accTxt}</text>`;
        g += `<text x="${cx(i)}" y="${H - pad.b + 18}" text-anchor="middle" class="viztxt">${st.name}</text>
          <text x="${cx(i)}" y="${H - pad.b + 33}" text-anchor="middle" class="ticktxt">${st.sub}</text>
          <text x="${cx(i)}" y="${H - pad.b + 48}" text-anchor="middle" class="ticktxt" fill="var(--accent-ink)">${i <= upto && (i < step || t > 0.8 || i === 0) ? st.w : ''}</text>`;
      }
      if (step === 6) {
        g += `<text x="${(pad.l + W - pad.r) / 2}" y="${pad.t + 14}" text-anchor="middle" class="viztxt" fill="var(--intu)" font-weight="700">17 − 3 + 13 − 100 + 13 − 3 = −63 dBW = 0.5 µW ✓</text>`;
      }
      stage.innerHTML = `<svg class="svgviz" viewBox="0 0 ${W} ${H}" role="img" aria-label="link budget waterfall">${g}</svg>
      <div class="stage-cap">${caps[step]}</div>`;
    },
  });
}

/* ════════════════════════════════════════════════════════════
   6 · Walkthrough เดินมือทีละขั้น (3 วิธีตามสไลด์ 11–13)
   ════════════════════════════════════════════════════════════ */
function walkthroughs() {
  // วิธีที่ 1 — วัตต์ล้วน (สไลด์ 11)
  mountWalk('walk-w', [
    { title: 'ตั้งต้น: เขียนโซ่ตัวคูณให้ครบ', body: `P_rx = 50 × 0.5 × 20 × 10⁻¹⁰ × 20 × 0.5
       Tx   สาย  เสาส่ง  อากาศ   เสารับ สาย`, note: 'เสีย 50% = เหลือครึ่ง = ×0.5 · ขยาย 20 เท่า = ×20 — แปลงคำพูดโจทย์เป็นตัวคูณให้หมดก่อน' },
    { title: 'ผ่านสายส่ง: 50 × 0.5', body: `= 25 W        (เหลือครึ่ง)` },
    { title: 'ผ่านเสาส่ง: 25 × 20', body: `= 500 W       (เสาอัดขึ้น 20 เท่า — แรงกว่าตอนออกจากเครื่องอีก)` },
    { title: 'ผ่านอากาศ: 500 × 10⁻¹⁰', body: `= 5 × 10⁻⁸ W  (โดนกินไปหมื่นล้านเท่า!)`, note: 'ตรงนี้แหละที่เลขเริ่ม "โหด" — คูณเลขติดเลขชี้กำลังผิดนิดเดียวก็หลุดเป็นสิบเท่า' },
    { title: 'ผ่านเสารับ: 5×10⁻⁸ × 20', body: `= 1 × 10⁻⁶ W = 1 µW` },
    { title: 'ผ่านสายรับ: 10⁻⁶ × 0.5', body: `= 5 × 10⁻⁷ W = 0.5 µW  ← คำตอบ (หน่วยวัตต์ตามโจทย์)` },
  ]);
  // วิธีที่ 2 — dBW (สไลด์ 12)
  mountWalk('walk-dbw', [
    { title: 'แปลงจุดตั้งต้นเป็น dBW', body: `P_tx = 50 W → 10·log₁₀(50) = 16.9897 ≈ 17 dBW`, note: 'คิดในหัวได้: 50 = 100 ÷ 2 → +20 − 3 = 17 — ไม่ต้องกดเครื่องเลย (สไลด์ก็ปัดเป็น 17)' },
    { title: 'แปลงทุกด่านเป็น dB', body: `×0.5   → 10·log(0.5)   = −3 dB
×20    → 10·log(20)    = +13 dB   (= ×2×10 → 3+10)
×10⁻¹⁰ → 10·log(10⁻¹⁰) = −100 dB  (นับเลขชี้กำลัง ×10)`, note: 'สามค่านี้ใช้ซ้ำตลอดทั้งวิชา จำเป็นชุดเลย: ครึ่ง = −3 · ×20 = +13 · ×10⁻¹⁰ = −100' },
    { title: 'บวกลบยาวรวดเดียว', body: `P_rx = 17 − 3 + 13 − 100 + 13 − 3
     = −63 dBW`, note: 'เทียบวิธีที่ 1: จากคูณเลข 10⁻¹⁰ กลายเป็นบวกลบเลขสองหลัก — นี่คือเหตุผลที่วิศวกรทั้งวงการใช้ dB' },
    { title: 'แปลงกลับเป็นวัตต์ (โจทย์ขอหน่วย W)', body: `P_rx = 10^(−63/10) = 10^(−6.3)
     = 5.01 × 10⁻⁷ W ≈ 0.5 µW ✓ ตรงวิธีที่ 1`, note: 'คลาดจากค่าเป๊ะ 0.24% เพราะสไลด์ปัด 16.99→17 และ 13.01→13 — ถ้าใช้ทศนิยมเต็มจะได้ −63.0103 dBW = 0.5000 µW เป๊ะ' },
  ]);
  // วิธีที่ 3 — dBm (สไลด์ 13)
  mountWalk('walk-dbm', [
    { title: 'แปลงจุดตั้งต้นเป็น dBm', body: `50 W = 50,000 mW → 10·log₁₀(50000) = 46.99 ≈ 47 dBm
(หรือลัด: 17 dBW + 30 = 47 dBm)`, note: 'เปลี่ยนแค่จุดอ้างอิงตั้งต้น — ตัวบวกลบระหว่างทาง (dB) ชุดเดิมเป๊ะ' },
    { title: 'บวกลบด้วยชุด dB เดิม', body: `P_rx = 47 − 3 + 13 − 100 + 13 − 3
     = −33 dBm` },
    { title: 'เช็กความถูกด้วยกฎ +30', body: `−33 dBm − (−63 dBW) = 30 ✓
ถ้าลบกันแล้วไม่ได้ 30 = คำนวณพลาดแน่นอน ย้อนกลับไปดูใหม่`, note: 'สไลด์ทำครบ 3 วิธีเพื่อโชว์ว่าคำตอบเดียวกันหมด: −33 dBm = −63 dBW = 0.5 µW' },
  ]);
}

/* ════════════════════════════════════════════════════════════
   7 · Link Budget Calculator (widget ปรับค่าเองได้)
   ════════════════════════════════════════════════════════════ */
function lbCalc() {
  const el = document.getElementById('lb-calc');
  if (!el) return;
  const defs = [
    { name: 'สายส่ง', v: 0.5 },
    { name: 'เสาอากาศส่ง', v: 20 },
    { name: 'อากาศ (path loss)', v: 1e-10 },
    { name: 'เสาอากาศรับ', v: 20 },
    { name: 'สายรับ', v: 0.5 },
  ];
  el.innerHTML = `
    <div class="lbc-grid">
      <label>กำลังตัวส่ง Tx (W) <input type="number" id="lbcTx" value="50" step="any" min="0"></label>
      ${defs.map((d, i) => `<label>${d.name} (×เท่า) <input type="number" class="lbcR" data-i="${i}" value="${d.v}" step="any" min="0"></label>`).join('')}
    </div>
    <div style="overflow-x:auto"><table class="tbl" id="lbcTbl"></table></div>
    <div class="readout">
      <div class="cell"><div class="k">ปลายทาง (dBW)</div><div class="v" id="lbcDbw">—</div></div>
      <div class="cell"><div class="k">ปลายทาง (dBm)</div><div class="v" id="lbcDbm">—</div></div>
      <div class="cell"><div class="k">ปลายทาง (วัตต์)</div><div class="v" id="lbcW">—</div></div>
    </div>
    <p class="hint" style="margin:4px 0 0">ใส่ตัวเลขโจทย์ไหนก็ได้ — ใส่ &lt;1 = เสีย (dB ติดลบ), &gt;1 = ขยาย (dB บวก) · ลองแทนเลขแบบฝึกหัด/ข้อสอบเก่าแล้วเทียบกับที่คิดมือ</p>`;
  const txIn = el.querySelector('#lbcTx');
  const rIns = [...el.querySelectorAll('.lbcR')];
  function render() {
    const tx = parseFloat(txIn.value);
    const rs = rIns.map((x) => parseFloat(x.value));
    if (!(tx > 0) || rs.some((r) => !(r > 0))) {
      el.querySelector('#lbcTbl').innerHTML = '<tr><td>ใส่ตัวเลขให้ครบ (ต้องมากกว่า 0 — ratio ของกำลังติดลบไม่ได้)</td></tr>';
      return;
    }
    let accDb = dB(tx), accW = tx;
    let rows = `<tr><th>ด่าน</th><th>×เท่า</th><th>คิดเป็น dB</th><th>สะสม (dBW)</th><th>สะสม (W)</th></tr>
      <tr><td><b>Tx</b></td><td>${tx} W</td><td>10·log(${tx}) = ${dB(tx).toFixed(2)} dBW</td><td><b>${accDb.toFixed(2)}</b></td><td>${fmtW(accW)}</td></tr>`;
    defs.forEach((d, i) => {
      const g = dB(rs[i]);
      accDb += g; accW *= rs[i];
      rows += `<tr><td>${d.name}</td><td>×${rs[i]}</td><td style="color:${g >= 0 ? 'var(--check)' : '#f0696b'}">${g >= 0 ? '+' : ''}${g.toFixed(2)}</td><td><b>${accDb.toFixed(2)}</b></td><td>${fmtW(accW)}</td></tr>`;
    });
    el.querySelector('#lbcTbl').innerHTML = rows;
    el.querySelector('#lbcDbw').textContent = accDb.toFixed(2) + ' dBW';
    el.querySelector('#lbcDbm').textContent = (accDb + 30).toFixed(2) + ' dBm';
    el.querySelector('#lbcW').textContent = fmtW(accW);
  }
  el.addEventListener('input', render);
  render();
}

/* ════════════════════════════════════════════════════════════
   8 · เกมประกอบ dB ในหัว (×2=+3, ×10=+10)
   ════════════════════════════════════════════════════════════ */
function dbGame() {
  const el = document.getElementById('viz-game');
  if (!el) return;
  // เป้า: (label, dB ประมาณจากกฎลัด, dB เป๊ะ) — เป๊ะยืนยันด้วยโปรแกรมแล้ว
  const targets = [
    { label: '×20 (เสาอากาศโจทย์!)', db: 13, exact: 13.0103 },
    { label: '×4', db: 6, exact: 6.0206 },
    { label: '×50 (Tx โจทย์!)', db: 17, exact: 16.9897 },
    { label: '÷2 (สายเสียครึ่ง)', db: -3, exact: -3.0103 },
    { label: '×1000', db: 30, exact: 30 },
    { label: '×5', db: 7, exact: 6.9897 },
    { label: '×40', db: 16, exact: 16.0206 },
    { label: '×8', db: 9, exact: 9.0309 },
    { label: '÷100', db: -20, exact: -20 },
    { label: '×2000', db: 33, exact: 33.0103 },
  ];
  let ti = 0, acc = 0, moves = [], solved = 0;
  el.innerHTML = `
    <div class="game-top">
      <div class="cell"><div class="k">เป้าหมาย: แปลงเป็น dB</div><div class="v" id="gTarget">—</div></div>
      <div class="cell"><div class="k">ที่กดสะสม</div><div class="v" id="gAcc">0 dB</div></div>
      <div class="cell"><div class="k">สมการของคุณ</div><div class="v" id="gEq" style="font-size:.95rem">—</div></div>
    </div>
    <div class="btnrow">
      <button class="btn" data-g="3">×2 → +3</button>
      <button class="btn" data-g="10">×10 → +10</button>
      <button class="btn" data-g="-3">÷2 → −3</button>
      <button class="btn" data-g="-10">÷10 → −10</button>
      <button class="btn ghost" data-g="clear">ล้าง</button>
      <button class="btn ghost" data-g="skip">ข้ามข้อ</button>
    </div>
    <div id="gMsg" class="game-msg"></div>`;
  const $ = (s) => el.querySelector(s);
  function draw(msg = '') {
    $('#gTarget').textContent = targets[ti].label;
    $('#gAcc').textContent = (acc > 0 ? '+' : '') + acc + ' dB';
    $('#gEq').textContent = moves.length ? moves.map((m) => (m > 0 ? '+' + m : m)).join(' ') : '—';
    $('#gMsg').innerHTML = msg;
  }
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-g]');
    if (!b) return;
    const v = b.dataset.g;
    if (v === 'clear') { acc = 0; moves = []; draw(); return; }
    if (v === 'skip') { ti = (ti + 1) % targets.length; acc = 0; moves = []; draw(); return; }
    acc += +v; moves.push(+v);
    const tg = targets[ti];
    if (acc === tg.db) {
      solved++;
      const err = Math.abs(tg.db - tg.exact);
      draw(`🎉 <b>ถูก!</b> ${tg.label.split(' ')[0]} ≈ <b>${tg.db > 0 ? '+' : ''}${tg.db} dB</b> ด้วยการแตกเป็น ${moves.map((m) => m === 3 ? '×2' : m === 10 ? '×10' : m === -3 ? '÷2' : '÷10').join(' · ')}
        <br>ค่าเป๊ะจากเครื่อง: ${tg.exact} dB → กฎลัดคลาดแค่ ${err.toFixed(4)} dB (เพราะ ×2 จริง ๆ คือ 3.0103) · ทำได้แล้ว ${solved} ข้อ`);
      ti = (ti + 1) % targets.length; acc = 0; moves = [];
      setTimeout(() => draw($('#gMsg').innerHTML), 0);
    } else if (moves.length >= 8) {
      draw('ยาวไปแล้ว 😅 ลองล้างแล้วคิดใหม่ — ทริค: แตกตัวเลขเป็น 2 กับ 10 ก่อน เช่น 40 = 2×2×10');
    } else draw();
  });
  draw();
}

/* ════════════════════════════════════════════════════════════
   9 · dB ↔ ratio converter
   ════════════════════════════════════════════════════════════ */
function converter() {
  const el = document.getElementById('conv');
  if (!el) return;
  el.innerHTML = `
    <div class="row" style="gap:20px">
      <label style="flex:1;min-width:180px">dB <input type="number" id="cvDb" value="13" step="any"></label>
      <span style="font-size:1.4rem;align-self:end;padding-bottom:6px">⇄</span>
      <label style="flex:1;min-width:180px">อัตราส่วนกำลัง (×เท่า) <input type="number" id="cvR" value="19.9526" step="any" min="0"></label>
    </div>
    <div class="btnrow">
      <button class="sbtn" data-cv="-100">−100</button><button class="sbtn" data-cv="-30">−30</button>
      <button class="sbtn" data-cv="-3">−3</button><button class="sbtn" data-cv="0">0</button>
      <button class="sbtn" data-cv="3">+3</button><button class="sbtn" data-cv="10">+10</button>
      <button class="sbtn" data-cv="13">+13</button><button class="sbtn" data-cv="17">+17</button><button class="sbtn" data-cv="20">+20</button>
    </div>
    <p class="hint" id="cvNote" style="margin:4px 0 0"></p>`;
  const dbIn = el.querySelector('#cvDb'), rIn = el.querySelector('#cvR'), note = el.querySelector('#cvNote');
  function fromDb() {
    const d = parseFloat(dbIn.value);
    if (!isFinite(d)) return;
    rIn.value = +Math.pow(10, d / 10).toPrecision(6);
    describe(d);
  }
  function fromR() {
    const r = parseFloat(rIn.value);
    if (!(r > 0)) { note.textContent = 'อัตราส่วนกำลังต้องมากกว่า 0 (log ของศูนย์/ลบไม่มีนิยาม)'; return; }
    dbIn.value = +dB(r).toPrecision(6);
    describe(dB(r));
  }
  function describe(d) {
    const r = Math.pow(10, d / 10);
    note.innerHTML = `10^(${(d / 10).toFixed(3)}) = ${r.toPrecision(4)} เท่า → ${d >= 0 ? 'ขยาย' : 'เหลือ'} ${d >= 0 ? r.toPrecision(4) : (r * 100).toPrecision(3) + '%'} ${Math.abs(d % 10) === 3 ? '· สังเกต: ลงท้าย ±3 = มีตัว ×2 หรือ ÷2 ซ่อนอยู่' : ''}`;
  }
  dbIn.addEventListener('input', fromDb);
  rIn.addEventListener('input', fromR);
  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cv]');
    if (b) { dbIn.value = b.dataset.cv; fromDb(); }
  });
  fromDb();
}

/* ════════════════════════════════════════════════════════════
   10 · JS runner — โค้ดรันได้ในหน้า
   ════════════════════════════════════════════════════════════ */
function jsRunner() {
  const initial = `// link budget โจทย์หลัก (สไลด์ 10) — คำนวณครบ 3 วิธีให้ตรงกับที่คิดมือ
const dB = r => 10 * Math.log10(r);

// ── วิธีที่ 1: วัตต์ล้วน ──
const chain = [50, 0.5, 20, 1e-10, 20, 0.5];   // Tx, สาย, เสาส่ง, อากาศ, เสารับ, สาย
let watt = 1;
for (const r of chain) watt *= r;
console.log("วิธีวัตต์  :", watt, "W =", watt * 1e6, "µW");

// ── วิธีที่ 2: dBW (ปัดตามสไลด์) ──
const steps = [17, -3, 13, -100, 13, -3];
const dbw = steps.reduce((a, b) => a + b, 0);
console.log("วิธี dBW  :", dbw, "dBW →", 10 ** (dbw / 10), "W");

// ── วิธีที่ 3: dBm ──
const dbm = [47, -3, 13, -100, 13, -3].reduce((a, b) => a + b, 0);
console.log("วิธี dBm  :", dbm, "dBm  (เช็ก:", dbm, "-", dbw, "=", dbm - dbw, "ต้องได้ 30)");

// ── เทียบค่าเป๊ะไม่ปัด ──
const exact = dB(50) + dB(0.5) + dB(20) + dB(1e-10) + dB(20) + dB(0.5);
console.log("ค่าเป๊ะ   :", exact.toFixed(4), "dBW →", (10 ** (exact / 10)).toExponential(4), "W");`;
  mountRunner('runner', initial);
}

/* ════════ init ════════ */
scaleViz();
logCurveViz();
logQuiz();
ladderViz();
waterfallViz();
walkthroughs();
lbCalc();
dbGame();
converter();
jsRunner();
mountExam([10, 15, 20]);
