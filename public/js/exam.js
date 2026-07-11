// ===== คลังข้อสอบรวม 3 สัปดาห์ + สอบจำลองจับเวลา (/exam) =====
// โจทย์ชุดเดียวกับข้อสอบจำลองท้ายบท w1–w3 — ตัวเลขยืนยันด้วยโปรแกรมแล้วทุกข้อ
import { mountExam } from './stepper.js';

const hub = document.getElementById('examHub');
const base = hub ? (hub.dataset.base || '') : '';
const modesEl = document.getElementById('hubModes');
const box = document.getElementById('hubBox');

// ---- คลังโจทย์: w = สัปดาห์, min = งบเวลาแนะนำ (นาที), q/sol = HTML ----
function Q(w, min, q, sol, anchor) {
  return { w, min, q, sol, link: `${base}/week${w}#${anchor}` };
}
const BANK = [
  // ══ Week 1 · dB / link budget ══
  Q(1, 2, '30 W = ? dBm',
    `<div class="formula">10·log₁₀(30) = 14.77 dBW → +30 → <b>44.77 dBm</b></div>
     เช็ก: 30 W อยู่ระหว่าง 10 W (40 dBm) กับ 100 W (50 dBm) ✓`, 'exam'),
  Q(1, 3, '1 dBm = ? dBW = ? W',
    `<div class="formula">1 − 30 = <b>−29 dBW</b> → P = 10^(−2.9) = <b>1.26 × 10⁻³ W = 1.26 mW</b></div>
     โบนัสน่าจำ: +1 dB = ×1.26 (เพราะ 10^0.1 = 1.2589)`, 'exam'),
  Q(1, 3, 'เหตุใด X<sub>dBm</sub> − Y<sub>dBm</sub> = Z<sub>dB</sub> ไม่ใช่ Z<sub>dBm</sub>?',
    `<div class="formula">10·log(P_x/1mW) − 10·log(P_y/1mW) = 10·log(P_x/P_y) — จุดอ้าง 1 mW ตัดกันหมด</div>
     เหลืออัตราส่วนเปล่า ๆ ไม่ผูกหมุด = dB · กฎพกไปสอบ: dBm−dBm=dB · dBm±dB=dBm · dBm+dBm=ไม่มีความหมาย`, 'exam'),
  Q(1, 2, 'Loss = 3 dB มีความหมายว่าอย่างไร มากหรือน้อย เพราะเหตุใด',
    `เหลือ 10^(−0.3) = 0.501 ≈ <b>ครึ่งหนึ่ง</b> — ตัวเลข 3 ดูจิ๋วแต่คือพลังงานหายครึ่ง = <b>มาก</b> (ธรรมชาติสเกล log: เลขเล็กซ่อนการเปลี่ยนแปลงใหญ่)`, 'exam'),
  Q(1, 8, 'ตัวส่ง <b>20 W</b> → สายเสีย 50% → เสาส่งขยาย <b>100 เท่า</b> → อากาศเสีย <b>10⁸ เท่า</b> → เสารับขยาย <b>10 เท่า</b> → สายเสีย 50% — จงหากำลังรับในหน่วย<b>วัตต์</b> และ <b>dBm</b> (ทำ 2 วิธีเช็กกัน)',
    `<div class="formula">วัตต์: 20 × 0.5 × 100 × 10⁻⁸ × 10 × 0.5 = 5×10⁻⁵ W = 50 µW
dBW:  13 − 3 + 20 − 80 + 10 − 3 = −43 dBW  (20 W = ×2×10 → 13 dBW)
dBm:  43 − 3 + 20 − 80 + 10 − 3 = −13 dBm · เช็ก: −13 − (−43) = 30 ✓</div>
     กับดัก: ×100 = +20 dB (ไม่ใช่ +100!) · 10⁸ เท่า = 80 dB`, 'exam'),
  // ══ Week 2 · packet / switching / layer ══
  Q(2, 5, 'ข้อความ <b>60 ไบต์</b> ส่งผ่านโหนดกลาง 2 ตัว (X → a → b → Y) header <b>4 ไบต์</b>/แพ็กเก็ต — หาเวลารวมเมื่อแบ่ง 1, 2, 5, 10 ก้อน แล้วสรุปว่าแบ่งแบบไหนเร็วสุด',
    `<div class="formula">L = 3 ลิงก์ · s = 60/N + 4 · T = s × (N + 2)
N=1: 64×3 = 192 · N=2: 34×4 = 136 · N=5: 16×7 = <b>112 🏆</b> · N=10: 10×12 = 120</div>
     ห้ามตอบ "ยิ่งเล็กยิ่งดี" — N=10 แย่กว่า N=5 เพราะภาษี header (กราฟตัว U)`, 'exam'),
  Q(2, 4, 'เครื่อง A ต่อเครือข่าย ATM ส่งข้อมูลผ่าน router ไปเครื่อง B บน LAN — (ก) router เปิดอ่านถึงชั้นไหน เพราะอะไร (ข) เหตุใดเฟรมขาเข้า/ขาออกต่างชนิดกันได้',
    `(ก) ถึงแค่<b>หัว IP (ชั้น 3)</b> — หน้าที่คือหาเส้นทาง ไม่แตะ TCP/DATA
     (ข) การแบ่งชั้นทำให้ <b>IP datagram เป็นภาษากลาง</b>: แกะเฟรม ATM → เหลือ IP ก้อนเดิม → ห่อเฟรม LAN ใหม่ — "เฟรมเปลี่ยน แต่ IP ข้างในคือก้อนเดิม"`, 'exam'),
  Q(2, 4, 'จงอธิบาย 3 เฟสของ circuit switching + เหตุใด utilization "ไม่ถึง 100%" และ "โทรไม่ติดเพราะสายเต็ม" เกิดจากอะไร',
    `<div class="formula">① establishment (จองวงจรก่อนส่ง) → ② data transfer (อัตรา/delay คงที่) → ③ disconnect (คืนทรัพยากร)</div>
     ไม่ถึง 100% เพราะจองขาดตลอดการเชื่อมต่อ ช่วงเงียบไม่มีใครใช้แทนได้ · สายเต็ม = call blocking: วงจรมีจำกัด เต็มแล้วปฏิเสธเลย (packet switching รับทุกคนแต่ช้าลง)`, 'exam'),
  Q(2, 4, 'งานส่งข้อความสั้น 1–2 แพ็กเก็ตนาน ๆ ครั้ง ควรใช้ datagram หรือ virtual circuit เพราะอะไร · และ "VC จองเส้นทางแล้ว คู่อื่นใช้ลิงก์ไม่ได้" ถูกหรือผิด',
    `ใช้ <b>Datagram</b> — ไม่มีเฟส setup โยนก้อนแรกได้ทันที (งานสั้น ค่า setup แพงกว่าข้อมูล)
     ข้อความนั้น<b>ผิด</b> — VC "จำเส้นทาง" แต่<b>ไม่จองความจุ</b> ลิงก์ยังแชร์ได้ · ที่จองขาดจริงคือ circuit switching เท่านั้น`, 'exam'),
  Q(2, 3, 'เครื่องเดียวเปิดเว็บ + เล่นเกมพร้อมกัน — MAC address, IP address, port ตอบคำถามคนละข้อยังไง อยู่ชั้นไหน และข้อมูลสองแอป "ไม่สลับกัน" เพราะที่อยู่ตัวไหน',
    `<div class="formula">MAC · ชั้น 2 · "เครื่องไหนในวง" | IP · ชั้น 3 · "เครื่องไหนในโลก" | port · ชั้น 4 · "แอปไหนในเครื่อง"</div>
     เว็บกับเกมมาที่ IP/MAC เดียวกัน แต่ <b>port ต่างกัน</b> — Transport ยื่นให้ถูกโปรแกรม`, 'exam'),
  // ══ Week 3 · คลื่น / Nyquist / Shannon ══
  Q(3, 3, 'จงหา λ ของ (ก) WiFi 2.4 GHz (ข) วิทยุ FM 100 MHz + ทำไมเสาอากาศ WiFi เล็กกว่าเสาวิทยุมาก',
    `<div class="formula">(ก) λ = 3×10⁸/2.4×10⁹ = 0.125 m = 12.5 cm   (ลัด: 300/2400)
(ข) λ = 300/100 = 3 m</div>
     ขนาดเสาสัมพันธ์กับ λ — ความถี่สูง = คลื่นสั้น = เสาเล็ก`, 'exam'),
  Q(3, 6, 'ช่องสัญญาณสเปกตรัม <b>3–6 MHz</b>, SNR<sub>dB</sub> = <b>18 dB</b> — จงหา (ก) อัตราส่งสูงสุดตามทฤษฎี (ข) จำนวนระดับสัญญาณที่ต้องใช้',
    `<div class="formula">B = 6−3 = 3 MHz · SNR = 10^1.8 ≈ 63
C = 3×10⁶ × log₂(64) = 3×10⁶ × 6 = <b>18 Mbps</b>   (63+1 = 64 = 2⁶ ไม่ต้องกดเครื่อง!)
Nyquist ย้อน: log₂M = 18M/(2×3M) = 3 → <b>M = 8 ระดับ</b></div>`, 'exam'),
  Q(3, 4, 'ช่องไร้ noise กว้าง <b>4 kHz</b> สัญญาณ <b>8 ระดับ</b> — (ก) ส่งได้เร็วสุดเท่าไหร่ (ข) อยากได้ 32 kbps ต้องกี่ระดับ',
    `<div class="formula">(ก) C = 2(4000)·log₂8 = 8000×3 = <b>24 kbps</b>
(ข) 32000 = 8000·log₂M → log₂M = 4 → <b>M = 16 ระดับ</b></div>
     เพิ่มความเร็วโดยไม่ขยายช่อง = เพิ่มระดับ — แต่โลกจริง noise จำกัด M (งานของ Shannon)`, 'exam'),
  Q(3, 4, 'Amplifier กับ Repeater ต่างกันอย่างไร และเหตุใดดิจิทัลส่งไกลแล้วคุณภาพดีกว่า ทั้งที่ถูกลดทอนแรงกว่า',
    `Amplifier ขยายทุกอย่าง<b>รวม noise</b> → สะสมทุกช่วง · Repeater <b>ตีความบิตแล้วสร้างสัญญาณใหม่สะอาด</b> → noise ถูกล้างทุกช่วง
     ดิจิทัลจึงวางรีพีทเตอร์ถี่ ๆ แล้วส่งไกลไม่สะสมความเสื่อม (ข้อแม้: noise แรงจนตีความผิด = ผิดถาวร)`, 'exam'),
  Q(3, 4, 'FDM กับ TDM ใช้ "ส่วนเกิน" ของสื่อคนละด้านอย่างไร ยกตัวอย่างระบบจริงอย่างละหนึ่ง และแบบใดเข้าคู่สัญญาณดิจิทัล',
    `<div class="formula">FDM: ส่วนเกินของแบนด์วิดท์ → ซอยความถี่ ส่งพร้อมกัน (วิทยุ FM 88–108 MHz)
TDM: ส่วนเกินของอัตราส่ง → ผลัดช่องเวลา (โทรศัพท์ดิจิทัลยุคใหม่)</div>
     <b>TDM คู่ดิจิทัล</b> — ข้อมูลเป็นก้อนบิต สลับเวลาได้ธรรมชาติ (อาจารย์: โทรศัพท์เก่า FDM ใหม่ TDM)`, 'exam'),
];

