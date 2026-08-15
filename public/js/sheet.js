/* หน้า /sheet — ติ๊กบรรทัดที่ลอกลงกระดาษแล้ว (จำใน localStorage) */
(function () {
  var KEY = 'wl-sheet-ticks-v1';
  var rows = Array.prototype.slice.call(document.querySelectorAll('.tick[data-t]'));
  if (!rows.length) return;

  var bar = document.getElementById('pBar');
  var txt = document.getElementById('pTxt');
  var reset = document.getElementById('btnReset');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function save(st) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
  }

  var state = load();

  function paintProgress() {
    var done = rows.filter(function (r) { return r.classList.contains('done'); }).length;
    var pct = Math.round((done / rows.length) * 100);
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = 'ลอกไปแล้ว ' + pct + '%  (' + done + '/' + rows.length + ' บรรทัด)';
  }

  rows.forEach(function (row) {
    var k = row.getAttribute('data-t');
    if (state[k]) row.classList.add('done');
    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');
    function toggle() {
      var on = row.classList.toggle('done');
      if (on) state[k] = 1; else delete state[k];
      save(state);
      paintProgress();
    }
    row.addEventListener('click', toggle);
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* --- โหมดฉบับย่อ: ซ่อนบรรทัดที่ตัดได้ก่อน --- */
  var CKEY = 'wl-sheet-coremode-v1';
  var coreBtn = document.getElementById('btnCore');
  var hint = document.getElementById('coreHint');
  var optional = rows.filter(function (r) { return !r.hasAttribute('data-core'); });

  function applyCore(on) {
    optional.forEach(function (r) { r.style.display = on ? 'none' : ''; });
    // ซ่อนหัวข้อย่อยที่ไม่เหลือบรรทัดเลย
    Array.prototype.forEach.call(document.querySelectorAll('.blk h5'), function (h) {
      var n = h.nextElementSibling, any = false;
      while (n && n.tagName !== 'H5') {
        if (n.classList && n.classList.contains('tick') && n.style.display !== 'none') { any = true; break; }
        n = n.nextElementSibling;
      }
      h.style.display = any ? '' : 'none';
    });
    if (coreBtn) coreBtn.textContent = on ? '📖 กลับไปฉบับเต็ม (186 บรรทัด)' : '⚡ ฉบับย่อ (123 บรรทัด)';
    if (hint) hint.style.opacity = on ? '.6' : '';
    document.documentElement.setAttribute('data-sheetmode', on ? 'core' : 'full');
  }

  if (coreBtn) {
    var coreOn = false;
    try { coreOn = localStorage.getItem(CKEY) === '1'; } catch (e) {}
    applyCore(coreOn);
    coreBtn.addEventListener('click', function () {
      coreOn = !coreOn;
      try { localStorage.setItem(CKEY, coreOn ? '1' : '0'); } catch (e) {}
      applyCore(coreOn);
    });
  }

  if (reset) {
    reset.addEventListener('click', function () {
      rows.forEach(function (r) { r.classList.remove('done'); });
      state = {};
      save(state);
      paintProgress();
    });
  }

  paintProgress();
})();
