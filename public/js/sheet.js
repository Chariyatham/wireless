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
