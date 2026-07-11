// ===== Progress tracking (localStorage) — เช็คว่าแต่ละ week อ่าน/ลองแล็บ/สอบจบหรือยัง =====
// เก็บใน 'wl-progress': { w1: {visit:true, lab:true, exam:true}, w2: {...}, ... }
const KEY = 'wl-progress';

function getP() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function mark(week, item) {
  const p = getP();
  (p[week] = p[week] || {})[item] = true;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
  renderBadges();
}

// ---- หน้าบทเรียน: mark อัตโนมัติ ----
function initPage() {
  const m = location.pathname.match(/week(\d)/) || (location.pathname.match(/exam/) ? [null, 'exam'] : null);
  if (!m) return;
  const w = m[1] === 'exam' ? 'exam' : 'w' + m[1];
  mark(w, 'visit');
  // แตะ interactive ตัวไหนก็ได้ครั้งแรก (lab / walkthrough / stepper) = "ลองแล็บแล้ว"
  const once = (e) => {
    if (e.target.closest && e.target.closest('.lab, .walk, .stepper, .lq')) {
      mark(w, 'lab');
      document.removeEventListener('click', once, true);
      document.removeEventListener('input', once, true);
    }
  };
  document.addEventListener('click', once, true);
  document.addEventListener('input', once, true);
  // mountExam ยิง event นี้ตอนหมดเวลา/ยอมแพ้ (= ทำข้อสอบครบหนึ่งรอบ)
  document.addEventListener('wl:examdone', () => mark(w, 'exam'));
}

// ---- หน้าแรก: วาดจุดความคืบหน้าบนการ์ด ----
const ITEMS = [['visit', 'อ่าน'], ['lab', 'ลองแล็บ'], ['exam', 'สอบจบ']];
function renderBadges() {
  const p = getP();
  document.querySelectorAll('[data-progress-week]').forEach((el) => {
    const w = p[el.dataset.progressWeek] || {};
    el.innerHTML = ITEMS.map(([k, l]) =>
      `<span class="prog-dot ${w[k] ? 'on' : ''}">${w[k] ? '✓' : '○'} ${l}</span>`).join('');
  });
  const rs = document.getElementById('progReset');
  if (rs) rs.hidden = Object.keys(p).length === 0;
}
document.getElementById('progReset')?.addEventListener('click', () => {
  if (confirm('ล้างความคืบหน้าทั้งหมด?')) {
    localStorage.removeItem(KEY);
    renderBadges();
  }
});

initPage();
renderBadges();
