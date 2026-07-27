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
- **ตรวจจบด้วย Playwright** (chromium `/usr/bin/chromium`): screenshot ทุก section, กดปุ่มทุกตัว, console error = 0, เช็คธีมขาว/ดำทั้งคู่ (ไม่มี playwright ติดตั้งถาวร — `npm i playwright-core` ใน scratchpad + `executablePath: '/usr/bin/chromium'`)
- **🧷 กฎ QA เพิ่ม (จากรีวิวข้ามโมเดล 26 ก.ค. 2569 — เจอ 4 จุดหลุดในบทที่ verify แล้ว ทั้งหมดเป็น 3 คลาสนี้):**
  1. **ค่าที่ derive จากค่าปัดแล้ว ห้ามใช้** — ผลต่าง/ผลรวมต้องคิดจากค่าเต็มก่อนแล้วค่อยปัด (เคส 132.94−98.11 = 34.83 แต่ค่าจริง 34.84)
  2. **ป้ายบิต/ทิศ/ขั้ว/ลำดับจุดใน interactive ทุกตัวที่อ้าง "ตามสไลด์ X" ต้องเปิดภาพสไลด์หน้านั้นเทียบตอน QA** — ตัวเลขถูกไม่พอ (เคส QPSK constellation ป้าย 00 ไปอยู่ 45° ทั้งที่สไลด์ 25 คือ 11@45°·01@135°·00@225°·10@315° และ BPSK ป้ายสลับกับตารางในหน้าเดียวกันเอง)
  3. **สูตร/ประโยคที่ฝังใน stepper label + SVG render ของ .js ต้องไล่เทียบสไลด์เท่ากับสูตรใน .astro** — จุดนี้ชอบหลุดเพราะ QA มักตรวจแต่ตาราง/formula box (เคส β Carson เขียน nₐ·A_m/f_m แทน n_f·A_m/(2πB) ตามสไลด์ 47 · เคส label PCM "ระดับเพิ่ม 4 เท่า" ที่จริงระดับ ×2/noise ÷4)
- อัปเดต **progress checklist** (`public/js/progress.js`), **แผนที่คอนเซปต์** (conceptmap.js), **การ์ดหน้าแรก + WeekNav**, และเพิ่มโจทย์บทใหม่เข้า**คลังข้อสอบรวม** (`src/pages/exam.astro` + `public/js/exam.js`)
- **pipeline เนื้อหาใหม่ (kim ยืนยัน 2026-07-11 — ทำตามนี้ทุกรอบ ไม่ต้องรอสั่ง):**
  1. kim วางไฟล์ (เสียง/สไลด์) แล้วบอกว่าเพิ่มเนื้อหา → ถอดเสียงผ่าน Groq (สูตรด้านล่าง) + อ่าน PDF ทุกหน้า (หน้าไดอะแกรมเปิดเป็นภาพ)
  2. **เสนอแผนให้ kim recheck ก่อนเสมอ**: โครง sections + animation ที่จะสร้าง + โจทย์/ตัวเลขที่จะใช้ — **รอ kim ยืนยันแล้วจึงเริ่มเขียน**
  3. เขียนด้วยเครื่องมือกลาง → verify เลขด้วย node → Playwright console=0 → อัปเดต progress/conceptmap/BANK ใน exam.js → commit (push เมื่อ kim สั่ง)

## วัตถุดิบ (source materials)
- `เนื้อหาเรียน/wireless-w1.pdf` (4 หน้า) — **Week 1: Basic Math** = Logarithm (สมบัติ), Decibel (dB/dBW/dBm), การแปลงกำลังงาน, โจทย์ link budget (Tx→cable loss→antenna gain→wireless loss→Rx), แบบฝึกหัด
- `เนื้อหาเรียน/wireless-w2.pdf` (17 หน้า) — **Week 2: Protocols & TCP/IP** = องค์ประกอบการสื่อสาร, ฟีเจอร์โพรโทคอล (Syntax/Semantic/Timing), TCP/IP 5 ชั้น, OSI 7 ชั้น, OSI vs TCP/IP, ศัพท์เครือข่าย (ES/IS/bridge/router), LAN/MAN/WAN, Circuit/Packet switching (Datagram & Virtual Circuit), ขนาดแพ็กเก็ต
  - หมายเหตุ: บางหน้าเป็นรูปไดอะแกรมล้วน (TCP/IP example, switching network) → pdftotext ดึงไม่ได้ ต้อง render เป็นภาพ/animation แทน
