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

// ④ การบ้านครั้งที่ 2 ข้อ 1-2: ดาวเทียม 35,368 km @ 4 GHz, Pt = 250 W, เกน 44+48 dB
const Ldb = 20*log10(4e9) + 20*log10(35368e3) - 147.56;
const Pt = 10*log10(250);
console.log('④ L_iso =', Ldb.toFixed(2), 'dB · Pr =', (Pt - Ldb).toFixed(2), 'dBW');
const Lg = Ldb - 44 - 48;
console.log('   มีเกน: L_G =', Lg.toFixed(2), 'dB · Pr =', (Pt - Lg).toFixed(2), 'dBW');

// ⑤ การบ้านครั้งที่ 2 ข้อ 3: จาน Ø 100 cm (= 1 m!) @ 40 GHz
const lam5 = c / 40e9, A5 = Math.PI * (1/2)**2;
console.log('⑤ Ae =', (0.56*A5).toFixed(4), 'm² · G =', (7*A5/lam5**2).toFixed(0),
  '=', (10*log10(7*A5/lam5**2)).toFixed(2), 'dB');

// ⑥ การบ้านครั้งที่ 2 ข้อ 4: 20,000 km @ 5 GHz, Pt = 120 W, เกน 20+45 dB → dBm
const L6 = 20*log10(5e9) + 20*log10(2e7) - 147.56;
const Lg6 = L6 - 20 - 45;
console.log('⑥ L_iso =', L6.toFixed(2), '· L_G =', Lg6.toFixed(2),
  'dB · Pr =', (10*log10(120) + 30 - Lg6).toFixed(2), 'dBm');

// ═══ สไลด์ 41–88 ═══
// ⑦ Path loss exponent (สไลด์ 46): 1.9 GHz, 1.5 km, โล่ง vs เมือง n = 3.1
const lam7 = c / 1.9e9, K7 = 20*log10(4*Math.PI/lam7), d7 = 1500;
const pl = (n) => K7 + 10*n*log10(d7);
console.log('⑦ ก้อนความถี่ =', K7.toFixed(2), 'dB · โล่ง(n=2) =', pl(2).toFixed(2),
  '· เมือง(n=3.1) =', pl(3.1).toFixed(2), '→ ต่าง', (pl(3.1)-pl(2)).toFixed(2), 'dB');

// ⑧ Thermal noise: T = 290 K, B = 1 MHz
const T = 290, B = 1e6, kB = 1.3803e-23;
console.log('⑧ 10log k =', (10*log10(kB)).toFixed(2), '· N0 =', (10*log10(kB*T)).toFixed(2),
  'dBW/Hz · N =', (10*log10(kB*T*B)).toFixed(2), 'dBW');

// ⑨ การบ้านครั้งที่ 3 ข้อ 1: Eb/N0 = 8.4 dB, T = 290 K, R = 2400 bps → S?
const S9 = 8.4 + 10*log10(2400) - 228.6 + 10*log10(290);
console.log('⑨ S =', S9.toFixed(2), 'dBW =', (S9+30).toFixed(2), 'dBm');
console.log('   ตรวจย้อน Eb/N0 =',
  (10*log10(Math.pow(10, S9/10) / (2400 * kB * 290))).toFixed(2), 'dB');

// ⑩ การบ้านครั้งที่ 3 ข้อ 2: spectral efficiency 6 bps/Hz → Eb/N0?
const snr10 = Math.pow(2, 6) - 1;
console.log('⑩ S/N =', snr10, '=', (10*log10(snr10)).toFixed(2), 'dB → Eb/N0 =',
  (snr10/6).toFixed(2), '=', (10*log10(snr10/6)).toFixed(2), 'dB');

// ⑪ การบ้านครั้งที่ 3 ข้อ 3: ฮอร์น r = 25 cm @ 5 GHz
const A11 = Math.PI * 0.25**2, lam11 = c/5e9;
console.log('⑪ A =', A11.toFixed(4), 'm² · Ae = 0.81A =', (0.81*A11).toFixed(4),
  'm² · G = 10A/λ² =', (10*A11/lam11**2).toFixed(1),
  '=', (10*log10(10*A11/lam11**2)).toFixed(2), 'dB');
