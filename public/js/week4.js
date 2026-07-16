// ===== Week 4 — สายอากาศ / การแพร่กระจายคลื่น / LOS / Free space loss / Friis =====
// เนื้อหาเท่าที่อาจารย์สอนแล้ว (สไลด์ 1–40) — ตัวเลขทุกตัวยืนยันด้วยสคริปต์ node แล้ว
import { createStepper, mountWalk, mountRunner, mountExam, easeOut } from './stepper.js';

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const C4 = { main: '#c792ea', sig: '#58c4dd', warn: '#f6a85f', ok: '#83c167', bad: '#e06c75' };
const log10 = Math.log10;

// ---------------------------------------------------------------
// helper: โครง SVG polar สำหรับ radiation pattern
// ---------------------------------------------------------------
function polarPath(fn, cx, cy, R, scale = 1, n = 360) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const th = (i / n) * 2 * Math.PI;
    const r = Math.max(0, fn(th)) * R * scale;
    const x = cx + r * Math.cos(th), y = cy - r * Math.sin(th);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }
  return d + 'Z';
}
// ไดโพลแนวตั้ง (E-plane): |cos((π/2)cosθ)/sinθ| — เลข 8 แนวนอน→หมุนให้แกนเสาตั้ง
function dipolePat(th) {
  const s = Math.sin(th);
  if (Math.abs(s) < 1e-4) return 0;
  return Math.abs(Math.cos((Math.PI / 2) * Math.cos(th)) / s);
}
// สายอากาศแบบมีทิศทาง: array factor N=5 คูณ element cardioid (พูหลักชี้ขวา มีพูข้าง+นัลล์จริง)
function dirPat(th) {
  const x = (Math.PI / 2) * Math.sin(th);
  const af = Math.abs(x) < 1e-6 ? 1 : Math.abs(Math.sin(5 * x) / (5 * Math.sin(x)));
  const elem = (1 + Math.cos(th)) / 2; // กดพูหลัง
  return af * elem;
}
// หามุม half-power (−3 dB) ของ dirPat เชิงตัวเลข (ห้าม hardcode)
function halfPowerAngle() {
  const target = Math.SQRT1_2; // กำลังครึ่ง = แอมพลิจูด 1/√2
  for (let deg = 0; deg <= 90; deg += 0.1) {
    if (dirPat((deg * Math.PI) / 180) < target) return deg;
  }
  return 90;
}

