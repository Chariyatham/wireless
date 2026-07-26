// ===== Week 5 — เทคนิคการเข้ารหัสสัญญาณ (สไลด์ 1–66) =====
// สไลด์ 1–35 มีไฟล์เสียงคาบ 20 ก.ค. (กล่อง 🎙) · สไลด์ 36–66 ยังไม่ได้สอนในคาบ
// ตัวเลขทุกตัวยืนยันด้วยสคริปต์ node แล้ว
import { createStepper, mountWalk, mountRunner, mountExam, easeOut } from './stepper.js';

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const C5 = { main: '#f78c6c', sig: '#58c4dd', warn: '#ffd66b', ok: '#83c167', bad: '#e06c75', alt: '#c792ea' };
const log10 = Math.log10, log2 = (x) => Math.log(x) / Math.LN2;

// ---------------------------------------------------------------
// helper: วาดคลื่นในกรอบ (ใช้ร่วมกันหลาย stepper)
// ---------------------------------------------------------------
function wavePath(fn, x0, x1, ymid, amp, n = 400) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + (x1 - x0) * u;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + (ymid - amp * fn(u)).toFixed(2);
  }
  return d;
}

// ---------------------------------------------------------------
// 1) Stepper: สายโซ่ระบบสื่อสารไร้สาย (สไลด์ 2–3)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('chainStepper');
  if (!el) return;
  const W = 600, H = 260;
  const BLOCKS = [
    { t: 'แหล่งกำเนิด', s: '(Source)', d: 'สร้างข้อมูลที่จะส่ง — เสียง ตัวอักษรที่พิมพ์ ภาพ ฯลฯ' },
    { t: 'เข้ารหัสแหล่งกำเนิด', s: 'Source encoder', d: 'ตัดส่วนที่ฟุ่มเฟือยทิ้ง ให้ข้อมูลเล็กลงแต่ยังครบ (เช่น Vocoder: ตัวอักษร e ใช้บิตน้อยกว่า q)' },
    { t: 'เข้ารหัสช่องสัญญาณ', s: 'Channel encoder', d: 'เติมบิตเข้าไป เพื่อกู้คืนได้เมื่อช่องสัญญาณทำข้อมูลพัง (คนละเรื่องกับ source encoder!)' },
    { t: 'มอดูเลต', s: 'Modulator', d: 'แปลงบิตให้เป็นสัญญาณจริงที่ส่งเข้าช่องสัญญาณได้ — ตัวเอกของบทนี้' },
    { t: 'สายอากาศ', s: 'Antenna', d: 'แปลงสัญญาณในสายเป็นคลื่นแม่เหล็กไฟฟ้าในอากาศ (Week 4 ทั้งบท!)' },
    { t: 'ช่องสัญญาณ', s: 'Channel', d: 'พาสัญญาณไป — และตามปกติจะทำให้สัญญาณผิดรูป (noise/fading จาก Week 4)' },
    { t: 'ดีมอดูเลต + ถอดรหัส', s: 'Demod + decoder', d: 'ทำย้อนกลับทุกขั้นของฝั่งส่ง ตามลำดับกลับหลัง' },
    { t: 'ตัวรับ', s: 'Receiver', d: 'ได้ข้อมูลเดิมกลับคืน — "ตัวรับทำย้อนกลับจากที่ตัวส่งทำ"' },
  ];
  createStepper(el, {
    steps: BLOCKS.length, stepDuration: 1500,
    label: (s) => `ขั้น ${s + 1} · ${BLOCKS[s].t} — ${BLOCKS[s].d}`,
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc'), card = cssVar('--card', '#fff');
      let g = '';
      const bw = 66, bh = 46, gap = 8;
      BLOCKS.forEach((b, i) => {
        const row = i < 4 ? 0 : 1;
        const idx = i < 4 ? i : i - 4;
        const x = 40 + idx * (bw + gap + 32), y = row === 0 ? 40 : 150;
        const on = i <= step;
        const fill = on ? (i === step ? C5.main : C5.sig) : line;
        g += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${fill}${on ? '' : '55'}"
                 stroke="${on ? fill : line}" stroke-width="${i === step ? 2.5 : 1}"/>
              <text x="${x + bw / 2}" y="${y + 20}" text-anchor="middle" font-size="9.5" fill="${on ? '#111' : ink}" font-weight="700">${b.t.length > 12 ? b.t.slice(0, 11) + '…' : b.t}</text>
              <text x="${x + bw / 2}" y="${y + 34}" text-anchor="middle" font-size="8" fill="${on ? '#111' : ink}">${b.s}</text>`;
        if (idx < 3) {
          const ax = x + bw, ay = y + bh / 2;
          g += `<line x1="${ax + 2}" y1="${ay}" x2="${ax + 36}" y2="${ay}" stroke="${i < step ? C5.sig : line}" stroke-width="2"/>
                <polygon points="${ax + 36},${ay} ${ax + 30},${ay - 4} ${ax + 30},${ay + 4}" fill="${i < step ? C5.sig : line}"/>`;
        }
      });
      // ลูกศรลงแถวสอง
      g += `<path d="M ${40 + 3 * (bw + gap + 32) + bw / 2},${40 + bh} L ${40 + 3 * (bw + gap + 32) + bw / 2},${118} L ${40 + bw / 2},${118} L ${40 + bw / 2},${150}"
               fill="none" stroke="${step >= 4 ? C5.sig : line}" stroke-width="2"/>
            <polygon points="${40 + bw / 2},${150} ${40 + bw / 2 - 4},${144} ${40 + bw / 2 + 4},${144}" fill="${step >= 4 ? C5.sig : line}"/>`;
      // การ์ดคำอธิบาย
      g += `<rect x="24" y="212" width="${W - 48}" height="40" rx="8" fill="${card}" stroke="${C5.main}"/>
            <text x="36" y="230" font-size="11" fill="${C5.main}" font-weight="700">${BLOCKS[step].t} · ${BLOCKS[step].s}</text>
            <text x="36" y="245" font-size="10.5" fill="${ink}">${BLOCKS[step].d.length > 88 ? BLOCKS[step].d.slice(0, 87) + '…' : BLOCKS[step].d}</text>`;
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:290px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 2) Stepper: ASK / FSK / PSK / DPSK จากบิตชุดเดียวกัน (สไลด์ 12–23)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('modStepper');
  if (!el) return;
  const W = 600, H = 300;
  const BITS = [1, 0, 1, 1, 0, 0, 1, 0];
  const x0 = 50, x1 = W - 20, ymid = 150, amp = 42;
  const slot = (x1 - x0) / BITS.length;
  const LBL = [
    'ขั้น 1 · ข้อมูลดิจิทัลที่จะส่ง: 1 0 1 1 0 0 1 0 — แต่สื่อไร้สายส่ง "สี่เหลี่ยม" แบบนี้ไม่ได้ ต้องฝากไปกับคลื่นพาห์',
    'ขั้น 2 · ASK — เล่นที่ "ความสูง": บิต 1 = มีคลื่นพาห์ (แอมพลิจูด A) · บิต 0 = ไม่มีคลื่นเลย',
    'ขั้น 3 · BFSK — เล่นที่ "ความถี่": บิต 1 ใช้ f₁ · บิต 0 ใช้ f₂ (ห่างจาก f_c เท่ากันคนละทาง) แอมพลิจูดคงที่ตลอด',
    'ขั้น 4 · BPSK — เล่นที่ "มุมเฟส": 2 เฟสห่างกัน 180° (1 = cos, 0 = −cos) แอมพลิจูดและความถี่คงที่',
    'ขั้น 5 · DPSK — ดูที่ "การเปลี่ยน": บิต 0 = เฟสเหมือนตัวก่อนหน้า · บิต 1 = เฟสตรงข้ามกับตัวก่อนหน้า',
    'ขั้น 6 · เทียบ 3 แบบ: ทั้งหมดส่งบิตชุดเดียวกัน ต่างกันแค่ "เล่นพารามิเตอร์ตัวไหนของคลื่น"',
  ];
  const carrier = (u, f) => Math.cos(2 * Math.PI * f * u);
  function drawBits(ink, yTop) {
    let g = '', hi = 20;
    BITS.forEach((b, i) => {
      const xa = x0 + i * slot, y = b ? yTop - hi : yTop;
      g += `<line x1="${xa}" y1="${y}" x2="${xa + slot}" y2="${y}" stroke="${C5.warn}" stroke-width="2.5"/>
            <line x1="${xa}" y1="${yTop}" x2="${xa}" y2="${yTop - hi}" stroke="${C5.warn}" stroke-width="1" opacity=".6"/>
            <text x="${xa + slot / 2}" y="${yTop + 15}" text-anchor="middle" font-size="10.5" fill="${ink}">${b}</text>`;
    });
    return g;
  }
  function scheme(kind, y, prog) {
    const A = amp * 0.62;
    let g = '', prevPhase = 0, marks = '';
    // เส้นอ้างอิงคลื่นพาห์จาง ๆ (ให้เห็นว่า "กลับเฟส" คือกลับหัวจากเส้นนี้)
    if (kind === 'psk' || kind === 'dpsk') {
      g += `<path d="${wavePath((u) => carrier(u * BITS.length, 3), x0, x1, y, A, 480)}"
               fill="none" stroke="${C5.alt}" stroke-width="1" stroke-dasharray="3 3" opacity=".5"/>`;
    }
    BITS.forEach((b, i) => {
      const xa = x0 + i * slot, xb = xa + slot;
      if (i / BITS.length > prog) return;
      let fn, flipped = false;
      if (kind === 'ask') fn = (u) => (b ? carrier(u, 3) : 0);
      else if (kind === 'fsk') fn = (u) => carrier(u, b ? 4 : 2);
      else if (kind === 'psk') { flipped = !b; fn = (u) => (b ? 1 : -1) * carrier(u, 3); }
      else { // dpsk
        if (b === 1) prevPhase = 1 - prevPhase;
        const ph = prevPhase;
        flipped = !!ph;
        fn = (u) => (ph ? -1 : 1) * carrier(u, 3);
      }
      g += `<path d="${wavePath(fn, xa, xb, y, A, 70)}" fill="none" stroke="${C5.sig}" stroke-width="2"/>`;
      if (flipped) marks += `<rect x="${xa}" y="${y - A - 4}" width="${slot}" height="${2 * A + 8}" fill="${C5.bad}18"/>
        <text x="${xa + slot / 2}" y="${y - A - 8}" text-anchor="middle" font-size="9" fill="${C5.bad}">180°</text>`;
      g += `<line x1="${xb}" y1="${y - 32}" x2="${xb}" y2="${y + 32}" stroke="${cssVar('--line-2', '#ccc')}" stroke-dasharray="2 3"/>`;
    });
    return marks + g;
  }
  createStepper(el, {
    steps: 6, stepDuration: 1700,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b');
      let g = '';
      if (step === 0) {
        g += drawBits(ink, 150);
        g += `<text x="${x0}" y="80" font-size="12" fill="${ink}">ข้อมูลดิจิทัล (digital data)</text>`;
      } else if (step === 5) {
        const rows = [['ASK — แอมพลิจูด', 'ask', 60], ['BFSK — ความถี่', 'fsk', 145], ['BPSK — เฟส', 'psk', 230]];
        g += drawBits(ink, 32);
        rows.forEach(([nm, k, y]) => {
          g += `<text x="4" y="${y - 34}" font-size="10.5" fill="${C5.main}" font-weight="700">${nm}</text>`;
          g += scheme(k, y, 1);
        });
      } else {
        const kind = ['', 'ask', 'fsk', 'psk', 'dpsk'][step];
        const names = { ask: 'ASK — Amplitude Shift Keying', fsk: 'BFSK — Binary Frequency Shift Keying', psk: 'BPSK — Binary Phase Shift Keying', dpsk: 'DPSK — Differential PSK' };
        g += drawBits(ink, 60);
        g += `<text x="${x0}" y="${100}" font-size="12" fill="${C5.main}" font-weight="700">${names[kind]}</text>`;
        g += scheme(kind, 180, 0.15 + 0.85 * easeOut(t));
        if (kind === 'dpsk') {
          let pp = 0;
          BITS.forEach((b, i) => {
            if (b === 1) pp = 1 - pp;
            g += `<text x="${x0 + i * slot + slot / 2}" y="${240}" text-anchor="middle" font-size="9.5" fill="${b ? C5.bad : C5.ok}">${b ? 'สลับ' : 'คงเดิม'}</text>`;
          });
        }
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:320px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 3) Stepper: MFSK — จาก 2 ความถี่เป็น M ความถี่ (สไลด์ 17–21)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('mfskStepper');
  if (!el) return;
  const W = 600, H = 290;
  const fc = 250, fd = 25, M = 8, L = log2(M);
  const freqs = []; for (let i = 1; i <= M; i++) freqs.push(fc + (2 * i - 1 - M) * fd);
  const LBL = [
    'ขั้น 1 · BFSK มีแค่ 2 ความถี่ → 1 สัญลักษณ์ = 1 บิต (ช้า)',
    'ขั้น 2 · เพิ่มเป็น M ความถี่ → 1 สัญลักษณ์แทนได้ L = log₂M บิต · ที่ M = 8 → 1 สัญลักษณ์ = 3 บิต',
    'ขั้น 3 · หาตำแหน่งแต่ละความถี่: fᵢ = f_c + (2i − 1 − M)·f_d  → กระจายรอบ f_c เท่า ๆ กัน',
    'ขั้น 4 · โจทย์สไลด์ 21 (f_c = 250 kHz, f_d = 25 kHz, M = 8): ได้ 75, 125, 175, 225, 275, 325, 375, 425 kHz',
    'ขั้น 5 · แบนด์วิดท์ที่ต้องใช้ = 2M·f_d = 2(8)(25) = 400 kHz — จ่ายแบนด์วิดท์เพิ่มเพื่อซื้อความเร็ว',
  ];
  createStepper(el, {
    steps: 5, stepDuration: 1600,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const axY = 200, xL = 50, xR = W - 30;
      const fmin = 50, fmax = 450;
      const sx = (f) => xL + (f - fmin) / (fmax - fmin) * (xR - xL);
      let g = `<line x1="${xL}" y1="${axY}" x2="${xR}" y2="${axY}" stroke="${ink}" stroke-width="1.5"/>
               <text x="${xR}" y="${axY + 80}" text-anchor="end" font-size="10.5" fill="${ink}">ความถี่ (kHz) →</text>
               <line x1="${sx(fc)}" y1="${axY - 120}" x2="${sx(fc)}" y2="${axY + 6}" stroke="${C5.alt}" stroke-dasharray="4 3"/>
               <text x="${sx(fc)}" y="${axY - 126}" text-anchor="middle" font-size="10.5" fill="${C5.alt}" font-weight="700">f_c = 250</text>`;
      const show = step === 0 ? 2 : Math.min(M, step === 1 ? Math.round(2 + 6 * easeOut(t)) : M);
      const list = step === 0 ? [fc - fd, fc + fd] : freqs.slice(0, show);
      list.forEach((f, i) => {
        const x = sx(f), h = 70 + (i % 2) * 14;
        g += `<line x1="${x}" y1="${axY}" x2="${x}" y2="${axY - h}" stroke="${C5.sig}" stroke-width="3"/>
              <circle cx="${x}" cy="${axY - h}" r="4" fill="${C5.sig}"/>
              <text x="${x}" y="${axY - h - 8}" text-anchor="middle" font-size="9.5" fill="${C5.sig}">${step >= 3 ? f : 'f' + (i + 1)}</text>
              <text x="${x}" y="${axY + 16}" text-anchor="middle" font-size="9" fill="${ink}">${step >= 3 ? '' : f}</text>`;
        if (step >= 1) g += `<text x="${x}" y="${axY + 30}" text-anchor="middle" font-size="9" fill="${C5.ok}">${(i).toString(2).padStart(3, '0')}</text>`;
      });
      if (step >= 2) g += `<text x="${xL}" y="40" font-size="12" fill="${ink}" font-family="var(--mono)">fᵢ = f_c + (2i − 1 − M)·f_d</text>`;
      if (step === 3) g += `<text x="${xL}" y="62" font-size="11.5" fill="${C5.main}" font-family="var(--mono)">f₁ = 250 + (2−1−8)(25) = 250 − 175 = 75 kHz</text>`;
      if (step >= 4) {
        g += `<line x1="${sx(freqs[0]) - 12}" y1="${axY + 46}" x2="${sx(freqs[M - 1]) + 12}" y2="${axY + 46}" stroke="${C5.bad}" stroke-width="2"/>
              <text x="${(sx(freqs[0]) + sx(freqs[M - 1])) / 2}" y="${axY + 62}" text-anchor="middle" font-size="11.5" fill="${C5.bad}" font-weight="700">BW = 2M·f_d = 400 kHz</text>`;
        g += `<text x="${xL}" y="62" font-size="11.5" fill="${C5.ok}" font-family="var(--mono)">L = log₂8 = 3 บิต/สัญลักษณ์ · Ts = L·T</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:310px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 4) Lab: Constellation diagram — เลือกวิธี แล้วดูจุด/บิตต่อสัญลักษณ์/baud rate
// ---------------------------------------------------------------
(function () {
  const sel = document.getElementById('qamSel');
  if (!sel) return;
  const rS = document.getElementById('qamR'), out = document.getElementById('qamOut'), cv = document.getElementById('qamCanvas');
  const SCHEMES = {
    // ลำดับจุด = ค่าบิต (index i → ป้าย i ฐานสอง) — BPSK: 0 = −cos (180°), 1 = cos (0°) ตามสไลด์ 22
    bpsk: { name: 'BPSK', M: 2, pts: [[-1, 0], [1, 0]] },
    // QPSK: ป้ายบิตตามสไลด์ 25 — 11@45° · 01@135° · 00@225° · 10@315°
    qpsk: { name: 'QPSK', M: 4, pts: [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [a / Math.SQRT2, b / Math.SQRT2]) },
    psk8: { name: '8PSK', M: 8, pts: Array.from({ length: 8 }, (_, i) => [Math.cos(i * Math.PI / 4), Math.sin(i * Math.PI / 4)]) },
    qam16: { name: '16QAM', M: 16, pts: [] },
    qam32: { name: '32QAM', M: 32, pts: [] },
    qam64: { name: '64QAM', M: 64, pts: [] },
  };
  // สร้างกริด QAM
  for (const [k, n] of [['qam16', 4], ['qam64', 8]]) {
    const p = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) p.push([(2 * i - n + 1) / (n - 1), (2 * j - n + 1) / (n - 1)]);
    SCHEMES[k].pts = p;
  }
  { // 32QAM = กริด 6×6 ตัดมุมทั้งสี่ (cross constellation)
    const p = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      const corner = (i === 0 || i === 5) && (j === 0 || j === 5);
      if (!corner) p.push([(2 * i - 5) / 5, (2 * j - 5) / 5]);
    }
    SCHEMES.qam32.pts = p;
  }
  function draw() {
    const s = SCHEMES[sel.value];
    const rExp = parseFloat(rS.value), R = Math.pow(10, rExp);
    document.getElementById('lblQamR').textContent = R >= 1e6 ? (R / 1e6).toFixed(2) + ' Mbps' : (R / 1e3).toFixed(0) + ' kbps';
    const L = log2(s.M), D = R / L;
    const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
    const S = 240, c = S / 2, rad = S / 2 - 26;
    let g = `<line x1="8" y1="${c}" x2="${S - 8}" y2="${c}" stroke="${line}"/>
             <line x1="${c}" y1="8" x2="${c}" y2="${S - 8}" stroke="${line}"/>
             <text x="${S - 10}" y="${c - 6}" text-anchor="end" font-size="10" fill="${ink}">I</text>
             <text x="${c + 6}" y="16" font-size="10" fill="${ink}">Q</text>`;
    if (s.name.includes('PSK')) g += `<circle cx="${c}" cy="${c}" r="${rad}" fill="none" stroke="${line}" stroke-dasharray="3 4"/>`;
    s.pts.forEach(([a, b], i) => {
      const x = c + a * rad, y = c - b * rad;
      g += `<circle cx="${x}" cy="${y}" r="4.5" fill="${C5.main}"/>`;
      if (s.M <= 8) g += `<text x="${x}" y="${y - 9}" text-anchor="middle" font-size="9.5" fill="${C5.sig}">${i.toString(2).padStart(L, '0')}</text>`;
    });
    cv.innerHTML = `<svg viewBox="0 0 ${S} ${S}" width="240" height="240">${g}</svg>`;
    out.innerHTML = `<b>${s.name}</b> · M = ${s.M} จุด → L = log₂M = <b>${L}</b> บิต/สัญลักษณ์
      <br/>D = R/L = ${R.toExponential(2)} ÷ ${L} = <b>${D >= 1e6 ? (D / 1e6).toFixed(3) + ' Msymbol/s' : (D / 1e3).toFixed(1) + ' ksymbol/s'}</b> (baud)
      <br/><span class="hint">baud rate ${L === 1 ? '= ' : '< '}bit rate เสมอ — ยิ่ง M มาก ยิ่งส่งบิตได้เยอะต่อสัญลักษณ์ แต่จุดยิ่งเบียดกัน = ทน noise น้อยลง</span>`;
  }
  sel.addEventListener('change', draw);
  rS.addEventListener('input', draw);
  draw();
})();

// ---------------------------------------------------------------
// 5) Lab: bandwidth efficiency จาก SNR กับ Eb/N0 (สไลด์ 32)
// ---------------------------------------------------------------
(function () {
  const sS = document.getElementById('bweS');
  if (!sS) return;
  const eS = document.getElementById('bweE'), out = document.getElementById('bweOut');
  function draw() {
    const snr = parseFloat(sS.value), eb = parseFloat(eS.value);
    document.getElementById('lblBweS').textContent = snr.toFixed(1);
    document.getElementById('lblBweE').textContent = eb.toFixed(1);
    const dbv = snr - eb, lin = Math.pow(10, dbv / 10);
    out.innerHTML = `10·log(R/B_T) = SNR(dB) − (Eb/N₀)(dB) = ${snr.toFixed(1)} − ${eb.toFixed(1)} = <b>${dbv.toFixed(2)} dB</b>
      <br/>R/B_T = 10^(${(dbv / 10).toFixed(3)}) = <b style="font-size:1.15em">${lin.toFixed(3)} bps/Hz</b>
      <br/><span class="hint">${lin >= 1 ? 'ได้มากกว่า 1 bps ต่อทุก 1 Hz — คุ้มแบนด์วิดท์' : 'ได้ไม่ถึง 1 bps ต่อ 1 Hz — เปลืองแบนด์วิดท์ (ทรง ASK/FSK)'}</span>`;
  }
  [sS, eS].forEach((s) => s.addEventListener('input', draw));
  draw();
})();

// ---------------------------------------------------------------
// 6) Stepper: AM / FM / PM จากสัญญาณเดียวกัน (สไลด์ 37–47)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('angleStepper');
  if (!el) return;
  const W = 600, H = 300;
  const x0 = 50, x1 = W - 20;
  const LBL = [
    'ขั้น 1 · สัญญาณข้อมูลแอนะล็อก x(t) (เสียงพูด/เพลง) กับคลื่นพาห์ความถี่สูงคงที่',
    'ขั้น 2 · AM — เอา x(t) ไปคุม "ความสูง" ของคลื่นพาห์ · s(t) = [1 + nₐ·x(t)]·cos(2πf_c t) · B_T = 2B',
    'ขั้น 3 · FM — เอา x(t) ไปคุม "ความถี่" (ชิดกันเมื่อ x สูง ห่างเมื่อ x ต่ำ) แอมพลิจูดคงที่',
    'ขั้น 4 · PM — เอา x(t) ไปคุม "มุมเฟส" · FM/PM รวมกันเรียก angle modulation — กินแบนด์วิดท์กว่า AM',
    'ขั้น 5 · กฎของคาร์สัน: B_T = 2(β + 1)B — ยิ่งเบี่ยงความถี่มาก (β สูง) ยิ่งกินแบนด์กว้าง แลกกับทนรบกวนดีขึ้น',
  ];
  const msg = (u) => Math.sin(2 * Math.PI * 1.5 * u);
  createStepper(el, {
    steps: 5, stepDuration: 1600,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b');
      let g = '';
      const lab = (y, txt, c) => `<text x="6" y="${y}" font-size="10.5" fill="${c}" font-weight="700">${txt}</text>`;
      g += lab(46, 'ข้อมูล x(t)', C5.warn) + `<path d="${wavePath(msg, x0, x1, 60, 26)}" fill="none" stroke="${C5.warn}" stroke-width="2.2"/>`;
      if (step === 0) {
        g += lab(146, 'คลื่นพาห์', C5.alt) + `<path d="${wavePath((u) => Math.cos(2 * Math.PI * 18 * u), x0, x1, 160, 30)}" fill="none" stroke="${C5.alt}" stroke-width="1.6"/>`;
        g += `<text x="${W / 2}" y="250" text-anchor="middle" font-size="12" fill="${ink}">มอดูเลต = ให้ x(t) ไป "ควบคุม" อย่างใดอย่างหนึ่งของคลื่นพาห์</text>`;
      } else {
        const prog = 0.15 + 0.85 * easeOut(t);
        const cut = x0 + (x1 - x0) * (step >= 4 ? 1 : prog);
        if (step === 1 || step >= 4) {
          const f = (u) => (1 + 0.75 * msg(u)) * Math.cos(2 * Math.PI * 18 * u) / 1.75;
          g += lab(146, 'AM (แอมพลิจูด)', C5.sig) + `<path d="${wavePath(f, x0, step === 1 ? cut : x1, 160, 42)}" fill="none" stroke="${C5.sig}" stroke-width="1.6"/>`;
          g += `<path d="${wavePath((u) => (1 + 0.75 * msg(u)) / 1.75, x0, step === 1 ? cut : x1, 160, 42)}" fill="none" stroke="${C5.warn}" stroke-width="1" stroke-dasharray="3 3"/>`;
        }
        if (step === 2) {
          const f = (u) => Math.cos(2 * Math.PI * (18 * u + 0.55 * (-Math.cos(2 * Math.PI * 1.5 * u) / (2 * Math.PI * 1.5))));
          g += lab(146, 'FM (ความถี่)', C5.ok) + `<path d="${wavePath(f, x0, cut, 160, 36)}" fill="none" stroke="${C5.ok}" stroke-width="1.6"/>`;
        }
        if (step === 3) {
          const f = (u) => Math.cos(2 * Math.PI * 18 * u + 1.6 * msg(u));
          g += lab(146, 'PM (มุมเฟส)', C5.main) + `<path d="${wavePath(f, x0, cut, 160, 36)}" fill="none" stroke="${C5.main}" stroke-width="1.6"/>`;
        }
        if (step >= 4) {
          g += `<text x="${x0}" y="230" font-size="12.5" fill="${ink}" font-family="var(--mono)">กฎของคาร์สัน:  B_T = 2(β + 1)B</text>
                <text x="${x0}" y="252" font-size="11.5" fill="${ink}" font-family="var(--mono)">β: PM = n_p·A_m · FM = ΔF/B = n_f·A_m/(2πB) · FM: B_T = 2ΔF + 2B</text>
                <text x="${x0}" y="276" font-size="11.5" fill="${C5.bad}">AM: B_T = 2B · SSB: B_T = B (ครึ่งเดียว ประหยัดกำลังด้วย แต่ซิงค์ยาก)</text>`;
        }
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:320px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 7) Stepper: PCM — สุ่ม → ควอนไทซ์ → เข้ารหัส (สไลด์ 48–52)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('pcmStepper');
  if (!el) return;
  const W = 600, H = 300;
  const x0 = 60, x1 = W - 30, yb = 220, hgt = 160;
  const NS = 12, LV = 8;                                   // 12 จุดสุ่ม, 8 ระดับ (3 บิต)
  const sig = (u) => 0.5 + 0.42 * Math.sin(2 * Math.PI * 1.15 * u + 0.6) + 0.08 * Math.sin(2 * Math.PI * 3.1 * u);
  const LBL = [
    'ขั้น 1 · สัญญาณแอนะล็อกต้นฉบับ (เช่น เสียงพูด) — ค่าต่อเนื่อง ไม่มีขั้น',
    'ขั้น 2 · สุ่มตัวอย่าง (sampling) — วัดค่าเป็นจังหวะ ได้เป็นพัลส์ PAM (ยังเป็นค่าต่อเนื่องอยู่)',
    'ขั้น 3 · ควอนไทซ์ (quantize) — ปัดแต่ละพัลส์เข้าระดับที่ใกล้ที่สุด → เกิด "ความคลาดเคลื่อน" = quantizing noise',
    'ขั้น 4 · เข้ารหัส — แต่ละระดับกลายเป็นบล็อก n บิต (ที่นี่ 8 ระดับ = 3 บิต) ได้บิตสตรีมพร้อมส่ง',
    'ขั้น 5 · คุณภาพ: SNR(dB) = 6.02n + 1.76 — เพิ่ม 1 บิต ได้ SNR ดีขึ้น ~6 dB (ระดับ ×2 → กำลัง noise ÷4)',
  ];
  createStepper(el, {
    steps: 5, stepDuration: 1700,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      let g = '';
      // เส้นระดับควอนไทซ์
      if (step >= 2) {
        for (let k = 0; k < LV; k++) {
          const y = yb - (k + 0.5) / LV * hgt;
          g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${line}" stroke-dasharray="2 4"/>
                <text x="${x0 - 6}" y="${y + 3.5}" text-anchor="end" font-size="8.5" fill="${ink}">${k.toString(2).padStart(3, '0')}</text>`;
        }
      }
      // สัญญาณต้นฉบับ
      const prog = step === 0 ? (0.2 + 0.8 * easeOut(t)) : 1;
      g += `<path d="${wavePath((u) => sig(u) - 0.5, x0, x0 + (x1 - x0) * prog, yb - hgt / 2, hgt)}" fill="none" stroke="${C5.warn}" stroke-width="2.2"/>`;
      // จุดสุ่ม
      if (step >= 1) {
        const n = step === 1 ? Math.round(NS * (0.2 + 0.8 * easeOut(t))) : NS;
        for (let i = 0; i < n; i++) {
          const u = (i + 0.5) / NS, x = x0 + (x1 - x0) * u;
          const v = sig(u);
          const q = Math.min(LV - 1, Math.floor(v * LV));
          const yv = yb - v * hgt, yq = yb - (q + 0.5) / LV * hgt;
          const useQ = step >= 2;
          g += `<line x1="${x}" y1="${yb}" x2="${x}" y2="${useQ ? yq : yv}" stroke="${useQ ? C5.ok : C5.sig}" stroke-width="3"/>
                <circle cx="${x}" cy="${useQ ? yq : yv}" r="3.5" fill="${useQ ? C5.ok : C5.sig}"/>`;
          if (step >= 2) g += `<line x1="${x}" y1="${yv}" x2="${x}" y2="${yq}" stroke="${C5.bad}" stroke-width="2"/>`;
          if (step >= 3) g += `<text x="${x}" y="${yb + 16}" text-anchor="middle" font-size="8" fill="${C5.main}" font-family="var(--mono)">${q.toString(2).padStart(3, '0')}</text>`;
        }
      }
      g += `<line x1="${x0}" y1="${yb}" x2="${x1}" y2="${yb}" stroke="${ink}"/>`;
      if (step === 2) g += `<text x="${x1}" y="${yb + 34}" text-anchor="end" font-size="10.5" fill="${C5.bad}">เส้นแดง = ความคลาดเคลื่อนจากการปัด (quantizing noise)</text>`;
      if (step >= 3) g += `<text x="${x0}" y="${yb + 40}" font-size="11" fill="${C5.main}" font-family="var(--mono)">บิตสตรีมที่ได้ = ต่อบล็อก 3 บิตเรียงกันไป → ส่งด้วย NRZ-L หรือรหัสอื่นได้</text>`;
      if (step >= 4) g += `<text x="${x0}" y="${yb + 62}" font-size="12.5" fill="${C5.ok}" font-family="var(--mono)">SNR(dB) = 6.02n + 1.76   ·   n = 3 → 19.82 dB   ·   n = 8 → 49.92 dB</text>`;
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:320px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 8) Stepper: รหัสสัญญาณดิจิทัล 5 แบบ (สไลด์ 63–64)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('lineStepper');
  if (!el) return;
  const W = 600, H = 300;
  const BITS = [0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1];        // ชุดเดียวกับสไลด์ 64
  const x0 = 60, x1 = W - 20, slot = (x1 - x0) / BITS.length;
  const CODES = [
    { n: 'NRZ-L', d: 'บิต 1 = แรงดันลบ · บิต 0 = แรงดันบวก (ตามสไลด์)' },
    { n: 'NRZI', d: 'ไม่สนบวก/ลบ — "เปลี่ยนระดับเมื่อเจอบิต 1" เท่านั้น' },
    { n: 'Manchester', d: 'เปลี่ยนกลางบิตเสมอ = มีนาฬิกาในตัว · low→high = 1 · high→low = 0' },
    { n: 'Differential Manchester', d: 'เปลี่ยนกลางบิตเสมอ (นาฬิกา) + เปลี่ยนที่ "ต้นบิต" = 0 · ไม่เปลี่ยนที่ต้นบิต = 1' },
    { n: 'Bipolar-AMI', d: 'บิต 0 = ไม่มีสัญญาณ · บิต 1 = พัลส์บวก/ลบ สลับกันไป' },
  ];
  function levels(kind) {
    // คืน array ของ [ระดับครึ่งแรก, ระดับครึ่งหลัง] ต่อบิต (−1,0,1)
    const out = []; let cur = 1, ami = 1, dmLast = 1;
    BITS.forEach((b) => {
      if (kind === 0) out.push([b ? -1 : 1, b ? -1 : 1]);
      else if (kind === 1) { if (b) cur = -cur; out.push([cur, cur]); }
      else if (kind === 2) out.push(b ? [-1, 1] : [1, -1]);
      else if (kind === 3) { if (b === 0) dmLast = -dmLast; out.push([dmLast, -dmLast]); dmLast = -dmLast; }
      else { if (b) { out.push([ami, ami]); ami = -ami; } else out.push([0, 0]); }
    });
    return out;
  }
  createStepper(el, {
    steps: 5, stepDuration: 1500,
    label: (s) => `ขั้น ${s + 1} · ${CODES[s].n} — ${CODES[s].d}`,
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      let g = '';
      // แถวบิต
      BITS.forEach((b, i) => {
        const x = x0 + i * slot;
        g += `<text x="${x + slot / 2}" y="26" text-anchor="middle" font-size="11" fill="${C5.warn}" font-weight="700">${b}</text>
              <line x1="${x}" y1="34" x2="${x}" y2="${H - 40}" stroke="${line}" stroke-dasharray="2 4" opacity=".6"/>`;
      });
      g += `<line x1="${x1}" y1="34" x2="${x1}" y2="${H - 40}" stroke="${line}" stroke-dasharray="2 4" opacity=".6"/>`;
      // วาดทุกโค้ดที่ผ่านมาแล้ว (ซ้อนกันเพื่อเทียบ)
      const rowH = 48, top = 56;
      for (let k = 0; k <= step; k++) {
        const y = top + k * rowH, amp = 15;
        const lv = levels(k);
        const isCur = k === step;
        const upto = isCur ? Math.round(BITS.length * (0.2 + 0.8 * easeOut(t))) : BITS.length;
        let d = '', px = x0, py = y - lv[0][0] * amp;
        d += `M${px},${py}`;
        for (let i = 0; i < Math.max(1, upto); i++) {
          const [a, b] = lv[i];
          const xa = x0 + i * slot, xm = xa + slot / 2, xb = xa + slot;
          const ya = y - a * amp, ym = y - b * amp;
          d += `L${xa},${ya} L${xm},${ya} L${xm},${ym} L${xb},${ym}`;
        }
        g += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="${line}" opacity=".5"/>
              <path d="${d}" fill="none" stroke="${isCur ? C5.main : C5.sig}" stroke-width="${isCur ? 2.4 : 1.6}" opacity="${isCur ? 1 : .75}"/>
              <text x="4" y="${y + 3}" font-size="9.5" fill="${isCur ? C5.main : ink}" font-weight="${isCur ? 700 : 400}">${CODES[k].n.length > 14 ? 'Diff. Manch.' : CODES[k].n}</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:320px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 9) Walkthroughs — โจทย์ในสไลด์ (ตัวเลข verify ด้วย node แล้ว)
// ---------------------------------------------------------------
mountWalk('walkBaud', [
  { title: 'โจทย์ที่อาจารย์ถามกลางห้อง', body: 'ส่งข้อมูลด้วย QPSK ที่อัตราข้อมูล (data rate) 1 Mbps\nถาม: baud rate เป็นเท่าไหร่?', note: '🎙 อาจารย์ชี้ที่รูป QPSK แล้วถามห้องว่า "board rate จะมีค่าเป็นเท่าไหร่"' },
  { title: 'จับสูตรให้ถูกตัว', body: 'D = R/L = R / log₂M\n\n  D = baud rate (สัญลักษณ์/วินาที)\n  R = bit rate (bps)\n  M = จำนวนระดับของสัญญาณ = 2^L\n  L = จำนวนบิตต่อสัญลักษณ์', note: 'ระวังสับสน: R คือ "บิต" ต่อวินาที · D คือ "สัญลักษณ์" ต่อวินาที — คนละหน่วยกัน' },
  { title: 'QPSK มีกี่เฟส?', body: 'QPSK = Quadrature PSK → ใช้ 4 มุมเฟส\n  M = 4\n  L = log₂4 = 2 บิต/สัญลักษณ์', note: '🎙 อาจารย์ถามห้องก่อนว่า "มีทั้งหมดกี่เฟสครับ" → 4 เฟส แล้วค่อยแทนลงสูตร' },
  { title: 'แทนค่า', body: 'D = R / log₂M = 10⁶ / 2\n  = 0.5 × 10⁶ = 500,000 symbol/s\n  = 500 kbaud   ← คำตอบ', note: '' },
  { title: 'บทเรียนที่ต้องจำจากข้อนี้', body: 'baud rate ≤ bit rate เสมอ\n\n  M = 2  → D = R      (เท่ากันพอดี)\n  M > 2  → D < R      (น้อยกว่าเสมอ)\n\nเพราะ 1 สัญลักษณ์แบกได้หลายบิต', note: '🎙 อาจารย์ย้ำประโยคนี้ซ้ำ 3 รอบ: "Baud rate จะมีค่าน้อยกว่าหรือเท่ากับ bit rate เสมอ" — เป็นข้อความที่ออกสอบเชิงทฤษฎีได้ง่ายมาก' },
]);

mountWalk('walkMFSK', [
  { title: 'โจทย์สไลด์ 21', body: 'จงหาค่าความถี่ทั้งหมดของ MFSK ที่มี\n  ความถี่คลื่นพาห์ f_c = 250 kHz\n  ความถี่ต่าง f_d = 25 kHz\n  จำนวนระดับ 8 ระดับ (M = 8)', note: '"จำนวนระดับ 8 ระดับ" = M = 8 → L = log₂8 = 3 บิตต่อสัญลักษณ์' },
  { title: 'สูตรตำแหน่งความถี่', body: 'fᵢ = f_c + (2i − 1 − M)·f_d      โดย i = 1, 2, …, M\n\nอ่านสูตรให้เป็นภาพ: (2i − 1 − M) คือ "เบอร์ช่อง" ที่วิ่ง\n−7, −5, −3, −1, +1, +3, +5, +7  เมื่อ M = 8\n→ กระจายรอบ f_c สมมาตร ห่างเท่า ๆ กัน', note: '🎙 อาจารย์เขียนสูตรบนกระดานแล้วให้ห้องช่วยกันตอบว่า "2i ลบ 1 ลบ M คูณกับ f_d บวก f_c ใช่ไหม"' },
  { title: 'ไล่ i = 1 และ 2', body: 'i = 1:  f₁ = 250k + (2(1) − 1 − 8)(25k)\n        = 250k + (−7)(25k)\n        = 250k − 175k = 75 kHz\n\ni = 2:  f₂ = 250k + (−5)(25k) = 250k − 125k = 125 kHz', note: '🎙 อาจารย์เดินข้อนี้สดในห้อง ได้ f₁ = 75 kHz และ f₂ = 125 kHz ตรงกัน' },
  { title: 'ครบทั้ง 8 ความถี่', body: 'f₁ = 75 kHz     f₅ = 275 kHz\nf₂ = 125 kHz    f₆ = 325 kHz\nf₃ = 175 kHz    f₇ = 375 kHz\nf₄ = 225 kHz    f₈ = 425 kHz\n\nสังเกต: ห่างกันทีละ 2·f_d = 50 kHz เท่ากันหมด', note: 'เช็กเร็ว: ค่ากลางของ f₄ กับ f₅ = (225+275)/2 = 250 = f_c ✓ สมมาตรรอบคลื่นพาห์' },
  { title: 'ต่อยอด: แบนด์วิดท์ที่ต้องใช้', body: 'จากสไลด์ 19–20:  BW = 2M·f_d\n  = 2 × 8 × 25 kHz = 400 kHz\n\nเช็กกับความถี่ที่ได้: f₈ − f₁ = 425 − 75 = 350 kHz\nบวกขอบข้างละ f_d (25) = 400 kHz ✓', note: 'นี่คือราคาของ MFSK — ได้ 3 บิตต่อสัญลักษณ์ แต่ต้องจ่ายแบนด์วิดท์ 400 kHz (ยิ่ง M มาก ยิ่งกินกว้าง)' },
]);

mountWalk('walkBWE', [
  { title: 'โจทย์สไลด์ 32', body: 'จงหาค่าประสิทธิภาพของแบนด์วิดท์ สำหรับ SNR = 12 dB\nที่ BER = 10⁻⁷ ของ ASK, FSK และ PSK', note: 'ประสิทธิภาพของแบนด์วิดท์ (bandwidth efficiency) = R/B_T หน่วย bps/Hz' },
  { title: 'ตั้งความสัมพันธ์ 3 ตัวให้เชื่อมกัน', body: 'จากนิยาม:  Eb/N₀ = (S/N) × (B_T/R)\n\nใส่ 10log ทั้งสองข้าง:\n  (Eb/N₀)dB = SNR(dB) + 10·log(B_T/R)\n            = SNR(dB) − 10·log(R/B_T)\n\nย้ายข้าง →  10·log(R/B_T) = SNR(dB) − (Eb/N₀)dB', note: '🎙 อาจารย์ทำขั้นนี้บนกระดานทีละบรรทัด: "ใส่ 10 log ของทั้งสองฝั่งเข้าไป… แล้วมันก็จะเท่ากับ SNR ที่เป็น dB ลบ 10 log ของ R ส่วนแบนด์วิดท์"' },
  { title: 'อ่าน Eb/N₀ จากกราฟสไลด์ 30 ที่ BER = 10⁻⁷', body: 'ลากเส้นแนวนอนที่ BER = 10⁻⁷ ไปตัดแต่ละเส้นโค้ง\nแล้วอ่านค่าแกนนอน:\n\n  ASK และ BFSK (เส้นน้ำเงิน)  →  Eb/N₀ ≈ 15 dB\n  BPSK (เส้นเขียว)             →  Eb/N₀ ≈ 11.2 dB', note: '🎙 อาจารย์อ่านค่าให้ในห้อง: ASK "ตรงนี้คือค่า 15" · BFSK "ก็ได้เท่ากัน คือ 15 เหมือนกัน" · PSK "ประมาณ 11.2 ก็ได้"' },
  { title: 'แทนค่า — ASK และ FSK', body: '10·log(R/B_T) = 12 − 15 = −3 dB\n\nR/B_T = 10^(−0.3) = 0.501 ≈ 0.5 bps/Hz   ← คำตอบ ASK, FSK\n\n(ได้ไม่ถึง 1 bps ต่อทุก 1 Hz = เปลืองแบนด์วิดท์)', note: '' },
  { title: 'แทนค่า — PSK', body: '10·log(R/B_T) = 12 − 11.2 = 0.8 dB\n\nR/B_T = 10^(0.08) = 1.202 ≈ 1.2 bps/Hz   ← คำตอบ PSK\n\nสรุป: PSK คุ้มแบนด์วิดท์กว่า ASK/FSK ประมาณ 2.4 เท่า\nที่คุณภาพ (BER) และ SNR เท่ากันเป๊ะ', note: '🎙 อาจารย์ถามก่อนคำนวณว่า "เขียว แดง น้ำเงิน อันไหนดีกว่า" — เขียว (BPSK) ดีที่สุด เพราะใช้พลังงานต่อบิตน้อยกว่าที่คุณภาพเท่ากัน' },
  { title: '✅ ตรวจแล้ว: 15 dB ที่อาจารย์อ่าน ตรงกับกราฟและทฤษฎี', body: 'เราวัดกราฟสไลด์ 30 ระดับพิกเซล + คำนวณทฤษฎีเทียบ:\n\n            วัดจากกราฟ   ทฤษฎี\n  BPSK        11.18 dB   11.31 dB  (coherent)\n  DPSK        11.75 dB   11.88 dB\n  ASK, BFSK   14.94 dB   14.89 dB  ← noncoherent!\n\nทั้งสามเส้นต่ำกว่าทฤษฎี ~0.13 dB เท่ากันหมด (= ความหนาเส้น)\n→ การวัดเชื่อถือได้ และเส้น "ASK, BFSK" ในสไลด์คือแบบ\n   ตรวจจับไม่อ้างอิงเฟส (noncoherent) ซึ่งทฤษฎีให้ 14.89 dB', note: 'สรุป: อ่าน 15 dB ถูกต้องแล้ว · คำตอบ R/B_T = 0.5 bps/Hz ของ ASK/FSK จึงถูก' },
  { title: 'แล้วเลข 14.2–14.3 dB ที่เห็นในตำราบางเล่มคืออะไร?', body: 'มันคือ ASK/FSK แบบ coherent (ตรวจจับโดยอ้างอิงเฟส):\n\n  Pb = Q(√(Eb/N₀))       → ที่ BER 10⁻⁷ ได้ 14.32 dB\n\nเทียบกับ noncoherent (เส้นในสไลด์):\n  Pb = ½·e^(−Eb/2N₀)     → ที่ BER 10⁻⁷ ได้ 14.89 dB\n\nคนละเงื่อนไขการตรวจจับ ไม่ใช่ "ตำราขัดกับอาจารย์"\n(ถ้าใช้ 14.3 จะได้ R/B_T = 0.59 ≈ 0.6 bps/Hz)', note: 'เกร็ดยืนยันว่าเลขในโจทย์ไม่ได้สุ่มมา: เลข 8.4 dB ที่ BER = 10⁻⁴ ในการบ้านครั้งที่ 3 ข้อ 1 คือค่าทฤษฎีของ coherent BPSK เป๊ะ ๆ (คำนวณได้ 8.40 dB)' },
]);

mountWalk('walkPCM', [
  { title: 'โจทย์สไลด์ 54', body: 'สัญญาณ PCM มีแบนด์วิดท์ 2,700 Hz\nใช้ sampling rate 7,000 samples/sec\n  (ก) SNR = 30 dB จงหาระดับของการทำ quantization\n  (ข) จงหาอัตราการส่งข้อมูล', note: 'ตรวจก่อนเลย: Nyquist ต้องการ ≥ 2B = 5,400 samples/s — ที่ให้มา 7,000 ผ่านสบาย' },
  { title: '(ก) เริ่มจากสูตร SNR ของ PCM', body: 'SNR(dB) = 6.02n + 1.76\n  โดย n = จำนวนบิตต่อ 1 ตัวอย่าง\n\nแทน SNR = 30:\n  30 = 6.02n + 1.76\n  6.02n = 28.24\n  n = 4.69 บิต', note: 'ที่มาของ 6.02: เพิ่ม 1 บิต = ระดับเพิ่ม 2 เท่า = กำลัง noise ลด 4 เท่า = 10·log4 ≈ 6.02 dB' },
  { title: 'ปัดขึ้น (บิตเป็นจำนวนเต็มเท่านั้น)', body: 'n = 4.69 → ต้องใช้ n = 5 บิต\n  (4 บิตให้ SNR = 25.84 dB — ไม่ถึง 30 ที่ต้องการ)\n\nจำนวนระดับ = 2ⁿ = 2⁵ = 32 ระดับ   ← คำตอบ (ก)\nSNR จริงที่ได้ = 6.02(5) + 1.76 = 31.86 dB', note: 'ปัด "ขึ้น" เสมอในโจทย์ทรงนี้ — เพราะโจทย์ระบุ SNR ที่ "ต้องได้อย่างน้อย"' },
  { title: '(ข) อัตราการส่งข้อมูล', body: 'อัตราข้อมูล = (samples/sec) × (บิตต่อ sample)\n  = 7,000 × 5\n  = 35,000 bps = 35 kbps   ← คำตอบ (ข)', note: 'เทียบของจริง: โทรศัพท์ดิจิทัลใช้ 8,000 samples/s × 8 บิต = 64 kbps พอดี — ทรงเดียวกันเป๊ะ' },
]);

// ---------------------------------------------------------------
// 10) โค้ดรันได้
// ---------------------------------------------------------------
mountRunner('runner5', `// ═══ Week 5: เทคนิคการเข้ารหัสสัญญาณ — ตรวจโจทย์ทุกข้อในบท ═══
const log10 = Math.log10, log2 = (x) => Math.log(x)/Math.LN2;

// ① baud rate: QPSK ที่ 1 Mbps
for (const [name, M] of [['BPSK',2],['QPSK',4],['8PSK',8],['16QAM',16],['64QAM',64]]) {
  const R = 1e6, L = log2(M);
  console.log('①', name.padEnd(6), 'L =', L, 'บิต/สัญลักษณ์ → D =', (R/L/1e3).toFixed(0), 'ksymbol/s');
}

// ② MFSK: fc = 250 kHz, fd = 25 kHz, M = 8  (โจทย์สไลด์ 21)
const fc = 250, fd = 25, M = 8;
const freqs = [];
for (let i = 1; i <= M; i++) freqs.push(fc + (2*i - 1 - M) * fd);
console.log('② ความถี่ (kHz):', freqs.join(', '));
console.log('   L =', log2(M), 'บิต/สัญลักษณ์ · BW = 2M·fd =', 2*M*fd, 'kHz');

// ③ Eb/N0 ที่ต้องใช้ตาม "ทฤษฎี" — พิสูจน์ว่าเลขที่อ่านจากกราฟถูกไหม
//    Q(x) = ความน่าจะเป็นหางขวาของเกาส์เซียน (อินทิเกรตด้วยกฎซิมป์สัน)
const phi = (t) => Math.exp(-t*t/2) / Math.sqrt(2*Math.PI);
function Q(x) { const n = 4000, hi = x + 15, h = (hi - x)/n; let s = phi(x) + phi(hi);
  for (let i = 1; i < n; i++) s += (i%2 ? 4 : 2) * phi(x + i*h); return s*h/3; }
function Qinv(p) { let lo = 0, hi = 20; for (let i = 0; i < 200; i++) { const m = (lo+hi)/2; Q(m) > p ? lo = m : hi = m; } return (lo+hi)/2; }
for (const BER of [1e-7, 1e-4]) {
  const x = Qinv(BER);
  console.log('③ BER =', BER,
    '| BPSK', (10*log10(x*x/2)).toFixed(2),
    '| DPSK', (10*log10(Math.log(1/(2*BER)))).toFixed(2),
    '| ASK/FSK coherent', (10*log10(x*x)).toFixed(2),
    '| ASK/FSK noncoherent', (10*log10(2*Math.log(1/(2*BER)))).toFixed(2), 'dB');
}
console.log('   → เส้น "ASK, BFSK" ในสไลด์ 30 = noncoherent (14.89) — ตรงกับที่อาจารย์อ่าน 15 dB');
console.log('   → 8.4 dB ที่ BER 1e-4 ในการบ้าน 3 ข้อ 1 = ทฤษฎี coherent BPSK เป๊ะ');

// ④ bandwidth efficiency: SNR = 12 dB, BER = 1e-7  (โจทย์สไลด์ 32)
const SNR = 12;
for (const [name, ebn0] of [['ASK/FSK จากกราฟ (15 dB)', 15], ['PSK จากกราฟ (11.2 dB)', 11.2], ['ถ้าเป็น coherent (14.32)', 14.32]]) {
  const db = SNR - ebn0;
  console.log('④', name.padEnd(26), db.toFixed(2), 'dB →', Math.pow(10, db/10).toFixed(3), 'bps/Hz');
}

// ⑤ ตรวจตาราง 6.2 ด้วยสูตร BT (r = 0, 0.5, 1)
console.log('⑤ ตรวจ R/BT จากสูตร  (ASK/PSK = 1/(1+r) · MPSK = log2M/(1+r) · MFSK = log2M/((1+r)M))');
for (const r of [0, 0.5, 1]) {
  const ask = 1/(1+r), mpsk8 = log2(8)/(1+r), mfsk8 = log2(8)/((1+r)*8);
  console.log('   r =', r, '| ASK/PSK', ask.toFixed(3), '| 8PSK', mpsk8.toFixed(3), '| 8FSK', mfsk8.toFixed(3));
}

// ⑥ PCM: SNR = 30 dB, 7000 samples/s  (โจทย์สไลด์ 54)
const nExact = (30 - 1.76) / 6.02, n = Math.ceil(nExact);
console.log('⑥ n =', nExact.toFixed(2), '→ ใช้', n, 'บิต · ระดับ =', 2**n,
  '· SNR จริง =', (6.02*n + 1.76).toFixed(2), 'dB · rate =', 7000*n, 'bps');
console.log('   Nyquist ขั้นต่ำ = 2×2700 =', 2*2700, 'samples/s (7000 ผ่าน)');
`);

// ---------------------------------------------------------------
// 11) ข้อสอบจับเวลา
// ---------------------------------------------------------------
mountExam([25, 18, 12]);
