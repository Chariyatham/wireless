#!/usr/bin/env python3
"""ถอดเสียงเลคเชอร์ด้วย faster-whisper (medium, int8, ภาษาไทย).
เรียงจากไฟล์สั้นไปยาว เพื่อวัดความเร็วได้เร็ว. เขียน transcript ทีละไฟล์."""
import os, sys, time
from pathlib import Path
from faster_whisper import WhisperModel

SRC = Path("เนื้อหาเรียน")
OUT = Path("transcripts")
OUT.mkdir(exist_ok=True)

# เรียงสั้น→ยาว
FILES = ["w2_2.m4a", "w2_1.m4a", "w3.m4a"]
MODEL = os.environ.get("WHISPER_MODEL", "medium")

print(f"[load] model={MODEL} device=cpu compute=int8 threads={os.cpu_count()}", flush=True)
t0 = time.time()
model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 8)
print(f"[load] done in {time.time()-t0:.0f}s", flush=True)

for name in FILES:
    src = SRC / name
    if not src.exists():
        print(f"[skip] {name} not found", flush=True)
        continue
    stem = Path(name).stem
    plain = OUT / f"{stem}.txt"
    seg_f = OUT / f"{stem}.segments.txt"
    if plain.exists() and plain.stat().st_size > 0:
        print(f"[skip] {name} already transcribed", flush=True)
        continue
    print(f"[start] {name}", flush=True)
    ts = time.time()
    segments, info = model.transcribe(
        str(src), language="th", beam_size=5, vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
    )
    dur = info.duration
    lines_plain, lines_seg = [], []
    last = ts
    for s in segments:
        lines_plain.append(s.text.strip())
        lines_seg.append(f"[{s.start:7.1f} -> {s.end:7.1f}] {s.text.strip()}")
        # progress ทุก ~60 วินาทีของเสียง
        if s.end // 60 > (getattr(s, "_mark", 0)) and time.time() - last > 15:
            pct = 100 * s.end / dur if dur else 0
            print(f"  .. {name}: {s.end:.0f}/{dur:.0f}s audio ({pct:.0f}%) | {time.time()-ts:.0f}s elapsed", flush=True)
            last = time.time()
    plain.write_text("\n".join(lines_plain) + "\n", encoding="utf-8")
    seg_f.write_text("\n".join(lines_seg) + "\n", encoding="utf-8")
    el = time.time() - ts
    speed = dur / el if el else 0
    print(f"[done] {name}: audio {dur:.0f}s transcribed in {el:.0f}s ({speed:.2f}x realtime) -> {plain}", flush=True)

print("[ALL DONE]", flush=True)
