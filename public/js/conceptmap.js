// ===== แผนที่คอนเซปต์หน้าแรก — เชื่อมทุกหัวข้อ 3 สัปดาห์ กดแล้วกระโดดไปบทเรียน =====
(function () {
  const holder = document.getElementById('conceptMap');
  if (!holder) return;
  const base = holder.dataset.base || '';
  const WCOL = { 1: '#ffd66b', 2: '#58c4dd', 3: '#83c167' };

  // [id, ป้าย, week, anchor, x, y]
  const nodes = [
    ['log', 'Logarithm', 1, 'week1#log', 110, 60],
    ['props', 'สมบัติ log (คูณ→บวก)', 1, 'week1#props', 110, 140],
    ['db', 'Decibel (dB)', 1, 'week1#db', 110, 220],
    ['units', 'dBW / dBm', 1, 'week1#units', 110, 300],
    ['lb', 'Link budget', 1, 'week1#linkbudget', 110, 380],

    ['proto', 'โพรโทคอล', 2, 'week2#protocol', 420, 45],
    ['layers', 'TCP/IP 5 ชั้น', 2, 'week2#tcpip', 420, 120],
    ['osi', 'OSI 7 ชั้น', 2, 'week2#osi', 545, 85],
    ['enc', 'Encapsulation', 2, 'week2#enc', 305, 165],
    ['dev', 'Router · Switch', 2, 'week2#terms', 520, 175],
    ['net', 'LAN · MAN · WAN', 2, 'week2#nettypes', 420, 240],
    ['cps', 'Circuit ↔ Packet switching', 2, 'week2#circuit', 420, 315],
    ['dgvc', 'Datagram / VC', 2, 'week2#dgvc', 315, 385],
    ['psize', 'ขนาดแพ็กเก็ต', 2, 'week2#psize', 530, 385],

    ['sine', 'คลื่นไซน์ A·f·φ', 3, 'week3#sinewave', 745, 45],
    ['ds', 'ข้อมูล vs สัญญาณ', 3, 'week3#datasig', 878, 95],
    ['four', 'โดเมนความถี่ (Fourier)', 3, 'week3#freqdomain', 745, 125],
    ['bw', 'Bandwidth', 3, 'week3#bwdata', 745, 200],
    ['snr', 'SNR', 3, 'week3#snr', 885, 200],
    ['nysh', 'Nyquist–Shannon', 3, 'week3#worked', 790, 275],
    ['spec', 'สเปกตรัม · ดาวเทียม', 3, 'week3#spectrum', 885, 345],
    ['mux', 'FDM / TDM', 3, 'week3#mux', 745, 390],
  ];
  // [จาก, ไป, ข้ามสัปดาห์?]
  const edges = [
    ['log', 'props'], ['props', 'db'], ['db', 'units'], ['units', 'lb'],
    ['proto', 'layers'], ['layers', 'osi'], ['layers', 'enc'], ['layers', 'dev'],
    ['dev', 'net'], ['net', 'cps'], ['cps', 'dgvc'], ['cps', 'psize'],
    ['sine', 'four'], ['sine', 'ds'], ['four', 'bw'], ['bw', 'nysh'],
    ['snr', 'nysh'], ['nysh', 'spec'], ['bw', 'mux'],
    ['db', 'snr', 1],      // SNR_dB ใช้สูตร dB ตรงๆ
    ['props', 'nysh', 1],  // log2 + เปลี่ยนฐาน โผล่ในโจทย์ Shannon
    ['lb', 'snr', 1],      // กำลังรับที่เหลือ = S ใน SNR
    ['cps', 'mux', 1],     // ลิงก์โหนด-โหนดใช้ FDM/TDM
  ];

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 960 430');
  svg.classList.add('cmap');
  holder.appendChild(svg);

  const pos = {};
  nodes.forEach((n) => { pos[n[0]] = { x: n[4], y: n[5], w: n[2] }; });

  const edgeEls = [];
  edges.forEach(([a, b, cross]) => {
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', pos[a].x); l.setAttribute('y1', pos[a].y);
    l.setAttribute('x2', pos[b].x); l.setAttribute('y2', pos[b].y);
    l.setAttribute('class', 'cm-edge' + (cross ? ' cross' : ''));
    svg.appendChild(l);
    edgeEls.push({ el: l, a, b });
  });

  nodes.forEach(([id, label, week, anchor, x, y]) => {
    const a = document.createElementNS(NS, 'a');
    a.setAttribute('href', base + '/' + anchor);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'cm-node');
    const padX = 9;
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 4);
    t.setAttribute('class', 'cm-label');
    t.textContent = label;
    // วัดความกว้างข้อความหลัง append ชั่วคราว
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('rx', 8);
    r.setAttribute('stroke', WCOL[week]);
    g.appendChild(r); g.appendChild(t);
    a.appendChild(g); svg.appendChild(a);
    const bb = t.getBBox ? t.getBBox() : { width: label.length * 8, height: 16 };
    r.setAttribute('x', x - bb.width / 2 - padX);
    r.setAttribute('y', y - 14);
    r.setAttribute('width', bb.width + padX * 2);
    r.setAttribute('height', 28);
    g.addEventListener('mouseenter', () => {
      edgeEls.forEach((e) => { if (e.a === id || e.b === id) e.el.classList.add('hi'); });
    });
    g.addEventListener('mouseleave', () => {
      edgeEls.forEach((e) => e.el.classList.remove('hi'));
    });
  });

  // ป้ายชื่อสัปดาห์เหนือแต่ละกลุ่ม
  [['WEEK 1 · คณิตของสัญญาณ', 110, 18, 1], ['WEEK 2 · ข้อมูลเดินทาง', 420, 18, 2], ['WEEK 3 · คลื่นของจริง', 800, 18, 3]].forEach(([txt, x, y, w]) => {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('class', 'cm-week');
    t.setAttribute('fill', WCOL[w]);
    t.textContent = txt;
    svg.appendChild(t);
  });
})();
