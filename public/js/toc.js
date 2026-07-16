// scrollspy: ไฮไลต์หัวข้อในสารบัญตามที่เลื่อนอ่าน
(function () {
  const links = Array.from(document.querySelectorAll('#toc a'));
  if (!links.length) return;
  const map = new Map();
  links.forEach((a) => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  });
  // ถ้า sidebar เลื่อนในตัวเองได้ (จอเตี้ย) เลื่อนตามให้หัวข้อ active อยู่ในสายตาเสมอ
  function reveal(a) {
    const sb = a.closest('.sidebar');
    if (!sb || sb.scrollHeight <= sb.clientHeight) return;
    const sbR = sb.getBoundingClientRect();
    const aR = a.getBoundingClientRect();
    if (aR.top < sbR.top) sb.scrollTop += aR.top - sbR.top - 8;
    else if (aR.bottom > sbR.bottom) sb.scrollTop += aR.bottom - sbR.bottom + 8;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          const a = map.get(e.target);
          if (a) { a.classList.add('active'); reveal(a); }
        }
      });
    },
    { rootMargin: '-35% 0px -60% 0px', threshold: 0 }
  );
  map.forEach((_a, el) => obs.observe(el));
})();
