#!/usr/bin/env bash
set -euo pipefail

# Generate a storyboard image set with local Stable Diffusion
# (stable-diffusion.cpp sd-cli, no API key, all offline).
#
# Batch convention (mirrors vo/NN-name.txt):
#   videos/<video-id>/images/*.txt      one prompt per image, any multiline text.
#                                      basename = output name (01-hook.txt -> 01-hook.png).
#                                      files starting with _ are config, never prompts.
#   videos/<video-id>/images/_style.txt    (optional) appended to EVERY prompt.
#                                      shared artist/lighting/palette anchor = the
#                                      storyboard consistency trick (same style +
#                                      same seed -> related images, not slides).
#   videos/<video-id>/images/_negative.txt (optional) batch negative prompt for all.
#   videos/<video-id>/images/_config       (optional) KEY=VALUE defaults, # comments ok:
#                                      PRESET MODEL VAE WIDTH HEIGHT STEPS CFG
#                                      SAMPLER SCHEDULER SEED SD_BIN EXTRA_ARGS
#
# Model selection is automatic: the user gives ONLY prompts, make-videos
# decides model + settings per prompt (PRESET=auto, the default).
#   photo      people, faces, close-ups -> Realistic Vision SD1.5
#              (768x512, ~24 steps, CFG 7, VAE). Photorealistic portraits,
#              yogis, devotees, goddesses, crowds.
#   cinematic  everything else -> SDXL-lightning 4-step (1344x768, 6 steps,
#              CFG 1.5). Fast 5-10 image batches: temples, skies, halls,
#              environments, stylized/painted/statue/silhouette renderings.
# Force one preset for the whole batch with PRESET=cinematic|photo, or force
# one model with MODEL=<path or bare filename> (settings are then inferred
# from the model file). Explicit WIDTH/HEIGHT/STEPS/CFG/SAMPLER always win
# over whatever was auto-selected.
#
# Output: videos/<video-id>/assets/*.png (source of truth) + synced to
#   public/<video-id>/assets/ — the same dirs generate-vo.sh syncs, so the
#   existing render pipeline picks images up with zero changes.
#
# Usage:
#   ./scripts/generate-images.sh <video-id> [--force] [--dry-run]
# Example:
#   ./scripts/generate-images.sh my-video
#   SEED=random ./scripts/generate-images.sh my-video --force
#   PRESET=photo ./scripts/generate-images.sh my-video   # force portraits
#   WIDTH=1216 HEIGHT=704 ./scripts/generate-images.sh my-video  # force size
#
# Env vars override _config. SEED is shared across the whole batch on purpose
# (same noise + same style = coherent set); set SEED=random for variety.
# Skips images whose .png already exists unless --force.

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VIDEO_ID="${1:?usage: generate-images.sh <video-id> [--force] [--dry-run]}"
shift || true

FORCE=0
DRYRUN=0
for arg in "$@"; do
  case "${arg}" in
    --force) FORCE=1 ;;
    --dry-run) DRYRUN=1 ;;
    *) echo "Unknown option: ${arg}" >&2; exit 1 ;;
  esac
done

IMG_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/images"
ASSET_DIR="${PROJECT_DIR}/videos/${VIDEO_ID}/assets"
PUB_DIR="${PROJECT_DIR}/public/${VIDEO_ID}/assets"

if [[ ! -d "${IMG_DIR}" ]]; then
  echo "ERROR: no prompts at ${IMG_DIR}" >&2
  echo "Create it: mkdir -p ${IMG_DIR} + write <name>.txt prompts (see script header)." >&2
  exit 1
fi

# ---- config file (project defaults) ----
declare -A cfg=()
if [[ -f "${IMG_DIR}/_config" ]]; then
  while IFS='=' read -r key val; do
    key="${key%%[[:space:]]*}"; val="${val##[[:space:]]}"
    [[ -z "${key}" || "${key}" == \#* ]] && continue
    cfg["${key}"]="${val}"
  done < "${IMG_DIR}/_config"
fi
pick() { # $1=name $2=fallback -> startup-env > _config > fallback
  if [[ -n "${OVR[$1]:-}" ]]; then printf '%s' "${OVR[$1]}";
  elif [[ -n "${cfg[$1]:-}" ]]; then printf '%s' "${cfg[$1]}";
  else printf '%s' "$2"; fi
}
# Snapshot the environment ONCE: per-image picks run in $(...) subshells that
# inherit the previous iteration's WIDTH/HEIGHT/..., which must NOT look like
# user overrides. OVR holds only what was set before this script assigned.
declare -A OVR=()
for _k in PRESET MODEL VAE WIDTH HEIGHT STEPS CFG SAMPLER SCHEDULER SEED SD_BIN EXTRA_ARGS; do
  [[ -n "${!_k:-}" ]] && OVR["${_k}"]="${!_k}"
done
unset _k

SD_BIN="$(pick SD_BIN "${HOME}/stable-diffusion.cpp/build/bin/sd-cli")"
MODEL_DIR=/mnt/data/models

# ---- automatic model selection: prompts in, settings out ----
PRESET_CFG="$(pick PRESET auto)"
[[ "${PRESET_CFG}" == "photoreal" || "${PRESET_CFG}" == "realistic" ]] && PRESET_CFG="photo"
case "${PRESET_CFG}" in
  auto|cinematic|photo) ;;
  *) echo "ERROR: unknown PRESET=${PRESET_CFG} (want auto|cinematic|photo)" >&2; exit 1 ;;
