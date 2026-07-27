// ===== Week 6 — การแผ่สเปกตรัม (Spread Spectrum) สไลด์ 1–53 =====
// 🔇 คาบนี้ไม่มีไฟล์เสียง → เนื้อหาทั้งบทเรียบเรียงจากสไลด์ล้วน ไม่มีกล่อง 🎙
// ตัวเลขทุกตัวยืนยันด้วยสคริปต์ node (verify-w6.js) แล้ว — 51 ค่า ผ่านหมด
import { createStepper, mountWalk, mountRunner, mountExam, easeOut } from './stepper.js';

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const C6 = { main: '#4ec9b0', sig: '#58c4dd', warn: '#ffd66b', ok: '#83c167', bad: '#e06c75', alt: '#c792ea' };

// 0 → −1 , 1 → +1  (สไลด์ 46 กำหนดไว้แบบนี้)
const bip = (s) => [...s].map((c) => (c === '1' ? 1 : -1));
const dot = (x, y) => x.reduce((s, v, i) => s + v * y[i], 0);
const xorStr = (a, b) => [...a].map((c, i) => (+c ^ +b[i])).join('');

// ---------------------------------------------------------------
// 1) Stepper: สายโซ่ระบบแผ่สเปกตรัม (สไลด์ 2–4, 21)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('chainStepper6');
  if (!el) return;
  const W = 600, H = 250;
  const BLOCKS = [
    { t: 'อินพุต', s: 'Input', d: 'ข้อมูลที่จะส่ง ถูกส่งเข้าไปในตัวเข้ารหัสสัญญาณ (สไลด์ 2)' },
    { t: 'เข้ารหัสช่อง', s: 'Channel encoder', d: 'สร้างสัญญาณแอนะล็อกที่มีแบนด์วิดท์ "แคบ" — ยังไม่แผ่' },
    { t: 'มอดูเลต + แผ่', s: 'Modulator', d: 'มอดูเลตด้วยลำดับของเลขโดด (รหัสการแผ่) → แบนด์วิดท์กว้างขึ้น' },
    { t: 'ตัวสร้างรหัสแผ่', s: 'PN generator', d: 'สร้างรหัสจากสัญญาณรบกวนเทียม (pseudo noise) — หัวใจของทั้งบท' },
    { t: 'ช่องสัญญาณ', s: 'Channel', d: 'สัญญาณกว้าง เตี้ย จมอยู่ในระดับ noise — คนไม่รู้รหัสมองไม่เห็น' },
    { t: 'ดีมอดูเลต + คลาย', s: 'Demodulator', d: 'ฝั่งรับใช้ลำดับเดียวกันมอดูเลตสัญญาณกลับ (สไลด์ 3)' },
    { t: 'ถอดรหัสช่อง', s: 'Channel decoder', d: 'ส่งเข้าตัวถอดรหัสช่องสัญญาณเพื่อนำข้อมูลกลับมา' },
    { t: 'ผู้ใช้', s: 'User', d: 'ได้ข้อมูลเดิมคืน — ต้องรู้รหัสตรงกันเท่านั้นจึงถอดได้' },
  ];
  createStepper(el, {
    steps: BLOCKS.length, stepDuration: 1500,
    label: (s) => `ขั้น ${s + 1} · ${BLOCKS[s].t} — ${BLOCKS[s].d}`,
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc'), card = cssVar('--card', '#fff');
      let g = '';
      const bw = 66, bh = 44, gap = 40;
      BLOCKS.forEach((b, i) => {
        const row = i < 4 ? 0 : 1;
        const idx = i < 4 ? i : i - 4;
        const x = 40 + idx * (bw + gap), y = row === 0 ? 34 : 132;
        const on = i <= step;
        const fill = on ? (i === step ? C6.main : C6.sig) : line;
        g += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${fill}${on ? '' : '55'}"
                 stroke="${on ? fill : line}" stroke-width="${i === step ? 2.5 : 1}"/>
              <text x="${x + bw / 2}" y="${y + 19}" text-anchor="middle" font-size="9.5" fill="${on ? '#111' : ink}" font-weight="700">${b.t}</text>
              <text x="${x + bw / 2}" y="${y + 33}" text-anchor="middle" font-size="7.5" fill="${on ? '#111' : ink}">${b.s}</text>`;
        if (idx < 3) {
          const ax = x + bw, ay = y + bh / 2;
          g += `<line x1="${ax + 2}" y1="${ay}" x2="${ax + gap - 6}" y2="${ay}" stroke="${i < step ? C6.sig : line}" stroke-width="2"/>
                <polygon points="${ax + gap - 4},${ay} ${ax + gap - 10},${ay - 4} ${ax + gap - 10},${ay + 4}" fill="${i < step ? C6.sig : line}"/>`;
        }
      });
      const lastX = 40 + 3 * (bw + gap) + bw / 2;
      g += `<path d="M ${lastX},${34 + bh} L ${lastX},${106} L ${40 + bw / 2},${106} L ${40 + bw / 2},${132}"
               fill="none" stroke="${step >= 4 ? C6.sig : line}" stroke-width="2"/>
            <polygon points="${40 + bw / 2},${132} ${40 + bw / 2 - 4},${126} ${40 + bw / 2 + 4},${126}" fill="${step >= 4 ? C6.sig : line}"/>`;
      // แถบสเปกตรัม: แคบ → กว้าง → แคบ (สไลด์ 21)
      const wide = step >= 2 && step <= 5;
      const specW = wide ? 150 : 34;
      g += `<rect x="${300 - specW / 2}" y="${196 - (wide ? 12 : 30)}" width="${specW}" height="${wide ? 12 : 30}"
               fill="${C6.main}" opacity=".55"/>
            <line x1="150" y1="196" x2="450" y2="196" stroke="${ink}" stroke-width="1"/>
            <text x="460" y="199" font-size="9" fill="${ink}">ความถี่</text>
            <text x="300" y="212" text-anchor="middle" font-size="9.5" fill="${C6.main}" font-weight="700">${wide ? 'แบนด์กว้าง เตี้ย — จมใน noise' : 'แบนด์แคบ สูง'}</text>`;
      g += `<rect x="24" y="222" width="${W - 48}" height="22" rx="6" fill="${card}" stroke="${C6.main}"/>
            <text x="34" y="237" font-size="10" fill="${ink}">${BLOCKS[step].d}</text>`;
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:280px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 2) Stepper: FHSS ช้า/เร็ว บนกริดความถี่ (สไลด์ 11–13)
//    ตัวเลขทุกตัวจากสไลด์ 12 (slow) และสไลด์ 13 (fast) — ตรวจกับภาพซูมแล้ว
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('fhStepper');
  if (!el) return;
  const W = 620, H = 320;
  const BITS = '01110011110110000011';                       // สไลด์ 12 + 13 ใช้ข้อมูลชุดเดียวกัน
  const SYMS = BITS.match(/../g);                            // 10 สัญลักษณ์ MFSK (M=4, k=2)
  const PN_SLOW = ['00', '00', '11', '11', '01', '01', '10', '10', '00', '00'];  // 5 ค่า × 2 สัญลักษณ์
  const PN_FAST = ['00', '11', '01', '10', '00', '10', '00', '11', '10', '00',
                   '10', '11', '11', '01', '00', '01', '10', '11', '01', '10'];
  const slotOf = (pn, sym) => parseInt(pn, 2) * 4 + parseInt(sym, 2);
  const SLOW = SYMS.map((s, i) => slotOf(PN_SLOW[i], s));
  const FAST = PN_FAST.map((p, i) => slotOf(p, SYMS[Math.floor(i / 2)]));
  const LBL = [
    'ขั้น 1 · ข้อมูล 20 บิต จับคู่ละ 2 บิต = 10 สัญลักษณ์ MFSK (M = 4 → k = log₂4 = 2 บิต/สัญลักษณ์)',
    'ขั้น 2 · ถ้าใช้ MFSK เฉย ๆ ไม่แผ่: ทุกสัญลักษณ์อยู่ใน "แถบเดียว" กว้าง W_d — 4 โทนต่อแถบ ศัตรูแจมจุดเดียวจบ',
    'ขั้น 3 · เพิ่มรหัส PN เข้ามา: PN เป็นตัวเลือก "แถบ" (W_d ไหนใน 4 แถบ) ส่วนสัญลักษณ์ยังเลือก "โทน" ในแถบนั้น',
    'ขั้น 4 · Slow FH (สไลด์ 12): T_c = 2T_s → PN 1 ค่าครอบ 2 สัญลักษณ์ ⇒ กระโดดช้ากว่าอัตราสัญลักษณ์',
    'ขั้น 5 · Fast FH (สไลด์ 13): T_c = T_s/2 → 1 สัญลักษณ์ถูกส่งกระจายบน 2 แถบ ⇒ กระโดดเร็วกว่าอัตราสัญลักษณ์',
    'ขั้น 6 · ทำไมทนการแจม: ศัตรูแจม 1 แถบได้แค่บางช่วง — Fast FH ยิ่งดี เพราะ 1 สัญลักษณ์กระจายหลายแถบ',
  ];
  createStepper(el, {
    steps: 6, stepDuration: 1900,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const fast = step === 4 || step === 5;
      const cols = fast ? 20 : 10;
      const seq = fast ? FAST : SLOW;
      const gx = 62, gy = 66, gw = W - gx - 16, gh = 178;
      const cw = gw / cols, rh = gh / 16;
      let g = '';
      // แถบ Wd 4 แถบ (แต่ละแถบ 4 โทน)
      for (let b = 0; b < 4; b++) {
        const y = gy + gh - (b + 1) * 4 * rh;
        g += `<rect x="${gx}" y="${y}" width="${gw}" height="${4 * rh}" fill="${b % 2 ? C6.sig : C6.main}" opacity=".07"/>
              <line x1="${gx}" y1="${y}" x2="${gx + gw}" y2="${y}" stroke="${ink}" stroke-width="1" opacity=".55"/>
              <text x="${gx - 8}" y="${y + 2 * rh + 3}" text-anchor="end" font-size="8.5" fill="${ink}" opacity=".8">W_d</text>`;
      }
      for (let r = 1; r < 16; r++) {
        if (r % 4 === 0) continue;
        const y = gy + gh - r * rh;
        g += `<line x1="${gx}" y1="${y}" x2="${gx + gw}" y2="${y}" stroke="${line}" stroke-dasharray="3 4" opacity=".55"/>`;
      }
      for (let c = 0; c <= cols; c++) {
        g += `<line x1="${gx + c * cw}" y1="${gy}" x2="${gx + c * cw}" y2="${gy + gh}" stroke="${line}" opacity=".7"/>`;
      }
      g += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="none" stroke="${ink}" stroke-width="1.2"/>
            <text x="20" y="${gy + gh / 2}" font-size="9.5" fill="${ink}" transform="rotate(-90 20 ${gy + gh / 2})" text-anchor="middle">ความถี่ (W_s = 4 W_d)</text>`;

      // แถวสัญลักษณ์ + PN
      SYMS.forEach((s, i) => {
        const cspan = fast ? 2 : 1;
        const x = gx + i * cw * cspan;
        g += `<text x="${x + cw * cspan / 2}" y="${gy - 22}" text-anchor="middle" font-size="9.5"
                 fill="${C6.warn}" font-weight="700" font-family="var(--mono)">${s}</text>`;
      });
      g += `<text x="${gx - 8}" y="${gy - 19}" text-anchor="end" font-size="8.5" fill="${C6.warn}">สัญลักษณ์</text>`;
      if (step >= 2) {
        const pns = fast ? PN_FAST : PN_SLOW;
        const shown = fast ? pns : pns.filter((_, i) => i % 2 === 0);
        shown.forEach((p, i) => {
          const cspan = fast ? 1 : 2;
          const x = gx + i * cw * cspan;
          g += `<text x="${x + cw * cspan / 2}" y="${gy - 6}" text-anchor="middle" font-size="9"
                   fill="${C6.alt}" font-weight="700" font-family="var(--mono)">${p}</text>`;
        });
        g += `<text x="${gx - 8}" y="${gy - 4}" text-anchor="end" font-size="8.5" fill="${C6.alt}">รหัส PN</text>`;
      }

      // บล็อกความถี่ที่ใช้จริง
      const showAll = step >= 3;
      const upto = step === 3 || step === 4
        ? Math.max(1, Math.round(cols * (0.15 + 0.85 * easeOut(t))))
        : (step >= 5 ? cols : 0);
      for (let c = 0; c < (showAll ? upto : (step >= 1 ? cols : 0)); c++) {
        // ก่อนใส่ PN (ขั้น 2) ให้ทุกอันอยู่แถบล่างสุด = MFSK ล้วน
        const slot = step >= 2 ? seq[c] : parseInt(SYMS[c], 2);
        const x = gx + c * cw, y = gy + gh - (slot + 1) * rh;
        g += `<rect x="${x + 1}" y="${y + rh * 0.18}" width="${cw - 2}" height="${rh * 0.64}" rx="1.5"
                 fill="${C6.main}" stroke="${C6.main}"/>`;
      }
      // ไฮไลต์การแจม 1 แถบ
      if (step === 5) {
        const jamY = gy + gh - 8 * rh;
        g += `<rect x="${gx}" y="${jamY}" width="${gw}" height="${4 * rh}" fill="${C6.bad}" opacity=".2"/>
              <rect x="${gx}" y="${jamY}" width="${gw}" height="${4 * rh}" fill="none" stroke="${C6.bad}" stroke-width="1.5" stroke-dasharray="5 3"/>
              <text x="${gx + 6}" y="${jamY - 4}" font-size="9.5" fill="${C6.bad}" font-weight="700">⚡ ศัตรูแจมแถบนี้ทั้งแถบ — โดนแค่บาง hop เท่านั้น</text>`;
      }

      // แถบเวลา T / Ts / Tc
      const ty = gy + gh + 16;
      const tw = cw * (fast ? 2 : 1) / 2;
      g += `<line x1="${gx}" y1="${ty}" x2="${gx + tw}" y2="${ty}" stroke="${C6.bad}" stroke-width="1.6"/>
            <text x="${gx + tw + 5}" y="${ty + 3.5}" font-size="9" fill="${C6.bad}">T (1 บิต)</text>`;
      g += `<line x1="${gx}" y1="${ty + 15}" x2="${gx + tw * 2}" y2="${ty + 15}" stroke="${C6.warn}" stroke-width="1.6"/>
            <text x="${gx + tw * 2 + 5}" y="${ty + 18.5}" font-size="9" fill="${C6.warn}">T_s = 2T (1 สัญลักษณ์)</text>`;
      if (step >= 3) {
        const tcw = fast ? cw : cw * 2;
        g += `<line x1="${gx}" y1="${ty + 30}" x2="${gx + tcw}" y2="${ty + 30}" stroke="${C6.alt}" stroke-width="1.6"/>
              <text x="${gx + tcw + 5}" y="${ty + 33.5}" font-size="9" fill="${C6.alt}" font-weight="700">T_c ${fast ? '= T_s/2  →  T_c < T_s = FHSS แบบเร็ว' : '= 2T_s  →  T_c ≥ T_s = FHSS แบบช้า'}</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:340px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 3) Stepper: DSSS — XOR ทีละชิป (สไลด์ 15–16)
//    A = 01001011 · PN 32 ชิป · C = A ⊕ B  (ตรงสไลด์ 16 ทุกชิป)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('dsssStepper');
  if (!el) return;
  const W = 620, H = 300;
  const DATA = '01001011';
  const PN = '01101001011010110101001101001001';
  const SPREAD = [...DATA].map((b) => b.repeat(4)).join('');
  const TX = xorStr(SPREAD, PN);
  const BACK = xorStr(TX, PN);
  const x0 = 40, x1 = W - 16, cw = (x1 - x0) / 32;
  const LBL = [
    'ขั้น 1 · ข้อมูล A = 0 1 0 0 1 0 1 1 (8 บิต) — 1 บิตกินเวลา T',
    'ขั้น 2 · แต่ละบิตถูก "แทนที่ด้วยหลายบิต": ที่นี่ 4 ชิปต่อบิต → เวลาต่อชิป T_c = T/4 (สไลด์ 15)',
    'ขั้น 3 · รหัสการแผ่ (PN) 32 ชิป — ตัวเดียวกันนี้ต้องมีที่ฝั่งรับด้วย',
    'ขั้น 4 · ส่งจริง C = A ⊕ B (exclusive-OR ทีละชิป) — นี่คือสัญญาณที่ออกอากาศ',
    'ขั้น 5 · ฝั่งรับ XOR ด้วย PN ตัวเดิมอีกครั้ง: C ⊕ B = (A ⊕ B) ⊕ B = A ← ได้ข้อมูลเดิมเป๊ะ',
    'ขั้น 6 · ราคาที่จ่าย: อัตราชิปสูงขึ้น 4 เท่า → แบนด์วิดท์กว้างขึ้น 4 เท่า (สไลด์ 20)',
  ];
  function bitRow(str, y, color, cellW, ink, n) {
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + i * cellW;
      const on = str[i] === '1';
      g += `<rect x="${x}" y="${on ? y - 13 : y}" width="${cellW - 0.6}" height="13" fill="${color}" opacity="${on ? .85 : .18}"/>
            <text x="${x + cellW / 2}" y="${y + 11}" text-anchor="middle" font-size="${cellW > 24 ? 8.5 : 6.5}" fill="${ink}">${str[i]}</text>`;
    }
    return g;
  }
  createStepper(el, {
    steps: 6, stepDuration: 1700,
    label: (s) => LBL[s],
    render(stage, step, t) {
      const ink = cssVar('--ink', '#1d1f2b');
      let g = '';
      const rows = [];
      rows.push(['ข้อมูล A', DATA, C6.warn, (x1 - x0) / 8, 8]);
      if (step >= 1) rows.push(['A ขยายเป็นชิป', SPREAD, C6.warn, cw, 32]);
      if (step >= 2) rows.push(['รหัสแผ่ B (PN)', PN, C6.alt, cw, 32]);
      if (step >= 3) rows.push(['ส่งออกอากาศ C = A ⊕ B', TX, C6.main, cw, 32]);
      if (step >= 4) rows.push(['ฝั่งรับ: C ⊕ B', BACK, C6.ok, cw, 32]);
      rows.forEach(([name, str, color, cellW, n], r) => {
        const y = 34 + r * 46;
        g += `<text x="${x0}" y="${y - 18}" font-size="9.5" fill="${color}" font-weight="700">${name}</text>`;
        const shown = (r === rows.length - 1 && step <= 4) ? Math.max(1, Math.round(n * (0.2 + 0.8 * easeOut(t)))) : n;
        g += bitRow(str, y, color, cellW, ink, shown);
        g += `<line x1="${x0}" y1="${y + 13}" x2="${x1}" y2="${y + 13}" stroke="${ink}" opacity=".45"/>`;
      });
      if (step === 1) {
        g += `<line x1="${x0}" y1="${20}" x2="${x0 + cw}" y2="${20}" stroke="${C6.bad}" stroke-width="1.6"/>
              <text x="${x0 + cw + 6}" y="${23.5}" font-size="9" fill="${C6.bad}">T_c = T/4 (1 ชิป)</text>`;
      }
      if (step >= 4) {
        const y = 34 + (rows.length - 1) * 46;
        g += `<text x="${x0}" y="${y + 30}" font-size="11" fill="${C6.ok}" font-weight="700" font-family="var(--mono)">= 0000 1111 0000 0000 1111 0000 1111 1111  →  บีบกลับได้ A = 0 1 0 0 1 0 1 1 ✓</text>`;
      }
      if (step >= 5) {
        const y = 34 + rows.length * 46;
        g += `<text x="${x0}" y="${y + 6}" font-size="11" fill="${C6.main}" font-family="var(--mono)">อัตราชิป = k × D  (สไลด์ 22) → k = 4 ⇒ ถ้า D = 1 kbps จะได้ 4 kchip/s</text>
              <text x="${x0}" y="${y + 24}" font-size="10.5" fill="${ink}">"การแผ่อยู่ในสัดส่วนตรงกับจำนวนบิตที่ใช้" (สไลด์ 15) — ยิ่งชิปเยอะ ยิ่งแผ่กว้าง ยิ่งซ่อนเก่ง</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:320px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 4) Stepper: CDMA ตาราง 7.1 (สไลด์ 23–26)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('cdmaStepper');
  if (!el) return;
  const W = 620, H = 290;
  const A = [1, -1, -1, 1, -1, 1], B = [1, 1, -1, -1, 1, 1], C = [1, 1, -1, 1, 1, -1];
  const CASES = [
    { k: '(a)', tx: null, rxName: '—', title: 'รหัสของผู้ใช้ 3 คน (สไลด์ 26a)',
      note: 'A, B, C ถือรหัส 6 ชิป คนละชุด — ตัวรับต้องรู้ว่าจะถอดของใคร จึงหยิบรหัสคนนั้นมาคูณ' },
    { k: '(b1)', tx: A, txName: 'A ส่งบิต 1', rx: A, rxName: 'A', title: 'A ส่งบิต 1 → ตัวรับใช้รหัส A',
      note: 'ทุกช่องคูณกันได้ +1 หมด เพราะเป็นรหัสเดียวกันคูณตัวเอง → ผลรวม = +6 = "บิต 1" ชัดเจน' },
    { k: '(b2)', tx: A.map((v) => -v), txName: 'A ส่งบิต 0', rx: A, rxName: 'A', title: 'A ส่งบิต 0 (กลับขั้วรหัส)',
      note: 'บิต 0 คือส่ง <−c₁…−c₆> = ภาพกลับของรหัส → ได้ −6 · เครื่องรับอ่าน "ค่าติดลบ = บิต 0"' },
    { k: '(c)', tx: B, txName: 'B ส่งบิต 1', rx: A, rxName: 'A', title: 'B ส่ง แต่ตัวรับพยายามถอดของ A',
      note: 'ได้ 0 พอดี — A กับ B ตั้งฉากกัน (cross correlation = 0) → สัญญาณ B จึงเป็น "สิ่งที่ไม่ต้องการ ไม่ต้องสนใจ"' },
    { k: '(d)', tx: C, txName: 'C ส่งบิต 1', rx: B, rxName: 'B', title: 'C ส่ง แต่ตัวรับพยายามถอดของ B',
      note: '⚠︎ ได้ 2 ไม่ใช่ 0! เพราะ B กับ C ไม่ได้ตั้งฉากกันสนิท — แต่ 2 ยังห่างจาก 6 มาก จึงไม่ทำให้ตัดสินผิด' },
    { k: '(e)', tx: null, rx: B, rxName: 'B', title: 'B และ C ส่งพร้อมกัน → ตัวรับถอดของ B',
      note: 'สัญญาณในอากาศบวกกันเอง (2,2,−2,0,2,0) แต่พอคูณรหัส B แล้วรวม ได้ 8 → ยังอ่านว่า "บิต 1" ถูก' },
  ];
  createStepper(el, {
    steps: CASES.length, stepDuration: 2000,
    label: (s) => `${CASES[s].k} ${CASES[s].title}`,
    render(stage, step) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const cs = CASES[step];
      let g = '';
      const cw = 62, x0 = 150, y0 = 40;
      const cell = (x, y, v, fill, bold) =>
        `<rect x="${x}" y="${y}" width="${cw - 3}" height="24" rx="4" fill="${fill}" opacity="${fill === 'none' ? 1 : .8}" stroke="${line}"/>
         <text x="${x + (cw - 3) / 2}" y="${y + 16.5}" text-anchor="middle" font-size="11" font-weight="${bold ? 700 : 400}"
            fill="${fill === 'none' ? ink : '#111'}" font-family="var(--mono)">${v > 0 ? '+' + v : v}</text>`;
      const rowLabel = (y, txt, color) =>
        `<text x="${x0 - 10}" y="${y + 16.5}" text-anchor="end" font-size="10" fill="${color || ink}" font-weight="600">${txt}</text>`;

      if (step === 0) {
        [['ผู้ใช้ A', A, C6.warn], ['ผู้ใช้ B', B, C6.sig], ['ผู้ใช้ C', C, C6.alt]].forEach(([n, code, col], r) => {
          const y = y0 + r * 34;
          g += rowLabel(y, n, col);
          code.forEach((v, i) => { g += cell(x0 + i * cw, y, v, v > 0 ? col : 'none'); });
        });
        g += `<text x="${x0}" y="${y0 + 130}" font-size="11" fill="${ink}">ส่ง <b>บิต 1</b> = ส่งรหัสตรง ๆ &lt;c₁…c₆&gt; · ส่ง <b>บิต 0</b> = ส่งส่วนกลับ &lt;−c₁…−c₆&gt; (สไลด์ 23)</text>
              <text x="${x0}" y="${y0 + 152}" font-size="11" fill="${C6.main}" font-family="var(--mono)">ฟังก์ชันถอดรหัส: S(d) = d₁·c₁ + d₂·c₂ + d₃·c₃ + d₄·c₄ + d₅·c₅ + d₆·c₆</text>`;
      } else {
        let rows;
        if (step === 5) {
          const comb = B.map((v, i) => v + C[i]);
          rows = [['B ส่งบิต 1', B, C6.sig], ['C ส่งบิต 1', C, C6.alt], ['สัญญาณรวมในอากาศ', comb, C6.warn],
                  ['รหัสของตัวรับ (B)', B, C6.sig], ['คูณทีละชิป', comb.map((v, i) => v * B[i]), C6.main]];
        } else {
          rows = [[cs.txName, cs.tx, C6.warn], [`รหัสของตัวรับ (${cs.rxName})`, cs.rx, C6.sig],
                  ['คูณทีละชิป', cs.tx.map((v, i) => v * cs.rx[i]), C6.main]];
        }
        rows.forEach(([n, code, col], r) => {
          const y = y0 + r * 32;
          g += rowLabel(y, n, col);
          code.forEach((v, i) => {
            const last = r === rows.length - 1;
            g += cell(x0 + i * cw, y, v, v === 0 ? 'none' : (v > 0 ? col : 'none'), last);
          });
        });
        const sum = rows[rows.length - 1][1].reduce((s, v) => s + v, 0);
        const y = y0 + rows.length * 32 + 6;
        const good = Math.abs(sum) >= 6;
        g += `<text x="${x0}" y="${y + 18}" font-size="15" font-weight="700" font-family="var(--mono)"
                 fill="${good ? C6.ok : (sum === 0 ? ink : C6.bad)}">ผลรวม = ${sum > 0 ? '+' : ''}${sum}
                 ${sum >= 6 ? '  →  อ่านว่า บิต 1 ✓' : sum <= -6 ? '  →  อ่านว่า บิต 0 ✓' : '  →  ไม่ใช่สัญญาณของเรา'}</text>`;
      }
      g += `<foreignObject x="16" y="${H - 46}" width="${W - 32}" height="44">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:11px;line-height:1.45;color:${ink};font-family:inherit">${cs.note}</div>
            </foreignObject>`;
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:310px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 5) Stepper: LFSR สร้างลำดับ PN (สไลด์ 34–36)
//    x⁴ + x + 1 · ป้อนกลับ B₀ ⊕ B₁ · เริ่ม 1000 → 000100110101111 (คาบ 15)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('lfsrStepper');
  if (!el) return;
  const W = 620, H = 280;
  const STATES = [], OUT = [];
  {
    let [b3, b2, b1, b0] = [1, 0, 0, 0];
    for (let i = 0; i < 16; i++) {
      STATES.push([b3, b2, b1, b0]);
      if (i < 15) { OUT.push(b0); const fb = b0 ^ b1; [b3, b2, b1, b0] = [fb, b3, b2, b1]; }
    }
  }
  createStepper(el, {
    steps: 16, stepDuration: 750,
    label: (s) => s === 0
      ? 'ขั้น 0 · สถานะเริ่มต้น (seed) = 1000 — ถ้าไม่รู้ seed กับอัลกอริทึม ลำดับนี้เดาไม่ได้เลย (สไลด์ 32)'
      : s < 15
        ? `ขั้น ${s} · เอาต์พุต = B₀ ตัวเดิม → ป้อนกลับ B₀⊕B₁ เข้าหัว · ลำดับที่ได้ถึงตอนนี้: ${OUT.slice(0, s).join('')}`
        : 'ขั้น 15 · ครบ 1 คาบ! สถานะวนกลับเป็น 1000 → ลำดับยาว N = 2⁴−1 = 15 = maximal length (m-sequence)',
    render(stage, step) {
      const ink = cssVar('--ink', '#1d1f2b'), line = cssVar('--line-2', '#ccc');
      const st = STATES[Math.min(step, 15)];
      let g = '';
      const bx = 130, by = 46, bw = 62, bh = 44, gap = 22;
      ['B₃', 'B₂', 'B₁', 'B₀'].forEach((n, i) => {
        const x = bx + i * (bw + gap);
        const v = st[i];
        g += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${v ? C6.main : 'none'}"
                 opacity="${v ? .85 : 1}" stroke="${v ? C6.main : line}" stroke-width="1.8"/>
              <text x="${x + bw / 2}" y="${by + 27}" text-anchor="middle" font-size="19" font-weight="700"
                 fill="${v ? '#111' : ink}" font-family="var(--mono)">${v}</text>
              <text x="${x + bw / 2}" y="${by - 8}" text-anchor="middle" font-size="10" fill="${ink}">${n}</text>`;
        if (i < 3) {
          const ax = x + bw;
          g += `<line x1="${ax + 2}" y1="${by + bh / 2}" x2="${ax + gap - 6}" y2="${by + bh / 2}" stroke="${line}" stroke-width="2"/>
                <polygon points="${ax + gap - 4},${by + bh / 2} ${ax + gap - 10},${by + bh / 2 - 4} ${ax + gap - 10},${by + bh / 2 + 4}" fill="${line}"/>`;
        }
      });
      const outX = bx + 4 * (bw + gap);
      g += `<line x1="${outX - 20}" y1="${by + bh / 2}" x2="${outX + 14}" y2="${by + bh / 2}" stroke="${C6.warn}" stroke-width="2.4"/>
            <polygon points="${outX + 16},${by + bh / 2} ${outX + 9},${by + bh / 2 - 5} ${outX + 9},${by + bh / 2 + 5}" fill="${C6.warn}"/>
            <text x="${outX + 22}" y="${by + bh / 2 + 4}" font-size="10.5" fill="${C6.warn}" font-weight="700">Output</text>`;
      // วง XOR ป้อนกลับ (จาก B0 และ B1)
      const fy = by + bh + 42, fx = bx + 2.5 * (bw + gap) + bw / 2;
      const fbv = st[3] ^ st[2];
      g += `<circle cx="${fx}" cy="${fy}" r="14" fill="none" stroke="${C6.alt}" stroke-width="2"/>
            <text x="${fx}" y="${fy + 5}" text-anchor="middle" font-size="15" fill="${C6.alt}">⊕</text>
            <line x1="${bx + 3 * (bw + gap) + bw / 2}" y1="${by + bh}" x2="${bx + 3 * (bw + gap) + bw / 2}" y2="${fy}" stroke="${C6.alt}" stroke-width="1.6"/>
            <line x1="${bx + 3 * (bw + gap) + bw / 2}" y1="${fy}" x2="${fx + 14}" y2="${fy}" stroke="${C6.alt}" stroke-width="1.6"/>
            <line x1="${bx + 2 * (bw + gap) + bw / 2}" y1="${by + bh}" x2="${bx + 2 * (bw + gap) + bw / 2}" y2="${fy}" stroke="${C6.alt}" stroke-width="1.6"/>
            <line x1="${bx + 2 * (bw + gap) + bw / 2}" y1="${fy}" x2="${fx - 14}" y2="${fy}" stroke="${C6.alt}" stroke-width="1.6"/>
            <path d="M ${fx},${fy + 14} L ${fx},${fy + 22} L ${bx - 26},${fy + 22} L ${bx - 26},${by + bh / 2} L ${bx - 4},${by + bh / 2}"
               fill="none" stroke="${C6.alt}" stroke-width="1.8"/>
            <polygon points="${bx - 2},${by + bh / 2} ${bx - 9},${by + bh / 2 - 5} ${bx - 9},${by + bh / 2 + 5}" fill="${C6.alt}"/>
            <text x="${bx + 3 * (bw + gap) + bw / 2 + 18}" y="${fy + 4}" font-size="10.5" fill="${C6.alt}" font-family="var(--mono)">B₀ ⊕ B₁ = ${fbv}</text>`;
      // ลำดับที่ออกมาแล้ว
      const sy = 200;
      g += `<text x="24" y="${sy - 8}" font-size="10" fill="${ink}">ลำดับเอาต์พุตที่สะสมได้ (สไลด์ 36 แถวแรก):</text>`;
      const ow = 30;
      for (let i = 0; i < 15; i++) {
        const on = i < step;
        const x = 24 + i * ow;
        g += `<rect x="${x}" y="${sy}" width="${ow - 3}" height="26" rx="4"
                 fill="${on ? (OUT[i] ? C6.warn : 'none') : 'none'}" opacity="${on && OUT[i] ? .85 : 1}"
                 stroke="${on ? C6.warn : line}" stroke-width="${i === step - 1 ? 2.4 : 1}"/>
              <text x="${x + (ow - 3) / 2}" y="${sy + 18}" text-anchor="middle" font-size="13" font-weight="700"
                 fill="${on ? ink : line}" font-family="var(--mono)">${on ? OUT[i] : '·'}</text>`;
      }
      if (step >= 15) {
        g += `<text x="24" y="${sy + 48}" font-size="11.5" fill="${C6.ok}" font-weight="700" font-family="var(--mono)">คุณสมบัติ 1: มี "1" อยู่ 2ⁿ⁻¹ = 8 ตัว และ "0" อยู่ 2ⁿ⁻¹−1 = 7 ตัว ✓ (สไลด์ 37)</text>`;
      }
      stage.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:300px">${g}</svg>`;
    },
  });
})();

// ---------------------------------------------------------------
// 6) Lab: Walsh matrix + cross-correlation (สไลด์ 45–46)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('walshLab');
  if (!el) return;
  let n = 3;                        // 2^n
  let rowA = 0, rowB = 1;
  const grow = (M) => M.map((r) => [...r, ...r]).concat(M.map((r) => [...r, ...r.map((v) => 1 - v)]));
  function walsh(k) { let M = [[0]]; for (let i = 0; i < k; i++) M = grow(M); return M; }
  function draw() {
    const M = walsh(n), N = M.length;
    rowA = Math.min(rowA, N - 1); rowB = Math.min(rowB, N - 1);
    const a = M[rowA].map((v) => (v ? 1 : -1)), b = M[rowB].map((v) => (v ? 1 : -1));
    const prod = a.map((v, i) => v * b[i]);
    const sum = prod.reduce((s, v) => s + v, 0);
    const cellPx = Math.max(13, Math.min(30, 300 / N));
    const grid = M.map((row, r) => `<div class="wl-row ${r === rowA ? 'ra' : ''} ${r === rowB ? 'rb' : ''}" data-row="${r}">
        <span class="wl-idx">W${r}</span>${row.map((v) => `<i class="wl-c ${v ? 'on' : ''}" style="width:${cellPx}px;height:${cellPx}px"></i>`).join('')}
      </div>`).join('');
    el.innerHTML = `
      <div class="row">
        <label>ขนาดเมทริกซ์
          <select id="wlN">${[1, 2, 3, 4].map((k) => `<option value="${k}" ${k === n ? 'selected' : ''}>W${2 ** k} (${2 ** k}×${2 ** k})</option>`).join('')}</select>
        </label>
        <span class="hint" style="margin:0">กดที่แถวในตารางเพื่อเลือกคู่ที่จะเทียบ (แถวส้ม × แถวฟ้า)</span>
      </div>
      <div class="wl-grid">${grid}</div>
      <div class="wl-calc">
        <div>แถว <b class="ra">W${rowA}</b> → <code>${a.map((v) => (v > 0 ? '+1' : '−1')).join(' ')}</code></div>
        <div>แถว <b class="rb">W${rowB}</b> → <code>${b.map((v) => (v > 0 ? '+1' : '−1')).join(' ')}</code></div>
        <div>คูณทีละตำแหน่ง → <code>${prod.map((v) => (v > 0 ? '+1' : '−1')).join(' ')}</code></div>
        <div class="wl-sum ${sum === 0 ? 'ok' : 'bad'}">Σ = ${sum}
          ${rowA === rowB
            ? ` — แถวเดียวกันคูณตัวเอง ได้ ${N} (= ความยาวโค้ด) นี่คือ "สัญญาณของเรา"`
            : sum === 0
              ? ' — ตั้งฉากกัน (orthogonal) ✓ สองคนนี้ใช้คลื่นเดียวกันพร้อมกันได้โดยไม่กวนกัน'
              : ' — ไม่ตั้งฉาก (ไม่ควรเกิดกับ Walsh!)'}
        </div>
        <div class="hint" style="margin:6px 0 0">📌 สไลด์ 45: <b>ต้องการการเข้าจังหวะที่แน่นอน</b> — ถ้าจังหวะเพี้ยน cross correlation ระหว่าง Walsh คนละแถวจะไม่เป็น 0 อีกต่อไป และผู้ใช้จะกวนกันทันที</div>
      </div>`;
    el.querySelector('#wlN').addEventListener('change', (e) => { n = +e.target.value; rowA = 0; rowB = 1; draw(); });
    el.querySelectorAll('.wl-row').forEach((r) => r.addEventListener('click', () => {
      const idx = +r.dataset.row;
      if (idx === rowA) return;
      rowB = rowA; rowA = idx; draw();
    }));
  }
  el.classList.add('lab');
  draw();
})();

// ---------------------------------------------------------------
// 7) Lab: ตรวจคุณสมบัติรหัสสุ่มเทียม (สไลด์ 33, 37–40, 51–53)
// ---------------------------------------------------------------
(function () {
  const el = document.getElementById('pnLab');
  if (!el) return;
  const PRESETS = [
    ['100110101111000', 'รหัส 15 บิตในสไลด์ 51 (ตัวอย่างของอาจารย์)'],
    ['000100110101111', 'ลำดับดิบจาก LFSR สไลด์ 35 (seed 1000)'],
    ['111101011001000', 'ลำดับสไลด์ 35 แบบกลับหลัง'],
    ['101010101010101', 'สลับ 0/1 ตายตัว — ดูว่าทำไมถึงไม่ใช่รหัสสุ่มเทียม'],
    ['111111100000000', 'บล็อกเดียว — สมดุลใกล้เคียง แต่รันพัง'],
  ];
  let code = PRESETS[0][0];
  const shiftR = (s, j) => s.slice(s.length - j) + s.slice(0, s.length - j);
  function analyse(s) {
    const N = s.length;
    const ones = [...s].filter((c) => c === '1').length;
    const runs = s.match(/1+|0+/g) || [];
    const tally = (ch) => [1, 2, 3, 4].map((L) => runs.filter((r) => r[0] === ch && r.length === L).length);
    const bp = bip(s);
    const R = [];
    for (let t = 0; t < N; t++) R.push(bp.reduce((acc, _, k) => acc + bp[k] * bp[(k - t + N) % N], 0) / N);
    const xors = [];
    for (let j = 1; j < N; j++) {
      const x = xorStr(s, shiftR(s, j));
      xors.push([...x].filter((c) => c === '1').length);
    }
    return { N, ones, zeros: N - ones, runs, tally, R, xors };
  }
  function draw() {
    const a = analyse(code);
    const balOK = Math.abs(a.ones - a.zeros) <= 1;
    const total = a.runs.length;
    const ideal = [total / 2, total / 4, total / 8, total / 16].map((v) => v.toFixed(1));
    const got = [1, 2, 3, 4].map((L) => a.runs.filter((r) => r.length === L).length);
    const runOK = got[0] >= total / 2 - 1 && got[0] <= total / 2 + 1;
    const corrOK = a.xors.every((v) => Math.abs(v - a.ones) <= 1);
    const W = 460, H = 110, x0 = 34, x1 = W - 10, ymid = 62;
    const bw = (x1 - x0) / a.N;
    let spark = '';
    a.R.forEach((v, i) => {
      const x = x0 + i * bw, h = v * 40;
      spark += `<rect x="${x + bw * .15}" y="${h >= 0 ? ymid - h : ymid}" width="${bw * .7}" height="${Math.max(1.5, Math.abs(h))}"
                   fill="${i === 0 ? C6.main : C6.alt}" opacity="${i === 0 ? 1 : .8}"/>`;
    });
    el.innerHTML = `
      <div class="row">
        <label>รหัสที่จะตรวจ
          <select id="pnPick">${PRESETS.map(([c, d], i) => `<option value="${i}" ${c === code ? 'selected' : ''}>${c} — ${d}</option>`).join('')}</select>
        </label>
        <label>หรือพิมพ์เอง (0/1) <input id="pnIn" type="text" value="${code}" size="20" spellcheck="false"></label>
      </div>
      <div class="pn-res">
        <div class="pn-item ${balOK ? 'ok' : 'bad'}">
          <b>1. คุณสมบัติสมดุล (Balance)</b>
          <div>มี "1" <b>${a.ones}</b> ตัว · "0" <b>${a.zeros}</b> ตัว จาก ${a.N} บิต → ${balOK ? 'ต่างกันไม่เกิน 1 ✓ ผ่าน' : 'ต่างกัน ' + Math.abs(a.ones - a.zeros) + ' ✗ ไม่ผ่าน'}</div>
          <div class="hint" style="margin:2px 0 0">สไลด์ 33: "สัดส่วนของไบนารี 1 มีค่าใกล้เคียง 1/2"</div>
        </div>
        <div class="pn-item ${runOK ? 'ok' : 'bad'}">
          <b>2. คุณสมบัติรัน (Run property)</b>
          <div>รันทั้งหมด <b>${total}</b> ชุด → ยาว 1: <b>${got[0]}</b> (ควร ≈ ${ideal[0]}) · ยาว 2: <b>${got[1]}</b> (≈ ${ideal[1]}) · ยาว 3: <b>${got[2]}</b> (≈ ${ideal[2]}) · ยาว 4: <b>${got[3]}</b> (≈ ${ideal[3]})</div>
          <div class="pn-runs">${a.runs.map((r) => `<span class="pn-run ${r[0] === '1' ? 'one' : 'zero'}">${r}</span>`).join('')}</div>
          <div class="hint" style="margin:2px 0 0">สไลด์ 33: 1/2 ของรันยาว 1 · 1/4 ยาว 2 · 1/8 ยาว 3 …</div>
        </div>
        <div class="pn-item ${corrOK ? 'ok' : 'bad'}">
          <b>3. คุณสมบัติสหสัมพันธ์ (Correlation)</b>
          <div>[b] ⊕ [b](j) สำหรับ j = 1…${a.N - 1} ให้จำนวน "1" = <code>${a.xors.join(', ')}</code> → ${corrOK ? 'สมดุลทุกค่า ✓ ผ่าน' : '✗ ไม่สมดุล'}</div>
          <svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:120px;margin-top:4px">
            <line x1="${x0}" y1="${ymid}" x2="${x1}" y2="${ymid}" stroke="currentColor" opacity=".5"/>
            ${spark}
            <text x="4" y="${ymid - 38}" font-size="9" fill="currentColor">R = 1</text>
            <text x="4" y="${ymid + 4}" font-size="9" fill="currentColor">0</text>
            <text x="${x0}" y="${H - 4}" font-size="9" fill="currentColor">τ = 0</text>
            <text x="${x1}" y="${H - 4}" text-anchor="end" font-size="9" fill="currentColor">τ = ${a.N - 1}</text>
          </svg>
          <div class="hint" style="margin:0">ฟังก์ชันอัตสหสัมพันธ์ R(τ) = (1/N)·Σ B_k·B_(k−τ) · m-sequence ที่ดีต้องได้ <b>R(0) = 1</b> และ <b>R(τ≠0) = −1/N = ${(-1 / a.N).toFixed(4)}</b> (สไลด์ 38, 40)</div>
        </div>
        <div class="pn-verdict ${balOK && runOK && corrOK ? 'ok' : 'bad'}">
          ${balOK && runOK && corrOK
            ? '✅ ผ่านทั้ง 3 คุณสมบัติ → สรุปได้ว่ารหัสชุดนี้เป็น <b>รหัสสุ่มเทียม</b> (ตามข้อสรุปสไลด์ 53)'
            : '❌ ไม่ผ่านครบ 3 ข้อ → ยังใช้เป็นรหัสสุ่มเทียมไม่ได้ ศัตรูจะเดาแบบแผนออก'}
        </div>
      </div>`;
    el.querySelector('#pnPick').addEventListener('change', (e) => { code = PRESETS[+e.target.value][0]; draw(); });
    el.querySelector('#pnIn').addEventListener('change', (e) => {
      const v = e.target.value.replace(/[^01]/g, '');
      if (v.length >= 3) { code = v; draw(); }
    });
  }
  el.classList.add('lab');
  draw();
})();

// ---------------------------------------------------------------
// 8) Walkthroughs — โจทย์จากสไลด์ (ตัวเลข verify ด้วย node แล้ว)
// ---------------------------------------------------------------
mountWalk('walkCDMA', [
  { title: 'โจทย์สไลด์ 30', body: 'ในระบบ CDMA ถ้า\n  ผู้ใช้ A มีรหัส 0011  ส่งบิต 0\n  ผู้ใช้ B มีรหัส 0101  ส่งบิต 1\nออกไปในอากาศ\n\nถาม: (ก) สัญญาณที่รวมกันในอากาศเป็นเท่าไหร่\n      (ข) เครื่องรับเอาข้อมูลของผู้ใช้ A ออกมาได้อย่างไร',
    note: 'โจทย์นี้คือทั้งบทย่อในข้อเดียว — ต้องใช้ทั้งการแปลงเป็นไบโพลาร์ การบวกสัญญาณ และฟังก์ชันถอดรหัส' },
  { title: 'ขั้น 1 — แปลงรหัสเป็นไบโพลาร์ก่อน', body: 'กฎแปลง (สไลด์ 46):  0 → −1  ·  1 → +1\n\n  รหัส A = 0 0 1 1  →  (−1, −1, +1, +1)\n  รหัส B = 0 1 0 1  →  (−1, +1, −1, +1)',
    note: 'ทำไมต้องแปลง? เพราะการถอดรหัสใช้ "คูณแล้วบวก" — ถ้าปล่อยเป็น 0/1 การคูณจะได้ 0 ตลอด ใช้ไม่ได้' },
  { title: 'ขั้น 2 — เช็กก่อนว่าสองรหัสนี้ตั้งฉากกันจริงไหม', body: 'A · B = (−1)(−1) + (−1)(+1) + (+1)(−1) + (+1)(+1)\n      =   +1   +   (−1)  +   (−1)  +   +1\n      = 0   ✓ ตั้งฉากกัน (orthogonal)\n\nและ A · A = 1+1+1+1 = 4  (= ความยาวโค้ด k)',
    note: 'นี่คือเหตุผลทั้งหมดที่ CDMA ทำงานได้ — ถ้า A·B ≠ 0 สองคนนี้จะกวนกันทันที (เทียบกรณี (d) ในตาราง 7.1 ที่ได้ 2)' },
  { title: 'ขั้น 3 — แต่ละคนส่งอะไรออกอากาศ', body: 'กฎ (สไลด์ 23):  บิต 1 = ส่งรหัสตรง ๆ  ·  บิต 0 = ส่งส่วนกลับของรหัส\n\n  A ส่งบิต 0 → กลับขั้วทุกชิป\n     (−1, −1, +1, +1) → (+1, +1, −1, −1)\n\n  B ส่งบิต 1 → ส่งรหัสตรง ๆ\n     (−1, +1, −1, +1)',
    note: 'จำง่าย ๆ: บิต 0 = ภาพสะท้อนของรหัส (correlation = −1 ตามนิยามในสไลด์ 39)' },
  { title: 'ขั้น 4 — (ก) สัญญาณรวมในอากาศ', body: 'อากาศไม่ได้ "เลือก" ให้ใคร — คลื่นทุกคนบวกกันตรง ๆ ทีละชิป\n\n    A:  +1   +1   −1   −1\n    B:  −1   +1   −1   +1\n  ─────────────────────────\n  รวม:   0   +2   −2    0      ← คำตอบ (ก)',
    note: 'สังเกตชิปที่ 1 และ 4: ได้ 0 เพราะสองคนหักล้างกันพอดี — ข้อมูลไม่ได้หายไปไหน มันกระจายอยู่ในชิปที่เหลือ' },
  { title: 'ขั้น 5 — (ข) เครื่องรับถอดของ A', body: 'ใช้ฟังก์ชันถอดรหัส: เอาสัญญาณรวม "คูณ" รหัสของ A ทีละชิป แล้วบวก\n\n  รวม:      0    +2    −2     0\n  รหัส A:  −1    −1    +1    +1\n  ──────────────────────────────\n  คูณ:      0    −2    −2     0\n\n  ผลรวม = 0 + (−2) + (−2) + 0 = −4',
    note: 'จุดสำคัญ: สัญญาณของ B หายไปเองโดยไม่ต้องทำอะไรเลย — เพราะ A·B = 0 ที่เช็กไว้ตั้งแต่ขั้น 2' },
  { title: 'ขั้น 6 — อ่านคำตอบ', body: 'ค่าที่ได้ = −4\n  เทียบเกณฑ์: A·A = +4 คือ "บิต 1" · −4 คือ "บิต 0"\n\n  −4  ติดลบ  →  ผู้ใช้ A ส่ง บิต 0   ✓ ตรงกับโจทย์\n\nลองถอดของ B ด้วยรหัส B บ้าง:\n  (0)(−1) + (2)(+1) + (−2)(−1) + (0)(+1) = 0+2+2+0 = +4\n  → บวก  →  ผู้ใช้ B ส่ง บิต 1  ✓ ถูกเช่นกัน',
    note: 'สัญญาณก้อนเดียวกันในอากาศ ให้คำตอบถูกทั้งสองคน — นี่คือ "การเข้าถึงหลายทางแบบแบ่งรหัส" (Code Division Multiple Access) ในหนึ่งภาพ' },
]);

mountWalk('walkPN', [
  { title: 'โจทย์สไลด์ 51', body: 'จงพิจารณารหัสการแผ่ 15 บิต\n\n        "1 0 0 1 1 0 1 0 1 1 1 1 0 0 0"\n\nสำหรับคุณสมบัติ สมดุล · รัน · และสหสัมพันธ์',
    note: 'เกร็ด: รหัสชุดนี้คือ<b>ลำดับจาก LFSR ในสไลด์ 35 หมุนไป 3 ตำแหน่ง</b>พอดี (000100110101111 → เลื่อน 3 ได้ 100110101111000) — ไม่ใช่เลขสุ่มมั่ว' },
  { title: '1. คุณสมบัติสมดุล (Balance)', body: 'นับ:  1 0 0 1 1 0 1 0 1 1 1 1 0 0 0\n      ↑     ↑ ↑   ↑   ↑ ↑ ↑ ↑\n\n  "1" มี 8 ตัว\n  "0" มี 7 ตัว\n\nต่างกันแค่ 1 → เป็นไปตามคุณสมบัติสมดุล ✓',
    note: 'สำหรับ m-sequence ยาว N = 2ⁿ−1 จะได้ 1 อยู่ 2ⁿ⁻¹ ตัว และ 0 อยู่ 2ⁿ⁻¹−1 ตัวเสมอ (คุณสมบัติที่ 1 สไลด์ 37) — ที่นี่ n = 4: 8 กับ 7 ✓' },
  { title: '2. คุณสมบัติรัน (Run property)', body: 'แยกเป็นรัน:  1 | 00 | 11 | 0 | 1 | 0 | 1111 | 000\n              (8 ชุด)\n\n  ยาว 1 ของบิต 1: 2 ชุด   ยาว 1 ของบิต 0: 2 ชุด\n  ยาว 2 ของบิต 1: 1 ชุด   ยาว 2 ของบิต 0: 1 ชุด\n  ยาว 3 ของบิต 1: 0 ชุด   ยาว 3 ของบิต 0: 1 ชุด\n  ยาว 4 ของบิต 1: 1 ชุด   ยาว 4 ของบิต 0: 0 ชุด',
    note: 'ตรงกับที่สไลด์ 51 ระบุทุกบรรทัด' },
  { title: 'เทียบกับอุดมคติของสไลด์ 33', body: 'รันทั้งหมด 8 ชุด → อุดมคติควรเป็น\n\n  1/2 ของ 8 = 4 ชุด ยาว 1   ได้จริง 2+2 = 4  ✓\n  1/4 ของ 8 = 2 ชุด ยาว 2   ได้จริง 1+1 = 2  ✓\n  1/8 ของ 8 = 1 ชุด ยาว 3   ได้จริง 0+1 = 1  ✓\n\n→ "มีความใกล้เคียงกับคุณสมบัติรัน" ตามที่สไลด์สรุป',
    note: 'ตรงเป๊ะทุกช่อง ไม่ใช่แค่ใกล้เคียง — นี่คือลายเซ็นของ m-sequence ที่สร้างจาก LFSR ที่เลือก tap ถูก' },
  { title: '3. คุณสมบัติสหสัมพันธ์ — วิธีที่สไลด์ใช้', body: 'สไลด์ 52 บอกว่า "การประเมินค่าสหสัมพันธ์ค่อนข้างยุ่งยาก"\nจึงใช้ทางลัด: เอา [b] มา XOR กับตัวมันเองที่เลื่อนไป j ตำแหน่ง\nแล้วดูว่าผลลัพธ์ยัง "สมดุล" อยู่ไหม\n\n  [1 0 0 1 1 0 1 0 1 1 1 1 0 0 0]\n⊕ [0 1 0 0 1 1 0 1 0 1 1 1 1 0 0]   ← เลื่อน 1\n─────────────────────────────────\n= [1 1 0 1 0 1 1 1 1 0 0 0 1 0 0]\n\n  นับได้ "1" 8 ตัว, "0" 7 ตัว → สมดุล ✓',
    note: 'ทำเหมือนบวกเลขยาว ๆ สองบรรทัด แค่เปลี่ยนจากบวกเป็น XOR — สไลด์ 52 แนะนำวิธีนี้ตรง ๆ' },
  { title: 'เลื่อน 2 ตำแหน่ง (สไลด์ 53)', body: '  [1 0 0 1 1 0 1 0 1 1 1 1 0 0 0]\n⊕ [0 0 1 0 0 1 1 0 1 0 1 1 1 1 0]   ← เลื่อน 2\n─────────────────────────────────\n= [1 0 1 1 1 1 0 0 0 1 0 0 1 1 0]\n\n  "1" 8 ตัว → สมดุลเช่นกัน ✓\n\nสไลด์ระบุว่าผลลัพธ์สมดุลเหมือนกันสำหรับ j = 3, 4, …, 14',
    note: 'เราตรวจครบทั้ง 14 ค่าด้วยสคริปต์แล้ว — ได้ "1" แปดตัวเท่ากันทุก j จริง (ลองกดในแล็บด้านบนได้)' },
  { title: 'ทำไม "XOR แล้วสมดุล" ถึงแปลว่าสหสัมพันธ์ดี', body: 'ถ้าเปลี่ยน 0/1 เป็น −1/+1 แล้วคิด R(τ) ตามสูตรสไลด์ 38:\n\n  R(τ) = (1/N)·Σ B_k · B_{k−τ}\n\n  "จำนวนตำแหน่งที่ตรงกัน" − "จำนวนที่ต่างกัน" หารด้วย N\n  ตรงกัน = XOR ได้ 0 · ต่างกัน = XOR ได้ 1\n\n  ที่นี่ต่างกัน 8 ตรงกัน 7 → R = (7 − 8)/15 = −1/15\n\nตรงกับคุณสมบัติที่ 4 (สไลด์ 38) เป๊ะ:\n  R(τ) = 1 เมื่อ τ = 0, N, 2N, …\n  R(τ) = −1/N มิฉะนั้น',
    note: 'นี่คือกราฟทรงหนามในสไลด์ 40 — พุ่ง 1 ที่ τ = 0 แล้วราบอยู่ −1/15 ตลอด · ตัวรับจึงหา "จังหวะที่ตรงกัน" ได้คมมาก' },
  { title: 'สรุปคำตอบ', body: 'ผ่านทั้ง 3 คุณสมบัติ:\n  ✓ สมดุล (8 ต่อ 7)\n  ✓ รัน (4 / 2 / 1 ตรงอุดมคติ)\n  ✓ สหสัมพันธ์ (XOR แล้วสมดุลทุก j)\n\n→ ลำดับ "100110101111000" เป็นไปตามคุณสมบัติ\n   สมดุล รัน และสหสัมพันธ์\n   ดังนั้น รหัสชุดนี้เป็น "รหัสสุ่มเทียม" ✓',
    note: 'คำตอบตรงกับข้อสรุปสไลด์ 53 คำต่อคำ' },
]);

mountWalk('walkFH', [
  { title: 'อ่านสไลด์ 11 ให้เป็นสูตร', body: 'สำหรับอัตราการส่งข้อมูล R:\n\n  คาบของบิต       T  = 1 / R      วินาที\n  คาบของสัญลักษณ์  T_s = L · T      วินาที\n      โดย L = จำนวนบิตต่อสัญลักษณ์ = log₂M\n\n  T_c = คาบของการกระโดด (1 hop)\n\n  T_c ≥ T_s  →  FHSS แบบช้า (slow)\n  T_c < T_s  →  FHSS แบบเร็ว (fast)',
    note: 'จำแก่น: เทียบ "เวลาอยู่ที่ความถี่หนึ่ง" (T_c) กับ "เวลาของ 1 สัญลักษณ์" (T_s) — ใครยาวกว่ากันเท่านั้นเอง' },
  { title: 'อ่านตัวเลขจากรูปสไลด์ 12', body: 'ข้อมูลเข้า 20 บิต: 0111 0011 1101 1000 0011\nM = 4 → L = log₂4 = 2 บิต/สัญลักษณ์\n\n  20 บิต ÷ 2 = 10 สัญลักษณ์ MFSK\n  สัญลักษณ์: 01 11 00 11 11 01 10 00 00 11\n\nรหัส PN บนหัวรูปมี 5 ค่า: 00 11 01 10 00\n  → PN 1 ค่า ครอบ 10/5 = 2 สัญลักษณ์',
    note: 'T_s = 2T (เพราะ 2 บิต/สัญลักษณ์) และ T_c = 2T_s = 4T — ตรงกับแถบวัดที่มุมล่างซ้ายของรูป' },
  { title: 'ความถี่ที่ใช้จริงมาจากไหน', body: 'รูปแบ่งแกนความถี่เป็น 4 แถบ (W_d) แถบละ 4 โทน\n  → W_s = 4 × W_d = 16 ช่องความถี่\n\n  รหัส PN     → เลือกว่าอยู่ "แถบไหน" (0–3)\n  สัญลักษณ์  → เลือกว่าอยู่ "โทนไหน" ในแถบนั้น (0–3)\n\n  ช่องที่ใช้ = (ค่า PN) × 4 + (ค่าสัญลักษณ์)',
    note: 'นี่คือ "FHSS โดยใช้ MFSK": MFSK ทำหน้าที่แบกข้อมูล ส่วน FH ทำหน้าที่ย้ายทั้งก้อนไปมา — สองชั้นซ้อนกัน' },
  { title: 'ไล่ 3 คอลัมน์แรกให้ดู', body: 'คอลัมน์ 1: PN = 00 (แถบ 0) · สัญลักษณ์ = 01 (โทน 1)\n            ช่อง = 0×4 + 1 = 1\n\nคอลัมน์ 2: PN = 00 (แถบเดิม!) · สัญลักษณ์ = 11 (โทน 3)\n            ช่อง = 0×4 + 3 = 3\n\nคอลัมน์ 3: PN = 11 (แถบ 3) · สัญลักษณ์ = 00 (โทน 0)\n            ช่อง = 3×4 + 0 = 12',
    note: 'สังเกตคอลัมน์ 1–2 อยู่แถบเดียวกัน = "กระโดดช้า" ยังไม่เปลี่ยนความถี่ระหว่างสองสัญลักษณ์นี้' },
  { title: 'ครบทั้ง 10 คอลัมน์ (slow FH)', body: 'ช่องความถี่ที่ใช้ตามลำดับ:\n\n  1, 3, 12, 15, 7, 5, 10, 8, 0, 3\n\nจับคู่ดู: (1,3) (12,15) (7,5) (10,8) (0,3)\n  แต่ละคู่อยู่ในแถบเดียวกัน = 1 hop ต่อ 2 สัญลักษณ์',
    note: '✅ ตรวจกับภาพสไลด์ 12 ซูม 200% ทีละคอลัมน์แล้ว ตรงทั้ง 10 ช่อง' },
  { title: 'เทียบ Fast FH (สไลด์ 13)', body: 'ข้อมูลชุดเดียวกัน แต่คราวนี้ PN มี 20 ค่า\n  → T_c = T_s / 2 : 1 สัญลักษณ์ถูกส่งบน 2 แถบ\n\nช่องความถี่ 20 ครั้ง:\n  1, 13 | 7, 11 | 0, 8 | 3, 15 | 11, 3\n  9, 13 | 14, 6 | 0, 4 | 8, 12 | 7, 11\n\nสังเกต: แต่ละคู่ "เศษ 4 เท่ากัน" (โทนเดิม) แต่แถบต่างกัน',
    note: 'เช่น คู่แรก 1 กับ 13: 1 mod 4 = 1 และ 13 mod 4 = 1 → โทนเดียวกัน (สัญลักษณ์ 01) แค่ย้ายแถบจาก 0 ไป 3' },
  { title: 'แล้วมันทนการแจมยังไง (สไลด์ 14)', body: 'สไลด์ 14 บอก 2 ข้อ:\n  ① การแจมต้องทำ "ทุก ๆ ความถี่"\n  ② ถ้ากำลังส่งคงที่ การแจมจะถูกเฉลี่ยลงในทุก ๆ แถบ\n\nคิดเป็นเลข: ศัตรูมีกำลัง P จะแจม\n  แถบเดียว  → แรงเต็ม แต่เราโดนแค่ 1/4 ของเวลา\n  ทั้ง 4 แถบ → โดนตลอดเวลา แต่แรงเหลือ P/4 ต่อแถบ\n\nไม่ว่าเลือกทางไหน ศัตรูก็เสียเปรียบทั้งคู่',
    note: 'Fast FH ยังดีกว่าอีกขั้น เพราะ 1 สัญลักษณ์กระจายอยู่หลายแถบ — ต่อให้แถบหนึ่งโดนแจม อีกแถบยังส่งข้อมูลตัวเดียวกันรอดมาได้ <span class="plus">เสริมจากผู้เขียน — สไลด์บอกเหตุผลไว้ ส่วนการคิดเป็นสัดส่วนเป็นการขยายความ</span>' },
]);

mountWalk('walkWalsh', [
  { title: 'ปัญหาที่ Walsh code มาแก้', body: 'จากตาราง 7.1 กรณี (d): C ส่ง แต่ตัวรับถอดของ B\n  ได้ผลรวม = 2  (ไม่ใช่ 0!)\n\nแปลว่ารหัส B กับ C ไม่ได้ตั้งฉากกันสนิท\n→ ถ้ามีผู้ใช้เยอะ ๆ ค่าขยะแบบนี้จะสะสมจนอ่านผิด\n\nต้องการ: ชุดรหัสที่ "ทุกคู่" ตั้งฉากกันหมด = Orthogonal codes',
    note: 'สไลด์ 44: "Cross correlation คู่ใด ๆ มีค่าเป็น 0" — คำว่า "คู่ใด ๆ" คือหัวใจ' },
  { title: 'สูตรสร้างเมทริกซ์ Walsh (สไลด์ 45)', body: 'เริ่มจาก  W₁ = (0)\n\nแล้วโตเป็นสองเท่าด้วยกฎ:\n\n           ⎛ Wₙ    Wₙ  ⎞\n  W₂ₙ  =   ⎜             ⎟\n           ⎝ Wₙ   W̄ₙ  ⎠\n\n  โดย W̄ₙ = เอา Wₙ มาใส่ค่า not (กลับ 0↔1)',
    note: 'อ่านเป็นภาษาคน: "วางตัวเองไว้ 3 ช่อง แล้วช่องขวาล่างใส่ตัวกลับหัว" — เขียนโค้ดได้ในบรรทัดเดียว' },
  { title: 'ลองสร้าง W₂ และ W₄', body: 'W₁ = [0]\n\n        ⎡ 0  0 ⎤\n  W₂ = ⎣ 0  1 ⎦\n\n        ⎡ 0 0 0 0 ⎤\n        ⎢ 0 1 0 1 ⎥\n  W₄ = ⎢ 0 0 1 1 ⎥\n        ⎣ 0 1 1 0 ⎦',
    note: 'ตรงกับภาพในสไลด์ 46 ทุกช่อง — และสังเกตว่าแถวแรกเป็น 0 ล้วนเสมอ' },
  { title: 'ตรวจว่าตั้งฉากจริงไหม (ตัวอย่างสไลด์ 46)', body: 'แปลง 0 → −1 · 1 → +1 ก่อน\n\n  แถว W0:  −1  −1  −1  −1\n  แถว W1:  −1  +1  −1  +1\n  ─────────────────────────\n  คูณ:     +1  −1  +1  −1\n\n  Σ = +1 −1 +1 −1 = 0   ✓ ตั้งฉากกัน',
    note: 'ตรงกับกล่องตัวอย่างมุมล่างซ้ายของสไลด์ 46 ที่เขียน "Σrow = 0"' },
  { title: 'W₈ ตรวจครบทุกคู่', body: 'W₈ มี 8 แถว → มีคู่ที่ต้องเช็ก 8×7/2 = 28 คู่\n\nเราตรวจด้วยสคริปต์แล้ว: ทุกคู่ได้ 0 หมด ✓\nส่วนแถวคูณตัวเอง ได้ 8 (= ความยาวโค้ด) ทุกแถว\n\n→ รองรับผู้ใช้พร้อมกันได้ 8 คน โดยไม่กวนกันเลย',
    note: 'ลองกดเลือกคู่แถวในแล็บด้านบนดูได้ทุกคู่ — เปลี่ยนเป็น W₁₆ ก็ยังจริง' },
  { title: 'ข้อแม้ที่สไลด์เตือน (สไลด์ 45)', body: '"ต้องการการเข้าจังหวะที่แน่นอน\n มิเช่นนั้น Cross correlation ระหว่าง Walsh sequence\n ที่แตกต่างกัน ไม่ได้มีค่าเป็น 0"\n\nแปล: Walsh ตั้งฉากกันเฉพาะตอน "เริ่มพร้อมกันเป๊ะ"\nถ้าสัญญาณคนหนึ่งมาช้ากว่าไม่กี่ชิป ความตั้งฉากพัง',
    note: 'นี่คือเหตุผลที่สไลด์ 49–50 ต้องใช้ 2 ชั้น: Walsh (channelization) คุมคนในเซลเดียวกันที่ซิงค์กันได้ + PN (scrambling) คุมคนต่างเซลที่ซิงค์กันไม่ได้' },
]);

// ---------------------------------------------------------------
// 9) โค้ดรันได้
// ---------------------------------------------------------------
mountRunner('runner6', `// ═══ Week 6: การแผ่สเปกตรัม — ตรวจโจทย์ทุกข้อในบท ═══
const bip = s => [...s].map(c => c === '1' ? 1 : -1);
const dot = (x,y) => x.reduce((s,v,i) => s + v*y[i], 0);
const xor = (a,b) => [...a].map((c,i) => (+c ^ +b[i])).join('');

// ① โจทย์สไลด์ 30 — A รหัส 0011 ส่งบิต 0 · B รหัส 0101 ส่งบิต 1
const A = bip('0011'), B = bip('0101');
console.log('① A·B =', dot(A,B), '(ต้องเป็น 0 = ตั้งฉาก) · A·A =', dot(A,A));
const txA = A.map(c => -c);              // บิต 0 → กลับขั้ว
const air = txA.map((v,i) => v + B[i]);  // อากาศบวกกันเอง
console.log('   สัญญาณรวมในอากาศ =', air.join(', '));
console.log('   ถอดด้วยรหัส A →', dot(air,A), dot(air,A) < 0 ? '= บิต 0 ✓' : '= บิต 1');
console.log('   ถอดด้วยรหัส B →', dot(air,B), dot(air,B) > 0 ? '= บิต 1 ✓' : '= บิต 0');

// ② ตาราง 7.1 สไลด์ 26 — รหัส 6 ชิป 3 คน
const cA = [1,-1,-1,1,-1,1], cB = [1,1,-1,-1,1,1], cC = [1,1,-1,1,1,-1];
console.log('② (b) A ส่ง 1, รับ A =', dot(cA,cA), '| A ส่ง 0 =', dot(cA.map(v=>-v),cA));
console.log('   (c) B ส่ง, รับ A =', dot(cB,cA), '(ตั้งฉาก → ไม่กวน)');
console.log('   (d) C ส่ง, รับ B =', dot(cC,cB), '(ไม่ตั้งฉากสนิท → มีขยะ 2)');
const comb = cB.map((v,i) => v + cC[i]);
console.log('   (e) B+C =', comb.join(','), '→ รับ B =', dot(comb,cB));

// ③ DSSS สไลด์ 16 — 4 ชิป/บิต
const data = '01001011', pn = '01101001011010110101001101001001';
const spread = [...data].map(b => b.repeat(4)).join('');
const tx = xor(spread, pn);
console.log('③ ส่งออกอากาศ C =', tx);
console.log('   ถอดกลับ C⊕B  =', xor(tx,pn), xor(tx,pn) === spread ? '= A เดิม ✓' : '✗');

// ④ LFSR x⁴+x+1 เริ่ม 1000 (สไลด์ 35–36)
let [b3,b2,b1,b0] = [1,0,0,0], out = '';
for (let i = 0; i < 15; i++) { out += b0; const fb = b0 ^ b1; [b3,b2,b1,b0] = [fb,b3,b2,b1]; }
console.log('④ ลำดับ PN =', out, '· คาบ N = 2^4−1 =', 2**4-1);
console.log('   สถานะวนกลับ =', \`\${b3}\${b2}\${b1}\${b0}\`, '(ต้องเป็น 1000)');

// ⑤ ตรวจคุณสมบัติรหัสสไลด์ 51
const S = '100110101111000';
console.log('⑤ เป็นการหมุน 3 ตำแหน่งของ ④ ไหม:', out.slice(3)+out.slice(0,3) === S);
const ones = [...S].filter(c => c==='1').length;
console.log('   สมดุล: 1 =', ones, '· 0 =', S.length-ones);
const runs = S.match(/1+|0+/g);
console.log('   รัน', runs.length, 'ชุด:', runs.join(' | '));
for (const L of [1,2,3,4])
  console.log('     ยาว', L, '→ บิต1:', runs.filter(r=>r[0]==='1'&&r.length===L).length,
              '· บิต0:', runs.filter(r=>r[0]==='0'&&r.length===L).length,
              '· อุดมคติรวม ≈', (runs.length/2**L).toFixed(1));
const shiftR = (s,j) => s.slice(s.length-j) + s.slice(0,s.length-j);
const bal = [];
for (let j = 1; j < 15; j++) bal.push([...xor(S,shiftR(S,j))].filter(c=>c==='1').length);
console.log('   สหสัมพันธ์ — จำนวน 1 ของ [b]⊕[b](j), j=1..14:', bal.join(','));

// ⑥ autocorrelation R(τ) ตามสูตรสไลด์ 38
const bp = bip(S), N = S.length, R = [];
for (let t = 0; t < N; t++) R.push(bp.reduce((s,_,k) => s + bp[k]*bp[(k-t+N)%N], 0) / N);
console.log('⑥ R(0) =', R[0], '· R(τ≠0) =', R[1].toFixed(4), '(ทฤษฎี −1/N =', (-1/N).toFixed(4), ')');

// ⑦ Walsh W8 — ตรวจว่าทุกคู่ตั้งฉาก (สไลด์ 45–46)
let W = [[0]];
const grow = M => M.map(r => [...r,...r]).concat(M.map(r => [...r,...r.map(v => 1-v)]));
for (let i = 0; i < 3; i++) W = grow(W);
const wb = W.map(r => r.map(v => v ? 1 : -1));
let bad = 0;
for (let i = 0; i < 8; i++) for (let j = i+1; j < 8; j++) if (dot(wb[i],wb[j]) !== 0) bad++;
console.log('⑦ W8: คู่ที่ไม่ตั้งฉาก =', bad, 'จาก 28 คู่ · แถวคูณตัวเอง =', dot(wb[3],wb[3]));

// ⑧ FHSS สไลด์ 12/13 — ช่อง = PN×4 + สัญลักษณ์
const syms = '01110011110110000011'.match(/../g);
const pnSlow = ['00','00','11','11','01','01','10','10','00','00'];
console.log('⑧ slow FH ช่อง:', syms.map((s,i) => parseInt(pnSlow[i],2)*4 + parseInt(s,2)).join(', '));
const pnFast = ['00','11','01','10','00','10','00','11','10','00','10','11','11','01','00','01','10','11','01','10'];
console.log('   fast FH ช่อง:', pnFast.map((p,i) => parseInt(p,2)*4 + parseInt(syms[Math.floor(i/2)],2)).join(', '));

// ⑨ processing gain (เสริมจากผู้เขียน — สไลด์ไม่มีสูตรนี้ตรง ๆ)
for (const k of [4, 6, 11, 128]) console.log('⑨ k =', k, 'ชิป/บิต → Gp =', (10*Math.log10(k)).toFixed(2), 'dB');
`);

// ---------------------------------------------------------------
// 10) ข้อสอบจับเวลา
// ---------------------------------------------------------------
mountExam([25, 18, 12]);