- `เนื้อหาเรียน/wireless-w4.pdf` (22 หน้า = 88 สไลด์) — **Week 4: สายอากาศและการแพร่กระจายสัญญาณ** = radiation pattern, ชนิดสายอากาศ (isotropic/dipole/parabola/directional), antenna gain + effective area (ตารางสไลด์ 17), propagation 3 โหมด (ground ≤2MHz / sky 2-30MHz / LOS >30MHz), สมการ LOS (3.57√Kh, K=4/3), free space loss (20logf+20logd−147.56), Friis + เกน, path loss exponent, noise/thermal (kTB, −228.6), Eb/N0, multipath/fading, FEC/equalization/diversity/MIMO
- `เนื้อหาเรียน/040613503 hw2.pdf` — **การบ้านครั้งที่ 2** (4 ข้อ, ส่ง 19 ก.ค. 2569 เที่ยงคืน, เขียนมือ): ข้อ 1-2 ดาวเทียม 35,368 กม./4 GHz (ตรงโจทย์ท้ายคาบ) · ข้อ 3 จาน Ø 100 ซม./40 GHz (Ae 0.44 m², G 49.90 dB) · ข้อ 4 ดาวเทียม 20,000 กม./5 GHz/120 W/เกน 20+45 → Pr = −76.65 dBm — **เฉลยเปิดทั้งหมดบน week4 (kim สั่ง 16 ก.ค.)**
- `เนื้อหาเรียน/wireless-w6.pdf` (14 หน้า = 53 สไลด์) — **Week 6: การแผ่สเปกตรัม (Spread Spectrum)** = หลักการแผ่ + ข้อดี 3 ข้อ (สไลด์ 5), FHSS (ระบบ 9–10, MFSK ช้า/เร็ว 11–13 — T_c ≥ T_s = ช้า, ทนแจม 14), DSSS (XOR 15–16, BPSK s(t)=A·d(t)·c(t)·cos 17, สเปกตรัม 20), CDMA (chip rate = k×D 22, กฎส่ง/ถอด 23, **ตาราง 7.1** 26 → 6/−6/0/2/8, **โจทย์สไลด์ 30**), PN sequence (คุณสมบัติ 33, LFSR 34–36), m-sequence 4 ข้อ + R(τ) = −1/N (37–40), Gold (41–43), Walsh W₂ₙ = [Wₙ Wₙ; Wₙ W̄ₙ] (44–46), OVSF (47–48), multiple spreading 2 ชั้น (49–50), ประเมินรหัสสุ่มเทียม 15 บิต (51–53)
  - 🔇 **ไม่มีไฟล์เสียงคาบนี้** (kim เรียนออนไลน์ไม่ได้เข้า 27 ก.ค. และหา recording ไม่ได้) → week6 เขียนจากสไลด์ล้วน
- **ไฟล์เสียง:** `เนื้อหาเรียน/` มี w2_1, w2_2, w3, w4, w5, สอนต่อจากหน้า10+เฉลยการบ้านและทดสอบ1ข้อw3 (ถอดแล้วทั้งหมดใน `transcripts/`) — **ไม่มีของ w6**
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

