// ปุ่มสลับธีม ขาว/ดำ (ค่าเริ่มถูกตั้งใน <head> แล้วเพื่อกัน flash)
(function () {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  const root = document.documentElement;
  function icon() {
    const dark = root.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
    btn.setAttribute('title', dark ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด');
  }
  icon();
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    icon();
  });
})();
