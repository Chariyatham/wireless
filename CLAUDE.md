# CLAUDE.md — โปรเจกต์ "เว็บสอนวิชา Wireless"

บริบทสำหรับสร้างเว็บไซต์สอนวิชา Wireless Communications ของ kim (เด็กคอมปี 4)
**ตอบเป็นภาษาไทยเสมอ**

## เป้าหมายของโปรเจกต์
สร้าง **เว็บไซต์สอนวิชา Wireless** ที่อธิบายลึก เข้าใจง่าย มี animation
- วัตถุดิบ: **ไฟล์เสียงเลคเชอร์** (ถอดเป็น text) + **สไลด์ PDF**
- ผลลัพธ์: เว็บ static เปิดในเบราว์เซอร์ได้เลย → จะเอาขึ้น **GitHub (Pages)**
- กลุ่มเป้าหมาย: นักศึกษาคอมพิวเตอร์ปี 4 (เข้าใจ coding/ระบบพื้นฐานแล้ว)

## ⭐ Style การสอนที่ kim ต้องการ (หัวใจของงาน — ยึดเป็นหลักทุกหน้า)
1. **ทำให้เห็นภาพ (visualize)** — เน้นภาพ/animation ให้ "เห็น" ว่ามันทำงานยังไง ไม่ใช่ตัวหนังสือล้วน
2. **เชื่อมโลกจริงเสมอ** — ทุกหัวข้อต้องบอกว่า "เอาไปทำอะไรจริง / ทำไมต้องรู้ / ใช้ที่ไหนในชีวิตจริง" ก่อน/ระหว่างอธิบายทฤษฎี
3. **ไม่เอาแบบท่องจำสอบ** — เกลียดการเรียนแบบจำๆ สอบๆ, เรียน math แบบทำโจทย์ไปงั้นๆ โดยไม่รู้ความหมาย → ต้องอธิบาย "ทำไม" และ intuition เบื้องหลังสูตร ไม่ใช่แค่ plug ตัวเลข
4. **ศัพท์ใหม่อธิบายทีละคำ** — คำเทคนิคใหม่ครั้งแรก ต้องนิยามด้วยภาษาง่ายๆ ก่อน แล้วค่อยลงลึก (แนว tiered: ง่าย→ลึก)
5. **ลึก ละเอียด แต่เข้าใจได้** — ไม่ตื้น ไม่ข้าม แต่ต้องย่อยให้เข้าใจ

## กฎเหล็กจาก kim
- **ห้ามเดา ห้ามมั่ว** งานนี้สำคัญ — ไม่รู้ให้ถาม / ตอบว่าไม่รู้
- เนื้อหาต้องมาจาก **เสียงเลคเชอร์ + สไลด์จริง** เท่านั้น ห้ามแต่งเนื้อหาวิชาขึ้นเอง (เสริมตัวอย่าง/ภาพได้ แต่ต้องระบุว่าเป็นส่วนเสริม และต้องถูกต้อง)

