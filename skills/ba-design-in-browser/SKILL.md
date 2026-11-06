---
name: ba-design-in-browser
description: Use when an approved design doc needs business-analysis artifacts (flow, state machine, sequence, component, ER diagrams, functional spec, UI mockups) produced in browser tools like excalidraw.com or Google Stitch before implementation planning, or when driving Excalidraw's Mermaid import, canvas storage or PNG export from an agent.
---

# BA Design in the Browser

## Overview
Between design approval (`superpowers:brainstorming`) and implementation planning (`superpowers:writing-plans`), turn the design into reviewable BA boards. **Mermaid in the repo is the source of truth; Excalidraw is the rendering; the user's own canvas is never touched.** Browser work uses the Claude in Chrome tools.

## Workflow
Boards, each in an Excalidraw frame named `BA-NN <title>`:
1. Persona + end-to-end flow with decision points
2. State machine: every transition names its trigger (developer / agent / system), incl. blocked, abandoned, failure loops
3. Sequence diagrams: a developer confirmation before every external write
4. Component diagram with trust boundaries
5. ER diagram with versioning/audit fields

Then a functional spec (per page: purpose, data, actions, states loading/empty/error/normal/awaiting-decision) → Stitch screens → "UI reference" board → approval gate → update spec/plan.

**Per board:** write `docs/ba/NN-*.mmd` → render → export PNG to `docs/ba/` → show user → approval → commit. Maintain `docs/ba/README.md` (index) and `docs/ba/open-questions.md`: a gap in the design doc gets logged and your provisional choice is marked `TBD Qn` on the diagram — never silently invent. Sync approved changes back into the design doc.

## Quick Reference (Excalidraw)
| Task | Verified method |
|---|---|
| Mermaid → shapes | ⋮ More tools → Generate → Mermaid to Excalidraw. Flowchart, sequence, class, **state, ER all convert natively** — never hand-build element JSON |
| Set Mermaid text | Editor is CodeMirror 6: synthetic paste on `.cm-content` (`pasteMermaid` in `scripts/excalidraw-helpers.js`). Setting textarea value / React setter does nothing |
| Insert | Find the "Insert" button by accessibility lookup, not coordinates |
| Frame it | Right-click selection → Wrap selection in frame; double-click title to rename |
| Layout / wrap programmatically | `scripts/excalidraw-helpers.js`: backup → edit localStorage → `blockAppOverwrite()` → reload |
| Find new elements | "not in backup AND not in any BA frame" — never by position or custom ids |
| Export PNG | `bash scripts/save-clipboard-png.sh --clear` → select frame → Cmd+Shift+E → "Only selected" → "Copy PNG to clipboard" → `bash scripts/save-clipboard-png.sh docs/ba/NN-x.png <frameW> <frameH>` |

## Canvas safety
excalidraw.com has ONE local canvas per browser (localStorage `excalidraw`, `excalidraw-state`); a new tab shows the same drawing. If it has content, ask: user backs it up / boards placed far away / collaboration room (data on Excalidraw servers). Before any programmatic edit run `backupCanvas()`; after every change run `verifyUserElementsUnchanged()`.

## Google Stitch (partially validated)
- First visit: ToS with marketing/research boxes **pre-ticked**. Stop and ask; if authorized, untick both, then Continue.
- Prompts in the UI's target language, stored in `docs/ba/stitch-prompts/`: `00-global.md` (platform/width, audience, style refs, fonts, status colors, decision-point component, "This will: …" note on external-write buttons, required states) + one file per screen.
- Prompt box is in an iframe: click, then type ONE paragraph (newlines may submit). Submit with the arrow. ~1–2 min/screen; it builds a design-system board first. Order: shell + main list, then the most novel view.
- Save to `docs/ba/ui/<page>.png` (export method not yet validated) and place in the UI-reference frame with navigation arrows and state annotations.

## Common Mistakes
| Mistake | Fix |
|---|---|
| Edge targets a subgraph id | Converter breaks — target a node inside it |
| `flowchart LR` swimlane subgraphs | Tangled output — `flowchart TD`, `classDef` per actor + legend |
| Edited localStorage, reloaded, change gone | Running app rewrote it on unload — patch `setItem` first; delete `index` fields; frame must precede its children in the array |
| PNG download button / Save to file | Native save dialog is invisible to the agent; `.excalidraw` contains the whole canvas (leaks user drawing) |
| Stale PNG saved | Script clears clipboard first and checks size ≈ 2× frame |
| Serving `.mmd` from localhost | Chrome Local Network Access prompt blocks fetch — inline as JSON string |
| Insert lands off-screen | First scroll after a dialog is often swallowed — screenshot before inserting |
| Reading clipboard via page JS | Permission-dependent and heavy; use the osascript script |
