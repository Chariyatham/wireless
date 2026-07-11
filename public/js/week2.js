// ===== Week 2 — animations & labs (v3: encapsulation เป็น step player + walkthrough + runner + exam) =====
import { createStepper, mountWalk, mountRunner, mountExam } from './stepper.js';

// อ่านสี CSS variable (รองรับสลับธีม ขาว/ดำ)
function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}
const PKT_COLORS = ['#58c4dd', '#f6a85f', '#83c167'];

// ---------------------------------------------------------------
// 1) Encapsulation เต็มเส้นทาง: ผู้ส่ง → Router → ผู้รับ (fig 4.6 + 4.7)
//    v3: ขับด้วย step player กลาง — เล่น/ถอยหลัง/เดินหน้า/ลาก scrubber ได้
// ---------------------------------------------------------------
(function () {
  const holder = document.getElementById('encStepper');
  if (!holder) return;
  const stacks = {
    send: document.getElementById('sendStack'),
    rtr: document.getElementById('rtrStack'),
    recv: document.getElementById('recvStack'),
  };

  // segs: [class, label] — ก้อนข้อมูล ณ ขั้นนั้น
  const steps = [
    { st: 'send', l: 'app', segs: [['data', 'DATA']],
      cap: '① Application เตรียมข้อมูล (เช่น เนื้อหาอีเมล) — ก่อนส่ง สองฝั่ง "คุยเสมือน" ตกลงรูปแบบ/การเข้ารหัสกันแล้ว (peer-to-peer dialogue)' },
    { st: 'send', l: 'tp', segs: [['tp', 'TCP'], ['data', 'DATA']],
      cap: '② TCP หั่นข้อมูลเป็นก้อน (segment) แล้วเติมหัว TCP: พอร์ตปลายทาง + เลขลำดับ (sequence number) + ข้อมูลตรวจความผิดพลาด — และ "เก็บสำเนา" ไว้ เผื่อหายจะได้ส่งซ้ำ' },
    { st: 'send', l: 'ip', segs: [['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '③ IP เติมหัว IP: ที่อยู่เครื่องปลายทาง → ได้ IP datagram — หัวนี้แหละที่ router ทุกตัวระหว่างทางจะเปิดอ่าน' },
    { st: 'send', l: 'na', segs: [['na', 'ATM'], ['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '④ Network Access ห่อเป็นเฟรมของเครือข่ายที่ต่ออยู่ (ฝั่งนี้คือ ATM) — ใส่ตัวระบุการเชื่อมต่อ + ตัวตรวจ error ของหัวเฟรม' },
    { st: 'send', l: 'phy', segs: [['bits', '01001101…']],
      cap: '⑤ Physical แปลงทั้งก้อนเป็นสัญญาณบิต วิ่งเข้าเครือข่าย ATM ไปหา router →' },
    { st: 'rtr', l: 'phy1', segs: [['na', 'ATM'], ['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑥ ถึง router! Physical ขาเข้า ประกอบบิตกลับเป็นเฟรม' },
    { st: 'rtr', l: 'na1', segs: [['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑦ ชั้น link ของ router แกะเฟรม ATM ออก + ใช้ตัวตรวจ error เช็กว่าหัวเฟรมไม่เพี้ยนระหว่างทาง' },
    { st: 'rtr', l: 'ip0', segs: [['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑧ ชั้น IP ของ router เปิดอ่าน "ที่อยู่ปลายทาง" แล้วตัดสินใจเส้นทาง (routing decision) ว่าออกลิงก์ไหน — สังเกต: router ไม่แตะ TCP/DATA เลย เปิดถึงแค่หัว IP → นี่คือความหมายของ "router ทำงานที่ Layer 3"' },
    { st: 'rtr', l: 'na2', segs: [['llc', 'LLC'], ['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑨ ขาออกเป็น LAN (คนละชนิดกับขาเข้า!) → ห่อใหม่: เติมหัว LLC (เลขลำดับ + ที่อยู่)' },
    { st: 'rtr', l: 'na2', segs: [['mac', 'MAC'], ['llc', 'LLC'], ['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA'], ['mac', 'FCS']],
      cap: '⑩ แล้วห่อเฟรม MAC: หัว = ที่อยู่ MAC บน LAN, ท้าย = frame check sequence ไว้ตรวจ error — เฟรมเปลี่ยนใหม่หมด แต่ IP ข้างในก้อนเดิม' },
    { st: 'rtr', l: 'phy2', segs: [['bits', '11010001…']],
      cap: '⑪ Physical ขาออก ส่งบิตวิ่งบนสาย LAN →' },
    { st: 'recv', l: 'phy', segs: [['mac', 'MAC'], ['llc', 'LLC'], ['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA'], ['mac', 'FCS']],
      cap: '⑫ ถึงเครื่องผู้รับ — Physical ประกอบบิตเป็นเฟรม MAC' },
    { st: 'recv', l: 'na', segs: [['ip', 'IP'], ['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑬ Network Access ตรวจ FCS แล้วแกะ MAC/LLC ออก (decapsulation เริ่มแล้ว — แกะย้อนทีละชั้น)' },
    { st: 'recv', l: 'ip', segs: [['tp', 'TCP'], ['data', 'DATA']],
      cap: '⑭ IP เช็กที่อยู่ปลายทาง "ใช่เราจริง ✓" แล้วแกะหัว IP ออก' },
    { st: 'recv', l: 'tp', segs: [['data', 'DATA']],
      cap: '⑮ TCP ตรวจครบทุกก้อน + เรียงลำดับ — ถ้ามาถึงเป็น 3,1,2 ก็เรียงกลับเป็น 1,2,3 ก่อน / ขาดก้อนไหนขอให้ส่งซ้ำ' },
    { st: 'recv', l: 'app', segs: [['data', 'DATA']],
      cap: '⑯ ส่งขึ้น Application — ผู้รับได้ข้อมูลเดิม ครบ ถูกต้อง เรียงลำดับ ✓' },
  ];

  const phaseName = (i) => i <= 4 ? 'ผู้ส่งห่อ' : i <= 10 ? 'Router' : 'ผู้รับแกะ';
  createStepper(holder, {
    steps: steps.length, stepDuration: 2600,
    label: (i) => `ขั้น ${i + 1}/${steps.length} · ${phaseName(i)}`,
    render(stage, i) {
      const s = steps[i];
      document.querySelectorAll('.enc3 .lyr.active').forEach((e) => e.classList.remove('active'));
      const stack = stacks[s.st];
      if (stack) {
        const lyr = stack.querySelector('.lyr[data-l="' + s.l + '"]');
        if (lyr) lyr.classList.add('active');
      }
      stage.innerHTML = '<div class="packet">' +
        s.segs.map((x) => '<span class="seg ' + x[0] + '">' + x[1] + '</span>').join('') +
        '</div><div class="enc-cap">' + s.cap + '</div>';
    },
  });
})();

// ---------------------------------------------------------------
// 2) Store-and-forward เบื้องต้น (packet วิ่งผ่านโหนด)
// ---------------------------------------------------------------
(function () {
  const run = document.getElementById('swRun');
  if (!run) return;
  const row = document.getElementById('netRow');
  const cap = document.getElementById('swCap');
  const nodes = Array.from(row.querySelectorAll('.snode'));

  function centers() {
    const base = row.getBoundingClientRect().left;
    return nodes.map((n) => n.getBoundingClientRect().left - base + n.offsetWidth / 2);
  }
  run.addEventListener('click', () => {
    row.querySelectorAll('.pkt').forEach((p) => p.remove());
    run.disabled = true; run.textContent = 'กำลังส่ง…';
    cap.textContent = 'ดูจังหวะ: โหนดต้อง "รับให้ครบก้อนก่อน" แล้วค่อยส่งต่อ (store-and-forward) — แต่พอแพ็กเก็ต 1 ไปลิงก์ถัดไปแล้ว แพ็กเก็ต 2 ใช้ลิงก์แรกต่อได้ทันที';
    const xs = centers();
    const hop = 640;
    let done = 0;
    for (let p = 0; p < 3; p++) {
      const dot = document.createElement('div');
      dot.className = 'pkt';
      dot.style.background = PKT_COLORS[p];
      dot.textContent = String(p + 1);
      dot.style.left = xs[0] + 'px';
      row.appendChild(dot);
      for (let k = 1; k < xs.length; k++) {
        setTimeout(() => { dot.style.left = xs[k] + 'px'; }, p * hop + k * hop);
      }
      setTimeout(() => {
        done++;
        if (done === 3) {
          cap.textContent = 'ครบ 3 แพ็กเก็ต — สังเกตว่าแพ็กเก็ตหลายตัว "ไล่กัน" บนเส้นทางเดียวได้ = สายถูกแชร์ ไม่มีใครจองขาด (ต่างจาก circuit switching)';
          run.disabled = false; run.textContent = '▶ ส่งอีกครั้ง';
        }
      }, p * hop + (xs.length - 1) * hop + 250);
    }
  });
})();

// ---------------------------------------------------------------
// 3) Circuit switching: โทรศัพท์ A → ชุมสาย → trunk → ชุมสาย → B (3 เฟส)
// ---------------------------------------------------------------
(function () {
  const btn = document.getElementById('csPhase');
  if (!btn) return;
  const cap = document.getElementById('csCap');
  const segs = ['csL1', 'csTrunk', 'csL2'].map((id) => document.getElementById(id));
  const flow = document.getElementById('csFlow');
  let phase = 0;
  const phases = [
    {
      label: '▶ เฟส 1 · ยกหู–กดเบอร์ (สร้างวงจร)',
      cap: 'ยังไม่มีวงจร — ทุกเส้นว่าง (สีเทา) รอผู้ใช้เริ่มโทร',
    },
    {
      label: '▶ เฟส 2 · รับสาย (โอนถ่ายข้อมูล)',
      cap: 'เฟส 1 — สร้างวงจร: คำขอวิ่งจาก A → ชุมสายต้นทาง → จอง trunk → ชุมสายปลายทาง → กริ่งดังที่ B … ทุกช่วงของเส้นทางถูก "จองไว้ให้คู่นี้" ตั้งแต่ยังไม่ได้พูดสักคำ (นี่คือความหน่วงก่อนเริ่มส่ง)',
    },
    {
      label: '▶ เฟส 3 · วางสาย (สิ้นสุดวงจร)',
      cap: 'เฟส 2 — คุยกัน: ข้อมูล (เสียง) ไหลบนวงจรที่จองไว้ อัตราคงที่ ความหน่วงคงที่ ไม่มีใครแทรกได้ — แต่ตอนคุณเงียบ วงจรก็ยังถูกจองอยู่ = ความจุส่วนนั้นเสียเปล่า (ใช้ไม่ถึง 100%)',
    },
    {
      label: '▶ เริ่มใหม่ตั้งแต่เฟส 1',
      cap: 'เฟส 3 — วางสาย: วงจรถูกปลด ทุกโหนดคืนทรัพยากร ช่องบน trunk ว่างพร้อมให้คู่สนทนาอื่นใช้ต่อ',
    },
  ];
  function apply() {
    segs.forEach((s) => s.classList.remove('busy'));
    flow.classList.remove('on');
    if (phase === 1) segs.forEach((s) => s.classList.add('busy'));
    if (phase === 2) { segs.forEach((s) => s.classList.add('busy')); flow.classList.add('on'); }
    cap.textContent = phases[phase].cap;
    btn.textContent = phases[(phase) % phases.length].label;
  }
  btn.addEventListener('click', () => { phase = (phase + 1) % phases.length; apply(); });
  apply();
})();

// ---------------------------------------------------------------
// 4) กราฟเครือข่ายสวิตช์ (fig 3.3) + โหมด Datagram / Virtual Circuit
// ---------------------------------------------------------------
(function () {
  const holder = document.getElementById('graphAnim');
  if (!holder) return;
  const cap = document.getElementById('graphCap');
  const btnDG = document.getElementById('btnDG');
  const btnVC = document.getElementById('btnVC');

  // โหนดสวิตช์ 1-7 (วงกลม) + สถานี (เหลี่ยม): เลียนแบบภาพ 3.3 ในสไลด์
  const W = 640, H = 320;
  const nodes = {
    1: [175, 95], 2: [300, 70], 3: [430, 110], 4: [140, 215],
    5: [300, 175], 6: [430, 225], 7: [280, 275],
  };
  const stations = { A: [45, 235, 4], B: [60, 75, 1], C: [300, 18, 2], D: [545, 75, 3], E: [545, 185, 6], F: [545, 275, 6] };
  const edges = [[1, 2], [2, 3], [1, 4], [1, 5], [2, 5], [3, 5], [3, 6], [4, 5], [4, 7], [5, 7], [6, 7]];

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.classList.add('netgraph');
  holder.appendChild(svg);

  const edgeEls = {};
  function key(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
  edges.forEach(([a, b]) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', nodes[a][0]); l.setAttribute('y1', nodes[a][1]);
    l.setAttribute('x2', nodes[b][0]); l.setAttribute('y2', nodes[b][1]);
    l.setAttribute('class', 'ng-edge');
    svg.appendChild(l); edgeEls[key(a, b)] = l;
  });
  Object.entries(stations).forEach(([name, [x, y, n]]) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', x); l.setAttribute('y1', y);
    l.setAttribute('x2', nodes[n][0]); l.setAttribute('y2', nodes[n][1]);
    l.setAttribute('class', 'ng-edge ng-stlink');
    svg.appendChild(l);
  });
  Object.entries(nodes).forEach(([n, [x, y]]) => {
    const g = document.createElementNS(NS, 'circle');
    g.setAttribute('cx', x); g.setAttribute('cy', y); g.setAttribute('r', 17);
    g.setAttribute('class', 'ng-node');
    svg.appendChild(g);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 5);
    t.setAttribute('class', 'ng-label'); t.textContent = n;
    svg.appendChild(t);
  });
  Object.entries(stations).forEach(([name, [x, y]]) => {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x - 15); r.setAttribute('y', y - 13);
    r.setAttribute('width', 30); r.setAttribute('height', 26); r.setAttribute('rx', 5);
    r.setAttribute('class', 'ng-station');
    svg.appendChild(r);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 5);
    t.setAttribute('class', 'ng-label st'); t.textContent = name;
    svg.appendChild(t);
  });

  const dotsLayer = document.createElementNS(NS, 'g');
  svg.appendChild(dotsLayer);

  function clearHi() {
    svg.querySelectorAll('.ng-edge.hi').forEach((e) => e.classList.remove('hi'));
    dotsLayer.innerHTML = '';
  }
  function hiPath(path) {
    for (let i = 0; i < path.length - 1; i++) {
      const el = edgeEls[key(path[i], path[i + 1])];
      if (el) el.classList.add('hi');
    }
  }
  // เดินจุดตาม path (list ของหมายเลขโหนด, เริ่ม/จบเป็นพิกัดสถานี)
  function animDot(points, color, label, delay, msPerHop, onArrive) {
    const c = document.createElementNS(NS, 'g');
    const dot = document.createElementNS(NS, 'rect');
    dot.setAttribute('width', 22); dot.setAttribute('height', 18); dot.setAttribute('rx', 4);
    dot.setAttribute('fill', color);
    const tx = document.createElementNS(NS, 'text');
    tx.setAttribute('class', 'ng-pkt-label'); tx.textContent = label;
    c.appendChild(dot); c.appendChild(tx);
    c.setAttribute('opacity', 0);
    dotsLayer.appendChild(c);
    function place(x, y) {
      dot.setAttribute('x', x - 11); dot.setAttribute('y', y - 9);
      tx.setAttribute('x', x); tx.setAttribute('y', y + 4);
    }
    points.forEach((pt, i) => {
      setTimeout(() => {
        c.setAttribute('opacity', 1);
        place(pt[0], pt[1]);
        if (i === points.length - 1) {
          setTimeout(() => { c.setAttribute('opacity', .35); if (onArrive) onArrive(); }, msPerHop * 0.7);
        }
      }, delay + i * msPerHop);
    });
  }
  function toPoints(stFrom, path, stTo) {
    const pts = [stations[stFrom].slice(0, 2)];
    path.forEach((n) => pts.push(nodes[n]));
    pts.push(stations[stTo].slice(0, 2));
    return pts;
  }

  let busy = false;
  function runDG() {
    if (busy) return; busy = true; clearHi();
    cap.innerHTML = '<b>Datagram:</b> ส่งจาก A ไป D — <b>แต่ละแพ็กเก็ตเลือกทางเอง</b> ที่ทุกโหนด (ขึ้นกับสภาพจราจรตอนนั้น) จับตาดูว่าถึงปลายทาง "ไม่เรียงลำดับ"…';
    const hop = 620;
    const arrivals = [];
    const routes = [
      { path: [4, 1, 2, 3], label: '1' },   // อ้อม → ถึงช้า
      { path: [4, 5, 3], label: '2' },      // สั้น → ถึงเร็วสุด
      { path: [4, 7, 5, 3], label: '3' },   // กลางๆ
    ];
    routes.forEach((r, i) => {
      const pts = toPoints('A', r.path, 'D');
      animDot(pts, PKT_COLORS[i], r.label, i * 500, hop, () => {
        arrivals.push(r.label);
        if (arrivals.length === 3) {
          cap.innerHTML = '<b>ถึงปลายทางตามลำดับ: ' + arrivals.join(' → ') +
            '</b> — ไม่ใช่ 1→2→3! โหนดปลายทางต้องอาศัยเลขลำดับในเฮดเดอร์ <b>เรียงกลับ</b> ก่อนส่งขึ้นชั้นบน และถ้าตัวไหนหายก็รู้ว่าขาดเบอร์อะไร';
          busy = false;
        }
      });
    });
  }
  function runVC() {
    if (busy) return; busy = true; clearHi();
    const path = [4, 5, 3];
    cap.innerHTML = '<b>Virtual Circuit:</b> เฟสแรก — ส่งคำขอ (call request) ไป "วางเส้นทาง" ก่อน แล้วทุกแพ็กเก็ตจะวิ่งตามเส้นนี้…';
    hiPath(path);
    const hop = 620;
    setTimeout(() => {
      cap.innerHTML = '<b>Virtual Circuit:</b> เส้นทางถูกจดไว้ที่ทุกโหนดแล้ว (เส้นเน้น) — ทีนี้ส่งแพ็กเก็ต 1,2,3 <b>ตามกันบนเส้นเดียว</b> โหนดไม่ต้องคิดเส้นทางซ้ำ แค่เปิดตารางส่งต่อ';
      const arrivals = [];
      [0, 1, 2].forEach((i) => {
        animDot(toPoints('A', path, 'D'), PKT_COLORS[i], String(i + 1), i * hop, hop, () => {
          arrivals.push(String(i + 1));
          if (arrivals.length === 3) {
            cap.innerHTML = '<b>ถึงปลายทาง: ' + arrivals.join(' → ') +
              ' เรียงเป๊ะ</b> — เพราะทุกตัววิ่งทางเดียวกัน แซงกันไม่ได้ · ข้อสำคัญ: เส้นทางนี้ <b>ไม่ได้ถูกจองขาด</b> คู่อื่นยังแชร์ลิงก์เดียวกันได้ (ต่างจาก circuit switching)';
            busy = false;
          }
        });
      });
    }, 1500);
  }
  if (btnDG) btnDG.addEventListener('click', runDG);
  if (btnVC) btnVC.addEventListener('click', runVC);
})();

// ---------------------------------------------------------------
// 5) FDM vs TDM (มินิ — เลคเชอร์ยกตัวอย่างวิทยุ FM)
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('muxCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let t = 0;
  function draw() {
    const w = cv.width = cv.clientWidth * devicePixelRatio;
    const h = cv.height = cv.clientHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const cw = cv.clientWidth, ch = cv.clientHeight;
    ctx.clearRect(0, 0, cw, ch);
    const ink = cssVar('--text-dim', '#7c7f8a');
    const half = cw / 2 - 14;

    // ---- ซ้าย: FDM — 3 แถบความถี่ ส่งพร้อมกันตลอดเวลา ----
    ctx.font = '12px sans-serif'; ctx.fillStyle = ink;
    ctx.fillText('FDM — แบ่ง "ความถี่" (ทุกคนส่งพร้อมกัน คนละย่าน)', 4, 14);
    const laneH = 24, top = 30;
    for (let i = 0; i < 3; i++) {
      const y = top + i * (laneH + 8);
      ctx.fillStyle = PKT_COLORS[i] + '33';
      ctx.fillRect(4, y, half - 8, laneH);
      ctx.fillStyle = PKT_COLORS[i];
      // คลื่นวิ่งในแถบของตัวเอง
      ctx.beginPath();
      for (let x = 0; x <= half - 12; x += 2) {
        const yy = y + laneH / 2 + Math.sin((x + t * (40 + i * 14)) / (9 + i * 3)) * (laneH / 2 - 4);
        x === 0 ? ctx.moveTo(4 + x, yy) : ctx.lineTo(4 + x, yy);
      }
      ctx.lineWidth = 1.6; ctx.strokeStyle = PKT_COLORS[i]; ctx.stroke();
      ctx.fillText('ผู้ใช้ ' + (i + 1), half - 52, y + laneH - 7);
    }
    ctx.fillStyle = ink;
    ctx.fillText('↑ ความถี่', 4, top + 3 * (laneH + 8) + 14);

    // ---- ขวา: TDM — แถบเดียว ผลัดกันใช้ตามช่องเวลา ----
    const x0 = cw / 2 + 10;
    ctx.fillStyle = ink;
    ctx.fillText('TDM — แบ่ง "เวลา" (ได้ทั้งย่าน แต่ผลัดกันใช้)', x0, 14);
    const y0 = 30 + laneH + 8;
    ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.strokeRect(x0, y0, half - 8, laneH);
    const slotW = 34;
    const off = (t * 30) % (slotW * 3);
    ctx.save();
    ctx.beginPath(); ctx.rect(x0, y0, half - 8, laneH); ctx.clip();
    for (let x = -slotW * 3; x < half; x += slotW) {
      const i = Math.floor((x + off) / slotW + 300) % 3;
      ctx.fillStyle = PKT_COLORS[i];
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

// ---------------------------------------------------------------
// 6) Event timing (fig ในสไลด์ 63) + Lab ขนาดแพ็กเก็ต (fig 3.9)
//    — วาดแผนภาพ เวลา-ระยะทาง (time-space diagram) ตัวเดียวใช้ 2 งาน
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('timingCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const capEl = document.getElementById('timingCap');
  const btns = Array.from(document.querySelectorAll('[data-timing]'));

  const caps = {
    cs: 'Circuit switching: เสียเวลาช่วงแรกให้ "สัญญาณขอสร้างวงจร" วิ่งไป-กลับ (มี processing ที่ทุกโหนด) แต่พอวงจรพร้อม ข้อมูลไหลรวดเดียวถึงปลายทาง ไม่ต้องแวะคิดที่โหนดอีก — เหมาะกับการคุยต่อเนื่องยาวๆ',
    vc: 'Virtual circuit: มีเฟสส่ง call request "วางเส้นทาง" ก่อนเหมือนกัน (ไป-กลับ) จากนั้นแพ็กเก็ต 1,2,3 วิ่งตามกันแบบ store-and-forward — เร็วกว่า datagram ต่อแพ็กเก็ตเพราะโหนดไม่ต้องเลือกทางซ้ำ',
    dg: 'Datagram: ไม่ต้องรออะไรเลย ส่งแพ็กเก็ตแรกได้ทันที! แต่ทุกโหนดต้องรับให้ครบก้อน→เลือกเส้นทาง→ส่งต่อ (บันไดทีละขั้น) — ข้อความสั้นๆ แบบนี้ datagram จบก่อนเพื่อน เพราะไม่เสียค่า setup',
  };

  function draw(mode) {
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * devicePixelRatio; cv.height = h * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const ink = cssVar('--text-dim', '#7c7f8a');
    const line = cssVar('--line-2', '#d9d4c7');
    const names = ['สถานี A', 'โหนด 1', 'โหนด 2', 'สถานี B'];
    const xs = [60, 60 + (w - 120) / 3, 60 + 2 * (w - 120) / 3, w - 60];
    const top = 30, bottom = h - 16;
    ctx.font = '12px sans-serif';
    xs.forEach((x, i) => {
      ctx.strokeStyle = line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.fillStyle = ink; ctx.textAlign = 'center';
      ctx.fillText(names[i], x, 18);
    });
    ctx.fillText('เวลา ↓', 26, (top + bottom) / 2);

    const unit = (bottom - top) / 26; // 1 หน่วยเวลา
    function band(link, t0, dt, color, label) {
      // ก้อนข้อมูลวิ่งบนลิงก์ link (0..2) เริ่มเวลา t0 ใช้เวลา dt (หน่วย unit)
      const x1 = xs[link], x2 = xs[link + 1];
      const y1 = top + t0 * unit, y2 = top + (t0 + dt) * unit;
      const slope = 1.2 * unit; // propagation
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y1 + slope);
      ctx.lineTo(x2, y2 + slope); ctx.lineTo(x1, y2);
      ctx.closePath(); ctx.fill();
      if (label) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(label, (x1 + x2) / 2, (y1 + y2 + slope) / 2 + 3);
      }
    }
    function thinArrow(link, t0, color, back) {
      const x1 = back ? xs[link + 1] : xs[link], x2 = back ? xs[link] : xs[link + 1];
      const y1 = top + t0 * unit, y2 = y1 + 1.2 * unit;
      ctx.strokeStyle = color; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    const req = '#ffd66b', acc = '#83c167';
    if (mode === 'cs') {
      let t = 0;
      for (let k = 0; k < 3; k++) { thinArrow(k, t, req, false); t += 1.2 + 0.9; } // request + processing/โหนด
      ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.font = '11px sans-serif';
      ctx.fillText('คำขอสร้างวงจร (แวะประมวลผลทุกโหนด)', xs[0] + 8, top + 1 * unit);
      let t2 = t + 0.4;
      for (let k = 2; k >= 0; k--) { thinArrow(k, t2, acc, true); t2 += 1.2; } // accept กลับ ไม่ต้องคิดแล้ว
      ctx.fillText('ตอบรับ — วงจรพร้อม', xs[1] + 8, top + (t + 1.6) * unit);
      // user data: ไหลยาวรวดเดียว ไม่มี per-node delay
      const t3 = t2 + 0.4;
      for (let k = 0; k < 3; k++) band(k, t3 + k * 1.2, 9, PKT_COLORS[0] + 'cc', k === 1 ? 'ข้อมูลไหลต่อเนื่อง' : '');
    } else if (mode === 'vc') {
      let t = 0;
      for (let k = 0; k < 3; k++) { thinArrow(k, t, req, false); t += 1.2 + 0.9; }
      ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.font = '11px sans-serif';
      ctx.fillText('call request packet — วางเส้นทาง', xs[0] + 8, top + 1 * unit);
      let t2 = t + 0.4;
      for (let k = 2; k >= 0; k--) { thinArrow(k, t2, acc, true); t2 += 1.2; }
      const t3 = t2 + 0.4, dt = 2.2;
      for (let p = 0; p < 3; p++)
        for (let k = 0; k < 3; k++)
          band(k, t3 + (p + k) * dt, 2, PKT_COLORS[p] + 'cc', 'Pkt' + (p + 1));
    } else {
      const dt = 2.2, proc = 0.7; // datagram: เริ่มทันที แต่มี processing เลือกเส้นทางทุกโหนด
      for (let p = 0; p < 3; p++)
        for (let k = 0; k < 3; k++)
          band(k, p * dt + k * (dt + proc), 2, PKT_COLORS[p] + 'cc', 'Pkt' + (p + 1));
      ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.font = '11px sans-serif';
      ctx.fillText('ส่งได้ทันที ไม่มีเฟสสร้างวงจร', xs[0] + 8, top + 0.8 * unit);
    }
    if (capEl) capEl.textContent = caps[mode];
    btns.forEach((b) => b.classList.toggle('ghost', b.dataset.timing !== mode));
  }
  btns.forEach((b) => b.addEventListener('click', () => draw(b.dataset.timing)));
  const start = () => draw('cs');
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => draw(document.querySelector('[data-timing]:not(.ghost)')?.dataset.timing || 'cs'), 150); });
})();

// ---------------------------------------------------------------
// 7) Lab: ขนาดแพ็กเก็ต (fig 3.9) — ข้อความ 40 ไบต์, header 3 ไบต์/แพ็กเก็ต
//    เส้นทาง X → a → b → Y (3 ลิงก์) → เวลารวม = (40/P + 3)(P + 2) time-byte
// ---------------------------------------------------------------
(function () {
  const cv = document.getElementById('psCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sel = document.getElementById('psCount');
  const out = document.getElementById('psOut');
  const MSG = 40, HDR = 3, LINKS = 3;

  function total(P) { const s = MSG / P + HDR; return s * (P + LINKS - 1); }

  function draw(P) {
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * devicePixelRatio; cv.height = h * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const ink = cssVar('--text-dim', '#7c7f8a');
    const lineC = cssVar('--line-2', '#d9d4c7');
    const names = ['X', 'โหนด a', 'โหนด b', 'Y'];
    const xs = [46, 46 + (w - 92) / 3, 46 + 2 * (w - 92) / 3, w - 46];
    const top = 26, bottom = h - 8;
    ctx.font = '12px sans-serif';
    xs.forEach((x, i) => {
      ctx.strokeStyle = lineC; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
      ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(names[i], x, 16);
    });
    const s = MSG / P + HDR;               // ขนาดแพ็กเก็ต (ไบต์)
    const T = total(P);                    // เวลารวม
    const maxT = total(1);                 // สเกลอิงกรณีแย่สุด (129)
    const unit = (bottom - top) / (maxT + 2);
    for (let p = 0; p < P; p++) {
      for (let k = 0; k < LINKS; k++) {
        const t0 = s * (p + k);
        const x1 = xs[k], x2 = xs[k + 1];
        const y1 = top + t0 * unit, y2 = top + (t0 + s) * unit;
        // ส่วน header (บนสุดของก้อน) สีเข้ม / ข้อมูลสีอ่อน
        const hFrac = HDR / s;
        ctx.fillStyle = PKT_COLORS[p % 3];
        ctx.fillRect(x1 + 2, y1, x2 - x1 - 4, (y2 - y1) * hFrac);
        ctx.fillStyle = PKT_COLORS[p % 3] + '55';
        ctx.fillRect(x1 + 2, y1 + (y2 - y1) * hFrac, x2 - x1 - 4, (y2 - y1) * (1 - hFrac));
      }
    }
    // เส้นเวลารวม
    const yT = top + T * unit;
    ctx.strokeStyle = cssVar('--accent-warm', '#c46b3d'); ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(xs[0], yT); ctx.lineTo(xs[3], yT); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cssVar('--accent-warm', '#c46b3d');
    ctx.textAlign = 'left'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('จบที่ ' + T.toFixed(0) + ' time-byte', xs[0] + 4, yT + 16);

    if (out) {
      const best = [1, 2, 4, 5, 8, 10, 20].map((q) => [q, total(q)]).sort((a, b) => a[1] - b[1])[0];
      out.innerHTML =
        'แบ่งเป็น <b>' + P + '</b> แพ็กเก็ต → แพ็กเก็ตละ ' + (MSG / P) + '+' + HDR + ' = <b>' + s + ' ไบต์</b>' +
        ' · เวลารวม = ' + s + ' × (' + P + '+' + (LINKS - 1) + ') = <b>' + T.toFixed(0) + ' time-byte</b>' +
        (P === best[0] ? ' — <b>ดีที่สุดในตัวเลือกนี้ 🏆</b>' : ' (ดีสุดคือแบ่ง ' + best[0] + ' ก้อน = ' + best[1].toFixed(0) + ')');
    }
  }
  sel.addEventListener('input', () => draw(parseInt(sel.value, 10)));
  const start = () => draw(parseInt(sel.value, 10));
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(start, 150); });
})();

// ---------------------------------------------------------------
// 8) ตารางการบ้านของอาจารย์: เทียบ CS / Datagram / VC — กดตอบเอง แล้วตรวจ
// ---------------------------------------------------------------
(function () {
  const tbl = document.getElementById('cmpTable');
  if (!tbl) return;
  const btnCheck = document.getElementById('cmpCheck');
  const btnReset = document.getElementById('cmpReset');
  const outEl = document.getElementById('cmpOut');

  // แถว: [ข้อความ, ตัวเลือก, [เฉลย CS, DG, VC], เหตุผล]
  const YN = ['—', '✓', '✗'];
  const rows = [
    ['รูปแบบข้อมูล', ['—', 'สตรีมต่อเนื่อง', 'แพ็กเก็ต'], ['สตรีมต่อเนื่อง', 'แพ็กเก็ต', 'แพ็กเก็ต'],
      'CS ส่งเป็นสายข้อมูลต่อเนื่องบนวงจรที่จองไว้ (เช่น เสียงโทรศัพท์) · packet switching ทั้งสองแบบต้องหั่นเป็นแพ็กเก็ตก่อนเสมอ'],
    ['มีการเชื่อมต่อ/วางเส้นทางก่อนส่ง', YN, ['✓', '✗', '✓'],
      'CS ต้องสร้างวงจรจริงก่อน · VC ต้องส่ง call request วางเส้นทางก่อน · Datagram โยนแพ็กเก็ตแรกได้ทันที'],
    ['แบ่งปันสายสัญญาณกับคู่อื่นได้', YN, ['✗', '✓', '✓'],
      'CS จองความจุขาด ใครก็แทรกไม่ได้ (แม้เราเงียบ) · packet switching ทั้งคู่แชร์ลิงก์กัน — VC "จำเส้นทาง" แต่ไม่ได้จองความจุ'],
    ['ข้อมูลถึงปลายทางเรียงลำดับเอง', YN, ['✓', '✗', '✓'],
      'CS/VC วิ่งเส้นเดียวตลอด แซงกันไม่ได้ · Datagram ต่างตัวต่างไป อาจถึงสลับลำดับ ปลายทางต้องเรียงใหม่'],
    ['โหนดกลางทางทำงานแบบ store-and-forward', YN, ['✗', '✓', '✓'],
      'CS โหนดแค่ต่อวงจรแล้วปล่อยผ่าน (ไม่เก็บ) · packet switching ทุกแบบ โหนดต้องรับครบก้อน เก็บ แล้วส่งต่อ'],
    ['ต้องใส่ header ทุกก้อนข้อมูล', YN, ['✗', '✓', '✓'],
      'CS พอวงจรสร้างแล้ว ข้อมูลดิบไหลได้เลย · แพ็กเก็ตทุกตัวต้องพกที่อยู่/เลขลำดับไปเอง'],
    ['โหนดตัดสินใจเลือกเส้นทาง "ทุกแพ็กเก็ต"', YN, ['✗', '✓', '✗'],
      'Datagram เท่านั้นที่คิดใหม่ทุกก้อน · VC ตัดสินใจครั้งเดียวตอนสร้าง connection · CS ไม่มีแพ็กเก็ตให้ตัดสินใจ'],
    ['ตัวอย่างเครือข่าย', ['—', 'โทรศัพท์บ้าน', 'อินเทอร์เน็ต (IP)', 'X.25'], ['โทรศัพท์บ้าน', 'อินเทอร์เน็ต (IP)', 'X.25'],
      'โทรศัพท์ = จองวงจร · อินเทอร์เน็ตทุกวันนี้ = datagram (IP) · X.25 = เครือข่าย virtual circuit ยุคก่อน'],
  ];
  const cols = ['CS', 'Datagram', 'VC'];

  const tbody = tbl.querySelector('tbody');
  rows.forEach((r, ri) => {
    const tr = document.createElement('tr');
    const th = document.createElement('td');
    th.style.textAlign = 'left'; th.textContent = r[0];
    tr.appendChild(th);
    for (let c = 0; c < 3; c++) {
      const td = document.createElement('td');
      const b = document.createElement('button');
      b.className = 'qc'; b.type = 'button';
      b.dataset.row = ri; b.dataset.col = c; b.dataset.i = 0;
      b.textContent = r[1][0];
      b.addEventListener('click', () => {
        const i = (parseInt(b.dataset.i, 10) + 1) % r[1].length;
        b.dataset.i = i; b.textContent = r[1][i];
        b.classList.remove('good', 'bad');
      });
      td.appendChild(b); tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });

  btnCheck.addEventListener('click', () => {
    let good = 0, total = 0, why = [];
    rows.forEach((r, ri) => {
      let rowOk = true;
      for (let c = 0; c < 3; c++) {
        const b = tbl.querySelector('.qc[data-row="' + ri + '"][data-col="' + c + '"]');
        const ok = b.textContent === r[2][c];
        b.classList.toggle('good', ok);
        b.classList.toggle('bad', !ok);
        if (ok) good++; else rowOk = false;
        total++;
      }
      if (!rowOk) why.push('<li><b>' + r[0] + ':</b> เฉลย ' + cols.map((c, i) => c + ' = ' + r[2][i]).join(' · ') + ' — ' + r[3] + '</li>');
    });
    outEl.innerHTML = 'ได้ <b>' + good + '/' + total + '</b> ช่อง' +
      (why.length ? ' — แถวที่พลาดพร้อมเหตุผล:<ul>' + why.join('') + '</ul>' : ' — เยี่ยม! ครบถ้วนแบบนี้อาจารย์ให้ผ่านแน่นอน 🎉');
  });
  btnReset.addEventListener('click', () => {
    tbl.querySelectorAll('.qc').forEach((b) => {
      b.dataset.i = 0;
      const r = rows[parseInt(b.dataset.row, 10)];
      b.textContent = r[1][0];
      b.classList.remove('good', 'bad');
    });
    outEl.innerHTML = '';
  });
})();

// ---------------------------------------------------------------
// 9) Walkthrough: เดินเลขตารางขนาดแพ็กเก็ต fig 3.9 ทีละขั้น (ทำมือ)
//    ตัวเลข 129/92/77/84 ตรงสไลด์ — ยืนยันด้วยโปรแกรมแล้ว
// ---------------------------------------------------------------
mountWalk('walk-psize', [
  { title: 'ตั้งหลัก: อ่านโจทย์ให้ครบก่อนคิด',
    body: `ข้อความ M = 40 ไบต์ · header h = 3 ไบต์/แพ็กเก็ต
เส้นทาง X → a → b → Y  →  นับ "ลิงก์" ได้ L = 3
หน่วยเวลา: 1 time-byte = เวลาส่ง 1 ไบต์ผ่าน 1 ลิงก์`,
    note: 'จุดพลาดอันดับหนึ่ง: นับ L ผิด — นับ "เส้นเชื่อม" ไม่ใช่นับโหนด (2 โหนดกลาง = 3 ลิงก์)' },
  { title: 'หลักคิด: ก้อนแรกเดินเต็มทาง ที่เหลือตามหลังทีละก้อน',
    body: `แต่ละก้อนขนาด s = M/N + h ไบต์
ก้อนแรกใช้เวลา s ต่อลิงก์ × L ลิงก์ = s·L
ก้อนถัดไปตามหลังห่างกันก้อนละ s (pipeline!)
→ เวลารวม T = s·L + (N−1)·s = s × (N + L − 1)`,
    note: 'สูตรรวมเป็นส่วนเสริมจากผู้เขียน (สไลด์ใช้วิธีนับจากรูป) — แต่แทนเลขแล้วตรงสไลด์ทุกกรณี ใช้ได้ในห้องสอบ' },
  { title: 'กรณี a · ก้อนเดียว (N = 1)',
    body: `s = 40/1 + 3 = 43 ไบต์
T = 43 × (1 + 3 − 1) = 43 × 3 = 129 time-byte`,
    note: 'ไม่มี pipeline เลย — ลิงก์ถัดไปต้องนั่งรอรับครบทั้ง 43 ไบต์ก่อน' },
  { title: 'กรณี b · สองก้อน (N = 2)',
    body: `s = 40/2 + 3 = 23 ไบต์
T = 23 × (2 + 2) = 92 time-byte   (เร็วขึ้น 37 หน่วย!)`,
    note: 'เริ่มซ้อนงานได้: ระหว่างลิงก์สองส่งก้อนแรก ลิงก์แรกส่งก้อนสองพร้อมกัน' },
  { title: 'กรณี c · ห้าก้อน (N = 5) — แชมป์ของสไลด์',
    body: `s = 40/5 + 3 = 11 ไบต์
T = 11 × (5 + 2) = 77 time-byte 🏆`,
    note: 'pipelining เกือบเต็มประสิทธิภาพ และ header ยังไม่ท่วม (3 จาก 11 ไบต์)' },
  { title: 'กรณี d · สิบก้อน (N = 10) — เล็กเกินไป!',
    body: `s = 40/10 + 3 = 7 ไบต์
T = 7 × (10 + 2) = 84 time-byte   (แย่ลงกว่า N=5!)
เหตุผล: ข้อมูลจริงก้อนละ 4 ไบต์ แต่แบก header 3 ไบต์
→ ภาษี header = 3/7 ≈ 43% ของทุกก้อน`,
    note: 'นี่คือเหตุผลที่ "ยิ่งเล็กยิ่งดี" ผิด — กราฟเวลารวมเป็นรูปตัว U มีจุดต่ำสุดตรงกลาง (อาจารย์เตือนไว้ตรงๆ ว่าอย่าตอบแบบนั้น)' },
]);

// ---------------------------------------------------------------
// 10) JS runner: คำนวณตารางเวลารวมทุกการแบ่ง — ตรวจการบ้าน/ลองเลขใหม่
// ---------------------------------------------------------------
mountRunner('runner', `// ขนาดแพ็กเก็ตกับเวลารวม (fig 3.9) — แก้เลขเป็นโจทย์อื่นได้เลย
const M = 40;   // ขนาดข้อความ (ไบต์)
const h = 3;    // header ต่อแพ็กเก็ต (ไบต์)
const L = 3;    // จำนวนลิงก์ (X→a→b→Y = 3 ลิงก์)

const T = (N) => (M / N + h) * (N + L - 1);

// ลองทุกการแบ่งที่หารลงตัว
let best = null;
for (const N of [1, 2, 4, 5, 8, 10, 20, 40]) {
  const t = T(N);
  console.log(\`แบ่ง \${N} ก้อน → ก้อนละ \${M / N + h} ไบต์ → รวม \${t} time-byte\`);
  if (!best || t < best[1]) best = [N, t];
}
console.log(\`\\nดีที่สุด: แบ่ง \${best[0]} ก้อน = \${best[1]} time-byte\`);
console.log("เทียบสไลด์: 129 / 92 / 77 / 84 (N = 1, 2, 5, 10) ต้องตรงกัน");`);

// ---------------------------------------------------------------
// 11) TimedExam — ข้อสอบจำลอง week 2
// ---------------------------------------------------------------
mountExam([12, 18, 25]);