## 🏆 มาตรฐานบทเรียน (kim สั่ง 2026-07-11: week ใหม่ทุกบทต้อง "เท่าหรือดีกว่านี้" โดยไม่ต้อง prompt ซ้ำ)
ยกเครื่องตาม `UPGRADE_PROMPT.md` (มาตรฐาน Numer Master `~/Downloads/numer`) เสร็จครบ w1–w3 แล้ว — **week ใหม่ต้องมีครบทุกข้อโดยอัตโนมัติ:**
1. **เปิดด้วย "ทำไมต้องเรียน + อุปมาโลกจริง"** แล้วไล่ทฤษฎีจากราก (อธิบาย "ทำไม" ของทุกสูตร ห้ามโยนสูตรลอย)
2. **Animation/step player อย่างน้อย 4–6 ตัว/บท** — ใช้ `createStepper` จาก `public/js/stepper.js` (เล่น/ถอยหลัง/เดินหน้า/scrubber + คำอธิบายเปลี่ยนตามขั้น) ตัวเลขใน animation = ตัวเลขจริงจากตัวอย่างในบท
3. **ตัวอย่างทำมือทีละขั้น** — `mountWalk(id, steps)` เดินโจทย์จริงจากชีท/เลคเชอร์แบบเขียนลงกระดาษคำตอบ
4. **Interactive widget** ปรับค่าเองได้ (เครื่องคิด ฯลฯ)
5. **Section "คิดไวในห้องสอบ"** — สูตรลัด + ตารางตัดสินใจ + งบเวลา/ข้อ (ติดป้ายเสริม)
6. **โค้ดรันได้** — `mountRunner(id, code)` คำนวณโจทย์เดียวกับที่ทำมือ ผลต้องตรงกัน
7. **ข้อสอบจำลองจับเวลา 4–5 ข้อ** — `mountExam(presets)` + `#exam-timer`/`#exam-area` ครอบ `details.sol` (เฉลยล็อกจนหมดเวลา/ยอมแพ้)
8. **Quick reference ท้ายบท 1 จอ + กับดักพลาดบ่อย**
9. กล่อง `🎙 .lect` = สิ่งที่อาจารย์พูดนอกสไลด์ (จาก transcript — ห้ามแต่ง, คำเพี้ยนห้ามลอก) · ป้าย `.plus` "เสริมจากผู้เขียน" ทุกจุดที่นอกแหล่ง · จุดที่สไลด์กับเลคเชอร์ขัดกัน mark ⚠︎ พร้อมบอกยึดอะไรเพราะอะไร
- **ตัวเลขทุกตัวยืนยันด้วยสคริปต์ node ก่อนใส่** (ห้ามคิดในหัวแล้วพิมพ์) — เก็บสคริปต์ verify ใน scratchpad
- **ตรวจจบด้วย Playwright** (chromium `/usr/bin/chromium`): screenshot ทุก section, กดปุ่มทุกตัว, console error = 0, เช็คธีมขาว/ดำทั้งคู่
- อัปเดต **progress checklist** (`public/js/progress.js`), **แผนที่คอนเซปต์** (conceptmap.js), **การ์ดหน้าแรก + WeekNav**, และเพิ่มโจทย์บทใหม่เข้า**คลังข้อสอบรวม** (`src/pages/exam.astro` + `public/js/exam.js`)
- pipeline เนื้อหาใหม่: รับเสียง → ถอดผ่าน Groq (สูตรด้านล่าง) → อ่าน PDF ทุกหน้า (หน้าไดอะแกรมเปิดเป็นภาพ) → เสนอ "โครง + animation ที่จะสร้าง" ให้ kim ดูก่อนลงมือ → เขียน → verify → Playwright → commit (push เมื่อ kim สั่ง)

## วัตถุดิบ (source materials)
- `เนื้อหาเรียน/wireless-w1.pdf` (4 หน้า) — **Week 1: Basic Math** = Logarithm (สมบัติ), Decibel (dB/dBW/dBm), การแปลงกำลังงาน, โจทย์ link budget (Tx→cable loss→antenna gain→wireless loss→Rx), แบบฝึกหัด
- `เนื้อหาเรียน/wireless-w2.pdf` (17 หน้า) — **Week 2: Protocols & TCP/IP** = องค์ประกอบการสื่อสาร, ฟีเจอร์โพรโทคอล (Syntax/Semantic/Timing), TCP/IP 5 ชั้น, OSI 7 ชั้น, OSI vs TCP/IP, ศัพท์เครือข่าย (ES/IS/bridge/router), LAN/MAN/WAN, Circuit/Packet switching (Datagram & Virtual Circuit), ขนาดแพ็กเก็ต
  - หมายเหตุ: บางหน้าเป็นรูปไดอะแกรมล้วน (TCP/IP example, switching network) → pdftotext ดึงไม่ได้ ต้อง render เป็นภาพ/animation แทน
- **ไฟล์เสียง:** ยังไม่ได้รับจาก kim (รอส่ง)
- อาจารย์ผู้สอน: รศ.ดร.ธนภัทร์ อนุศาสน์อมรกุล