// ---------------------------------------------------------------
// 1) Stepper: radiation pattern — isotropic → dipole → directional → beamwidth
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('antStepper');
  if (!el) return;
  const W = 560, H = 300, cx = W / 2, cy = H / 2, R = 118;
  const bwDeg = halfPowerAngle(); // มุมครึ่งกำลังข้างเดียว → beamwidth = 2 เท่า

  const LBL = [
    'ขั้น 1 · Isotropic: แผ่เท่ากันทุกทิศ — วงกลมสมบูรณ์ (สร้างจริงไม่ได้ ใช้เป็นตัวอ้างอิง G = 1)',
    'ขั้น 2 · ไดโพล: ผ่ากลาง "โดนัท" ได้เลข 8 — แรงสุดด้านข้าง เงียบสนิทตามแนวเสา (nulls)',
    'ขั้น 3 · แบบมีทิศทาง (เช่น Yagi): พูหลัก (main lobe) + พูข้าง (sidelobes) + นัลล์ (nulls)',
    `ขั้น 4 · ความกว้างลำ (beam width) วัดที่จุดกำลังครึ่ง (−3 dB) ≈ ${(2 * bwDeg).toFixed(0)}°`,
    'ขั้น 5 · เทียบสามแบบ: ยิ่งบีบลำแคบ พลังงานยิ่งพุ่งไกล — นี่แหละที่มาของ "เกน"',
  ];

  createStepper(el, {
    steps: 5,
    stepDuration: 1900,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const line = cssVar('--line-2', '#d9d4c7');
      const ink = cssVar('--text-dim', '#7c7f8a');
      const k = easeOut(t);
      let body = '';
      // วงตาข่ายอ้างอิง
      const grid = [0.5, 1].map((g) =>
        `<circle cx="${cx}" cy="${cy}" r="${R * g}" fill="none" stroke="${line}" stroke-dasharray="3 4"/>`).join('') +
        `<line x1="${cx - R - 14}" y1="${cy}" x2="${cx + R + 14}" y2="${cy}" stroke="${line}"/>` +
        `<line x1="${cx}" y1="${cy - R - 14}" x2="${cx}" y2="${cy + R + 14}" stroke="${line}"/>`;

      const iso = `<path d="${polarPath(() => 1, cx, cy, R, 1)}" fill="${C4.sig}22" stroke="${C4.sig}" stroke-width="2"/>`;
      const dip = (op = 1) => `<path d="${polarPath(dipolePat, cx, cy, R, 1)}" opacity="${op}" fill="${C4.ok}22" stroke="${C4.ok}" stroke-width="2"/>`;
      const dir = (op = 1) => `<path d="${polarPath(dirPat, cx, cy, R, 1)}" opacity="${op}" fill="${C4.main}2a" stroke="${C4.main}" stroke-width="2.2"/>`;
      const antDot = `<circle cx="${cx}" cy="${cy}" r="5" fill="${C4.warn}"/><text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="11" fill="${ink}">สายอากาศ</text>`;

      if (step === 0) {
        body = `<path d="${polarPath(() => 1, cx, cy, R, 0.15 + 0.85 * k)}" fill="${C4.sig}22" stroke="${C4.sig}" stroke-width="2"/>
          <text x="${cx + R * 0.72}" y="${cy - R * 0.72}" font-size="12" fill="${C4.sig}">แผ่เท่ากันทุกทิศ</text>`;
      } else if (step === 1) {
        // เสาไดโพลแนวตั้ง + เลข 8
        body = `${dip(0.15 + 0.85 * k)}
          <line x1="${cx}" y1="${cy - 34}" x2="${cx}" y2="${cy + 34}" stroke="${C4.warn}" stroke-width="5" stroke-linecap="round"/>
          <text x="${cx + 8}" y="${cy - 38}" font-size="11" fill="${ink}">เสา (แนวตั้ง)</text>
          <text x="${cx + R * 0.62}" y="${cy - 8}" font-size="12" fill="${C4.ok}">แรงสุดด้านข้าง</text>
          <text x="${cx + 10}" y="${cy - R - 2}" font-size="11" fill="${C4.bad}">null — ตามแนวเสาเงียบสนิท</text>
          <text x="${cx - 118}" y="${cy + R + 12}" font-size="11" fill="${ink}">มอง 3 มิติ = หมุนเลข 8 รอบเสา → "โดนัทไม่มีรู"</text>`;
      } else if (step === 2 || step === 3) {
        body = `${dir(0.15 + 0.85 * (step === 2 ? k : 1))}
          <text x="${cx + R + 4}" y="${cy - 6}" font-size="12" fill="${C4.main}">พูหลัก (main lobe)</text>
          <text x="${cx + R * 0.30}" y="${cy - R * 0.52}" font-size="11" fill="${ink}">พูข้าง (sidelobe)</text>
          <text x="${cx - R * 0.95}" y="${cy - 12}" font-size="11" fill="${ink}">พูหลังเล็ก</text>
          <text x="${cx + R * 0.42}" y="${cy - R * 0.30}" font-size="11" fill="${C4.bad}">null</text>`;
        if (step === 3) {
          const a = (bwDeg * Math.PI) / 180;
          const r3 = R * Math.SQRT1_2;
          const x1 = cx + R * 1.08 * Math.cos(a), y1 = cy - R * 1.08 * Math.sin(a);
          const x2 = cx + R * 1.08 * Math.cos(-a), y2 = cy - R * 1.08 * Math.sin(-a);
          body += `
            <line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="${C4.warn}" stroke-dasharray="5 4" stroke-width="1.6"/>
            <line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${C4.warn}" stroke-dasharray="5 4" stroke-width="1.6"/>
            <path d="M ${cx + r3 * Math.cos(a)} ${cy - r3 * Math.sin(a)} A ${r3} ${r3} 0 0 1 ${cx + r3 * Math.cos(-a)} ${cy - r3 * Math.sin(-a)}" fill="none" stroke="${C4.warn}" stroke-width="2"/>
            <text x="${cx + r3 + 8}" y="${cy + 4}" font-size="12" fill="${C4.warn}">BW ≈ ${(2 * bwDeg).toFixed(0)}° ที่จุด −3 dB (กำลังหายครึ่ง)</text>`;
        }
      } else {
        body = `${iso}${dip(0.8)}${dir(0.95)}
          <text x="${cx - R - 6}" y="${cy - R - 2}" font-size="11" fill="${C4.sig}">■ isotropic (อ้างอิง)</text>
          <text x="${cx - R - 6}" y="${cy - R + 14}" font-size="11" fill="${C4.ok}">■ dipole</text>
          <text x="${cx - R - 6}" y="${cy - R + 30}" font-size="11" fill="${C4.main}">■ directional</text>
          <text x="${cx}" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="${ink}">พลังงานรวมเท่ากัน — แบบมีทิศทางแค่ "บีบ" ไปทางเดียว → เกนคือผลของการบีบ</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${grid}${body}${antDot}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 2) Dipole Lab — ความถี่ → λ → ความยาวเสา L = λ/2 หรือ λ/4
// ---------------------------------------------------------------
(function () {
  const sl = document.getElementById('dipF');
  if (!sl) return;
  const out = document.getElementById('dipOut');
  const svgBox = document.getElementById('dipSvg');
  const c = 3e8;

  function draw() {
    const fMHz = parseFloat(sl.value);
    const lbl = document.getElementById('lblDipF');
    if (lbl) lbl.textContent = fMHz >= 1000 ? (fMHz / 1000).toFixed(1) + ' GHz' : fMHz + ' MHz';
    const lam = c / (fMHz * 1e6);
    const half = lam / 2, quart = lam / 4;
    const fmt = (m) => (m >= 1 ? m.toFixed(2) + ' m' : (m * 100).toFixed(1) + ' cm');
    out.innerHTML =
      `λ = c/f = 3×10⁸ ÷ ${fMHz >= 1000 ? (fMHz / 1000) + '×10⁹' : fMHz + '×10⁶'} = <b>${fmt(lam)}</b>
       → ครึ่งคลื่น (Hertz) L = λ/2 = <b>${fmt(half)}</b> · ควอเตอร์ (Marconi) L = λ/4 = <b>${fmt(quart)}</b>`;
    // วาดเสาเทียบกับคน 1.7 m (สเกลเดียวกัน)
    const ink = cssVar('--text-dim', '#7c7f8a');
    const maxM = Math.max(half, 1.9);
    const H = 150, scale = (H - 30) / maxM;
    const man = 1.7 * scale, rod = half * scale, rodQ = quart * scale;
    svgBox.innerHTML = `<svg viewBox="0 0 560 ${H}" style="width:100%;height:auto;display:block">
      <line x1="0" y1="${H - 12}" x2="560" y2="${H - 12}" stroke="${cssVar('--line-2', '#d9d4c7')}"/>
      <g>
        <circle cx="120" cy="${H - 12 - man + 9}" r="9" fill="none" stroke="${ink}" stroke-width="2"/>
        <line x1="120" y1="${H - 12 - man + 18}" x2="120" y2="${H - 12 - man * 0.35}" stroke="${ink}" stroke-width="2"/>
        <line x1="120" y1="${H - 12 - man * 0.35}" x2="106" y2="${H - 12}" stroke="${ink}" stroke-width="2"/>
        <line x1="120" y1="${H - 12 - man * 0.35}" x2="134" y2="${H - 12}" stroke="${ink}" stroke-width="2"/>
        <text x="120" y="${H - 1}" text-anchor="middle" font-size="10" fill="${ink}">คน 1.7 m</text>
      </g>
      <g>
        <rect x="266" y="${H - 12 - rod}" width="8" height="${rod}" rx="3" fill="${C4.main}"/>
        <text x="270" y="${H - 1}" text-anchor="middle" font-size="10" fill="${ink}">λ/2 = ${fmt(half)}</text>
      </g>
      <g>
        <rect x="406" y="${H - 12 - rodQ}" width="8" height="${rodQ}" rx="3" fill="${C4.sig}"/>
        <text x="410" y="${H - 1}" text-anchor="middle" font-size="10" fill="${ink}">λ/4 = ${fmt(quart)}</text>
      </g>
    </svg>`;
  }
  sl.addEventListener('input', draw);
  document.querySelectorAll('[data-dip]').forEach((b) =>
    b.addEventListener('click', () => { sl.value = b.dataset.dip; draw(); }));
  draw();
})();

// ---------------------------------------------------------------
// 3) Gain Lab — ชนิดสายอากาศ + f (+ ขนาด) → Ae, G, G_dB ตามตารางสไลด์ 17
// ---------------------------------------------------------------
(function () {
  const sel = document.getElementById('gainType');
  if (!sel) return;
  const fS = document.getElementById('gainF');
  const dS = document.getElementById('gainD');
  const dWrap = document.getElementById('gainDWrap');
  const out = document.getElementById('gainOut');
  const c = 3e8;
  // [ชื่อ, ต้องมีพื้นที่หน้าตัด?, Ae(lam,A), G(lam,A)]
  const TYPES = {
    iso:   { name: 'ไอโซทรอปิก', area: false, Ae: (l) => l * l / (4 * Math.PI), G: () => 1 },
    loop:  { name: 'ไดโพลเล็กมาก/บ่วง', area: false, Ae: (l) => 1.5 * l * l / (4 * Math.PI), G: () => 1.5 },
    half:  { name: 'ไดโพลครึ่งคลื่น', area: false, Ae: (l) => 1.64 * l * l / (4 * Math.PI), G: () => 1.64 },
    horn:  { name: 'ปากแตร (Horn)', area: true, Ae: (l, A) => 0.81 * A, G: (l, A) => 10 * A / (l * l) },
    para:  { name: 'พาราโบลา', area: true, Ae: (l, A) => 0.56 * A, G: (l, A) => 7 * A / (l * l) },
    turn:  { name: 'กากบาท (Turnstile)', area: false, Ae: (l) => 1.15 * l * l / (4 * Math.PI), G: () => 1.15 },
  };
  function draw() {
    const ty = TYPES[sel.value];
    const fGHz = parseFloat(fS.value);
    const D = parseFloat(dS.value);
    document.getElementById('lblGainF').textContent = fGHz.toFixed(1);
    document.getElementById('lblGainD').textContent = D.toFixed(1);
    dWrap.style.display = ty.area ? '' : 'none';
    const lam = c / (fGHz * 1e9);
    const A = Math.PI * (D / 2) * (D / 2);
    const Ae = ty.Ae(lam, A), G = ty.G(lam, A);
    const GdB = 10 * log10(G);
    out.innerHTML =
      `λ = c/f = <b>${lam >= 0.01 ? lam.toFixed(4) : lam.toExponential(2)} m</b>` +
      (ty.area ? ` · A = π(Ø/2)² = π(${(D / 2).toFixed(2)})² = <b>${A.toFixed(4)} m²</b> <span style="color:${C4.bad}">← ใช้รัศมี ไม่ใช่ Ø!</span>` : '') +
      `<br/>Ae (พื้นที่ประสิทธิผล) = <b>${Ae >= 0.001 ? Ae.toFixed(4) : Ae.toExponential(2)} m²</b>
       · G = <b>${G >= 100 ? G.toFixed(0) : G.toFixed(2)} เท่า</b> (ไม่มีหน่วย!)
       · G = 10·log₁₀(G) = <b>${GdB.toFixed(2)} dB</b>`;
  }
  sel.addEventListener('change', draw);
  fS.addEventListener('input', draw);
  dS.addEventListener('input', draw);
  draw();
})();

// ---------------------------------------------------------------
// 4) Stepper: การแพร่กระจาย 3 โหมด (ground / sky / LOS) บนโลกโค้ง
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('propStepper');
  if (!el) return;
  const W = 560, H = 300;
  // โลก = วงกลมใหญ่ใต้จอ (โค้งเว่อร์เพื่อให้เห็น)
  const eR = 620, ecx = W / 2, ecy = H + eR - 92;
  const surfY = (x) => ecy - Math.sqrt(Math.max(0, eR * eR - (x - ecx) * (x - ecx)));

  const LBL = [
    'ขั้น 1 · คลื่นดิน (ground wave) ≤ 2 MHz — เกาะผิวโลก โค้งตามได้ ไปไกล · ตัวอย่าง: วิทยุ AM (~1 MHz)',
    'ขั้น 2 · คลื่นฟ้า (sky wave) 2–30 MHz — สะท้อนชั้นไอโอโนสเฟียร์ เด้งไป-มา (hop) ได้หลายช่วง · วิทยุสมัครเล่น',
    'ขั้น 3 · เส้นสายตา (LOS) > 30 MHz — วิ่งเส้นตรง ต้อง "มองเห็นกัน ไม่มีอะไรบัง" → ต้องทำเสาสูง · ไมโครเวฟ/ดาวเทียม',
    'ขั้น 4 · สรุป: ความถี่เป็นตัวเลือกโหมด — ต่ำเกาะดิน กลางเด้งฟ้า สูงพุ่งตรง (แลกกัน: ยิ่งสูงยิ่งจุข้อมูล แต่ยิ่งต้องเล็ง)',
  ];

  function earth(ink, line) {
    let d = '';
    for (let x = 0; x <= W; x += 8) d += (x === 0 ? 'M' : 'L') + x + ',' + surfY(x).toFixed(1);
    return `<path d="${d} L ${W},${H} L 0,${H} Z" fill="${line}55" stroke="${line}"/>
      <text x="${W / 2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="${ink}">โลก (โค้งจริง — วาดเว่อร์ให้เห็น)</text>`;
  }
  function tower(x, h, color, label, ink) {
    const y = surfY(x);
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - h}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y - h}" r="4" fill="${color}"/>
      ${label ? `<text x="${x}" y="${y - h - 8}" text-anchor="middle" font-size="10.5" fill="${ink}">${label}</text>` : ''}`;
  }

  createStepper(el, {
    steps: 4,
    stepDuration: 2100,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const line = cssVar('--line-2', '#d9d4c7');
      const ink = cssVar('--text-dim', '#7c7f8a');
      const k = easeOut(t);
      let body = '';
      const tx = 70, rx = 490;

      if (step === 0 || step === 3) {
        // ground wave: เส้นตามผิวโลก ยกขึ้นเล็กน้อย
        let d = '';
        const upto = step === 0 ? tx + (rx - tx) * k : rx;
        for (let x = tx; x <= upto; x += 6) d += (x === tx ? 'M' : 'L') + x + ',' + (surfY(x) - 14).toFixed(1);
        body += `<path d="${d}" fill="none" stroke="${C4.ok}" stroke-width="2.5"/>
          <text x="${tx + 60}" y="${surfY(tx + 60) - 24}" font-size="11" fill="${C4.ok}">ground ≤ 2 MHz (AM)</text>`;
      }
      if (step === 1 || step === 3) {
        // sky wave: ขึ้น-สะท้อน ionosphere-ลง สองฮอป
        const iy = 44;
        body += `<line x1="0" y1="${iy}" x2="${W}" y2="${iy}" stroke="${C4.sig}" stroke-dasharray="7 5"/>
          <text x="${W - 4}" y="${iy - 6}" text-anchor="end" font-size="11" fill="${C4.sig}">ชั้นไอโอโนสเฟียร์ (มีไอออน)</text>`;
        const mid1 = (tx + W / 2) / 2, mid2 = (W / 2 + rx) / 2;
        const pts = [
          [tx, surfY(tx) - 8], [mid1, iy], [W / 2, surfY(W / 2) - 8], [mid2, iy], [rx, surfY(rx) - 8],
        ];
        const total = step === 1 ? k * (pts.length - 1) : pts.length - 1;
        let d = 'M' + pts[0][0] + ',' + pts[0][1];
        for (let i = 1; i < pts.length; i++) {
          if (i - 1 < total) {
            const frac = Math.min(1, total - (i - 1));
            const x = pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * frac;
            const y = pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * frac;
            d += 'L' + x.toFixed(1) + ',' + y.toFixed(1);
          }
        }
        body += `<path d="${d}" fill="none" stroke="${C4.warn}" stroke-width="2.5"/>
          <text x="${mid1 - 4}" y="${(iy + surfY(tx)) / 2 - 20}" font-size="11" fill="${C4.warn}">sky 2–30 MHz (hop)</text>`;
      }
      if (step === 2 || step === 3) {
        // LOS: เส้นตรงจากยอดเสาถึงยอดเสา
        const hT = 64, hR = 40;
        const x1 = tx, y1 = surfY(tx) - hT, x2 = rx, y2 = surfY(rx) - hR;
        const ex = step === 2 ? x1 + (x2 - x1) * k : x2;
        const ey = step === 2 ? y1 + (y2 - y1) * k : y2;
        body += tower(x1, hT, C4.main, 'เสาสูง', ink) + tower(x2, hR, C4.main, '', ink) +
          `<line x1="${x1}" y1="${y1}" x2="${ex}" y2="${ey}" stroke="${C4.main}" stroke-width="2.5"/>
           <text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) - 10}" text-anchor="middle" font-size="11" fill="${C4.main}">LOS > 30 MHz — ต้องมองเห็นกัน</text>`;
        if (step === 2) {
          body += `<text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) + 30}" text-anchor="middle" font-size="10.5" fill="${ink}">โลกโค้ง → ยิ่งไกลยิ่งต้องยกเสาสูงหนีขอบโลก (เดี๋ยวมีสูตร!)</text>`;
        }
      } else if (step !== 3) {
        body += tower(tx, 26, ink, 'ส่ง', ink) + tower(rx, 26, ink, 'รับ', ink);
      }
      if (step === 3) body += tower(tx, 64, C4.main, '', ink) + tower(rx, 40, C4.main, '', ink);

      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${earth(ink, line)}${body}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 5) LOS Lab — ความสูงเสา → ระยะขอบฟ้าวิทยุ d = 3.57(√Kh₁ + √Kh₂)
