// ===== Week 3 — สัญญาณ / โดเมนความถี่ / Nyquist–Shannon / multiplexing =====

function cssVar3(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const C3 = ['#58c4dd', '#f6a85f', '#83c167'];

function fitCanvas(cv, ctx) {
  const w = cv.clientWidth, h = cv.clientHeight;
  cv.width = w * devicePixelRatio; cv.height = h * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  return [w, h];
}
function onReady(fn) {
  if (document.readyState === 'complete') fn();
  else window.addEventListener('load', fn);
}

// ---------------------------------------------------------------
// 1) Sine playground — s(t) = A sin(2πft + φ)  (รูป 2.3 ในสไลด์)
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('sineCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sA = document.getElementById('sineA');
  const sF = document.getElementById('sineF');
  const sP = document.getElementById('sineP');
  const out = document.getElementById('sineOut');

  function draw() {
    const [w, h] = fitCanvas(cv, ctx);
    ctx.clearRect(0, 0, w, h);
    const ink = cssVar3('--text-dim', '#7c7f8a');
    const line = cssVar3('--line-2', '#d9d4c7');
    const A = parseFloat(sA.value), f = parseFloat(sF.value), deg = parseFloat(sP.value);
    const phi = deg * Math.PI / 180;
    const put = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    put('lblA', A.toFixed(1)); put('lblF', f.toFixed(1)); put('lblP', deg + '°');
    const mid = h / 2, ampPx = (h / 2 - 18);
    // แกน + เส้นบอกช่วง 1 วินาที
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.setLineDash([4, 4]);
    for (let s = 1; s < 2; s++) {
      const x = (s / 2) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.font = '11px sans-serif';
    ctx.fillText('0 s', 4, mid + 14); ctx.fillText('1 s', w / 2 + 4, mid + 14); ctx.fillText('2 s', w - 24, mid + 14);
    ctx.fillText('+A', 4, 12); ctx.fillText('−A', 4, h - 4);
    // อ้างอิงจางๆ: คลื่นตั้งต้น (a) A=1, f=1, φ=0
    ctx.strokeStyle = line; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = (x / w) * 2;
      const y = mid - Math.sin(2 * Math.PI * 1 * t) * ampPx * 1;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // คลื่นจริงตามสไลเดอร์
    ctx.strokeStyle = C3[0]; ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = (x / w) * 2;
      const y = mid - A * Math.sin(2 * Math.PI * f * t + phi) * ampPx;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    out.innerHTML = 's(t) = <b>' + A.toFixed(1) + '</b> · sin(2π·<b>' + f.toFixed(1) + '</b>·t + <b>' + deg + '°</b>)' +
      ' &nbsp;→&nbsp; คาบ T = 1/f = <b>' + (1 / f).toFixed(2) + ' s</b>' +
      (deg > 0 ? ' · เลื่อนเฟส ' + deg + '° = ' + (deg / 360).toFixed(2) + ' คาบ' : '') +
      ' <span style="opacity:.6">(เส้นจาง = คลื่นตั้งต้น A=1, f=1, φ=0 ไว้เทียบ)</span>';
  }
  [sA, sF, sP].forEach((s) => s.addEventListener('input', draw));
  document.querySelectorAll('[data-sine]').forEach((b) => {
    b.addEventListener('click', () => {
      const [a, f, p] = b.dataset.sine.split(',').map(Number);
      sA.value = a; sF.value = f; sP.value = p; draw();
    });
  });
  onReady(draw);
  window.addEventListener('resize', draw);
})();

// ---------------------------------------------------------------
// 2) Fourier: บวกคลื่นไซน์คี่ (1f,3f,5f,…) → คลื่นเหลี่ยม (ความถี่มูลฐาน)
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('fourierCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sel = document.getElementById('fourierN');
  const out = document.getElementById('fourierOut');

  function draw() {
    const [w, h] = fitCanvas(cv, ctx);
    ctx.clearRect(0, 0, w, h);
    const ink = cssVar3('--text-dim', '#7c7f8a');
    const line = cssVar3('--line-2', '#d9d4c7');
    const N = parseInt(sel.value, 10); // จำนวนเทอม (ฮาร์มอนิกคี่)
    const waveW = w * 0.62, specX = w * 0.68;
    const mid = h / 2, amp = h / 2 - 16;
    ctx.strokeStyle = line;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(waveW, mid); ctx.stroke();
    // คลื่นรวม
    ctx.strokeStyle = C3[0]; ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = 0; x <= waveW; x++) {
      const t = (x / waveW) * 2;
      let s = 0;
      for (let i = 0; i < N; i++) {
        const k = 2 * i + 1;
        s += (4 / Math.PI) * (1 / k) * Math.sin(2 * Math.PI * k * t);
      }
      const y = mid - s * amp * 0.75;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // เป้าหมาย: square wave จางๆ
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (let x = 0; x <= waveW; x++) {
      const t = (x / waveW) * 2;
      const y = mid - (Math.sin(2 * Math.PI * t) >= 0 ? 1 : -1) * amp * 0.75;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.setLineDash([]);
    // สเปกตรัม (โดเมนความถี่): แท่งที่ f,3f,5f,…
    ctx.fillStyle = ink; ctx.font = '11px sans-serif';
    ctx.fillText('โดเมนเวลา', 4, 14);
    ctx.fillText('โดเมนความถี่ (สเปกตรัม)', specX, 14);
    const bw = (w - specX - 10) / 10;
    for (let i = 0; i < N && i < 10; i++) {
      const k = 2 * i + 1;
      const bh = (amp * 1.2) / k;
      ctx.fillStyle = C3[i % 3];
      ctx.fillRect(specX + i * bw, h - 18 - bh, bw * 0.55, bh);
      ctx.fillStyle = ink;
      ctx.fillText(k + 'f', specX + i * bw, h - 5);
    }
    const kmax = 2 * N - 1;
    out.innerHTML = 'ใช้ <b>' + N + '</b> เทอม (ความถี่ f ถึง ' + kmax + 'f) — แบนด์วิดท์ที่ใช้ ≈ <b>' + (kmax - 1) +
      'f</b> · ' + (N === 1 ? 'เทอมเดียว = ไซน์เพียวๆ' : N < 5 ? 'เริ่มเป็นเหลี่ยม แต่ยังย้วยอยู่' :
      N < 15 ? 'ใกล้เหลี่ยมแล้ว — ยิ่งเพิ่มความถี่สูง ยิ่งคม' : 'เกือบสมบูรณ์ — ต้องใช้ถึงอนันต์ถึงจะเหลี่ยมเป๊ะ (เส้นประ)');
  }
  sel.addEventListener('input', draw);
  onReady(draw);
  window.addEventListener('resize', draw);
})();

// ---------------------------------------------------------------
// 3) Amplifier vs Repeater — ทำไมดิจิทัลส่งไกลแล้ว "สะอาด" กว่า
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('ampCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const cap = document.getElementById('ampCap');
  const btns = Array.from(document.querySelectorAll('[data-amp]'));

  // สัญญาณดิจิทัล (square) + noise ระดับต่างๆ — สุ่มแบบ deterministic ให้วาดซ้ำได้
  function rnd(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; }; }
  const bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0];

  function wave(x, noiseAmp, r) {
    const bit = bits[Math.floor(x * bits.length) % bits.length];
    return (bit ? 0.7 : -0.7) + r() * noiseAmp * 2;
  }
  function panel(x0, pw, h, noiseAmp, seed, label, colBar) {
    const ink = cssVar3('--text-dim', '#7c7f8a');
    const mid = h / 2 + 8, amp = h / 2 - 26;
    const r = rnd(seed);
    ctx.strokeStyle = colBar; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let px = 0; px <= pw; px++) {
      const y = mid - wave(px / pw, noiseAmp, r) * amp;
      px === 0 ? ctx.moveTo(x0 + px, y) : ctx.lineTo(x0 + px, y);
    }
    ctx.stroke();
    ctx.strokeStyle = ink; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x0 + pw, mid); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ink; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(label, x0 + pw / 2, 14);
  }
  function draw(mode) {
    const [w, h] = fitCanvas(cv, ctx);
    ctx.clearRect(0, 0, w, h);
    const pw = (w - 80) / 3;
    const arrow = (x) => {
      ctx.fillStyle = cssVar3('--accent-warm', '#c46b3d');
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('→', x, h / 2 + 8);
    };
    if (mode === 'amp') {
      panel(0, pw, h, 0.02, 7, 'ต้นทาง (สะอาด)', C3[0]);
      arrow(pw + 20);
      panel(pw + 40, pw, h, 0.22, 13, 'เดินทางไกล: อ่อนลง + noise เกาะ', C3[1]);
      arrow(2 * pw + 60);
      panel(2 * (pw + 40), pw, h, 0.34, 13, 'ผ่าน Amplifier: ขยายหมด รวม noise!', '#c0492f');
      cap.innerHTML = '<b>Amplifier (สัญญาณแอนะล็อก):</b> มันแค่ "ขยายทุกอย่างที่รับมา" — สัญญาณโตขึ้นก็จริง แต่ noise ที่เกาะมาก็โตตามด้วย ต่อหลายช่วงเข้า noise สะสมจนสัญญาณเพี้ยน (อาจารย์: มันไม่ได้ฉลาด แค่ทำให้ใหญ่ขึ้นเฉยๆ) — ข้อมูลแอนะล็อกอย่างเสียงพอทนได้ แต่ถ้าเป็นข้อมูลดิจิทัลจะเริ่มอ่านบิตผิด';
    } else {
      panel(0, pw, h, 0.02, 7, 'ต้นทาง (สะอาด)', C3[0]);
      arrow(pw + 20);
      panel(pw + 40, pw, h, 0.22, 13, 'เดินทางไกล: อ่อนลง + noise เกาะ', C3[1]);
      arrow(2 * pw + 60);
      panel(2 * (pw + 40), pw, h, 0.02, 21, 'ผ่าน Repeater: อ่านบิต → สร้างใหม่เอี่ยม', C3[2]);
      cap.innerHTML = '<b>Repeater (สัญญาณดิจิทัล):</b> มัน "ตีความ" ก่อนว่าที่รับมาคือ 0 หรือ 1 (เทียบกับเส้นกึ่งกลาง) แล้ว<b>สร้างสัญญาณใหม่ที่สะอาด</b>ส่งต่อ — noise ถูกล้างทิ้งทุกช่วง! นี่คือเหตุผลใหญ่ที่โลกย้ายมาดิจิทัล · ข้อแลก: ถ้า noise หนักจนตีความผิด (1 กลายเป็น 0) ก็ผิดถาวรเลยเช่นกัน';
    }
    btns.forEach((b) => b.classList.toggle('ghost', b.dataset.amp !== mode));
  }
  btns.forEach((b) => b.addEventListener('click', () => draw(b.dataset.amp)));
  onReady(() => draw('amp'));
  window.addEventListener('resize', () => draw(document.querySelector('[data-amp]:not(.ghost)')?.dataset.amp || 'amp'));
})();

