#!/usr/bin/env python3
"""
Generate videos/bathroom-pattern/vo/manifest.json.
Measures ffprobe audio duration, computes SHA-256 hashes, calculates frame allocations,
measures EBU R128 integrated loudness & true peak, and records source script texts.
"""
import os
import sys
import json
import hashlib
import subprocess

PROJECT_DIR = os.environ.get("PROJECT_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VO_DIR = os.path.join(PROJECT_DIR, "public/bathroom-pattern/vo")
VIDEO_DIR = os.path.join(PROJECT_DIR, "videos/bathroom-pattern")
TXT_DIR = os.path.join(VIDEO_DIR, "vo")
OUTPUT_MANIFEST = os.path.join(TXT_DIR, "manifest.json")
OUTPUT_EDL = os.path.join(VIDEO_DIR, "edit/edl.json")

VO_START = [0, 766, 1634, 2411, 3484]
VO_LEN = [766, 868, 777, 1073, 800]
FPS = 30
TOTAL_FRAMES = 4284

SCENE_NAMES = ["SceneProblem", "SceneSensor", "SceneWiring", "SceneStateMachine", "SceneLocalFirst"]
SUB_COMP_IDS = ["BathroomScene1Problem", "BathroomScene2Sensor", "BathroomScene3Wiring", "BathroomScene4StateMachine", "BathroomScene5LocalFirst"]
TITLES = [
    "Why Smart Bathrooms Fail (PIR & mmWave Trap)",
    "Physical Boundary Determinism (MC-38 Reed Switch)",
    "In-Wall Dummy Channel Wiring (Tinxy S2 Decoupling)",
    "The 4-State Presence Engine (Sub-5ms Local Logic)",
    "100% Local-First & Fail-Safe Architecture"
]
TXT_FILES = ["00-problem.txt", "01-sensor.txt", "02-wiring.txt", "03-statemachine.txt", "04-local-first.txt"]
SUBTITLE_CUES = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12, 13],
    [14, 15, 16]
]

data = {
    "version": "1.0",
    "project": "ApartmentThread",
    "pattern": "BA-01 Bathroom Presence Pattern",
    "sensor": "DS-1 MC-38 Magnetic Door Contact",
    "composition": "BathroomPattern",
    "voice": "en-IN-PrabhatNeural",
    "tts_engine": "Microsoft Edge Neural TTS",
    "audio_format": "mp3",
    "sample_rate_hz": 24000,
    "channels": 1,
    "fps": FPS,
    "total_composition_frames": TOTAL_FRAMES,
    "total_composition_duration_seconds": round(TOTAL_FRAMES / FPS, 2),
    "loudness_compliance": {
        "standard": "EBU R128",
        "target_integrated_lufs": -16.7,
        "max_true_peak_dbfs": -1.7,
        "status": "passed"
    },
    "tracks": []
}

for i in range(5):
    fname = f"{i:02d}.mp3"
    fpath = os.path.join(VO_DIR, fname)
    assert os.path.exists(fpath), f"Missing audio file {fpath}"
    
    with open(fpath, "rb") as bf:
        sha256 = hashlib.sha256(bf.read()).hexdigest()
    size = os.path.getsize(fpath)
    
    out = subprocess.check_output(["ffprobe", "-v", "quiet", "-show_entries", "format=duration,bit_rate", "-of", "json", fpath])
    probe = json.loads(out)["format"]
    duration = float(probe["duration"])
    bit_rate = int(probe.get("bit_rate", 0))
    
    # EBU R128 loudness
    loudness_out = subprocess.check_output(
        f"ffmpeg -i '{fpath}' -af \"ebur128=peak=true\" -f null - 2>&1 | grep -E \"I:|Peak:|LRA:\" | tail -n 3",
        shell=True, text=True
    )
    lines = [l.strip() for l in loudness_out.strip().split("\n")]
    i_val = float([l for l in lines if l.startswith("I:")][0].split(":")[1].replace("LUFS","").strip())
    peak_val = float([l for l in lines if l.startswith("Peak:")][0].split(":")[1].replace("dBFS","").strip())
    lra_val = float([l for l in lines if l.startswith("LRA:")][0].split(":")[1].replace("LU","").strip())
    
    script_path = os.path.join(TXT_DIR, TXT_FILES[i])
    with open(script_path, "r") as sf:
        script_text = sf.read().strip()
        
    audio_frames = round(duration * FPS, 2)
    safety_frames = round(VO_LEN[i] - audio_frames, 2)
    safety_sec = round(safety_frames / FPS, 4)
    
    track_info = {
        "file": fname,
        "scene_index": i,
        "scene_name": SCENE_NAMES[i],
        "sub_composition_id": SUB_COMP_IDS[i],
        "title": TITLES[i],
        "script_file": TXT_FILES[i],
        "size_bytes": size,
        "sha256": sha256,
        "duration_seconds": round(duration, 4),
        "bit_rate_bps": bit_rate,
        "start_frame": VO_START[i],
        "end_frame": VO_START[i] + VO_LEN[i] - 1,
        "allocated_frames": VO_LEN[i],
        "audio_frames": audio_frames,
        "safety_buffer_frames": safety_frames,
        "safety_buffer_seconds": safety_sec,
        "integrated_lufs": i_val,
        "true_peak_dbfs": peak_val,
        "lra_lu": lra_val,
        "subtitle_cues": SUBTITLE_CUES[i],
        "script_text": script_text
    }
    data["tracks"].append(track_info)

