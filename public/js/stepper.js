// ===== Step Player กลาง (vanilla port จาก Numer Master lib/anim.jsx) =====
// ใช้: createStepper(containerEl, { steps, stepDuration, label(step), render(stage, step, t) })
// - stage = <div> พื้นที่วาด (viz เขียน innerHTML/SVG เองใน render)
// - step = index ขั้นปัจจุบัน, t = 0..1 ความคืบหน้าภายในขั้น (ไว้ทำ motion ต่อเนื่อง)
// ปุ่ม: ◀ ก่อนหน้า · ▶/⏸ เล่น/หยุด · ▶| ถัดไป · ↺ รีเซ็ต + scrubber ลากได้

export function createStepper(el, opts) {
  const { steps, stepDuration = 1600, label, render, autoplayOnView = false } = opts;
  let step = 0, t = 0, playing = false, raf = 0, startTs = 0;

  el.classList.add('stepper');
  const stage = document.createElement('div');
  stage.className = 'stepper-stage';
  const bar = document.createElement('div');
  bar.className = 'stepper-bar';
  bar.innerHTML = `
    <button class="sbtn" data-act="prev" title="ก่อนหน้า">◀</button>
    <button class="sbtn primary" data-act="play" title="เล่น/หยุด">▶</button>
    <button class="sbtn" data-act="next" title="ถัดไป">▶|</button>
    <button class="sbtn ghost" data-act="reset" title="เริ่มใหม่">↺</button>
    <span class="stepper-label"></span>
    <input class="stepper-scrub" type="range" min="0" max="${(steps - 1) * 100}" value="0" step="1" aria-label="เลื่อนดูขั้นตอน">
  `;
  el.appendChild(stage);
  el.appendChild(bar);
  const labelEl = bar.querySelector('.stepper-label');
  const scrub = bar.querySelector('.stepper-scrub');
  const playBtn = bar.querySelector('[data-act="play"]');

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    render(stage, step, t);
    labelEl.textContent = label ? label(step) : `ขั้น ${step + 1}/${steps}`;
    scrub.value = String(step * 100 + Math.round(t * 100));
    playBtn.textContent = playing ? '⏸' : '▶';
  }

  function stop() { playing = false; cancelAnimationFrame(raf); startTs = 0; draw(); }

  function loop(now) {
    if (!playing) return;
    if (!startTs) startTs = now;
    t = Math.min(1, (now - startTs) / stepDuration);
    if (t >= 1) {
      if (step >= steps - 1) { playing = false; startTs = 0; draw(); return; }
      step += 1; t = 0; startTs = now;
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (reduceMotion) { // ไม่เล่น motion อัตโนมัติ — เดินทีละขั้นแทน
      next(); return;
    }
    if (step >= steps - 1 && t >= 1) { step = 0; t = 0; }
    playing = true; startTs = 0;
    raf = requestAnimationFrame(loop);
    draw();
  }
  function next() { stop(); if (step < steps - 1) { step += 1; } t = 1; draw(); }
  function prev() { stop(); t = 0; if (step > 0) step -= 1; draw(); }
  function reset() { stop(); step = 0; t = 0; draw(); }

  bar.addEventListener('click', (e) => {
    const act = e.target.closest && e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'play') playing ? stop() : play();
    else if (a === 'next') next();
    else if (a === 'prev') prev();
    else if (a === 'reset') reset();
  });
  scrub.addEventListener('input', () => {
    playing = false; cancelAnimationFrame(raf); startTs = 0;
    const v = +scrub.value;
    step = Math.min(steps - 1, Math.floor(v / 100));
    t = (v - step * 100) / 100;
    draw();
  });

  draw();

  if (autoplayOnView && !reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { play(); io.disconnect(); } });
    }, { threshold: 0.5 });
    io.observe(el);
  }

  return { play, stop, next, prev, reset, get step() { return step; } };
}

// ===== helpers วาดกราф (port จาก anim.jsx) =====
export function makeScale([d0, d1], [r0, r1]) {
  const m = (r1 - r0) / (d1 - d0);
  return (v) => r0 + (v - d0) * m;
}

export function plotPath(fn, x0, x1, sx, sy, n = 160) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    let y;
    try { y = fn(x); } catch { continue; }
    if (!isFinite(y)) continue;
    d += (d === '' ? 'M' : 'L') + sx(x).toFixed(2) + ',' + sy(y).toFixed(2) + ' ';
  }
  return d;
}

export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// สร้าง SVG string ของแกน + grid สำหรับใส่ใน template literal
export function svgAxes({ W, H, pad, xDomain, yDomain, xTicks = [], yTicks = [], xFmt = (v) => v, yFmt = (v) => v }) {
  const sx = makeScale(xDomain, [pad.l, W - pad.r]);
  const sy = makeScale(yDomain, [H - pad.b, pad.t]);
  let s = '';
  for (const v of yTicks) {
    s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${sy(v)}" y2="${sy(v)}" class="grid"/>`;
    s += `<text x="${pad.l - 6}" y="${sy(v) + 3.5}" text-anchor="end" class="ticktxt">${yFmt(v)}</text>`;
  }
  for (const v of xTicks) {
    s += `<line x1="${sx(v)}" x2="${sx(v)}" y1="${pad.t}" y2="${H - pad.b}" class="grid"/>`;
    s += `<text x="${sx(v)}" y="${H - pad.b + 14}" text-anchor="middle" class="ticktxt">${xFmt(v)}</text>`;
  }
  return s;
}