## การตัดสินใจ workflow (ตกลงกับ kim แล้ว)
- **ถอดเสียง:** `faster-whisper` (เร็วบน CPU, ไม่ต้องโหลด torch) ติดตั้งใน venv ที่ `tools/whisper-venv/`
  - เครื่อง: 16 cores, RAM 31GB, GPU Intel Iris Xe (ถอดด้วย CPU), ภาษาไทย + ศัพท์เทคนิคอังกฤษ
  - ⚠️ **บทเรียนความเร็ว:** `medium` + `beam_size=5` + `condition_on_previous_text=True` → **ช้าผิดปกติมาก** (ติด repetition loop, ใช้ CPU แค่ ~4 threads). แก้แล้วในสคริปต์: `beam_size=1`, `condition_on_previous_text=False`, `cpu_threads=8`, `vad_filter=True`, env `OMP_NUM_THREADS=8`. ถ้ายังช้าอีก ลดเป็น model `small`
  - สคริปต์: `tools/transcribe.py` → เขียนผลไป `transcripts/<name>.txt` + `.segments.txt` (มี timestamp)
- **สร้างเว็บ:** เขียนเอง (การันตีคุณภาพได้) — ไม่ลง skill ยอดต่ำมาใช้แบบปิดตา แต่หยิบไอเดียโครงสร้างคอร์สจาก `kevintsai1202/teaching-site-skills@teaching-site` และวิธีอธิบายศัพท์ทีละระดับจาก `szeyu/vibe-study-skills@concept-explainer`
- **แนวทางทำภาพ (kim สั่ง):** ทำ **animation/ภาพต้นฉบับให้ดีกว่าสไลด์** เป็นค่าเริ่มต้น (คลื่นไซน์, packet วิ่ง, dB scale, FDM/TDM, switching ฯลฯ) — เข้าใจดีกว่าภาพนิ่ง
  - อาจารย์อนุญาตแล้ว → **แคปภาพสไลด์มาใส่เว็บได้** เป็น fallback เมื่อวาดใหม่แล้วสู้ของเดิมไม่ได้ แต่ default ยังวาด/animate เองเพราะสอนได้ดีกว่า
- **Stack:** ✅ **Astro** (kim เลือก 2026-07-03) — เว็บ content + interactive islands, static → GitHub Pages, ใส่ React component ได้ถ้าต้องการ
  - `base: '/wireless'` ใน `astro.config.mjs` (project page) — ⚠️ `import.meta.env.BASE_URL` เวอร์ชันนี้ให้ `/wireless` (ไม่มี `/` ท้าย) ต้อง `.replace(/\/$/,'')` แล้วต่อ `${base}/path` เอง
  - dev/preview: `npm run dev` / `npm run preview` → เปิด `http://localhost:4321/wireless/`
  - deploy: GitHub Action `.github/workflows/deploy.yml` (withastro/action@v3 + deploy-pages) — push `main` แล้วขึ้น Pages อัตโนมัติ (ต้องเปิด Pages: Settings → Pages → Source = GitHub Actions)
- **Deploy:** repo = `https://github.com/Chariyatham/wireless.git` (branch `main`) — **PUBLIC**
  - ✅ **อาจารย์อนุญาตให้เผยแพร่ได้แล้ว** (kim ยืนยัน 2026-07-03) → เสียง/สไลด์/transcript ขึ้น public repo ได้ (ปรับ `.gitignore` แล้ว)
  - เว็บยังเน้นคำอธิบายเรียบเรียงใหม่ + animation ต้นฉบับของเราเอง (เพื่อการเรียนรู้) โดยอ้างอิง/แคปเนื้อหาอาจารย์ได้เต็มที่