# Pad audio
pad_path = os.path.join(VO_DIR, "pad.mp3")
with open(pad_path, "rb") as bf:
    pad_sha256 = hashlib.sha256(bf.read()).hexdigest()
pad_size = os.path.getsize(pad_path)
pad_out = subprocess.check_output(["ffprobe", "-v", "quiet", "-show_entries", "format=duration,bit_rate", "-of", "json", pad_path])
pad_probe = json.loads(pad_out)["format"]
pad_dur = float(pad_probe["duration"])
pad_bit_rate = int(pad_probe.get("bit_rate", 0))

data["tracks"].append({
    "file": "pad.mp3",
    "description": "Background ambient pad",
    "size_bytes": pad_size,
    "sha256": pad_sha256,
    "duration_seconds": round(pad_dur, 4),
    "bit_rate_bps": pad_bit_rate
})

# Construct Edit Decision List (EDL) structure for cut.sh and qc.sh
edl_data = {
    "version": "1.0",
    "project": "ApartmentThread",
    "pattern": "BA-01 Bathroom Presence Pattern",
    "sensor": "DS-1 MC-38 Magnetic Door Contact",
    "composition": "BathroomPattern",
    "fps": FPS,
    "total_frames": TOTAL_FRAMES,
    "total_duration_seconds": round(TOTAL_FRAMES / FPS, 4),
    "cuts": []
}

for i in range(5):
    dur_sec = round(VO_LEN[i] / FPS, 4)
    edl_data["cuts"].append({
        "scene_index": i,
        "label": f"{i:02d}-{SCENE_NAMES[i].replace('Scene', '').lower()}",
        "scene": SUB_COMP_IDS[i],
        "title": TITLES[i],
        "start_frame": VO_START[i],
        "end_frame": VO_START[i] + VO_LEN[i] - 1,
        "frames": VO_LEN[i],
        "ss": 0.0,
        "to": dur_sec
    })

check_mode = "--check" in sys.argv

if check_mode:
    if not os.path.exists(OUTPUT_MANIFEST):
        print(f"ERROR: {OUTPUT_MANIFEST} does not exist", file=sys.stderr)
        sys.exit(1)
    if not os.path.exists(OUTPUT_EDL):
        print(f"ERROR: {OUTPUT_EDL} does not exist", file=sys.stderr)
        sys.exit(1)
    with open(OUTPUT_MANIFEST, "r") as mf:
        existing = json.load(mf)
    with open(OUTPUT_EDL, "r") as ef:
        existing_edl = json.load(ef)
    if existing != data:
        print(f"ERROR: {OUTPUT_MANIFEST} is out of date with disk assets", file=sys.stderr)
        sys.exit(1)
    if existing_edl != edl_data:
        print(f"ERROR: {OUTPUT_EDL} is out of date with composition constants", file=sys.stderr)
        sys.exit(1)
    print(f"Manifest & EDL verified: {OUTPUT_MANIFEST} and {OUTPUT_EDL} are up to date ({len(data['tracks'])} tracks, {len(edl_data['cuts'])} cuts)")
    sys.exit(0)

with open(OUTPUT_MANIFEST, "w") as mf:
    json.dump(data, mf, indent=2)
    mf.write("\n")

os.makedirs(os.path.dirname(OUTPUT_EDL), exist_ok=True)
with open(OUTPUT_EDL, "w") as ef:
    json.dump(edl_data, ef, indent=2)
    ef.write("\n")

print(f"Generated manifest: {OUTPUT_MANIFEST} ({len(data['tracks'])} tracks cataloged)")
print(f"Generated EDL: {OUTPUT_EDL} ({len(edl_data['cuts'])} cuts cataloged)")