`);

/* ═══════════════════════════════════════════════════════════════
   ส่วนที่ 2 ของ Week 4 — สไลด์ 41–88
   (path loss exponent · noise · Eb/N0 · multipath/fading · การชดเชย)
   ⚠️ คาบ 20 ก.ค. อาจารย์สอนส่วนนี้ แต่ไฟล์เสียงเสีย (อัดได้ 14 วินาที)
   → เนื้อหาส่วนนี้เรียบเรียงจาก "สไลด์" เป็นหลัก ไม่มีกล่อง 🎙
   ตัวเลขทุกตัว verify ด้วย node แล้ว
   ═══════════════════════════════════════════════════════════════ */

// ---------------------------------------------------------------
// 10) Stepper: path loss exponent — โลกจริงชันกว่าอวกาศว่าง
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('pleStepper');
  if (!el) return;
  const W = 580, H = 320, pad = { l: 52, r: 16, t: 16, b: 40 };
  const c = 3e8, f = 1.9e9, lam = c / f;
  const K0 = 20 * log10(4 * Math.PI / lam);          // 38.02 dB — เทอมความถี่
  const loss = (d, n) => K0 + 10 * n * log10(d);      // d เป็นเมตร
  const d0 = 10, d1 = 10000;                          // 10 m → 10 km
  const sx = (d) => pad.l + (log10(d) - log10(d0)) / (log10(d1) - log10(d0)) * (W - pad.l - pad.r);
  const sy = (v) => H - pad.b - (v - 40) / (170 - 40) * (H - pad.t - pad.b);
  const CURVES = [
    { n: 2, c: C4.ok, lbl: 'n = 2 · ที่โล่ง/อวกาศว่าง' },
    { n: 2.7, c: C4.sig, lbl: 'n = 2.7 · เมือง (ขอบล่าง)' },
    { n: 3.1, c: C4.warn, lbl: 'n = 3.1 · เมือง (โจทย์)' },
    { n: 4.8, c: C4.bad, lbl: 'n = 4.8 · ในตึกมีสิ่งกีดขวาง' },
  ];
  const LBL = [
    'ขั้น 1 · เริ่มจากที่เรารู้แล้ว: อวกาศว่าง n = 2 — กำลังลดตาม 1/d² (แผ่บนผิวทรงกลม)',
    'ขั้น 2 · เมืองจริง n = 2.7–3.5 — ตึกบัง สะท้อน กระเจิง → เส้น "ชันขึ้น" กำลังหายเร็วกว่าเดิม',
    'ขั้น 3 · โจทย์สไลด์ 46: n = 3.1 ที่ 1.9 GHz — ลากไปที่ d = 1.5 กม.',
    'ขั้น 4 · อ่านผลต่าง: ที่ 1.5 กม. โล่ง = 101.54 dB · เมือง = 136.47 dB → ต่างกัน 34.94 dB!',
    'ขั้น 5 · ในตึก n สูงถึง 4–6 — นี่คือเหตุผลที่ Wi-Fi ทะลุ 2 ห้องแล้วสัญญาณหายไปเกือบหมด',
  ];
  function curvePath(n) {
    let d = '', started = false;
    for (let i = 0; i <= 60; i++) {
      const dd = Math.pow(10, log10(d0) + (log10(d1) - log10(d0)) * i / 60);
      const v = loss(dd, n);
      if (v > 168) break;                     // ตัดไม่ให้เส้นทะลุกรอบบน
      d += (started ? 'L' : 'M') + sx(dd).toFixed(1) + ',' + sy(v).toFixed(1);
      started = true;
    }
    return d;
  }
  createStepper(el, {
    steps: 5, stepDuration: 1500,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const show = step === 0 ? 1 : step === 1 ? 2 : step >= 4 ? 4 : 3;
      let g = '';
      // grid
      for (const v of [60, 90, 120, 150]) {
        g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(v)}" y2="${sy(v)}" stroke="${line}" stroke-dasharray="2 4"/>
              <text x="${pad.l - 6}" y="${sy(v) + 4}" text-anchor="end" font-size="10" fill="${ink}">${v}</text>`;
      }
      for (const v of [10, 100, 1000, 10000]) {
        g += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${pad.t}" y2="${H - pad.b}" stroke="${line}" stroke-dasharray="2 4"/>
              <text x="${sx(v)}" y="${H - pad.b + 15}" text-anchor="middle" font-size="10" fill="${ink}">${v >= 1000 ? (v / 1000) + ' กม.' : v + ' m'}</text>`;
      }
      for (let i = 0; i < show; i++) {
        const cv = CURVES[i];
        const grow = i === show - 1 ? (0.25 + 0.75 * easeOut(t)) : 1;
        g += `<path d="${curvePath(cv.n)}" fill="none" stroke="${cv.c}" stroke-width="${cv.n === 3.1 ? 3 : 2}"
                 stroke-dasharray="${W * 2}" stroke-dashoffset="${(1 - grow) * W * 2}" opacity="${cv.n === 3.1 && step >= 2 ? 1 : .85}"/>`;
        // legend มุมซ้ายบน (ไม่ทับเส้น/ไม่ทับป้ายระยะ)
        const ly = pad.t + 16 + i * 15;
        g += `<line x1="${pad.l + 6}" x2="${pad.l + 26}" y1="${ly}" y2="${ly}" stroke="${cv.c}" stroke-width="3"/>
              <text x="${pad.l + 31}" y="${ly + 3.5}" font-size="10.5" fill="${cv.c}" font-weight="700">${cv.lbl}</text>`;
      }
      if (step >= 2) {
        const dm = 1500;
        g += `<line x1="${sx(dm)}" x2="${sx(dm)}" y1="${pad.t}" y2="${H - pad.b}" stroke="${C4.main}" stroke-width="2"/>
              <text x="${sx(dm) + 5}" y="${pad.t + 12}" font-size="11" fill="${C4.main}" font-weight="700">d = 1.5 กม.</text>`;
        if (step >= 3) {
          const y2 = sy(loss(dm, 2)), y31 = sy(loss(dm, 3.1));
          g += `<circle cx="${sx(dm)}" cy="${y2}" r="5" fill="${C4.ok}"/><circle cx="${sx(dm)}" cy="${y31}" r="5" fill="${C4.warn}"/>
                <line x1="${sx(dm) - 34}" x2="${sx(dm) - 34}" y1="${y2}" y2="${y31}" stroke="${C4.bad}" stroke-width="2"/>
                <text x="${sx(dm) - 40}" y="${(y2 + y31) / 2}" text-anchor="end" font-size="12" fill="${C4.bad}" font-weight="700">Δ 34.94 dB</text>
                <text x="${sx(dm) + 6}" y="${y2 + 4}" font-size="10.5" fill="${C4.ok}">101.54 dB</text>
                <text x="${sx(dm) + 6}" y="${y31 + 4}" font-size="10.5" fill="${C4.warn}">136.47 dB</text>`;
        }
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:340px">
        <text x="10" y="${pad.t + 2}" font-size="10.5" fill="${ink}">Path loss (dB) — ที่ 1.9 GHz</text>
        ${g}
        <text x="${W / 2}" y="${H - 4}" text-anchor="middle" font-size="10.5" fill="${ink}">ระยะทาง (สเกล log)</text>
      </svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 11) Lab: เครื่องคิด path loss แบบมี n (ปรับเองได้)
// ---------------------------------------------------------------
(function () {
  const fS = document.getElementById('pleF');
  if (!fS) return;
  const dS = document.getElementById('pleD'), nS = document.getElementById('pleN');
  const out = document.getElementById('pleOut');
  function draw() {
    const fGHz = parseFloat(fS.value), dkm = parseFloat(dS.value), n = parseFloat(nS.value);
    document.getElementById('lblPleF').textContent = fGHz.toFixed(2);
    document.getElementById('lblPleD').textContent = dkm.toFixed(2);
    document.getElementById('lblPleN').textContent = n.toFixed(1);
    const lam = 3e8 / (fGHz * 1e9), d = dkm * 1000;
    const term1 = 20 * log10(4 * Math.PI / lam), term2 = 10 * n * log10(d);
    const free = term1 + 20 * log10(d);
    out.innerHTML = `λ = c/f = <b>${lam.toFixed(4)} m</b> · 20·log(4π/λ) = <b>${term1.toFixed(2)} dB</b> (เทอมความถี่ — ไม่ขึ้นกับระยะ)
      <br/>10·n·log(d) = 10 × ${n.toFixed(1)} × log(${d.toFixed(0)}) = <b>${term2.toFixed(2)} dB</b> (เทอมระยะ — n คูณตรงนี้)
      <br/>Path loss = <b style="font-size:1.15em">${(term1 + term2).toFixed(2)} dB</b>
      · เทียบที่โล่ง (n=2) = ${free.toFixed(2)} dB → <b style="color:${C4.bad}">แพงขึ้น ${(term1 + term2 - free).toFixed(2)} dB</b>`;
  }
  [fS, dS, nS].forEach((s) => s.addEventListener('input', draw));
  draw();
})();

// ---------------------------------------------------------------
// 12) Stepper: thermal noise — ทำไมต้อง −228.6
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('noiseStepper');
  if (!el) return;
  const W = 580, H = 250;
  const LBL = [
    'ขั้น 1 · อิเล็กตรอนในตัวนำ "สั่น" ตามความร้อน → เกิดสัญญาณรบกวนพื้นฐานที่กำจัดไม่ได้',
    'ขั้น 2 · ความหนาแน่นของ noise: N₀ = kT  (วัตต์ต่อ 1 Hz) — k = 1.3803×10⁻²³ J/K',
    'ขั้น 3 · เปิดแบนด์วิดท์กว้างขึ้น = กวาด noise เข้ามามากขึ้น → N = kTB (วัตต์)',
    'ขั้น 4 · เป็น dB: N = 10log k + 10log T + 10log B = −228.6 + 10log T + 10log B  (dBW)',
    'ขั้น 5 · ตัวอย่าง T = 290 K, B = 1 MHz → N = −228.6 + 24.62 + 60 = −143.98 dBW',
  ];
  createStepper(el, {
    steps: 5, stepDuration: 1500,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const bw = step >= 2 ? (step === 2 ? 90 + 200 * easeOut(t) : 290) : 90;
      let g = '';
      // แกนความถี่ + พื้น noise
      const y0 = 170, x0 = 60;
      g += `<line x1="${x0}" y1="${y0}" x2="${W - 20}" y2="${y0}" stroke="${ink}" stroke-width="1.5"/>
            <text x="${W - 20}" y="${y0 + 18}" text-anchor="end" font-size="10.5" fill="${ink}">ความถี่ →</text>`;
      // อิเล็กตรอนสั่น (ขั้น 1)
      if (step === 0) {
        for (let i = 0; i < 14; i++) {
          const px = x0 + 20 + i * 32, jitter = Math.sin(t * 12 + i) * 7;
          g += `<circle cx="${px}" cy="${100 + jitter}" r="5" fill="${C4.warn}" opacity=".85"/>`;
        }
        g += `<text x="${W / 2}" y="${60}" text-anchor="middle" font-size="12" fill="${ink}">อิเล็กตรอนปั่นป่วนตามอุณหภูมิ — ยิ่งร้อน ยิ่งสั่นแรง</text>`;
      }
      // แถบ noise floor
      if (step >= 1) {
        const hgt = 26;
        g += `<rect x="${x0}" y="${y0 - hgt}" width="${bw}" height="${hgt}" fill="${C4.bad}55" stroke="${C4.bad}"/>
              <text x="${x0 + bw / 2}" y="${y0 - hgt - 8}" text-anchor="middle" font-size="11.5" fill="${C4.bad}" font-weight="700">${step >= 2 ? 'N = k·T·B' : 'N₀ = k·T (ต่อ 1 Hz)'}</text>`;
        if (step >= 2) g += `<line x1="${x0}" x2="${x0 + bw}" y1="${y0 + 22}" y2="${y0 + 22}" stroke="${C4.sig}" stroke-width="2"/>
              <text x="${x0 + bw / 2}" y="${y0 + 36}" text-anchor="middle" font-size="11" fill="${C4.sig}">B (แบนด์วิดท์)</text>`;
      }
      if (step >= 3) {
        g += `<text x="${x0}" y="${40}" font-size="13" fill="${ink}" font-family="var(--mono)">N(dBW) = −228.6 + 10·log T + 10·log B</text>`;
        if (step >= 4) g += `<text x="${x0}" y="${64}" font-size="13" fill="${C4.main}" font-family="var(--mono)" font-weight="700">= −228.6 + 24.62 + 60.00 = −143.98 dBW</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:270px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 13) Lab: Eb/N0 ↔ กำลังส่ง (ตรงกับการบ้านครั้งที่ 3 ข้อ 1)