## โครงไฟล์ (เริ่มทำ)
- `เนื้อหาเรียน/` — สไลด์ PDF ต้นฉบับ (+ ไฟล์เสียงเมื่อได้รับ)
- `tools/whisper-venv/` — Python venv สำหรับ faster-whisper (อย่า commit ขึ้น git)
- โครง Astro: `src/pages/` (index.astro, week1.astro), `src/layouts/Base.astro`, `src/components/` (Step, ModuleCard), `src/styles/global.css`, `public/js/` (hero.js, module1.js — animation vanilla ใช้ต่อได้ทุก stack)
- `transcripts/` — ผลถอดเสียง (ยังไม่มี w2/w3 จนกว่าถอดเสร็จ; ไม่มี w1 เพราะไม่มีเสียง)
- ✅ Week 1 สร้างเสร็จแล้ว (จากสไลด์) มี 2 interactive lab: dB slider + link budget

## 🔖 สถานะล่าสุด — หยุดไว้ 2026-07-04 (kim จะทำต่อพรุ่งนี้)
**เสร็จแล้ว:**
- Astro + workflow deploy GitHub Pages (`.github/workflows/deploy.yml`)
- ดีไซน์: ธีมวิชาการ Distill/Seeing-Theory (พื้นกระดาษ + serif Noto Serif Thai) + **ปุ่มสลับ ขาว/ดำ** (`public/js/theme.js`, `data-theme`, จำใน localStorage, กัน flash ด้วย inline script ใน `<head>` ของ `Base.astro`)
- **Week 1 เต็ม** (`src/pages/week1.astro`): log + สมบัติ log + dB/dBW/dBm + link budget, เน้นออกสอบ, 2 interactive lab (`public/js/module1.js`), sidebar ซ้าย + สารบัญ scrollspy (`public/js/toc.js`)
- หน้าแรก (`src/pages/index.astro`): hero คลื่น + การ์ด 3 สัปดาห์ (W2/W3 ล็อกไว้ใน `WeekNav.astro` + index)

**เสร็จเพิ่ม (2026-07-04 บ่าย):**
- ✅ **week2.astro รื้อเขียนใหม่แบบละเอียดเต็ม** จากสไลด์ 68 แผ่น + transcript w2_1 — 21 sections, กล่อง "🎙 จากปากอาจารย์" 15 จุด (เนื้อหาเลคเชอร์ที่ไม่มีในสไลด์), ป้าย "เสริมจากผู้เขียน" แยกส่วนเสริมชัดเจน, ป้าย "ระวังสอบ" ตามที่อาจารย์เน้น
- ✅ interactive 8 ชิ้นใน `public/js/week2.js` (เขียนใหม่): encapsulation ผ่าน router (fig 4.6/4.7) · store-and-forward · โทรศัพท์ 3 เฟส CS · กราฟเครือข่ายสวิตช์ fig 3.3 เล่นโหมด Datagram/VC ได้ · FDM vs TDM canvas · event timing canvas 3 โหมด · lab ขนาดแพ็กเก็ต (fig 3.9, ตัวเลข 129/92/77/84 ตรงสไลด์) · ตารางการบ้านอาจารย์ (สไลด์ 68) แบบกดตอบ+ตรวจ+เฉลยพร้อมเหตุผล
- CSS ส่วนใหม่ต่อท้าย `global.css` (`.lect`, `.plus`, `.qc`, phone-net, netgraph ฯลฯ) — รองรับธีมมืดแล้ว