**เสร็จเพิ่ม (2026-07-16): เนื้อหาคาบ 15 ก.ค. (w3 จบ + w4 เท่าที่สอน)**
- ✅ ถอดเสียง 2 ไฟล์ใหม่ (Groq สูตรเดิม): `w4` (64 นาที) + `สอนต่อจากหน้า10+เฉลยการบ้านและทดสอบ1ข้อw3` (54 นาที)
- ✅ **week4.astro ใหม่** ครอบสไลด์ 1–40 **เท่าที่อาจารย์สอน** (kim ยืนยัน 15 ก.ค.: "ทำเท่าที่สอน") — สไลด์ 41–88 (path loss exponent → MIMO) มี section "⏳ ที่เหลือของ Week 4" ระบุหัวข้อรอเรียนต่อ · interactive 6 ชิ้น (`public/js/week4.js`): antenna pattern stepper (AF จริง N=5 + คำนวณ beamwidth −3dB เชิงตัวเลข) · dipole lab (f→λ→L เทียบตัวคน) · gain lab (6 ชนิดตามตารางสไลด์ 17) · propagation 3 โหมด stepper (โลกโค้ง) · LOS lab (h₁,h₂,K toggle) · FSL sphere stepper + กราฟ dB ทรงสไลด์ 39 — walkthrough 4 ชุด (dipole 1.5m / จาน 45.46dB / เสา 41.2กม.→47ม. / **การบ้านดาวเทียม 35,368กม. 4GHz: 195.45dB, −171.47dBW, 103.45dB, −79.47dBW — kim สั่งเปิดเฉลยเลย**) + คิดไว + fx-991CW + runner + ข้อสอบ 5 ข้อ
- ✅ **week1**: กล่อง 🎙 เฉลย hw1 ฉบับอาจารย์ (คาบ 15 ก.ค. — ตรงเฉลยเราทุกข้อ, ข้อ 6 อาจารย์ยืนยันตีความ Loss=1.5 เป็นอัตราส่วน + ใช้เป็น**ข้อทดสอบเก็บคะแนนจริง**) + **การบ้านชุดใหม่ Loss=25dB, Pt=50W → Pr −8.01dBW = 21.99dBm** (kim พิมพ์โจทย์ยืนยัน + เลือก 25 dB ไม่ใช่ 25 เท่า)
- ✅ **week3**: กล่อง 🎙 คาบสอนต่อ 3 จุด (Wi-Fi omni + "λ=c/f สอบไม่ให้สูตร" / เสาไมโครเวฟยอดตึก + ดาวเทียม=relay / FDM เก่ากว่า TDM)
- ✅ conceptmap เพิ่มคอลัมน์ W4 (6 โหนด ม่วง #c792ea + เส้นข้าม: sine→ant, spec→prop4, lb→friis4) · exam.js BANK → 21 ข้อ (W1+ข้อทดสอบจริง, W4 ×5) · การ์ดหน้าแรก + WeekNav ปลดล็อก W4
- ✅ ตัวเลข verify ด้วย node 43 ค่า (สคริปต์ใน scratchpad) · Playwright ผ่าน: console error = 0 ทุกหน้า, กดปุ่มทุกตัว, เลขใน lab/runner ตรง, เฉลยล็อก/ปลดถูก, 2 ธีม
- ⚠️ เลขสไลด์ 35,368 กม. ต่างจาก Stallings (35,863) — เว็บคิดตามสไลด์ + ใส่หมายเหตุ .plus เทียบตำรา (ต่าง ~0.12 dB)

**เสร็จเพิ่ม (2026-07-26): คาบ 20 ก.ค. — week4 ครบทั้งบท + week5 ใหม่ + การบ้าน 3**
- ⚠️ **ไฟล์เสียง w4 คาบต่อหาย**: `w4ต่อตั้งแต่หน้า12.m4a` อัด 20 ก.ค. 11:34 UTC ได้แค่ **14 วินาที** (พูดถึง receiver sensitivity) แล้ว `w5.m4a` เริ่ม 12:38 UTC → **หายไป ~1 ชม. ที่อาจารย์สอน w4 หน้า 12+** · ถอด w5 สำเร็จ (53 นาที, 664 ประโยค)
- ✅ **week4 ครบ 88 สไลด์**: เพิ่ม 8 section (path loss exponent + ตาราง n + โจทย์ 1.9GHz/1.5km → 101.54 vs 136.48 dB · ระยะครอบคลุม 3 วง · noise 4 ชนิด + kTB/−228.6 · Eb/N₀ · multipath→ISI · fading (fast/slow, flat/selective, Rayleigh/Rician) · FEC/equalization/diversity/MIMO · **การบ้านครั้งที่ 3**) · interactive ใหม่ 7 ชิ้น (5 stepper + 2 lab) + walkthrough 4 ชุด · ข้อสอบท้ายบท 5→7 ข้อ · เช็กเข้าใจ 5→8 ข้อ
  - 🔇 **ส่วนสไลด์ 41–88 ติดป้ายชัดว่าไม่มีเลคเชอร์ → เรียบเรียงจากสไลด์ล้วน ไม่มีกล่อง 🎙 (ไม่เดา)**
- ✅ **การบ้านครั้งที่ 3** (`เนื้อหาเรียน/040613503 hw3.pdf`, ส่ง **27 ก.ค. 2569 เขียนส่งเท่านั้น**) — 3 ข้อ เฉลยเปิดบน week4 #hw3: ① Eb/N₀ 8.4dB, 290K, 2400bps → **S = −161.77 dBW** ② spectral eff 6 bps/Hz → SNR 63 → **Eb/N₀ = 10.21 dB** ③ ฮอร์น r=25cm @5GHz → **Ae 0.159 m², G 27.37 dB** (10A/λ² ตามตารางสไลด์ 17)
- ✅ **week5.astro ใหม่** (สไลด์ 1–66) — 20 section: สายโซ่ระบบ · ⭐ Encoder vs Modulator (อาจารย์บอกเองว่าออกสอบ) · 4 คู่ข้อมูล×สัญญาณ · เกณฑ์+BER · bit rate vs baud rate · ASK/BFSK/BPSK/DPSK · MFSK · QPSK/multilevel · QAM · B_T + ประสิทธิภาพสเปกตรัม · AM/FM/PM/SSB/Carson · PCM · DM/Vocoder · รหัสดิจิทัล 5 แบบ · ตารางสรุป
  - interactive 8 ชิ้น (`public/js/week5.js`): chainStepper · modStepper (ASK/FSK/PSK/DPSK จากบิตชุดเดียว + ไฮไลต์ 180°) · mfskStepper · constellation lab (BPSK→64QAM) · bandwidth-efficiency lab · angleStepper (AM/FM/PM/Carson) · pcmStepper · lineStepper (NRZ-L/NRZI/Manchester/Diff/AMI ชุดบิตสไลด์ 64)
  - walkthrough 4 ชุด: baud rate QPSK 1Mbps→500kbaud · MFSK 250k/25k/M=8 → 75–425 kHz, BW 400 kHz · bandwidth efficiency · PCM 30dB/7000sps → 5 บิต/32 ระดับ/35 kbps
  - **สไลด์ 36–66 ยังไม่ได้สอนในคาบ** (จบที่ QAM ~สไลด์ 35) → ติดป้ายบอกทุกส่วน
- ✅ **2 จุดที่เคยสงสัยว่า "ขัดกัน" — สืบจนได้ข้อมูลจริงแล้ว (26 ก.ค.) เว็บใช้ข้อสรุปนี้:**
  1. **Eb/N₀ = 15 dB ของ ASK/BFSK ที่ BER 10⁻⁷ → อาจารย์ถูก ไม่ใช่ค่าที่ขัดกับตำรา** · วัดกราฟสไลด์ 30 ระดับพิกเซล (สคริปต์ PIL ใน scratchpad): BPSK 11.18 · DPSK 11.75 · ASK/BFSK **14.94 dB** — ทั้งสามเส้นต่ำกว่าทฤษฎี ~0.13 dB เท่ากัน (ความหนาเส้น) → เส้นในสไลด์คือ **noncoherent** (ทฤษฎี Pb = ½e^(−γ/2) → 14.89 dB) · เลข ~14.2–14.3 ที่เจอในตำราคือ **coherent** (Pb = Q(√γ) → 14.32 dB) — คนละเงื่อนไขการตรวจจับ · **คำตอบ R/B_T = 0.5 bps/Hz ถูกต้อง**
  2. **ตาราง 6.2 แถว FSK/MFSK ผิดจริง และรู้ว่าผิดยังไง**: ค่าในตารางที่ r = 0.5 และ r = 1 เท่ากับ **ค่าที่ถูก × (1+r)²** พอดีทุกช่อง (×2.25, ×4) = ตอนทำตาราง**คูณ (1+r) แทนที่จะหาร** · แถว ASK/PSK/MPSK ตรงสูตร 100% · เว็บใส่กล่อง ⚠︎ อธิบายครบ + ให้ยึดสูตร B_T
  - ทฤษฎีอ้างอิง (คำนวณเองด้วย `math.erfc` + bisection, ตรวจซ้ำใน runner ของ week5 ด้วย Simpson): BER 10⁻⁷ → BPSK 11.31 · DPSK 11.88 · ASK/FSK coherent 14.32 · noncoherent 14.89 dB · **BER 10⁻⁴ → BPSK = 8.40 dB = เลขในโจทย์การบ้าน 3 ข้อ 1 เป๊ะ**
- ✅ conceptmap เพิ่มคอลัมน์ W5 (6 โหนด ส้ม #f78c6c) + W4 เพิ่ม 3 โหนด (ple4/noise4/fade4) · exam.js BANK 21→28 ข้อ · การ์ดหน้าแรก + WeekNav + /exam อัปเดตเป็น 5 สัปดาห์
- ✅ verify เลขด้วย node ทุกตัว · Playwright: console error = 0 ทุกหน้า (6 หน้า × 2 ธีม), กดปุ่มครบ, ไม่ล้นแนวนอน
- 🚫 `เนื้อหาเรียน/ilovepdf_merged.pdf` = **วุฒิบัตร e-Learning SET ของ kim (ไม่เกี่ยวกับวิชา)** — ไม่ commit ขึ้น repo สาธารณะ

**เสร็จเพิ่ม (2026-07-26 เย็น): รีวิวข้ามโมเดล (Fable ตรวจงานที่ Opus ทำ) — คุณภาพโดยรวมผ่านมาตรฐาน**
- ตรวจซ้ำทั้งชุด: เลข 60+ ค่าด้วย node ✓ ทุกตัว (ยกเว้น 1 จุดปัดเศษ) · โครงครบมาตรฐาน 9 ข้อ · smoke test ใหม่ 7 หน้า × 2 ธีม console = 0, ไม่ล้นแนวนอน, runner ให้ค่าตรง
- แก้ 4 จุด: ① β Carson ใน angleStepper (nₐ·A_m/f_m → PM = n_p·A_m · FM = ΔF/B = n_f·A_m/(2πB) ตามสไลด์ 47) ② ป้ายบิต BPSK/QPSK ใน constellation lab + ประโยคใน astro ให้ตรงสไลด์ 25 (11@45°·01@135°·00@225°·10@315°) ③ label pcmStepper "ระดับ ×4" → "ระดับ ×2/noise ÷4" ④ 34.83 → 34.84 dB (week4 exam ข้อ 6ค + exam.js) — บทเรียน 3 คลาสเขียนเป็น "กฎ QA เพิ่ม" ในหัวข้อมาตรฐานด้านบนแล้ว

**เสร็จเพิ่ม (2026-07-27): week6 การแผ่สเปกตรัม — บทแรกที่ไม่มีเลคเชอร์ทั้งบท**
- ⚠️ **คาบ 27 ก.ค. เรียนออนไลน์ kim ไม่ได้เข้า และ "หาไฟล์เสียงไม่ได้"** (ยืนยันแล้ว ไม่มี recording) → w6 ทั้งบท**เรียบเรียงจากสไลด์ล้วน ไม่มีกล่อง 🎙 เลย** ติดป้ายบอกที่หัวหน้า + ท้ายบท · kim อนุมัติแนวทางนี้
- ✅ **แก้ป้าย w5 สไลด์ 36–66** 4 จุด: "จะเติมกล่อง 🎙 เมื่อมีเลคเชอร์คาบต่อไป" (ไม่จริงแล้ว) → **"ไม่มีไฟล์เสียงคาบนี้"** (kim เลือกถ้อยคำนี้ เพราะไม่แน่ใจว่าอาจารย์สอนจบหรือยัง)
- ✅ **week6.astro ใหม่** (สไลด์ 1–53, 27 sections): ทำไมต้องแผ่ · 🎬 สายโซ่ · ข้อดี 3 ข้อสไลด์ 5 · FHSS หลักการ/ระบบ/MFSK ช้า-เร็ว/ทนแจม · DSSS XOR/BPSK/สเปกตรัม · CDMA หลักการ/ตาราง 7.1/📝 โจทย์สไลด์ 30 · PN + คุณสมบัติ 3 ข้อ · 🎬 LFSR · m-sequence 4 ข้อ + R(τ) · Gold · 🧪 Walsh · OVSF · multiple spreading 2 ชั้น · 📝 ประเมินรหัส 15 บิต · 🌍 ของจริง · คิดไว · โค้ด · ข้อสอบ 5 ข้อ · เช็กเข้าใจ 8 ข้อ · สรุป
  - interactive 7 ชิ้น (`public/js/week6.js`): chainStepper6 · **fhStepper** (กริด 16 ช่อง = 4 แถบ × 4 โทน เล่น slow/fast) · dsssStepper · cdmaStepper (ตาราง 7.1 ครบ 5 กรณี) · lfsrStepper (15 สถานะ) · **walshLab** (สร้าง W2→W16 + เลือกคู่แถวดู cross-corr) · **pnLab** (พิมพ์รหัสเองแล้วตรวจ สมดุล/รัน/สหสัมพันธ์ + กราฟ R(τ))
  - walkthrough 4 ชุด: โจทย์ CDMA สไลด์ 30 (7 ขั้น) · ประเมินรหัส 15 บิต (9 ขั้น) · FHSS ช้า/เร็ว (7 ขั้น) · Walsh (6 ขั้น)
- ✅ **ตัวเลข verify ด้วย node 51 ค่า + ข้อสอบอีก 5 ชุด** (`verify-w6.js`, `verify-exam6.js` ใน scratchpad) — ค่าหลัก: โจทย์สไลด์ 30 → อากาศ (0,+2,−2,0) ถอด A ได้ **−4 = บิต 0** · ตาราง 7.1 = **6/−6/0/2/8** · LFSR x⁴+x+1 seed 1000 → **000100110101111** · รหัสสไลด์ 51 = ลำดับนั้น**หมุน 3 ตำแหน่ง**พอดี (ค้นพบเอง) · R(τ≠0) = −1/15 · W₈ ตั้งฉากครบ 28 คู่
- ✅ **QA ตามกฎ 3 ข้อครบ:** เปิดภาพสไลด์ 12/13/16 ซูม 200–250% เทียบ**ทีละคอลัมน์/ทีละชิป** → slow FH 10 ช่อง `1,3,12,15,7,5,10,8,0,3` · fast FH 20 ช่อง · PN 32 ชิปสไลด์ 16 ตรงหมด · **เจอ 2 จุดหลุดแก้แล้ว**: ① ค่าคาดหวังที่พิมพ์จากสายตาผิด (คอลัมน์ 5–6 สลับ) — โมเดลถูก ② ป้าย `B₀⊕B₁` ใน lfsrStepper ทับเส้นป้อนกลับ · Playwright: 8 หน้า × 2 ธีม console error = 0, กดปุ่มครบ, มือถือ 360px ไม่ล้น (แก้ `<select>` กว้างเกินจอ)
- ✅ conceptmap เพิ่มคอลัมน์ W6 (6 โหนด เขียว #4ec9b0 + เส้นข้าม ask5→fh6/ds6, mux→cdma6, fade4→ss6) · exam.js BANK 28→**33 ข้อ** · โหมดสุ่มเป็น 18/12 ข้อ · การ์ดหน้าแรก + WeekNav + /exam เป็น 6 สัปดาห์
- 📌 **ส่วนเสริมที่ kim อนุมัติให้ใส่ (ติดป้าย `.plus` ทุกจุด):** โลกจริง Wi-Fi/Bluetooth/GPS/3G · **Processing gain G_p = W_s/W_d = 10log(k)** (สไลด์ไม่มีสูตรนี้ตรง ๆ) · ข้อสอบจำลอง 5 ข้อแต่งเอง

**เหลือทำ:**
1. ให้ kim รีวิวเว็บจริงทั้ง 6 สัปดาห์ ว่าถึงมาตรฐาน "ละเอียดกว่าอาจารย์+สไลด์" แล้วปรับตาม feedback
2. ❓ **ถามเพื่อนเรื่องคาบ 27 ก.ค.** — (ก) สอนถึงไหน (จบ w5 แล้วต่อ w6 หรือขึ้น w6 เลย) (ข) **มีการบ้านครั้งที่ 4 ไหม** kim บอกว่า "ถ้ามีเดี๋ยวมาบอก" → ค่อยแปะเข้า week6 ทีหลัง (ทำแบบเดียวกับ hw2/hw3 ได้)
3. ~~เฉลย "การบ้าน 2 ตาราง"~~ — **ปิดเรื่องนี้แล้ว (kim ตัดสิน 27 ก.ค.)**: เว็บมีเฉลยพร้อมเหตุผลของเราเองครบทั้ง 2 ตารางอยู่แล้ว (`week2.astro:560`, `week3.astro:200`) เป็นคำตอบตายตัว ไม่ต้องรอเฉลยอาจารย์
4. ⚠️ ถ้า kim อัดเสียงคาบต่อไป **เช็กว่าไฟล์ยาวจริงก่อนปิดเครื่อง** (บทเรียนจากไฟล์ 14 วินาที) · และถ้าเรียนออนไลน์ **เช็กว่ามี recording ไหมทันทีหลังคาบ** (บทเรียนจากคาบ 27 ก.ค. ที่หาไม่ได้แล้ว)

**ถอดเสียง: ✅ เสร็จครบแล้ว (2026-07-04) — อยู่ใน `transcripts/` (w2_1, w2_2, w3 มีทั้ง .txt และ .segments.txt)**
- ทำผ่าน **Groq API** (ฟรี, whisper-large-v3 / -turbo): local CPU ช้าเกิน (`small` = ผลมั่วใช้ไม่ได้, `medium` = 0.15x realtime)
- สูตรที่ใช้ได้: loudnorm → mp3 mono 16kHz 32kbps → **หั่นท่อนละ 10 นาที** (ไฟล์ยาว 56 นาทีทั้งก้อนโดน Internal Server Error) → ยิงทีละท่อน → merge + เลื่อน timestamp (สคริปต์เก็บใน scratchpad ของ session 2026-07-04)
- โควตาฟรี large-v3 ชนง่าย → fallback เป็น `whisper-large-v3-turbo` (โควตาแยก คุณภาพใกล้กัน)
- คุณภาพ transcript: ตามเนื้อหาได้จริง แต่คำเพี้ยนประปราย ช่วงต้นคาบ/เสียงคุยเพี้ยนหนัก → **ใช้เป็นตัวบอกว่าอาจารย์เน้น/ยกตัวอย่างอะไร แล้วเทียบสไลด์เสมอ ห้ามลอกคำเพี้ยนลงเว็บ**
⚠️ **บทเรียน pkill:** อย่าใส่ `pkill/pgrep -f` ในคำสั่งเดียวกับที่มีคำว่า `transcribe.py`/`whisper` (จะ match+ฆ่า shell ตัวเอง) — ใช้ regex bracket หรือแยกคำสั่ง
**รันเว็บ:** `npm run dev` → `http://localhost:4321/wireless/`
