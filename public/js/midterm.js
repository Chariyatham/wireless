// ===== หน้า /midterm — นับถอยหลัง + ข้อสอบจำลอง 10 ข้อจับเวลา =====
import { mountExam } from './stepper.js';

// นับถอยหลังถึงสอบจริง: ศุกร์ 21 ส.ค. 2569 13:00 (เวลาไทย)
(function () {
  const el = document.getElementById('midCount');
  if (!el) return;
  const T = new Date('2026-08-21T13:00:00+07:00').getTime();
  function render() {
    const diff = T - Date.now();
    if (diff <= 0) {
      el.innerHTML = '🏁 <b>ถึงเวลาสอบแล้ว (หรือสอบผ่านไปแล้ว)</b> — ขอให้สิ่งที่ซ้อมมาทั้งหมดทำงาน!';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.innerHTML = `⏳ เหลืออีก <b>${d} วัน ${h} ชั่วโมง ${m} นาที</b> ถึงสอบกลางภาค Wireless
      <span class="hint" style="display:block;margin-top:4px">คาบเรียนที่เหลือก่อนสอบ: จันทร์ 10 ส.ค. · จันทร์ 17 ส.ค. (คาบสุดท้าย — เนื้อหาหลังจากนี้ไม่อยู่ในขอบเขตกลางภาคตามที่อาจารย์บอก)</span>`;
  }
  render();
  setInterval(render, 30000);
})();

// ข้อสอบจำลอง — 180 นาทีเท่าสอบจริง
mountExam([210, 180, 150]);