**เสร็จเพิ่ม (2026-07-04 เย็น):**
- ✅ **week1 อุดช่องว่างเทียบสไลด์ครบ**: ตาราง W/dBW/dBm เต็ม 14 แถว (ถึง 1 GW), วิธีที่ 3 ของโจทย์ link budget (คิดแบบ dBm เริ่ม 47 dBm), คำเตือน "dB เป็นค่ากลาง ระวังหน่วย", ลิงก์ mathsisfun จากสไลด์
- ✅ **week3.astro สร้างเสร็จเต็มรูปแบบ** (สไลด์ 50 แผ่น + transcript w3, กล่อง 🎙 10 จุด): ประวัติ→สัญญาณ→โดเมนเวลา/ความถี่→BW→data/signal→amp/repeater→Nyquist/Shannon/SNR→โจทย์เดินสด (B=1MHz, 24dB → 8Mbps → M=16)→สื่อ/สเปกตรัม/microwave/ดาวเทียม/วิทยุ→FDM/TDM
- ✅ interactive 6 ชิ้น (`public/js/week3.js`): Sine Lab (A/f/φ + ปุ่ม 4 กรณีตามรูป 2.3) · Fourier Lab (ประกอบ square wave จากฮาร์มอนิกคี่ + สเปกตรัม) · Amplifier vs Repeater · เครื่องคิด Nyquist–Shannon · การบ้านตารางข้อมูล×สัญญาณ (สไลด์ 28 — modem/codec/NRZ/PCM) · FDM vs TDM canvas
- ✅ ปลดล็อก W3 ใน WeekNav + การ์ดหน้าแรก — **เนื้อหาครบทั้ง 3 สัปดาห์แล้ว**

**✅ DEPLOYED (2026-07-04): https://chariyatham.github.io/wireless/**
- แผนที่คอนเซปต์หน้าแรกเสร็จ (`public/js/conceptmap.js` — SVG คลิกได้ 22 โหนด + เส้นเชื่อมข้ามสัปดาห์ เช่น dB→SNR, สมบัติ log→Nyquist/Shannon, switching→FDM/TDM) — ทำเองแทน graphify (คุมคุณภาพได้)
- push `main` แล้ว + เปิด Pages ผ่าน `gh api` (build_type=workflow) — deploy run แรกผ่าน ทุกหน้า 200
- push ครั้งต่อไปที่ `main` = deploy อัตโนมัติ
- 🔑 Groq key: kim สั่ง**เก็บไว้ ไม่ revoke** — ห้ามให้หลุดขึ้น git (ตรวจ `grep -rn "gsk_"` แล้วสะอาด; key ไม่เคยอยู่ในไฟล์ repo — อยู่ในแชท/scratchpad ที่ลบแล้วเท่านั้น)

**เหลือทำ:**
1. ให้ kim รีวิวเว็บจริงทั้ง 3 สัปดาห์ ว่าถึงมาตรฐาน "ละเอียดกว่าอาจารย์+สไลด์" แล้วปรับตาม feedback

**ถอดเสียง: ✅ เสร็จครบแล้ว (2026-07-04) — อยู่ใน `transcripts/` (w2_1, w2_2, w3 มีทั้ง .txt และ .segments.txt)**
- ทำผ่าน **Groq API** (ฟรี, whisper-large-v3 / -turbo): local CPU ช้าเกิน (`small` = ผลมั่วใช้ไม่ได้, `medium` = 0.15x realtime)
- สูตรที่ใช้ได้: loudnorm → mp3 mono 16kHz 32kbps → **หั่นท่อนละ 10 นาที** (ไฟล์ยาว 56 นาทีทั้งก้อนโดน Internal Server Error) → ยิงทีละท่อน → merge + เลื่อน timestamp (สคริปต์เก็บใน scratchpad ของ session 2026-07-04)
- โควตาฟรี large-v3 ชนง่าย → fallback เป็น `whisper-large-v3-turbo` (โควตาแยก คุณภาพใกล้กัน)
- คุณภาพ transcript: ตามเนื้อหาได้จริง แต่คำเพี้ยนประปราย ช่วงต้นคาบ/เสียงคุยเพี้ยนหนัก → **ใช้เป็นตัวบอกว่าอาจารย์เน้น/ยกตัวอย่างอะไร แล้วเทียบสไลด์เสมอ ห้ามลอกคำเพี้ยนลงเว็บ**
⚠️ **บทเรียน pkill:** อย่าใส่ `pkill/pgrep -f` ในคำสั่งเดียวกับที่มีคำว่า `transcribe.py`/`whisper` (จะ match+ฆ่า shell ตัวเอง) — ใช้ regex bracket หรือแยกคำสั่ง
**รันเว็บ:** `npm run dev` → `http://localhost:4321/wireless/`
