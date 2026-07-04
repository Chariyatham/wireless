// สัญญาณคลื่นเคลื่อนที่บนหน้าแรก — สื่อถึง "wireless"
(function () {
  const cvs = document.getElementById('heroWave');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  function resize() {
    const r = window.devicePixelRatio || 1;
    cvs.width = cvs.clientWidth * r;
    cvs.height = cvs.clientHeight * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  function draw() {
    const w = cvs.clientWidth, h = cvs.clientHeight, mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    // วาดคลื่นซ้อนกัน 3 ความถี่ (สื่อว่าออกจากจุดเดียวได้หลายความถี่)
    const waves = [
      { a: h * 0.30, f: 2.2, c: 'rgba(58,124,165,.80)', s: 1 },
      { a: h * 0.20, f: 3.6, c: 'rgba(196,107,61,.55)', s: 1.6 },
      { a: h * 0.12, f: 6.0, c: 'rgba(106,94,192,.45)', s: 2.3 },
    ];
    for (const wv of waves) {
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const y = mid + wv.a * Math.sin((x / w) * wv.f * Math.PI * 2 - t * wv.s);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wv.c;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    t += 0.03;
    requestAnimationFrame(draw);
  }
  draw();
})();
