// ===== Module 1 — dB lab + link budget =====

// ---- helper: format watts อ่านง่าย ----
function fmtWatt(p) {
  if (p >= 1e6) return (p / 1e6).toPrecision(3) + ' MW';
  if (p >= 1e3) return (p / 1e3).toPrecision(3) + ' kW';
  if (p >= 1)   return p.toPrecision(3) + ' W';
  if (p >= 1e-3) return (p * 1e3).toPrecision(3) + ' mW';
  if (p >= 1e-6) return (p * 1e6).toPrecision(3) + ' µW';
  return (p * 1e9).toPrecision(3) + ' nW';
}

// ---- dB lab: เลื่อน "กำลัง" แล้วดู dBW / dBm + จำนวนศูนย์ ----
(function () {
  const s = document.getElementById('dbSlider');
  if (!s) return;
  const outW = document.getElementById('dbWatt');
  const outdBW = document.getElementById('dbW');
  const outdBm = document.getElementById('dbm');
  const zeros = document.getElementById('zeros');

  function render() {
    const exp = parseFloat(s.value);        // เลขชี้กำลังของ 10 (หน่วยวัตต์)
    const P = Math.pow(10, exp);            // กำลังจริง (W)
    const dBW = 10 * exp;                   // = 10*log10(P/1W)
    const dBm = dBW + 30;                   // 1 mW reference
    outW.textContent = fmtWatt(P);
    outdBW.textContent = (dBW >= 0 ? '+' : '') + dBW.toFixed(0) + ' dBW';
    outdBm.textContent = (dBm >= 0 ? '+' : '') + dBm.toFixed(0) + ' dBm';

    // ตัวช่วยเห็นภาพ "dB = นับจำนวนศูนย์ (เลขชี้กำลัง)"
    const n = Math.round(exp);
    let str;
    if (n >= 0) str = '1' + '0'.repeat(n) + ' W';
    else str = '0.' + '0'.repeat(-n - 1) + '1 W';
    zeros.innerHTML = 'กำลัง = <b>' + str + '</b> &nbsp;→&nbsp; เลื่อนขึ้นทีละ <b>×10</b> = +10 dB ทุกครั้ง';
  }
  s.addEventListener('input', render);
  render();
})();

// ---- Link budget: ไล่บวก dB ไปตามสายส่ง แล้วดูกำลังที่ปลายทาง ----
(function () {
  const btn = document.getElementById('runBudget');
  if (!btn) return;
  const nodes = Array.from(document.querySelectorAll('#chain .node'));
  const totalEl = document.getElementById('budgetTotal');
  const wattEl = document.getElementById('budgetWatt');
  // ขั้นตอนจริงจากสไลด์ (Tx 50 W)
  // 17 dBW → -3 (สาย) +13 (เสาส่ง) -100 (อากาศ) +13 (เสารับ) -3 (สาย) = -63 dBW
  const START = 17;                          // 50 W ≈ 17 dBW
  const steps = [null, -3, +13, -100, +13, -3];  // node[0] คือ Tx
  let i = 0, running = 0;

  function reset() {
    i = 0; running = START;
    nodes.forEach(n => { n.classList.remove('pos', 'neg'); const d = n.querySelector('.db'); if (d) d.textContent = ''; });
    nodes[0].querySelector('.db').textContent = START + ' dBW';
    totalEl.textContent = START + ' dBW';
    wattEl.textContent = fmtWatt(Math.pow(10, START / 10));
  }

  function tick() {
    i++;
    if (i >= nodes.length) { btn.disabled = false; btn.textContent = '▶ เล่นอีกครั้ง'; return; }
    running += steps[i];
    const node = nodes[i];
    node.classList.add(steps[i] >= 0 ? 'pos' : 'neg');
    node.querySelector('.db').textContent = (steps[i] >= 0 ? '+' : '') + steps[i] + ' dB';
    totalEl.textContent = (running >= 0 ? '+' : '') + running + ' dBW';
    wattEl.textContent = fmtWatt(Math.pow(10, running / 10));
    setTimeout(tick, 850);
  }

  btn.addEventListener('click', () => {
    btn.disabled = true; btn.textContent = 'กำลังส่ง…';
    reset();
    setTimeout(tick, 500);
  });
  reset();
})();