// ---------------------------------------------------------------
// 4) เครื่องคิด Nyquist–Shannon (โจทย์เดินสดของอาจารย์)
// ---------------------------------------------------------------
(function () {
  const sB = document.getElementById('capB');
  if (!sB) return;
  const sS = document.getElementById('capSNR');
  const out = document.getElementById('capOut');
  function calc() {
    const B = parseFloat(sB.value);          // MHz
    const snrdb = parseFloat(sS.value);      // dB
    const put = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    put('lblB', B); put('lblS', snrdb);
    const snr = Math.pow(10, snrdb / 10);
    const C = B * 1e6 * Math.log2(1 + snr);  // bps
    const M = Math.pow(2, C / (2 * B * 1e6));
    const Mup = Math.pow(2, Math.ceil(Math.log2(M)));
    const isClass = Math.abs(B - 1) < 0.01 && Math.abs(snrdb - 24) < 0.01;
    out.innerHTML =
      '<b>ขั้น 1 — ถอด dB กลับ (วิชา Week 1!):</b> SNR = 10^(' + snrdb + '/10) = 10^' + (snrdb / 10).toFixed(1) + ' ≈ <b>' + snr.toFixed(0) + ' เท่า</b><br/>' +
      '<b>ขั้น 2 — Shannon:</b> C = B·log₂(1+SNR) = ' + B + '×10⁶ × log₂(' + (1 + snr).toFixed(0) + ') = ' + B + '×10⁶ × ' + Math.log2(1 + snr).toFixed(2) + ' ≈ <b>' + (C / 1e6).toFixed(1) + ' Mbps</b> (เพดานทางทฤษฎี)<br/>' +
      '<b>ขั้น 3 — Nyquist ย้อนหา M:</b> C = 2B·log₂M → log₂M = C/(2B) = ' + (C / (2 * B * 1e6)).toFixed(2) + ' → M ≈ ' + M.toFixed(1) + ' → ใช้จริงต้องเป็นกำลังของ 2 → <b>M = ' + Mup + ' ระดับ</b>' +
      (isClass ? '<br/>🎯 <b>นี่คือโจทย์ที่อาจารย์เดินในห้องเป๊ะๆ:</b> B = 1 MHz (สเปกตรัม 3→4 MHz), SNR_dB = 24 → SNR ≈ 251 → C ≈ 8 Mbps → M = 16 ระดับ' : '');
  }
  [sB, sS].forEach((s) => s.addEventListener('input', calc));
  calc();
})();

