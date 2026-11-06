# Google Stitch: verified workflow

Verified on a real 11-screen run. Browser work uses the Claude in Chrome tools.

## Setup
- First visit: ToS with marketing/research boxes **pre-ticked**. Stop and ask; if authorized, untick both, then Continue.
- The new "design agent" mode can hang 5+ min on the first screen. Use the banner's **"Switch back"** to the classic experience (much faster).
- Classic mode: pick **"Web"** (default is "App") before submitting.

## Prompting
- Files in the project: `design/prompts/00-global.md` (platform/width, audience, style refs, fonts, status colors, decision-point component, "This will: ..." note on external-write buttons, required states) + one file per screen (`NN-page.md`) + `NN-page-fix.md` for corrections.
- Prepend the global prompt to the first screen only. Write in the UI's target language.
- ONE paragraph per prompt: the box is in an iframe, click it, type; newlines may submit. Submit with the arrow. ~1–2 min/screen.
- Always include **"Do not show any model name"** and the product's real integration mode (e.g. "integrates only via the user's local CLI; no webhooks").
- Stitch invents plausible details: specific AI model versions, webhook/API integrations, "tech lead"/"architect" approvers, Merkle trees, extra buttons. After every export, grep the HTML for such terms and compare against the spec:
  `grep -n -i -E "gpt|claude|gemini|webhook|api key|tech lead|architect|merkle" design/code/NN-page.html`

## Canvas gotchas
- A screen chip in the input box (e.g. "Tickets ×") means the prompt **edits that screen**. To ask for a new screen, click an empty canvas area far from the input to clear the selection.
- Suggestion chips sit just above the input; a stray click submits them. Cancel via the ⊗ next to the running item in the history.
- Long waits: keep any single browser batch under ~90 s (it times out); poll with shorter batches.

## Export (reliable path)
The `.zip` (screen.png + code.html + DESIGN.md) downloads only the **first** time; later downloads are silently blocked by Chrome's multiple-downloads protection with no visible prompt. Take that first zip's `DESIGN.md` as `design/DESIGN.md`, then for every screen:

1. Clear the clipboard: `pbcopy < /dev/null`
2. Select the screen, note the **"1280 x H"** label under it.
3. Export → choose **"Code to Clipboard"**.
   **DANGER:** the default format is "AI Studio"; the bottom button then reads "Build with AI Studio" and sends the design to another Google service. Screenshot/zoom and confirm the "Code to Clipboard" radio is selected **and** the button reads **"Copy"** before clicking.
4. `pbpaste > design/code/NN-page.html`, then grep it for strings expected from the latest edit (stale-code check).
5. `bash scripts/render-stitch-html.sh design/code/NN-page.html <H> design/screens/NN-page.png` (Chrome path via `$CHROME`; throwaway profile). H unknown → render tall and inspect; app-shell pages use `h-screen`, so whitespace auto-trim does not work.

## When Stitch won't converge
"Code to Clipboard" sometimes returns stale pre-edit code even after a reload, and Stitch sometimes "fixes" the wrong element repeatedly. Then patch the exported HTML locally (small text/class edits), re-render, and **log every local edit in `design/README.md`** so the divergence between repo and Stitch canvas is documented.

## Output layout
```
design/
  prompts/   00-global.md, NN-page.md, NN-page-fix.md
  screens/   NN-page.png
  code/      NN-page.html
  DESIGN.md  design system (from the first zip)
  README.md  layout, export method, local-edit log
```

## UI-reference board in Excalidraw
1. Per screenshot: `osascript -e 'set the clipboard to (read (POSIX file "<png>") as «class PNGf»)'`, click empty canvas, Cmd+V. (Image files go to IndexedDB; elements stay in localStorage.)
2. Lay out with the localStorage technique (`scripts/excalidraw-helpers.js`): uniform width (e.g. 1000), grid, captions (clone an existing text element as template), plus a Mermaid navigation diagram in the same frame.
3. Zoom in and verify each caption matches its image.
4. Very large board: export at scale 1× and convert to JPEG to keep the repo small (full-res pages already live in `design/screens/`):
   `sips -s format jpeg -s formatOptions 80 board.png --out board.jpg`
