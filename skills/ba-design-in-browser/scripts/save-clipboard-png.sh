#!/usr/bin/env bash
# Save the PNG currently on the macOS clipboard to a file.
#
# Usage:
#   bash save-clipboard-png.sh --clear                  # step 1: clear clipboard (run BEFORE clicking "Copy PNG to clipboard")
#   bash save-clipboard-png.sh OUT.png [FRAME_W FRAME_H] # step 2: write clipboard PNG; optional size check
#
# Excalidraw's "Copy PNG to clipboard" exports at 2x scale, so the image should be
# roughly 2*FRAME_W x 2*FRAME_H. A mismatch (or no PNG) usually means the copy click
# missed and the clipboard still holds something stale.
set -euo pipefail

if [[ "${1:-}" == "--clear" ]]; then
  osascript -e 'set the clipboard to "x"'
  echo "clipboard cleared"
  exit 0
fi

out="${1:?usage: save-clipboard-png.sh OUT.png [FRAME_W FRAME_H] | --clear}"
mkdir -p "$(dirname "$out")"
abs="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")"

if ! osascript -e 'the clipboard as «class PNGf»' >/dev/null 2>&1; then
  echo "error: clipboard holds no PNG (did the copy click land?)" >&2
  exit 1
fi

osascript \
  -e "set f to open for access POSIX file \"$abs\" with write permission" \
  -e 'set eof f to 0' \
  -e 'write (the clipboard as «class PNGf») to f' \
  -e 'close access f'

w=$(sips -g pixelWidth "$abs" | awk '/pixelWidth/{print $2}')
h=$(sips -g pixelHeight "$abs" | awk '/pixelHeight/{print $2}')
echo "saved $abs (${w}x${h})"

if [[ $# -ge 3 ]]; then
  ew=$(( $2 * 2 )); eh=$(( $3 * 2 ))
  # allow 15% tolerance for export padding
  if (( w < ew * 85 / 100 || w > ew * 115 / 100 || h < eh * 85 / 100 || h > eh * 115 / 100 )); then
    echo "warning: expected ~${ew}x${eh} (2x frame); image may be stale" >&2
    exit 2
  fi
fi