// ---------------------------------------------------------------
(function () {
  const eS = document.getElementById('ebE');
  if (!eS) return;
  const rS = document.getElementById('ebR'), tS = document.getElementById('ebT');
  const out = document.getElementById('ebOut');
  function draw() {
    const eb = parseFloat(eS.value), rExp = parseFloat(rS.value), T = parseFloat(tS.value);
    const R = Math.pow(10, rExp);
    document.getElementById('lblEbE').textContent = eb.toFixed(1);
    document.getElementById('lblEbR').textContent = R >= 1e6 ? (R / 1e6).toFixed(2) + ' Mbps' : R >= 1e3 ? (R / 1e3).toFixed(2) + ' kbps' : R.toFixed(0) + ' bps';
    document.getElementById('lblEbT').textContent = T.toFixed(0);
    const S = eb + 10 * log10(R) - 228.6 + 10 * log10(T);
    out.innerHTML = `S(dBW) = (Eb/N₀) + 10·log R − 228.6 + 10·log T
      <br/>= ${eb.toFixed(1)} + <b>${(10 * log10(R)).toFixed(2)}</b> − 228.6 + <b>${(10 * log10(T)).toFixed(2)}</b>
      = <b style="font-size:1.15em">${S.toFixed(2)} dBW</b> (= ${(S + 30).toFixed(2)} dBm = ${Math.pow(10, S / 10).toExponential(2)} W)
      <br/><span class="hint">N₀ = kT = ${(10 * log10(1.3803e-23 * T)).toFixed(2)} dBW/Hz · ส่งเร็วขึ้น 2 เท่า = ต้องเพิ่มกำลัง 3 dB เป๊ะ ๆ</span>`;
  }
  [eS, rS, tS].forEach((s) => s.addEventListener('input', draw));
  draw();
})();

