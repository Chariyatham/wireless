#!/usr/bin/env python3
"""ถอดเสียงเลคเชอร์ผ่าน Groq API (whisper-large-v3, ฟรี) — ใช้ได้กับทุกวิชา

วิธีใช้:  python3 tools/transcribe_groq.py <ไฟล์เสียง.m4a> [ไฟล์อื่นๆ ...]
ผลลัพธ์: transcripts/<ชื่อ>.txt (ข้อความล้วน) + transcripts/<ชื่อ>.segments.txt (มี timestamp)

key: อ่านจาก env GROQ_API_KEY หรือไฟล์ ~/.config/groq.key (ห้ามเอา key ใส่ใน repo!)
ต้องมี: ffmpeg, ffprobe, curl (มีในเครื่องอยู่แล้ว)

บทเรียนที่ฝังในสคริปต์นี้ (จากโปรเจกต์ wireless):
- เสียงห้องเรียนเบามาก → ต้อง loudnorm ก่อนเสมอ
- ไฟล์ยาว 50+ นาทีทั้งก้อนโดน Internal Server Error → หั่นท่อนละ 10 นาที
- โควตาฟรี whisper-large-v3 ชนง่าย → fallback เป็น -turbo (โควตาแยก คุณภาพใกล้กัน)
"""
import json, os, subprocess, sys, tempfile, time
from pathlib import Path

API = "https://api.groq.com/openai/v1/audio/transcriptions"
CHUNK_SEC = 600
OUT = Path("transcripts"); OUT.mkdir(exist_ok=True)


def key():
    k = os.environ.get("GROQ_API_KEY", "").strip()
    if not k:
        f = Path.home() / ".config" / "groq.key"
        if f.exists():
            k = f.read_text().strip()
    if not k:
        sys.exit("ไม่พบ key: ตั้ง env GROQ_API_KEY หรือสร้างไฟล์ ~/.config/groq.key")
    return k


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def dur(p):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=noprint_wrappers=1:nokey=1", str(p)]).stdout.strip()
    return float(out)


def transcribe_chunk(mp3, k):
    for attempt, model in enumerate(["whisper-large-v3", "whisper-large-v3",
                                     "whisper-large-v3-turbo", "whisper-large-v3-turbo"]):
        r = subprocess.run(
            ["curl", "-sS", API, "-H", f"Authorization: Bearer {k}",
             "-F", f"file=@{mp3}", "-F", f"model={model}", "-F", "language=th",
             "-F", "temperature=0", "-F", "response_format=verbose_json"],
            capture_output=True, text=True)
        try:
            data = json.loads(r.stdout)
        except json.JSONDecodeError:
            data = {}
        if isinstance(data.get("segments"), list):
            print(f"    [ok] {Path(mp3).name} ({model})", flush=True)
            return data["segments"]
        msg = (data.get("error") or {}).get("message", r.stdout[:80])
        print(f"    [fail#{attempt+1}] {Path(mp3).name}: {msg[:90]}", flush=True)
        time.sleep(12)
    return None


def process(src, k):
    stem = Path(src).stem
    print(f"[{stem}] เตรียมเสียง (loudnorm → mp3 16k mono 32kbps → หั่น {CHUNK_SEC//60} นาที/ท่อน)", flush=True)
    with tempfile.TemporaryDirectory() as td:
        norm = Path(td) / "norm.mp3"
        run(["ffmpeg", "-y", "-i", str(src), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
             "-ar", "16000", "-ac", "1", "-b:a", "32k", str(norm)])
        run(["ffmpeg", "-y", "-i", str(norm), "-f", "segment",
             "-segment_time", str(CHUNK_SEC), "-c", "copy", str(Path(td) / "part_%03d.mp3")])
        parts = sorted(Path(td).glob("part_*.mp3"))
        print(f"[{stem}] {len(parts)} ท่อน — เริ่มถอด", flush=True)
        plain, seg_lines, offset, missing = [], [], 0.0, 0
        for p in parts:
            segs = transcribe_chunk(p, k)
            if segs is None:
                missing += 1
                print(f"    [WARN] {p.name}: ถอดไม่สำเร็จ ข้ามท่อนนี้", flush=True)
            else:
                for s in segs:
                    txt = s["text"].strip()
                    if not txt:
                        continue
                    a, b = s["start"] + offset, s["end"] + offset
                    plain.append(txt)
                    seg_lines.append(f"[{a:7.1f}->{b:7.1f}] {txt}")
            offset += dur(p)
            time.sleep(3)
    (OUT / f"{stem}.txt").write_text("\n".join(plain) + "\n", encoding="utf-8")
    (OUT / f"{stem}.segments.txt").write_text("\n".join(seg_lines) + "\n", encoding="utf-8")
    print(f"[{stem}] เสร็จ: {len(plain)} ประโยค, เสียง {offset/60:.0f} นาที, ท่อนที่หาย {missing} → transcripts/{stem}.txt", flush=True)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    k = key()
    for f in sys.argv[1:]:
        if not Path(f).exists():
            print(f"[skip] ไม่พบไฟล์ {f}", flush=True); continue
        process(f, k)
    print("[ALL DONE]", flush=True)
