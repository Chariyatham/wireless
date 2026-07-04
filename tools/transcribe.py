#!/usr/bin/env python3
"""ถอดเสียงเลคเชอร์ด้วย faster-whisper.
- normalize เสียง (loudnorm) ก่อน เพราะไฟล์เสียงเบา (mean ~ -35 dB)
- ปิด vad_filter (VAD ตัดเสียงเบาทิ้งหมด → transcript ว่าง)
- เรียงสั้น→ยาว เพื่อเห็นผลไฟล์แรกไว
"""
import os, time, subprocess
from pathlib import Path
from faster_whisper import WhisperModel

SRC = Path("เนื้อหาเรียน")
OUT = Path("transcripts"); OUT.mkdir(exist_ok=True)
TMP = Path("tools/_audio_tmp"); TMP.mkdir(parents=True, exist_ok=True)

FILES = ["w2_2.m4a", "w2_1.m4a", "w3.m4a"]
MODEL = os.environ.get("WHISPER_MODEL", "small")


def prep(src: Path, dst: Path):
    """ทำให้เสียงดังสม่ำเสมอ + 16k mono wav (ช่วยเสียงเบามาก)"""
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src),
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
         "-ar", "16000", "-ac", "1", str(dst)],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


print(f"[load] model={MODEL}", flush=True)
t0 = time.time()
model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=8)
print(f"[load] done {time.time()-t0:.0f}s", flush=True)

for name in FILES:
    src = SRC / name
    if not src.exists():
        print(f"[skip] {name} missing", flush=True); continue
    stem = Path(name).stem
    plain = OUT / f"{stem}.txt"
    seg_f = OUT / f"{stem}.segments.txt"
    if plain.exists() and plain.stat().st_size > 5:
        print(f"[skip] {name} already done", flush=True); continue

    wav = TMP / f"{stem}.wav"
    print(f"[prep] {name} → normalize loudness", flush=True)
    prep(src, wav)

    print(f"[start] {name}", flush=True)
    ts = time.time()
    segments, info = model.transcribe(
        str(wav), language="th", beam_size=1,
        condition_on_previous_text=False, vad_filter=False,
    )
    lp, ls = [], []
    n = 0
    for s in segments:
        lp.append(s.text.strip())
        ls.append(f"[{s.start:7.1f}->{s.end:7.1f}] {s.text.strip()}")
        n += 1
        if n % 40 == 0:
            print(f"  .. {name}: {s.end:.0f}/{info.duration:.0f}s audio | {n} segs | {time.time()-ts:.0f}s", flush=True)

    plain.write_text("\n".join(lp) + "\n", encoding="utf-8")
    seg_f.write_text("\n".join(ls) + "\n", encoding="utf-8")
    el = time.time() - ts
    chars = sum(len(x) for x in lp)
    print(f"[done] {name}: {n} segs, {chars} chars, audio {info.duration:.0f}s in {el:.0f}s ({info.duration/max(el,1):.2f}x realtime)", flush=True)

print("[ALL DONE]", flush=True)