// ---------------------------------------------------------------
// 14) Stepper: multipath → ISI
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('mpStepper');
  if (!el) return;
  const W = 580, H = 360;
  const LBL = [
    'ขั้น 1 · เส้นตรง (LOS) — คลื่นวิ่งตรงจากเสาถึงมือถือ ถึงก่อนเพื่อนเสมอ (ทางสั้นสุด)',
    'ขั้น 2 · การสะท้อน (reflection) — ชนผิวใหญ่กว่าความยาวคลื่นมาก (ตึก/พื้น) เด้งกลับมา',
    'ขั้น 3 · การเลี้ยวเบน (diffraction) — เจอ "ขอบ/มุม" ของสิ่งกีดขวาง คลื่นโค้งอ้อมไปได้',
    'ขั้น 4 · การกระเจิง (scattering) — ชนวัตถุเล็ก ๆ ใกล้ ๆ ความยาวคลื่น (ใบไม้/ป้าย) → แตกกระจายหลายทิศ',
    'ขั้น 5 · ผลรวมที่ตัวรับ: ก๊อปปี้เดียวกันมาถึงคนละเวลา → เฟสบวก/หักล้างกัน + ล้ำเข้าไปในบิตถัดไป = ISI',
  ];
  const bs = cssVar('--paper-2', '#f4f2ee');
  createStepper(el, {
    steps: 5, stepDuration: 1700,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const TX = { x: 60, y: 110 }, RX = { x: 500, y: 195 };
      let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${bs}" rx="8"/>`;
      // ตึก / พื้น / ต้นไม้ (จัดให้ไม่ทับแผงพัลส์ด้านล่าง)
      g += `<rect x="230" y="40" width="70" height="120" fill="${line}" stroke="${ink}" opacity=".55"/>
            <text x="265" y="34" text-anchor="middle" font-size="10" fill="${ink}">ตึก</text>
            <rect x="340" y="222" width="120" height="12" fill="${line}" stroke="${ink}" opacity=".55"/>
            <text x="400" y="248" text-anchor="middle" font-size="10" fill="${ink}">พื้น</text>
            <circle cx="165" cy="222" r="15" fill="${line}" stroke="${ink}" opacity=".5"/>
            <text x="165" y="252" text-anchor="middle" font-size="10" fill="${ink}">ต้นไม้</text>`;
      // เสา + มือถือ
      g += `<line x1="${TX.x}" y1="${TX.y}" x2="${TX.x}" y2="${TX.y + 90}" stroke="${C4.main}" stroke-width="4"/>
            <circle cx="${TX.x}" cy="${TX.y}" r="6" fill="${C4.main}"/>
            <text x="${TX.x}" y="${TX.y - 12}" text-anchor="middle" font-size="11" fill="${C4.main}" font-weight="700">เสาส่ง</text>
            <rect x="${RX.x - 10}" y="${RX.y - 18}" width="20" height="34" rx="4" fill="${C4.sig}"/>
            <text x="${RX.x}" y="${RX.y + 32}" text-anchor="middle" font-size="11" fill="${C4.sig}" font-weight="700">มือถือ</text>`;
      const paths = [
        { d: `M${TX.x},${TX.y} L${RX.x},${RX.y}`, c: C4.ok, lbl: 'ตรง (LOS)', delay: 0 },
        { d: `M${TX.x},${TX.y} L265,${40} L${RX.x},${RX.y}`, c: C4.warn, lbl: 'สะท้อนตึก', delay: 0.22 },
        { d: `M${TX.x},${TX.y} Q230,170 300,155 T${RX.x},${RX.y}`, c: C4.sig, lbl: 'เลี้ยวเบนขอบตึก', delay: 0.4 },
        { d: `M${TX.x},${TX.y} L165,222 L${RX.x},${RX.y}`, c: C4.bad, lbl: 'กระเจิงจากต้นไม้', delay: 0.6 },
      ];
      const nShow = Math.min(step + 1, 4);
      for (let i = 0; i < nShow; i++) {
        const p = paths[i], grow = (i === step && step < 4) ? easeOut(t) : 1;
        g += `<path id="mp${i}" d="${p.d}" fill="none" stroke="${p.c}" stroke-width="2" stroke-dasharray="1200"
                 stroke-dashoffset="${(1 - grow) * 1200}" opacity=".9"/>`;
      }
      if (step === 4) {
        // แผงล่าง: พัลส์มาถึงคนละเวลา (วางใต้ฉากทั้งหมด ไม่ทับอะไร)
        const top = 278, base = 336;
        g += `<rect x="24" y="${top}" width="${W - 48}" height="66" fill="${cssVar('--card', '#fff')}" stroke="${line}" rx="6"/>
              <text x="36" y="${top + 15}" font-size="10.5" fill="${ink}">พัลส์ของ "บิตเดียวกัน" มาถึงตัวรับคนละเวลา (ก๊อปปี้ที่ช้ากว่าจะไปทับบิตถัดไป):</text>
              <line x1="36" y1="${base}" x2="${W - 36}" y2="${base}" stroke="${line}"/>`;
        for (let i = 0; i < 4; i++) {
          const x = 150 + paths[i].delay * 250, h = 30 * (1 - i * 0.2);
          g += `<rect x="${x}" y="${base - h}" width="10" height="${h}" fill="${paths[i].c}"/>`;
        }
        g += `<rect x="${150 + 0.62 * 250}" y="${top + 22}" width="${W - 36 - (150 + 0.62 * 250)}" height="${base - top - 22}" fill="${C4.bad}18"/>
              <text x="${W - 40}" y="${top + 34}" text-anchor="end" font-size="10.5" fill="${C4.bad}" font-weight="700">ล้ำเข้าช่องเวลาบิตถัดไป = ISI</text>`;
      }
      // ป้ายชื่อเส้นล่าสุด
      if (step < 4) g += `<text x="${W / 2}" y="${H - 14}" text-anchor="middle" font-size="12.5" fill="${paths[Math.min(step, 3)].c}" font-weight="700">${paths[Math.min(step, 3)].lbl}</text>`;
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:380px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 15) Stepper: fading — ใหญ่/เล็ก, ช้า/เร็ว, flat/selective
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('fadeStepper');
  if (!el) return;
  const W = 580, H = 280, pad = { l: 46, r: 14, t: 18, b: 38 };
  const sx = (i) => pad.l + i / 400 * (W - pad.l - pad.r);
  const sy = (v) => H - pad.b - (v + 40) / 60 * (H - pad.t - pad.b); // dB: −40..+20
  // เส้นทาง: path loss เชิงเส้นบนสเกล log + shadowing + fast fading
  const base = (i) => -6 - 22 * (i / 400);
  const slow = (i) => 7 * Math.sin(i / 62) + 3 * Math.sin(i / 23 + 1.2);
  const fast = (i) => 6 * Math.sin(i / 2.1) * Math.sin(i / 7.3 + .5) - 3 * Math.abs(Math.sin(i / 5.7));
  const LBL = [
    'ขั้น 1 · เส้นตรงเอียงลง = path loss เฉลี่ย (ยิ่งไกลยิ่งอ่อน) — นี่คือสิ่งที่สูตรบทนี้คำนวณให้',
    'ขั้น 2 · เฟดดิงขนาดใหญ่ (large-scale) = เงา (shadowing) จากตึก/เนินเขา — ช้า ค่อย ๆ ขึ้นลง',
    'ขั้น 3 · เฟดดิงขนาดเล็ก (small-scale) = multipath หักล้างกัน — เปลี่ยนเร็วมากในระยะ ~½ ความยาวคลื่น',
    'ขั้น 4 · Fast fading = จุดรับเปลี่ยนเร็วกว่าคาบสัญลักษณ์ · Slow fading = ช้ากว่า → ออกแบบคนละแบบ',
    'ขั้น 5 · Flat fading = ทุกความถี่ตกพร้อมกัน · Selective fading = บางความถี่ตกลึก บางความถี่รอด',
  ];
  createStepper(el, {
    steps: 5, stepDuration: 1600,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      let g = '';
      for (const v of [10, 0, -10, -20, -30]) {
        g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(v)}" y2="${sy(v)}" stroke="${line}" stroke-dasharray="2 4"/>
              <text x="${pad.l - 6}" y="${sy(v) + 4}" text-anchor="end" font-size="10" fill="${ink}">${v}</text>`;
      }
      const mk = (fn, upto) => { let d = ''; for (let i = 0; i <= upto; i++) d += (i === 0 ? 'M' : 'L') + sx(i).toFixed(1) + ',' + sy(fn(i)).toFixed(1); return d; };
      const upto = step === 0 ? Math.round(400 * (0.2 + 0.8 * easeOut(t))) : 400;
      if (step < 4) {
        g += `<path d="${mk(base, 400)}" fill="none" stroke="${C4.ok}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
        if (step >= 1) g += `<path d="${mk((i) => base(i) + slow(i), step === 1 ? upto : 400)}" fill="none" stroke="${C4.warn}" stroke-width="2.5"/>`;
        if (step >= 2) g += `<path d="${mk((i) => base(i) + slow(i) + fast(i), 400)}" fill="none" stroke="${C4.sig}" stroke-width="1.3" opacity=".95"/>`;
        g += `<text x="${W - pad.r}" y="${pad.t + 12}" text-anchor="end" font-size="10.5" fill="${C4.ok}">— — path loss เฉลี่ย</text>`;
        if (step >= 1) g += `<text x="${W - pad.r}" y="${pad.t + 26}" text-anchor="end" font-size="10.5" fill="${C4.warn}">— เฟดดิงใหญ่ (เงา)</text>`;
        if (step >= 2) g += `<text x="${W - pad.r}" y="${pad.t + 40}" text-anchor="end" font-size="10.5" fill="${C4.sig}">— เฟดดิงเล็ก (multipath)</text>`;
        if (step === 3) {
          g += `<rect x="${sx(40)}" y="${pad.t}" width="${sx(120) - sx(40)}" height="${H - pad.t - pad.b}" fill="${C4.bad}22" stroke="${C4.bad}"/>
                <text x="${sx(80)}" y="${pad.t + 14}" text-anchor="middle" font-size="10.5" fill="${C4.bad}" font-weight="700">deep fade</text>`;
        }
        g += `<text x="${W / 2}" y="${H - 6}" text-anchor="middle" font-size="10.5" fill="${ink}">ระยะทาง / เวลา ที่ตัวรับเคลื่อนที่ →</text>
              <text x="10" y="${pad.t}" font-size="10.5" fill="${ink}">กำลังรับ (dB)</text>`;
      } else {
        // flat vs selective: กราฟ 2 อัน แกนความถี่
        const half = (W - 40) / 2;
        for (let k = 0; k < 2; k++) {
          const ox = 20 + k * (half + 8);
          const H2 = H - pad.b - pad.t;
          g += `<rect x="${ox}" y="${pad.t}" width="${half}" height="${H2}" fill="none" stroke="${line}"/>`;
          let d = '';
          for (let i = 0; i <= 60; i++) {
            const x = ox + i / 60 * half;
            const v = k === 0 ? -8 + 2 * Math.sin(t * 3) : -6 - 18 * Math.exp(-Math.pow((i - 34) / 6, 2)) - 6 * Math.exp(-Math.pow((i - 12) / 4, 2));
            d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + (pad.t + H2 - (v + 34) / 40 * H2).toFixed(1);
          }
          g += `<path d="${d}" fill="none" stroke="${k === 0 ? C4.ok : C4.bad}" stroke-width="2.5"/>
                <text x="${ox + half / 2}" y="${pad.t - 4}" text-anchor="middle" font-size="11.5" fill="${k === 0 ? C4.ok : C4.bad}" font-weight="700">${k === 0 ? 'Flat fading — ตกเท่ากันทั้งแบนด์' : 'Selective — บางความถี่ตกลึก'}</text>
                <text x="${ox + half / 2}" y="${H - 10}" text-anchor="middle" font-size="10" fill="${ink}">ความถี่ →</text>`;
        }
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:300px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 16) Stepper: วิธีชดเชย — FEC · equalization · diversity · MIMO
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('fixStepper');
  if (!el) return;
  const W = 580, H = 260;
  const LBL = [
    'ขั้น 1 · ปัญหา: บิตพังจาก fading/ISI — ส่งซ้ำก็ช้า จะแก้ที่ต้นทางยังไง?',
    'ขั้น 2 · FEC — เติม "บิตตรวจสอบ" ไปกับข้อมูล ตัวรับคำนวณเองว่าบิตไหนพัง แล้วซ่อมได้เลย ไม่ต้องขอส่งใหม่',
    'ขั้น 3 · Adaptive equalization — รวบพลังงานที่กระจายเลอะข้ามบิต (ISI) กลับเข้าช่องเวลาเดิม',
    'ขั้น 4 · Diversity — ส่งซ้ำคนละ "ช่อง" ที่เฟดไม่พร้อมกัน: ต่างเสา (space) · ต่างความถี่ · ต่างเวลา',
    'ขั้น 5 · MIMO — หลายเสาส่ง × หลายเสารับ พร้อมกัน: ได้ทั้งความทน (diversity) และความเร็ว (หลายสตรีม)',
  ];
  createStepper(el, {
    steps: 5, stepDuration: 1600,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const card = cssVar('--card', '#fff');
      let g = `<rect x="0" y="0" width="${W}" height="${H}" fill="${card}" rx="8" stroke="${line}"/>`;
      const bit = (x, y, v, c) => `<rect x="${x}" y="${y}" width="17" height="20" rx="3" fill="${c}"/><text x="${x + 8.5}" y="${y + 15}" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">${v}</text>`;
      if (step === 0) {
        const bits = [1, 0, 1, 1, 0, 0, 1, 0];
        bits.forEach((b, i) => { g += bit(90 + i * 24, 110, b, i === 3 || i === 6 ? C4.bad : C4.sig); });
        g += `<text x="${W / 2}" y="90" text-anchor="middle" font-size="12.5" fill="${ink}">บิตที่รับมา — สีแดง = พังเพราะ fading/ISI</text>
              <text x="${W / 2}" y="170" text-anchor="middle" font-size="12" fill="${C4.bad}">ส่งใหม่ทั้งชุด = เสียเวลา · ทำไงให้ "ซ่อมเองได้"?</text>`;
      } else if (step === 1) {
        const bits = [1, 0, 1, 1, 0, 0, 1, 0];
        bits.forEach((b, i) => { g += bit(70 + i * 24, 100, b, C4.sig); });
        const par = [1, 0, 1];
        par.forEach((b, i) => { g += bit(70 + 8 * 24 + 10 + i * 24, 100, b, C4.ok); });
        g += `<text x="${W / 2}" y="78" text-anchor="middle" font-size="12.5" fill="${ink}">ข้อมูล + รหัสแก้ไข (สีเขียว) ส่งไปด้วยกัน</text>
              <text x="${W / 2}" y="160" text-anchor="middle" font-size="12" fill="${C4.ok}">ตัวรับคำนวณรหัสใหม่ → ตรงกัน = ไม่พัง · ไม่ตรง = รู้ว่าบิตไหนพัง แล้วแก้เลย</text>
              <text x="${W / 2}" y="185" text-anchor="middle" font-size="11.5" fill="${ink}">แลกกับ: ต้องส่งบิตเกินจากข้อมูลจริง (overhead)</text>`;
      } else if (step === 2) {
        // พัลส์เบลอ → คมขึ้น
        const k = easeOut(t);
        for (let i = 0; i < 4; i++) {
          const cx = 120 + i * 90;
          const wdt = 60 - 36 * k, h = 30 + 40 * k;
          g += `<rect x="${cx - wdt / 2}" y="${150 - h}" width="${wdt}" height="${h}" fill="${C4.sig}" opacity=".8" rx="3"/>`;
          g += `<line x1="${cx}" y1="160" x2="${cx}" y2="172" stroke="${line}"/>`;
        }
        g += `<text x="${W / 2}" y="60" text-anchor="middle" font-size="12.5" fill="${ink}">ก่อน: พัลส์บานล้ำข้ามช่องเวลา (ISI) → หลัง equalizer: รวบกลับมาคม</text>
              <text x="${W / 2}" y="200" text-anchor="middle" font-size="11.5" fill="${ink}">"adaptive" = ปรับตามช่องสัญญาณที่เปลี่ยนตลอด (มือถือวิ่งไปเรื่อย)</text>`;
      } else if (step === 3) {
        const kinds = [['ต่างเสา (space)', C4.main], ['ต่างความถี่', C4.sig], ['ต่างเวลา', C4.warn]];
        kinds.forEach(([nm, c], i) => {
          const x = 60 + i * 165;
          g += `<rect x="${x}" y="70" width="140" height="110" rx="8" fill="${c}22" stroke="${c}"/>
                <text x="${x + 70}" y="96" text-anchor="middle" font-size="12" fill="${c}" font-weight="700">${nm}</text>`;
          for (let j = 0; j < 3; j++) {
            const bad = (i + j) % 3 === 0;
            g += `<circle cx="${x + 34 + j * 36}" cy="140" r="13" fill="${bad ? C4.bad : C4.ok}"/>
                  <text x="${x + 34 + j * 36}" y="145" text-anchor="middle" font-size="11" fill="#fff">${bad ? '✗' : '✓'}</text>`;
          }
        });
        g += `<text x="${W / 2}" y="52" text-anchor="middle" font-size="12.5" fill="${ink}">ส่งสำเนาไปหลายช่องที่ "เฟดไม่พร้อมกัน" — ขอแค่ช่องเดียวรอด ก็ได้ข้อมูลครบ</text>
              <text x="${W / 2}" y="210" text-anchor="middle" font-size="11.5" fill="${ink}">หลักคิด: ความน่าจะเป็นที่ทุกช่องพังพร้อมกัน &lt;&lt; ช่องเดียวพัง</text>`;
      } else {
        const txs = [90, 150], rxs = [430, 490];
        txs.forEach((y) => { g += `<circle cx="120" cy="${y}" r="9" fill="${C4.main}"/>`; });
        rxs.forEach((x, i) => { g += `<circle cx="460" cy="${90 + i * 60}" r="9" fill="${C4.sig}"/>`; });
        for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
          const on = t > (i * 2 + j) / 5;
          g += `<line x1="120" y1="${txs[i]}" x2="460" y2="${90 + j * 60}" stroke="${on ? C4.ok : line}" stroke-width="${on ? 2 : 1}" opacity="${on ? .9 : .4}"/>`;
        }
        g += `<text x="120" y="70" text-anchor="middle" font-size="11.5" fill="${C4.main}" font-weight="700">2 เสาส่ง</text>
              <text x="460" y="70" text-anchor="middle" font-size="11.5" fill="${C4.sig}" font-weight="700">2 เสารับ</text>
              <text x="${W / 2}" y="205" text-anchor="middle" font-size="12.5" fill="${ink}">MIMO 2×2 — 4 เส้นทางอิสระในย่านความถี่เดียวกัน</text>
              <text x="${W / 2}" y="228" text-anchor="middle" font-size="11.5" fill="${ink}">Wi-Fi/4G/5G ที่เขียน 2×2, 4×4 บนกล่องเราเตอร์ = อันนี้เอง</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:280px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 17) Walkthroughs ส่วนที่ 2 + การบ้านครั้งที่ 3
// ---------------------------------------------------------------
mountWalk('walkPLE', [
  { title: 'อ่านโจทย์ (สไลด์ 46)', body: 'เปรียบเทียบ path loss ของ 2 สภาพแวดล้อมในระบบมือถือ\n  1) พื้นที่โล่ง       2) พื้นที่เมือง n = 3.1\nที่ f = 1.9 GHz, d = 1.5 กม., สายอากาศไอโซทรอปิก', note: '"พื้นที่โล่ง" = free space → n = 2 (บรรทัดแรกของตารางสไลด์ 45) — โจทย์ไม่บอกตรง ๆ ต้องรู้เอง' },
  { title: 'เตรียมสูตรให้อยู่ในรูปที่ใส่ n ได้', body: 'จาก L = (4πd/λ)ⁿ …ที่ n = 2 คือสูตรเดิม\nเขียนเป็น dB แยกเป็น 2 ก้อน:\n\n  L(dB) = 20·log(4π/λ) + 10·n·log(d)\n           └ ก้อนความถี่ ┘   └ ก้อนระยะ ┘\n\nข้อดี: เปลี่ยน n แล้วก้อนแรกไม่ต้องคิดใหม่', note: 'สังเกต: n โผล่แค่ที่ก้อนระยะ — เพราะ n คือ "กำลังของ d" (1/dⁿ) ไม่เกี่ยวกับความถี่' },
  { title: 'ก้อนความถี่ (คิดครั้งเดียว ใช้ทั้ง 2 ข้อ)', body: 'λ = c/f = 3×10⁸ ÷ 1.9×10⁹ = 0.1579 m\n\n4π/λ = 12.566 ÷ 0.1579 = 79.59\n20·log(79.59) = 38.02 dB', note: '' },
  { title: '1) พื้นที่โล่ง n = 2', body: '10·n·log d = 10 × 2 × log(1500) = 20 × 3.176 = 63.52 dB\n\nL = 38.02 + 63.52 = 101.54 dB   ← คำตอบ 1)\n\nเช็กด้วยสูตร Week 4 ตอนต้น: 20log f + 20log d − 147.56\n = 185.58 + 63.52 − 147.56 = 101.54 dB ✓ ตรงกัน', note: 'สองสูตรนี้คือสูตรเดียวกัน แค่จัดรูปคนละแบบ — ใช้อันไหนก็ได้เมื่อ n = 2' },
  { title: '2) พื้นที่เมือง n = 3.1', body: '10·n·log d = 10 × 3.1 × log(1500) = 31 × 3.1761 = 98.459 dB\n\nL = 38.015 + 98.459 = 136.474 → 136.47 dB   ← คำตอบ 2)\n\nผลต่าง = 136.474 − 101.537 = 34.937 → 34.94 dB\n(อย่าเอาค่าที่ปัดแล้วมาบวก จะเพี้ยนเป็น 136.48)', note: '34.94 dB ≈ 3,100 เท่า! ระยะเท่ากันเป๊ะ แค่ย้ายจากทุ่งโล่งเข้าเมือง กำลังที่ถึงตัวรับหายไปสามพันเท่า — นี่คือเหตุผลที่เสามือถือในเมืองต้องถี่กว่าชนบทมาก' },
]);

mountWalk('walkHw3a', [
  { title: 'ข้อ 1 — อ่านโจทย์', body: 'จงหากำลังงานของสัญญาณ (dBW) ถ้า\n  Eb/N₀ = 8.4 dB  ที่ BER = 10⁻⁴\n  อุณหภูมิ T = 290 K\n  อัตราการส่งข้อมูล R = 2,400 bps', note: '"BER = 10⁻⁴" เป็นแค่บริบท (บอกว่าทำไมต้องใช้ 8.4 dB) — ไม่ต้องเอาไปคำนวณ' },
  { title: 'ตั้งสมการจากนิยาม Eb/N₀', body: 'Eb = S·Tb = S/R      (พลังงานต่อบิต)\nN₀ = k·T             (ความหนาแน่น noise ต่อ 1 Hz)\n\n  Eb/N₀ = S / (k·T·R)', note: 'จำวิธีอ่าน: "กำลังหารด้วยอัตราบิต" = พลังงานที่ทุ่มให้บิตหนึ่งบิต — ยิ่งส่งเร็ว พลังงานต่อบิตยิ่งน้อย' },
  { title: 'แปลงเป็น dB แล้วย้ายข้าง', body: '(Eb/N₀)dB = S(dBW) − 10log R − 10log k − 10log T\n\n10·log k = 10·log(1.3803×10⁻²³) = −228.6 dBW/K/Hz\n\n→ S(dBW) = (Eb/N₀) + 10log R − 228.6 + 10log T', note: '−228.6 คือ "ค่าคงที่ Boltzmann ในภาษา dB" — ท่องไว้เลย ออกทุกโจทย์ noise' },
  { title: 'แทนค่า', body: '10·log R = 10·log(2400)  = 33.80 dB\n10·log T = 10·log(290)   = 24.62 dB\n\nS = 8.4 + 33.80 − 228.6 + 24.62\n  = −161.77 dBW    ← คำตอบ', note: '' },
  { title: 'ตรวจคำตอบ + ความรู้สึกของตัวเลข', body: 'ย้อนกลับ: S = 10^(−16.177) = 6.6×10⁻¹⁷ W\n  Eb = S/R = 2.8×10⁻²⁰ J\n  N₀ = kT = 4.0×10⁻²¹ W/Hz\n  Eb/N₀ = 6.9 เท่า = 8.4 dB ✓\n\n(= −131.77 dBm — เล็กกว่าสัญญาณ Wi-Fi ที่มือถือรับได้ราว 100,000 เท่า)', note: 'ตัวเลขจิ๋วมากไม่ได้แปลว่าผิด — โจทย์นี้ให้ "กำลังขั้นต่ำที่ยังอ่านออก" ซึ่งเล็กเป็นธรรมชาติของมัน' },
]);

mountWalk('walkHw3b', [
  { title: 'ข้อ 2 — อ่านโจทย์', body: 'จงหา Eb/N₀ สำหรับประสิทธิภาพสเปกตรัม (spectral efficiency) 6 bps/Hz\n\nโจทย์ใบ้มาให้แล้ว:\n  Spectral efficiency = R/B\n  Hint: ใช้สูตร Shannon capacity', note: 'Spectral efficiency = bandwidth efficiency = "ได้กี่ bps ต่อทุก 1 Hz ที่จ่ายไป"' },
  { title: 'ขั้นที่ 1 — Shannon ให้ SNR', body: 'Shannon:  C = B·log₂(1 + S/N)\nหาร B ตลอด:  C/B = log₂(1 + S/N)\n\nแทน C/B = 6:\n  6 = log₂(1 + S/N)\n  2⁶ = 1 + S/N\n  S/N = 64 − 1 = 63 เท่า  (= 17.99 dB)', note: 'Week 3 กลับมาเต็ม ๆ — Shannon คือเพดานทฤษฎี ที่นี่ใช้ "ย้อนกลับ" หา SNR ที่ต้องมี' },
  { title: 'ขั้นที่ 2 — เชื่อม SNR กับ Eb/N₀', body: 'จาก  Eb/N₀ = (S/N) × (B/R)\n\nB/R = 1 ÷ (R/B) = 1/6\n\n  Eb/N₀ = 63 × (1/6) = 10.5 เท่า', note: 'ความหมาย: SNR ดูทั้งแบนด์ · Eb/N₀ หารเฉลี่ยลงเป็น "ต่อบิต" → เทียบข้ามวิธีมอดูเลตได้อย่างยุติธรรม' },
  { title: 'ตอบเป็น dB', body: 'Eb/N₀ = 10·log₁₀(10.5) = 10.21 dB   ← คำตอบ\n\nสรุปทางเดิน: 6 bps/Hz → SNR 63 → หาร 6 → 10.5 → 10.21 dB', note: 'ข้อนี้เป็นสูตรผสม Week 3 (Shannon) + Week 4 (Eb/N₀) — ออกสอบง่ายเพราะเชื่อม 2 บทในข้อเดียว' },
]);

mountWalk('walkHw3c', [
  { title: 'ข้อ 3 — อ่านโจทย์', body: 'จงหาอัตราขยาย (เกน) และพื้นที่ประสิทธิผลของ\n"สายอากาศสะท้อนแบบฮอร์น" รัศมี 25 ซม. ที่ 5 GHz\n\nคำสำคัญ: ฮอร์น (horn) + ให้ "รัศมี" มาแล้ว', note: 'ต่างจากการบ้านครั้งที่ 2 ที่ให้เส้นผ่านศูนย์กลาง — ข้อนี้ให้รัศมีตรง ๆ ไม่ต้องหาร 2 (อ่านโจทย์ให้ดี!)' },
  { title: 'เลือกแถวจากตารางสไลด์ 17', body: 'แถว "ฮอร์น พื้นที่ปาก A":\n  Ae = 0.81·A\n  G  = 10·A/λ²\n\n(เทียบ: พาราโบลาคือ 0.56A และ 7A/λ² — อย่าหยิบผิดแถว)', note: 'ตัวเลข 0.81 กับ 10 มาคู่กันเสมอ เพราะ G = 4π·Ae/λ² และ 4π(0.81) ≈ 10.2 ≈ 10' },
  { title: 'หา A และ λ', body: 'A = πr² = π(0.25)² = 0.1963 m²\nλ = c/f = 3×10⁸ ÷ 5×10⁹ = 0.06 m\nλ² = 0.0036 m²', note: '25 ซม. = 0.25 m — แปลงหน่วยก่อนเสมอ' },
  { title: 'ตอบ (ก) พื้นที่ประสิทธิผล', body: 'Ae = 0.81 × 0.1963 = 0.159 m²   ← คำตอบ (ก)\n\n(ปากแตรจริง 0.196 m² แต่ "ใช้งานได้จริง" 0.159 m² = 81%)', note: '' },
  { title: 'ตอบ (ข) เกน', body: 'G = 10A/λ² = (10 × 0.1963) ÷ 0.0036\n  = 1.9635 ÷ 0.0036 = 545.4 เท่า\n\nG(dB) = 10·log₁₀(545.4) = 27.37 dB   ← คำตอบ (ข)', note: '💡 ถ้าใช้สูตรกลาง G = 4π·Ae/λ² จะได้ 555.2 = 27.44 dB ต่างกัน 0.07 dB เพราะ "10" ในตารางเป็นเลขปัดจาก 4π×0.81 = 10.18 — ตอบตามตารางสไลด์ (27.37 dB) ปลอดภัยสุด' },
]);

// ---------------------------------------------------------------
// 18) ข้อสอบจับเวลา
// ---------------------------------------------------------------
mountExam([25, 18, 12]);