// ---------------------------------------------------------------
// 5) การบ้านสไลด์ 28: ตาราง ข้อมูล × สัญญาณ (เทคนิค/อุปกรณ์/ระบบ)
// ---------------------------------------------------------------
(function () {
  const tbl = document.getElementById('dsTable');
  if (!tbl) return;
  const btnCheck = document.getElementById('dsCheck');
  const btnReset = document.getElementById('dsReset');
  const outEl = document.getElementById('dsOut');

  const TECH = ['—', 'มอดูเลต AM/FM', 'เข้ารหัสสาย (NRZ/Manchester)', 'มอดูเลตดิจิทัล (shift keying)', 'แปลง A→D (PCM/Delta)'];
  const DEV = ['—', 'เครื่องส่งวิทยุ/โทรศัพท์', 'Digital transceiver', 'โมเด็ม (Modem)', 'Codec'];
  const SYS = ['—', 'วิทยุ FM · โทรศัพท์บ้าน', 'LAN / Ethernet', 'เน็ตผ่านสายโทรศัพท์ (dial-up/ADSL)', 'โทรศัพท์ดิจิทัล · CD'];
  // แถว: [ป้าย data→signal, [เฉลย tech, dev, sys], เหตุผล]
  const rows = [
    ['แอนะล็อก → แอนะล็อก', ['มอดูเลต AM/FM', 'เครื่องส่งวิทยุ/โทรศัพท์', 'วิทยุ FM · โทรศัพท์บ้าน'],
      'เสียง (analog) ฝากไปกับคลื่นวิทยุ (analog) ด้วยการมอดูเลต AM/FM — อาจารย์: วิทยุที่หมุนหาคลื่นนั่นแหละ / โทรศัพท์บ้านยุคแรกก็ส่งเสียงเป็นสัญญาณไฟฟ้าแอนะล็อกตรงๆ'],
    ['ดิจิทัล → ดิจิทัล', ['เข้ารหัสสาย (NRZ/Manchester)', 'Digital transceiver', 'LAN / Ethernet'],
      'บิต 0/1 แปลงเป็นพัลส์แรงดันตามกติกา (อาจารย์เอ่ยชื่อ NRZ กับ Manchester) — คือสิ่งที่วิ่งอยู่ในสายแลน'],
    ['ดิจิทัล → แอนะล็อก', ['มอดูเลตดิจิทัล (shift keying)', 'โมเด็ม (Modem)', 'เน็ตผ่านสายโทรศัพท์ (dial-up/ADSL)'],
      'Modem = MOdulator + DEModulator (อาจารย์ให้ถอดชื่อในห้อง) — เอาบิตไปขี่คลื่นแอนะล็อก เพราะสายโทรศัพท์/สื่อบางชนิดรับได้แต่แอนะล็อก'],
    ['แอนะล็อก → ดิจิทัล', ['แปลง A→D (PCM/Delta)', 'Codec', 'โทรศัพท์ดิจิทัล · CD'],
      'Codec = COder + DECoder — สุ่มค่าเสียงเป็นตัวเลข (PCM / Delta modulation) — ระบบโทรศัพท์ดิจิทัลและการอัด CD ทำแบบนี้'],
  ];
  const colOpts = [TECH, DEV, SYS];
  const tbody = tbl.querySelector('tbody');
  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');
    const th = document.createElement('td');
    th.style.textAlign = 'left'; th.innerHTML = '<b>' + r[0] + '</b>';
    tr.appendChild(th);
    for (let c = 0; c < 3; c++) {
      const td = document.createElement('td');
      const b = document.createElement('button');
      b.className = 'qc'; b.type = 'button';
      b.dataset.row = ri; b.dataset.col = c; b.dataset.i = 0;
      b.textContent = colOpts[c][0];
      b.addEventListener('click', () => {
        const i = (parseInt(b.dataset.i, 10) + 1) % colOpts[c].length;
        b.dataset.i = i; b.textContent = colOpts[c][i];
        b.classList.remove('good', 'bad');
      });
      td.appendChild(b); tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  btnCheck.addEventListener('click', () => {
    let good = 0, why = [];
    rows.forEach((r, ri) => {
      let rowOk = true;
      for (let c = 0; c < 3; c++) {
        const b = tbl.querySelector('.qc[data-row="' + ri + '"][data-col="' + c + '"]');
        const ok = b.textContent === r[1][c];
        b.classList.toggle('good', ok); b.classList.toggle('bad', !ok);
        if (ok) good++; else rowOk = false;
      }
      if (!rowOk) why.push('<li><b>' + r[0] + ':</b> ' + r[1].join(' · ') + ' — ' + r[2] + '</li>');
    });
    outEl.innerHTML = 'ได้ <b>' + good + '/12</b> ช่อง' +
      (why.length ? ' — แถวที่พลาด:<ul>' + why.join('') + '</ul>' : ' — เต็ม! ตารางนี้เอาไปตอบอาจารย์ได้เลย 🎉');
  });
  btnReset.addEventListener('click', () => {
    tbl.querySelectorAll('.qc').forEach((b) => {
      b.dataset.i = 0; b.textContent = colOpts[parseInt(b.dataset.col, 10)][0];
      b.classList.remove('good', 'bad');
    });
    outEl.innerHTML = '';
  });
})();

// ---------------------------------------------------------------
// 6) FDM vs TDM (canvas เดียวกับที่ใช้ใน Week 2 — ปรับ id)
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('mux3Canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let t = 0;
  function draw() {
    const [cw, ch] = fitCanvas(cv, ctx);
    ctx.clearRect(0, 0, cw, ch);
    const ink = cssVar3('--text-dim', '#7c7f8a');
    const half = cw / 2 - 14;
    ctx.font = '12px sans-serif'; ctx.fillStyle = ink; ctx.textAlign = 'left';
    ctx.fillText('FDM — แบ่งย่านความถี่ (ส่งพร้อมกันตลอดเวลา)', 4, 14);
    const laneH = 24, top = 30;
    for (let i = 0; i < 3; i++) {
      const y = top + i * (laneH + 8);
      ctx.fillStyle = C3[i] + '33';
      ctx.fillRect(4, y, half - 8, laneH);
      ctx.beginPath();
      for (let x = 0; x <= half - 12; x += 2) {
        const yy = y + laneH / 2 + Math.sin((x + t * (40 + i * 14)) / (9 + i * 3)) * (laneH / 2 - 4);
        x === 0 ? ctx.moveTo(4 + x, yy) : ctx.lineTo(4 + x, yy);
      }
      ctx.lineWidth = 1.6; ctx.strokeStyle = C3[i]; ctx.stroke();
      ctx.fillStyle = ink;
      ctx.fillText('ช่อง ' + (i + 1), half - 52, y + laneH - 7);
    }
    ctx.fillText('↑ ความถี่', 4, top + 3 * (laneH + 8) + 14);
    const x0 = cw / 2 + 10;
    ctx.fillStyle = ink;
    ctx.fillText('TDM — แบ่งช่องเวลา (ผลัดกันใช้ทั้งย่าน)', x0, 14);
    const y0 = 30 + laneH + 8;
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, half - 8, laneH);
    const slotW = 34;
    const off = (t * 30) % (slotW * 3);
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, half - 8, laneH); ctx.clip();
    for (let x = -slotW * 3; x < half; x += slotW) {
      const i = Math.floor((x + off) / slotW + 300) % 3;
      ctx.fillStyle = C3[i];
      ctx.fillRect(x0 + x + off - slotW * 2, y0 + 2, slotW - 3, laneH - 4);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(String(i + 1), x0 + x + off - slotW * 2 + slotW / 2 - 6, y0 + laneH / 2 + 4);
    }
    ctx.restore();
    ctx.fillStyle = ink; ctx.font = '12px sans-serif';
    ctx.fillText('เวลา →', x0, y0 + laneH + 18);
    t += 0.016;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
