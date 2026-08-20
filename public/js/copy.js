/* หน้า /copy — ติ๊กก้อนที่ลอกลงกระดาษแล้ว + นาฬิกาจับเวลา (localStorage แยกจาก /sheet) */
(function () {
  var KEY = 'wl-copy-ticks-v1';
  var TKEY = 'wl-copy-start-v1';
  var rows = Array.prototype.slice.call(document.querySelectorAll('.tick[data-t]'));
  if (!rows.length) return;

  var bar = document.getElementById('pBar');
  var txt = document.getElementById('pTxt');
  var reset = document.getElementById('btnReset');

  /* นาทีโดยประมาณของแต่ละบล็อก (ตามจำนวนตัวอักษรจริง ที่ 100 ตัวอักษร/นาที) */
  var MIN = { c7a: 10, c7b: 5, c7c: 6, c2a: 8, c2b: 9, c6a: 9, c6b: 6, c6c: 12,
              c1a: 12, c4a: 9, c4b: 9, c4c: 10, c5a: 13, c5b: 16, c8a: 12, c8b: 10,
              c3a: 10, c3b: 10 };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var state = load();

  function paint() {
    var done = 0, left = 0;
    rows.forEach(function (r) {
      var k = r.getAttribute('data-t');
      if (r.classList.contains('done')) done++; else left += (MIN[k] || 10);
    });
    var pct = Math.round((done / rows.length) * 100);
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = 'ลอกแล้ว ' + pct + '% (' + done + '/' + rows.length + ' ก้อน) · เหลืออีก ~' + left + ' นาที';
  }

  rows.forEach(function (row) {
    var k = row.getAttribute('data-t');
    if (state[k]) row.classList.add('done');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    function toggle() {
      var on = row.classList.toggle('done');
      if (on) state[k] = 1; else delete state[k];
      save(state); paint();
    }
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  if (reset) {
    reset.addEventListener('click', function () {
      rows.forEach(function (r) { r.classList.remove('done'); });
      state = {}; save(state); paint();
    });
  }

  /* --- จับเวลา: เดินหน้าตั้งแต่กดเริ่ม บอกว่าใช้ไปกี่นาที / เหลือกี่นาทีจาก 4 ชม. --- */
  var tBtn = document.getElementById('btnTimer');
  var tTxt = document.getElementById('tTxt');
  var start = null;
  try { start = parseInt(localStorage.getItem(TKEY) || '', 10) || null; } catch (e) {}

  function two(n) { return (n < 10 ? '0' : '') + n; }

  function tickClock() {
    if (!start) { if (tTxt) tTxt.textContent = '—'; return; }
    var mins = Math.floor((Date.now() - start) / 60000);
    var left = 240 - mins;
    if (tTxt) {
      tTxt.textContent = 'ผ่านไป ' + Math.floor(mins / 60) + ':' + two(mins % 60) +
        ' · เหลือ ' + (left > 0 ? Math.floor(left / 60) + ':' + two(left % 60) : 'หมดเวลาแล้ว');
      tTxt.style.color = left < 30 ? 'var(--accent-warm)' : 'var(--text-dim)';
    }
    if (tBtn) tBtn.textContent = '⏱ ล้างเวลา';
  }

  if (tBtn) {
    tBtn.addEventListener('click', function () {
      if (start) { start = null; try { localStorage.removeItem(TKEY); } catch (e) {} tBtn.textContent = '⏱ เริ่มจับเวลา'; }
      else { start = Date.now(); try { localStorage.setItem(TKEY, String(start)); } catch (e) {} }
      tickClock();
    });
    tickClock();
    setInterval(tickClock, 20000);
  }

  paint();
})();
