#!/usr/bin/env bash
# Render a Stitch "Code to Clipboard" HTML export to a PNG with headless Chrome (macOS).
#
# Usage:
#   bash render-stitch-html.sh CODE.html HEIGHT OUT.png
#
# HEIGHT = the "1280 x H" label Stitch shows under the selected screen. If unknown,
# pass a tall value (e.g. 3000) and inspect: app-shell pages use h-screen, so
# trimming whitespace afterwards does not work.
# Override the browser with $CHROME; width/scale with $WIDTH / $SCALE.
set -euo pipefail

html="${1:?usage: render-stitch-html.sh CODE.html HEIGHT OUT.png}"
height="${2:?missing HEIGHT}"
out="${3:?missing OUT.png}"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
width="${WIDTH:-1280}"
scale="${SCALE:-1.25}"

[[ -f "$html" ]] || { echo "error: $html not found" >&2; exit 1; }
[[ -x "$chrome" ]] || { echo "error: Chrome not found at $chrome (set \$CHROME)" >&2; exit 1; }

abs_html="$(cd "$(dirname "$html")" && pwd)/$(basename "$html")"
mkdir -p "$(dirname "$out")"
abs_out="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")"

# Throwaway profile: never touch the user's real Chrome profile.
profile="$(mktemp -d "${TMPDIR:-/tmp}/stitch-render.XXXXXX")"
trap 'rm -rf "$profile"' EXIT

"$chrome" --headless=new --disable-gpu --hide-scrollbars \
  --user-data-dir="$profile" \
  --window-size="${width},${height}" \
  --force-device-scale-factor="$scale" \
  --virtual-time-budget=8000 \
  --screenshot="$abs_out" \
  "file://$abs_html" >/dev/null 2>&1

[[ -s "$abs_out" ]] || { echo "error: no screenshot written" >&2; exit 1; }
w=$(sips -g pixelWidth "$abs_out" | awk '/pixelWidth/{print $2}')
h=$(sips -g pixelHeight "$abs_out" | awk '/pixelHeight/{print $2}')
echo "saved $abs_out (${w}x${h})"
