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
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('active'));
          const a = map.get(e.target);
          if (a) a.classList.add('active');
        }
      });
    },
    { rootMargin: '-35% 0px -60% 0px', threshold: 0 }
  );
  map.forEach((_a, el) => obs.observe(el));
})();