// ---- ชุดสอบ ----
const MODES = [
  { id: 'full', name: '📚 ชุดเต็ม 15 ข้อ (ซ้อมใหญ่)', pick: () => [...BANK] },
  { id: 'mix9', name: '🎲 สุ่ม 9 ข้อ (3 ต่อสัปดาห์)', pick: () => pickBalanced(3) },
  { id: 'mix6', name: '⚡ สุ่ม 6 ข้อ (2 ต่อสัปดาห์)', pick: () => pickBalanced(2) },
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickBalanced(perWeek) {
  const out = [];
  for (const w of [1, 2, 3]) out.push(...shuffle(BANK.filter((q) => q.w === w)).slice(0, perWeek));
  return out;
}

function render(mode) {
  const set = shuffle(mode.pick());
  const totalMin = set.reduce((a, q) => a + q.min, 0);
  const presets = [Math.max(5, Math.round(totalMin * 0.7)), totalMin, Math.round(totalMin * 1.4)];
  box.innerHTML = `
    <p class="hint">ชุดนี้ ${set.length} ข้อ · เวลาแนะนำรวม <b>${totalMin} นาที</b> — ลำดับข้อถูกสุ่มใหม่ทุกครั้งที่กดเลือกชุด</p>
    <div id="exam-timer"></div>
    <div id="exam-area">
      ${set.map((q, i) => `
        <div class="q">
          <div class="qh"><span class="hub-q-week">W${q.w}</span>ข้อ ${i + 1} <span class="hint">(~${q.min} นาที)</span><br>
            <span style="font-weight:400">${q.q}</span></div>
          <details class="sol"><summary>เฉลย</summary><div class="body">${q.sol}
            <p class="hub-link">📖 <a href="${q.link}">ทวนหัวข้อนี้แบบละเอียดในบทเรียน Week ${q.w} →</a></p>
          </div></details>
        </div>`).join('')}
    </div>`;
  mountExam(presets);
  modesEl.querySelectorAll('.btn').forEach((b) => b.classList.toggle('ghost', b.dataset.mode !== mode.id));
}

function init() {
  modesEl.innerHTML = MODES.map((m) => `<button class="btn ghost" data-mode="${m.id}">${m.name}</button>`).join('');
  modesEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    render(MODES.find((m) => m.id === b.dataset.mode));
  });
  render(MODES[2]); // เริ่มด้วยชุดเบาสุด — กดชุดอื่นได้ทันที
}

if (hub && modesEl && box) init();