esac
FORCED_MODEL="$(pick MODEL "")"
[[ -n "${FORCED_MODEL}" && "${FORCED_MODEL}" != */* ]] && FORCED_MODEL="${MODEL_DIR}/${FORCED_MODEL}"

preset_defaults() { # $1=photo|cinematic -> P_MODEL P_VAE P_W P_H P_STEPS P_CFG P_SAMPLER P_SCHEDULER
  case "$1" in
    photo)
      P_MODEL="${MODEL_DIR}/Realistic_Vision_V6.0_NV_B1_fp16.safetensors"
      P_VAE="${MODEL_DIR}/vae-ft-mse-840000-ema-pruned.safetensors"
      P_W=768; P_H=512; P_STEPS=24; P_CFG=7; P_SAMPLER=euler_a; P_SCHEDULER="";;
    *)
      P_MODEL="${MODEL_DIR}/sdxl_lightning_4step.q8_0.gguf"
      P_VAE=""; P_W=1344; P_H=768; P_STEPS=6; P_CFG=1.5; P_SAMPLER=euler; P_SCHEDULER="";;
  esac
}

classify_prompt() { # $1=prompt text -> photo|cinematic
  local t="$1"
  # stylized renderings stay on the fast SDXL model even with people in them
  if grep -qiE 'painting|illustration|drawing|sketch|statue|sculpture|silhouette|anime|cartoon|watercolor|digital art|3d render' <<<"${t}"; then
    printf 'cinematic'; return
  fi
  if grep -qiE 'portrait|close-up|closeup|close up|face|person|people|man|woman|girl|boy|child|baby|family|crowd|devotee|pilgrim|yogi|meditat|priest|sadhu|dancer|goddess|deity|human|skin|eyes|smile' <<<"${t}"; then
    printf 'photo'; return
  fi
  printf 'cinematic'
}

infer_model_preset() { # $1=model path -> photo|cinematic (settings for a forced MODEL)
  local m="${1,,}"
  if [[ "${m}" == *realistic* || "${m}" == *vision* || "${m}" == *"1.5"* || "${m}" == *sd15* ]]; then
    printf 'photo'; return
  fi
  printf 'cinematic'
}

resolve_preset() { # $1=prompt body -> preset for this image
  case "${PRESET_CFG}" in
    cinematic|photo) printf '%s' "${PRESET_CFG}"; return ;;
  esac
  if [[ -n "${FORCED_MODEL}" ]]; then infer_model_preset "${FORCED_MODEL}"; return; fi
  classify_prompt "$1"
}

if [[ "${DRYRUN}" == "0" ]]; then
  [[ -x "${SD_BIN}" ]] || { echo "ERROR: sd-cli not found at ${SD_BIN}" >&2; exit 1; }
fi

# ---- shared texts ----
clean() { grep -v '^[[:space:]]*#' "$1" 2>/dev/null | sed '/^[[:space:]]*$/d' | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g; s/^ //; s/ $//'; }
STYLE=""; [[ -f "${IMG_DIR}/_style.txt" ]] && STYLE="$(clean "${IMG_DIR}/_style.txt")"
NEGATIVE="blurry, low quality, worst quality, jpeg artifacts, watermark, text, logo, deformed, disfigured, extra limbs, extra fingers, bad anatomy"
[[ -f "${IMG_DIR}/_negative.txt" ]] && NEGATIVE="$(clean "${IMG_DIR}/_negative.txt")"
NEG_FILE="$(mktemp)"; printf '%s' "${NEGATIVE}" > "${NEG_FILE}"
trap 'rm -f "${NEG_FILE}"' EXIT

mkdir -p "${ASSET_DIR}" "${PUB_DIR}"

shopt -s nullglob
prompts=()
for f in "${IMG_DIR}"/*.txt; do
  base="$(basename "${f}")"
  [[ "${base}" == _* ]] && continue
  prompts+=("${f}")
done

if [[ "${#prompts[@]}" == "0" ]]; then
  echo "ERROR: no prompt files in ${IMG_DIR} (only _config/_style/_negative matched)" >&2
  exit 1
fi

SEED="$(pick SEED 42)"         # fixed + shared = coherent storyboard; "random" = variety
EXTRA_ARGS="$(pick EXTRA_ARGS "")"

if [[ "${PRESET_CFG}" == "auto" && -z "${FORCED_MODEL}" ]]; then
  echo "Preset:  auto (per-prompt: photo=Realistic Vision, cinematic=SDXL-lightning)"
else
  echo "Preset:  ${PRESET_CFG}${FORCED_MODEL:+ model=$(basename "${FORCED_MODEL}")} (forced for batch)"
fi
echo "Seed:    ${SEED}"
echo "Style:   ${STYLE:-<none>}"
echo "Negative: ${NEGATIVE:0:100}..."
echo "Batch:   ${#prompts[@]} prompts -> ${ASSET_DIR}/ (+ sync ${PUB_DIR}/)"
echo ""

made=()
for prompt_file in "${prompts[@]}"; do
  name="$(basename "${prompt_file}" .txt)"
  out="${ASSET_DIR}/${name}.png"
  if [[ -f "${out}" && "${FORCE}" == "0" ]]; then
    echo "skip  ${name} (exists, --force to redo)"
    continue
  fi
  body="$(clean "${prompt_file}")"
  preset="$(resolve_preset "${body}")"
  preset_defaults "${preset}"
  MODEL="${FORCED_MODEL:-${P_MODEL}}"
  VAE="$(pick VAE "${P_VAE}")"
  [[ -n "${VAE}" && "${VAE}" != */* ]] && VAE="${MODEL_DIR}/${VAE}"
  WIDTH="$(pick WIDTH "${P_W}")"
  HEIGHT="$(pick HEIGHT "${P_H}")"
  STEPS="$(pick STEPS "${P_STEPS}")"
  CFG="$(pick CFG "${P_CFG}")"
  SAMPLER="$(pick SAMPLER "${P_SAMPLER}")"
  SCHEDULER="$(pick SCHEDULER "${P_SCHEDULER}")"
  full="${body}${STYLE:+ ${STYLE}}"
  seed_arg="${SEED}"
  [[ "${SEED}" == "random" ]] && seed_arg="-1"
  prompt_tmp="$(mktemp)"
  printf '%s' "${full}" > "${prompt_tmp}"
  # shellcheck disable=SC2086
  cmd=("${SD_BIN}" -m "${MODEL}" -o "${out}"
    --prompt-file "${prompt_tmp}" --negative-prompt-file "${NEG_FILE}"
    -W "${WIDTH}" -H "${HEIGHT}" --steps "${STEPS}"
    --cfg-scale "${CFG}" --sampling-method "${SAMPLER}" -s "${seed_arg}")
  [[ -n "${VAE}" ]] && cmd+=(--vae "${VAE}")
  [[ -n "${SCHEDULER}" ]] && cmd+=(--scheduler "${SCHEDULER}")
  [[ -n "${EXTRA_ARGS}" ]] && cmd+=(${EXTRA_ARGS})
  if [[ "${DRYRUN}" == "1" ]]; then
    echo "would generate ${name} [${preset} ${WIDTH}x${HEIGHT} s${STEPS} cfg${CFG}]: ${full:0:100}..."
    rm -f "${prompt_tmp}"
    continue
  fi
  [[ -f "${MODEL}" ]] || { echo "ERROR: model not found: ${MODEL}" >&2; rm -f "${prompt_tmp}"; exit 1; }
  [[ -z "${VAE}" || -f "${VAE}" ]] || { echo "ERROR: vae not found: ${VAE}" >&2; rm -f "${prompt_tmp}"; exit 1; }
  echo "gen   ${name} [${preset} ${WIDTH}x${HEIGHT} s${STEPS} cfg${CFG}] (${body:0:60}...)"
  if "${cmd[@]}" >/dev/null 2>&1 && [[ -s "${out}" ]]; then
    made+=("${out}")
    cp -f "${out}" "${PUB_DIR}/"
  else
    echo "ERROR: failed on ${name} — rerun with --dry-run to inspect, or check VRAM." >&2
    rm -f "${prompt_tmp}"
    exit 1
  fi
  rm -f "${prompt_tmp}"
done

echo ""
echo "Done: ${#made[@]} new, $(( ${#prompts[@]} - ${#made[@]} )) skipped/existing."
if [[ "${#made[@]}" -gt "0" ]]; then
  printf '  %s\n' "${made[@]}"
fi
echo "Next: reference staticFile('${VIDEO_ID}/assets/<name>.png') via PhotoSlide, then ./render.sh <Comp> --still"