// ---------------------------------------------------------------
(function () {
  const h1S = document.getElementById('losH1');
  if (!h1S) return;
  const h2S = document.getElementById('losH2');
  const out = document.getElementById('losOut');
  const box = document.getElementById('losSvg');
  let K = 4 / 3;

  function draw() {
    const h1 = parseFloat(h1S.value), h2 = parseFloat(h2S.value);
    document.getElementById('lblLosH1').textContent = h1;
    document.getElementById('lblLosH2').textContent = h2;
    const d = 3.57 * (Math.sqrt(K * h1) + Math.sqrt(K * h2));
    const dOpt = 3.57 * (Math.sqrt(h1) + Math.sqrt(h2));
    out.innerHTML = `d = 3.57(√(K·${h1}) + √(K·${h2})) = <b>${d.toFixed(1)} กม.</b> ${K > 1
      ? `<span class="hint">(K = 4/3 คลื่นวิทยุหักเหโค้งตาม → ไกลกว่าแสงที่เห็น ${dOpt.toFixed(1)} กม.)</span>`
      : '<span class="hint">(K = 1 = ขอบฟ้าที่ "ตามอง" เห็น)</span>'}`;
    // วาด: โลกโค้ง + เสาสองต้น + เส้นสัมผัสขอบฟ้า
    const W = 560, H = 190;
    const eR = 900, ecx = W / 2, ecy = H + eR - 62;
    const surfY = (x) => ecy - Math.sqrt(Math.max(0, eR * eR - (x - ecx) * (x - ecx)));
    const ink = cssVar('--text-dim', '#7c7f8a');
    const line = cssVar('--line-2', '#d9d4c7');
    const hPx = (m) => 12 + 68 * Math.sqrt(m / 200); // สเกลไม่เชิงเส้นให้ดูรู้เรื่อง
    const x1 = 60, x2 = 500;
    const y1 = surfY(x1) - hPx(h1), y2 = surfY(x2) - hPx(h2);
    let earth = '';
    for (let x = 0; x <= W; x += 8) earth += (x === 0 ? 'M' : 'L') + x + ',' + surfY(x).toFixed(1);
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
      <path d="${earth} L ${W},${H} L 0,${H} Z" fill="${line}55" stroke="${line}"/>
      <line x1="${x1}" y1="${surfY(x1)}" x2="${x1}" y2="${y1}" stroke="${C4.main}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${x2}" y1="${surfY(x2)}" x2="${x2}" y2="${y2}" stroke="${C4.sig}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C4.warn}" stroke-width="2" ${K > 1 ? '' : 'stroke-dasharray="6 4"'}/>
      <text x="${x1 + 6}" y="${y1 - 6}" font-size="11" fill="${C4.main}">h₁ = ${h1} m</text>
      <text x="${x2 - 6}" y="${y2 - 6}" text-anchor="end" font-size="11" fill="${C4.sig}">h₂ = ${h2} m</text>
      <text x="${W / 2}" y="${Math.min(y1, y2) - 8}" text-anchor="middle" font-size="12" fill="${C4.warn}">d ≈ ${d.toFixed(1)} กม.</text>
    </svg>`;
  }
  h1S.addEventListener('input', draw);
  h2S.addEventListener('input', draw);
  document.querySelectorAll('[data-losk]').forEach((b) => b.addEventListener('click', () => {
    K = b.dataset.losk === 'radio' ? 4 / 3 : 1;
    document.querySelectorAll('[data-losk]').forEach((x) => x.classList.toggle('ghost', x !== b));
    draw();
  }));
  draw();
})();

// ---------------------------------------------------------------
// 6) Stepper: Free space loss — พลังงานเกลี่ยบนผิวทรงกลม → สูตร → กราฟ dB
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('fslStepper');
  if (!el) return;
  const W = 560, H = 300;
  const LBL = [
    'ขั้น 1 · เสาส่งแผ่กำลัง Pₜ ทุกทิศ — ที่ระยะ d พลังงานถูก "เกลี่ย" ทั่วผิวทรงกลม 4πd²',
    'ขั้น 2 · ระยะ ×2 → ผิวทรงกลม ×4 → ความหนาแน่นเหลือ ¼ = หายไป 6.02 dB',
    'ขั้น 3 · ระยะ ×4 → เหลือ 1/16 (−12 dB) · กฎจำ: ระยะ×2 = +6 dB loss · ระยะ×10 = +20 dB',
    'ขั้น 4 · ฝั่งรับเก็บคลื่นได้ตามพื้นที่ Ae — isotropic มี Ae = λ²/4π → ยิ่งความถี่สูง (λ สั้น) ยิ่งเก็บได้น้อย',
    'ขั้น 5 · รวมร่าง: Loss = (4πd/λ)² → หน่วย dB: L = 20log f + 20log d − 147.56 (เส้นตรงบนแกน log)',
  ];
  createStepper(el, {
    steps: 5,
    stepDuration: 2000,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const line = cssVar('--line-2', '#d9d4c7');
      const ink = cssVar('--text-dim', '#7c7f8a');
      const k = easeOut(t);
      let body = '';
      if (step <= 3) {
        const cx = 120, cy = H / 2;
        const radii = [70, 140, 280];
        const upTo = step === 0 ? 0 : step === 1 ? 1 : 2;
        const dens = ['P/4πd²', '¼ เท่า (−6.02 dB)', '1/16 เท่า (−12.04 dB)'];
        radii.forEach((r, i) => {
          if (i > upTo) return;
          const rr = i === upTo ? r * (0.3 + 0.7 * (step === 3 ? 1 : k)) : r;
          const op = 1 - i * 0.22;
          body += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${C4.sig}" stroke-width="${2.4 - i * 0.5}" opacity="${op}"/>
            <text x="${cx + rr - 4}" y="${cy - 8}" text-anchor="end" font-size="11" fill="${C4.sig}">${['d', '2d', '4d'][i]}</text>
            <text x="${cx + rr - 4}" y="${cy + 14}" text-anchor="end" font-size="10.5" fill="${ink}">${dens[i]}</text>`;
        });
        body += `<circle cx="${cx}" cy="${cy}" r="6" fill="${C4.warn}"/>
          <text x="${cx}" y="${cy + 24}" text-anchor="middle" font-size="11" fill="${ink}">Pₜ</text>`;
        // ผืนพลังงานเท่าเดิม เกลี่ยบนผิวกว้างขึ้น
        if (step >= 1 && step <= 2) {
          body += `<text x="${W - 8}" y="26" text-anchor="end" font-size="11.5" fill="${ink}">พลังงานก้อนเดิม — แต่ผิวที่ต้องแบ่งใหญ่ขึ้น ×4 ทุกครั้งที่ระยะ ×2</text>`;
        }
        if (step === 3) {
          const rxX = 470, rxY = H / 2;
          body += `<rect x="${rxX - 7}" y="${rxY - 26}" width="14" height="52" rx="4" fill="${C4.ok}"/>
            <text x="${rxX}" y="${rxY - 34}" text-anchor="middle" font-size="11" fill="${C4.ok}">เสารับ: เก็บได้ = Ae</text>
            <text x="${rxX}" y="${rxY + 46}" text-anchor="middle" font-size="10.5" fill="${ink}">Ae(iso) = λ²/4π — λ สั้น → "มือ" เล็กลง</text>`;
        }
      } else {
        // กราฟ L(dB) vs d (log) — ทรงเดียวกับสไลด์ 39
        const pad = { l: 60, r: 16, t: 20, b: 40 };
        const x0 = pad.l, x1 = W - pad.r, y0 = H - pad.b, y1 = pad.t;
        const dMin = 1, dMax = 100; // km
        const sx = (dkm) => x0 + ((log10(dkm) - log10(dMin)) / (log10(dMax) - log10(dMin))) * (x1 - x0);
        const sy = (L) => y0 - ((L - 60) / (180 - 60)) * (y0 - y1);
        const freqs = [[30e6, '30 MHz'], [300e6, '300 MHz'], [3e9, '3 GHz'], [30e9, '30 GHz'], [300e9, '300 GHz']];
        body += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${line}"/>
          <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="${line}"/>`;
        [1, 5, 10, 50, 100].forEach((dk) => {
          body += `<text x="${sx(dk)}" y="${y0 + 16}" text-anchor="middle" font-size="10" fill="${ink}">${dk}</text>`;
        });
        [60, 90, 120, 150, 180].forEach((L) => {
          body += `<line x1="${x0}" y1="${sy(L)}" x2="${x1}" y2="${sy(L)}" stroke="${line}" stroke-dasharray="3 5"/>
            <text x="${x0 - 6}" y="${sy(L) + 3}" text-anchor="end" font-size="10" fill="${ink}">${L}</text>`;
        });
        body += `<text x="${(x0 + x1) / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="${ink}">ระยะทาง (กม., สเกล log)</text>
          <text x="16" y="${(y0 + y1) / 2}" font-size="10.5" fill="${ink}" transform="rotate(-90 16 ${(y0 + y1) / 2})">Loss (dB)</text>`;
        const nShow = Math.max(1, Math.ceil(freqs.length * (0.2 + 0.8 * k)));
        freqs.slice(0, nShow).forEach(([f, name], i) => {
          const L = (dkm) => 20 * log10(f) + 20 * log10(dkm * 1000) - 147.56;
          body += `<line x1="${sx(dMin)}" y1="${sy(L(dMin))}" x2="${sx(dMax)}" y2="${sy(L(dMax))}" stroke="${C4.main}" stroke-width="2" opacity="${0.45 + i * 0.14}"/>
            <text x="${x1 - 2}" y="${sy(L(dMax)) - 4}" text-anchor="end" font-size="10" fill="${C4.main}">${name}</text>`;
        });
        body += `<text x="${x0 + 10}" y="${y1 + 12}" font-size="11" fill="${ink}">ยิ่งความถี่สูง / ยิ่งไกล → loss ยิ่งมาก (ทุกเส้นชัน 20 dB ต่อ ×10)</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">${body}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 7) Walkthroughs — โจทย์ที่อาจารย์ทำสดในห้อง (ตัวเลข verify ด้วย node แล้ว)
// ---------------------------------------------------------------
mountWalk('walkDipole', [
  { title: 'อ่านโจทย์ + เลือกสูตร', body: 'โจทย์: ไดโพลครึ่งคลื่น รับความถี่ 100 MHz — ถามความยาวเสา (เมตร)\n\n"ครึ่งคลื่น" บอกสูตรตรง ๆ:  L = λ/2\nแต่ยังไม่รู้ λ → ต้องหาจาก  λ = c/f  ก่อน', note: '🎙 อาจารย์: สูตร λ = c/f ในห้องสอบไม่มีให้ — "จำไม่ได้ ช่วยไม่ได้นะครับ"' },
  { title: 'หา λ (ระวังหน่วย MHz!)', body: 'λ = c/f = (3×10⁸) ÷ (100×10⁶)\n           = 3 m\n\n⚠️ 100 MHz = 100×10⁶ = 10⁸ Hz (เมกะ = 10⁶)', note: '🎙 กับดักที่อาจารย์ดักไว้กลางห้อง: ใครเผลอเขียน 10⁹ (กิกะ) จะได้ λ = 0.003 m — "ความหมายเปลี่ยนเลยนะครับ"' },
  { title: 'ตอบ + ต่อยอดควอเตอร์เวฟ', body: 'L = λ/2 = 3/2 = 1.5 m   ← คำตอบ\n\nอาจารย์ถามต่อ: ถ้าเป็น quarter-wave (Marconi) ล่ะ?\nL = λ/4 = 0.75 m = 75 cm', note: 'โจทย์ง่ายแต่เก็บคะแนนฟรี — พลาดได้ทางเดียวคือหน่วยกับจำสูตรไม่ได้' },
]);

mountWalk('walkDish', [
  { title: 'อ่านโจทย์ + เลือกสูตรจากตาราง', body: 'โจทย์: จานพาราโบลา Ø 2 เมตร ใช้ความถี่ 12 GHz\nถาม (ก) พื้นที่ประสิทธิผล Ae (ตร.ม.)  (ข) เกน G เป็น dB\n\nจากตารางสไลด์ 17 แถว "พาราโบลา":\n  Ae = 0.56·A     และ     G = 7A/λ²', note: '🎙 อาจารย์: "วิชานี้สูตรจะเยอะ แต่เลือกให้ถูก ทำไปมันก็จะไม่ยาก" — โจทย์บอกชนิดสายอากาศเสมอ ชนิดคือตัวชี้แถวในตาราง' },
  { title: 'หา A ก่อน (จุดพลาดอันดับหนึ่ง)', body: 'A = พื้นที่หน้าตัด (วงกลม) = π·r²\nร้ศมี r = Ø/2 = 2/2 = 1 m\nA = π(1)² = π ≈ 3.1416 m²', note: '🎙 อาจารย์ย้ำ 2 กับดัก: (1) วงกลมใช้ πr² ไม่ใช่ 2πr (นั่นคือเส้นรอบวง!) (2) โจทย์ให้เส้นผ่านศูนย์กลาง — ต้องหาร 2 เป็นรัศมีก่อน และถ้าให้มาเป็น cm ต้องแปลงเป็นเมตรก่อน' },
  { title: '(ก) พื้นที่ประสิทธิผล', body: 'Ae = 0.56 × A = 0.56 × π = 1.76 m²   ← คำตอบ (ก)', note: 'Ae คือ "ขนาดมือที่ใช้รับคลื่นจริง" — เล็กกว่าหน้าจานเพราะรับได้ไม่เต็มร้อย' },
  { title: 'หา λ สำหรับสูตรเกน', body: 'λ = c/f = (3×10⁸) ÷ (12×10⁹) = 0.025 m\n\n(12 GHz = 12×10⁹ — คราวนี้กิกะจริง ๆ)', note: '' },
  { title: '(ข) เกน — ใช้ A ไม่ใช่ Ae!', body: 'G = 7A/λ² = (7 × 3.1416) ÷ (0.025)²\n  = 21.99 ÷ 0.000625\n  = 35,186 เท่า   (ไม่มีหน่วย)\n\nแปลงเป็น dB: G(dB) = 10·log₁₀(35186) = 45.46 dB   ← คำตอบ (ข)', note: '🎙 จุดที่อาจารย์เตือนแรงสุดในข้อนี้: "บางคนเอา Ae ไปแทนในสูตร 7A/λ² — ผิดเลยนะ" สูตรเกนใช้ A พื้นที่หน้าตัด · และ G เพล่า ๆ ไม่มีหน่วย "ใครใส่หน่วยเป็น dB ตรงนี้ปุ๊บ จบเลย" — จะเป็น dB ต่อเมื่อใส่ 10log แล้วเท่านั้น' },
]);

mountWalk('walkLOS', [
  { title: 'ข้อ (ก): เสาส่ง 100 m เสารับอยู่พื้นดิน', body: 'เสารับอยู่พื้นดิน → h₂ = 0 → เทอม √(Kh₂) = 0\nเหลือ  d = 3.57·√(K·h₁)   โดย K = 4/3 (คลื่นวิทยุ)\n\nd = 3.57 × √(4/3 × 100)\n  = 3.57 × √133.33\n  = 3.57 × 11.55 = 41.2 กม.   ← คำตอบ (ก)', note: '🎙 อาจารย์ให้ความรู้สึกของตัวเลข: "เสาสูงตั้ง 100 เมตร ยังส่งได้แค่ ~41 กิโล" — โลกโค้งโหดกว่าที่คิด นี่คือเหตุผลที่เสาสัญญาณต้องมีเยอะ' },
  { title: 'ข้อ (ข): เพิ่มเสารับเป็น 10 m — เสาส่งลดเหลือเท่าไหร่?', body: 'โจทย์กลับด้าน: ระยะเท่าเดิม (41.2 กม.) แต่คราวนี้ h₂ = 10 m\nหา h₁ ใหม่จากสมการเต็ม:\n\n41.2 = 3.57(√(K·h₁) + √(4/3 × 10))\n41.2/3.57 = √(K·h₁) + √13.33\n11.55 − 3.65 = √(K·h₁) = 7.90', note: 'เทคนิค: หารทั้งสองข้างด้วย 3.57 ก่อน แล้วย้ายเทอมที่รู้ค่า — อย่ารีบยกกำลังสองตั้งแต่ยังมีบวกอยู่ในราก' },
  { title: 'แก้ราก → คำตอบ', body: '√(K·h₁) = 7.90\nK·h₁ = 62.34\nh₁ = 62.34 ÷ (4/3) = 46.75 ≈ 47 m   ← คำตอบ (ข)\n\nเช็กความหมาย: ยกเสารับขึ้นแค่ 10 เมตร\nเสาส่งลดจาก 100 → ~47 เมตร (ลดกว่าครึ่ง!)', note: '🎙 ตรงกับที่อาจารย์เฉลยในห้อง (~47 เมตร) — สองฝั่งช่วยกันถูกกว่าฝั่งเดียวแบก เพราะ d โตตาม "ราก" ของความสูง (ยกเสาสูงขึ้น 4 เท่า ได้ระยะแค่ 2 เท่า)' },
]);

mountWalk('walkSat', [
  { title: 'อ่านโจทย์ (การบ้านท้ายคาบ w4)', body: 'ดาวเทียมห่างจากพื้นโลก d = 35,368 กม. ส่งลงมาที่ f = 4 GHz\n(ก) Loss (dB) ถ้าใช้สายอากาศไอโซทรอปิก\n(ข) กำลังรับ ถ้าส่ง Pₜ = 250 W\n(ค) Loss ใหม่ ถ้าเสาส่งมีเกน 44 dB เสารับ 48 dB\n(ง) กำลังรับของข้อ (ค) ที่ Pₜ = 250 W เท่าเดิม', note: 'โจทย์นี้คือ link budget ของจริง — dB จาก Week 1 กลับมาเต็มตัว' },
  { title: '(ก) Loss ไอโซทรอปิก — สูตร dB ตรง ๆ', body: 'L(dB) = 20·log f + 20·log d − 147.56    (f เป็น Hz, d เป็นเมตร!)\n\nf = 4×10⁹ Hz → 20·log(4×10⁹) = 192.04\nd = 35,368 กม. = 3.5368×10⁷ m → 20·log = 150.97\n\nL = 192.04 + 150.97 − 147.56 = 195.45 dB   ← คำตอบ (ก)', note: '⚠️ กับดักหน่วย: d ต้องเป็นเมตร (คูณ 1000 จาก กม.) — ลืมคูณ = หายไป 60 dB เต็ม ๆ' },
  { title: '(ข) กำลังรับ — ลบกันเป็น dB', body: 'Pₜ = 250 W → 10·log(250) = 23.98 dBW\n\nPᵣ = Pₜ(dBW) − L(dB) = 23.98 − 195.45\n   = −171.47 dBW   ← คำตอบ (ข)\n\n(ถอดกลับ: 10^(−17.147) ≈ 7×10⁻¹⁸ W — จิ๋วระดับอะตอม!)', note: 'นี่คือเหตุผลที่จานดาวเทียมต้องมีเกนสูง ๆ — สัญญาณจากอวกาศแผ่วขนาดนี้' },
  { title: '(ค) ใส่เกนสายอากาศ — แค่ลบต่อ', body: 'L_G(dB) = L_iso − Gₜ(dB) − Gᵣ(dB)\n        = 195.45 − 44 − 48\n        = 103.45 dB   ← คำตอบ (ค)\n\nเกนสายอากาศ = "ได้คืน" — บีบลำคลื่นเล็งหากัน แทนที่จะแผ่ทิ้งรอบทิศ', note: '' },
  { title: '(ง) กำลังรับรอบใหม่', body: 'Pᵣ = 23.98 − 103.45 = −79.47 dBW   ← คำตอบ (ง)\n   (≈ 1.13×10⁻⁸ W)\n\nเทียบกัน: เกนรวม 92 dB ทำให้กำลังรับโตขึ้น ~1.6 พันล้านเท่า\nจาก 10⁻¹⁸ → 10⁻⁸ W — จานคือพระเอกของการสื่อสารดาวเทียม', note: '💡 หมายเหตุเทียบตำรา (เสริมจากผู้เขียน): หนังสือ Stallings ใช้ d = 35,863 กม. (ได้ 195.57 dB) — เลขในสไลด์คือ 35,368 เราคิดตามสไลด์ ผลต่างแค่ ~0.12 dB วิธีทำเหมือนกันเป๊ะ' },
]);

// ---------------------------------------------------------------
// 8) โค้ดรันได้ — โจทย์ทุกข้อของบทในไม่กี่บรรทัด
// ---------------------------------------------------------------
mountRunner('runner', `// ═══ Week 4: สายอากาศ + การแพร่กระจาย — ตรวจโจทย์ทุกข้อในบท ═══
const c = 3e8, log10 = Math.log10;

// ① ไดโพลครึ่งคลื่น 100 MHz
const lam1 = c / 100e6;
console.log('① λ =', lam1, 'm → L = λ/2 =', lam1/2, 'm · λ/4 =', lam1/4, 'm');

// ② จานพาราโบลา Ø 2 m @ 12 GHz
const lam2 = c / 12e9, A = Math.PI * (2/2)**2;
const Ae = 0.56 * A, G = 7 * A / lam2**2;
console.log('② A =', A.toFixed(4), 'm² · Ae =', Ae.toFixed(2), 'm² · G =',
  G.toFixed(0), '=', (10*log10(G)).toFixed(2), 'dB');

// ③ LOS: เสาส่ง 100 m → พื้นดิน / เสารับ 10 m
const K = 4/3;
const d = 3.57 * Math.sqrt(K * 100);
console.log('③ d =', d.toFixed(1), 'km');
const h1 = (d/3.57 - Math.sqrt(K*10))**2 / K;
console.log('   เสารับ 10 m → เสาส่งเหลือ', h1.toFixed(1), 'm');

// ④ การบ้านดาวเทียม: 35,368 km @ 4 GHz, Pt = 250 W, เกน 44+48 dB
const Ldb = 20*log10(4e9) + 20*log10(35368e3) - 147.56;
const Pt = 10*log10(250);
console.log('④ L_iso =', Ldb.toFixed(2), 'dB · Pr =', (Pt - Ldb).toFixed(2), 'dBW');
const Lg = Ldb - 44 - 48;
console.log('   มีเกน: L_G =', Lg.toFixed(2), 'dB · Pr =', (Pt - Lg).toFixed(2), 'dBW');
`);

// ---------------------------------------------------------------
// 9) ข้อสอบจับเวลา
// ---------------------------------------------------------------
mountExam([25, 18, 12]);
