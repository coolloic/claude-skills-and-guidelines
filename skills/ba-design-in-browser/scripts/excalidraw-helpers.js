// Excalidraw page-console helpers for agents driving excalidraw.com.
// Paste the whole file into the page (e.g. via a JavaScript tool), then call functions.
// All BA boards live in frames whose name starts with "BA-".
//
// Storage facts: excalidraw.com keeps ONE local canvas per browser in
// localStorage['excalidraw'] (elements array) and localStorage['excalidraw-state'].
// The running app rewrites both on unload, so edits need blockAppOverwrite() before reload.

const KEY = 'excalidraw';
const BACKUP_KEY = 'excalidraw-backup-before-ba';
const BA_PREFIX = 'BA-';

const load = (key = KEY) => JSON.parse(localStorage.getItem(key) || '[]');

// --- Mermaid import ---------------------------------------------------------
// Dialog: toolbar "More tools" -> Generate -> "Mermaid to Excalidraw".
// The editor is CodeMirror 6; setting a textarea value does not work. Dispatch a paste.
// Pass the Mermaid source as a JSON-escaped string literal (don't fetch from localhost:
// Chrome's Local Network Access prompt blocks it). Then click "Insert" (find by name).
function pasteMermaid(src) {
  const el = document.querySelector('.cm-content');
  if (!el) throw new Error('Mermaid dialog not open (.cm-content missing)');
  el.focus();
  getSelection().selectAllChildren(el);
  const dt = new DataTransfer();
  dt.setData('text/plain', src);
  el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  return el.innerText.slice(0, 80);
}

// --- Safety -----------------------------------------------------------------
function backupCanvas() {
  if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, localStorage.getItem(KEY) || '[]');
  return load(BACKUP_KEY).length + ' elements backed up';
}

function baFrameIds(els) {
  return new Set(els.filter(e => e.type === 'frame' && (e.name || '').startsWith(BA_PREFIX)).map(e => e.id));
}

// "User element" = not a BA frame and not inside one.
function userElements(els) {
  const ba = baFrameIds(els);
  return els.filter(e => !e.isDeleted && !ba.has(e.id) && !ba.has(e.frameId));
}

const fingerprint = e => `${e.id}|${Math.round(e.x)}|${Math.round(e.y)}|${e.text || ''}`;

// Run after EVERY change. Compares user elements in the backup vs now.
function verifyUserElementsUnchanged() {
  const before = new Set(userElements(load(BACKUP_KEY)).map(fingerprint));
  const now = new Set(load().filter(e => !e.isDeleted).map(fingerprint));
  const missing = [...before].filter(f => !now.has(f));
  return missing.length ? { ok: false, missing } : { ok: true, count: before.size };
}

// Newly inserted (e.g. from Mermaid) = not in backup AND not in any BA frame.
// Never select by position: a table once landed inside an excluded range and was missed.
function newLooseElements() {
  const old = new Set(load(BACKUP_KEY).map(e => e.id));
  const els = load();
  const ba = baFrameIds(els);
  return els.filter(e => !e.isDeleted && !old.has(e.id) && !ba.has(e.id) && !ba.has(e.frameId));
}

// --- Programmatic edits -----------------------------------------------------
const bump = e => { e.version = (e.version || 1) + 1; e.versionNonce = Math.floor(Math.random() * 2 ** 31); e.updated = Date.now(); };

// Move a BA frame and its children by dx, dy (in the given elements array).
function shiftFrame(els, frameName, dx, dy) {
  const f = els.find(e => e.type === 'frame' && e.name === frameName);
  if (!f) throw new Error('no frame ' + frameName);
  for (const e of els) if (e.id === f.id || e.frameId === f.id) { e.x += dx; e.y += dy; bump(e); }
}

// Arrange all BA frames left-to-right, sorted by name, starting at (x0, y0).
function arrangeBaFramesInRow(els, x0, y0, gap = 200) {
  let x = x0;
  els.filter(e => e.type === 'frame' && (e.name || '').startsWith(BA_PREFIX) && !e.isDeleted)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(f => { shiftFrame(els, f.name, x - f.x, y0 - f.y); x += f.width + gap; });
}

// Wrap elements (by id) in a new frame cloned from an existing one.
// The frame must precede its first child in the array.
function wrapInNewFrame(els, childIds, name, pad = 40) {
  const tpl = els.find(e => e.type === 'frame');
  if (!tpl) throw new Error('need an existing frame to clone (wrap one via the UI first)');
  const kids = els.filter(e => childIds.includes(e.id));
  const minX = Math.min(...kids.map(e => e.x)), minY = Math.min(...kids.map(e => e.y));
  const maxX = Math.max(...kids.map(e => e.x + (e.width || 0))), maxY = Math.max(...kids.map(e => e.y + (e.height || 0)));
  const frame = { ...structuredClone(tpl), id: 'ba' + Math.random().toString(36).slice(2, 12), name,
    x: minX - pad, y: minY - pad, width: maxX - minX + 2 * pad, height: maxY - minY + 2 * pad,
    frameId: null, boundElements: [], groupIds: [] };
  bump(frame);
  kids.forEach(e => { e.frameId = frame.id; bump(e); });
  els.splice(els.indexOf(kids[0]), 0, frame);
  return frame.id;
}

// Stop the running app from overwriting our edit when the page unloads.
function blockAppOverwrite() {
  const orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === KEY || k === 'excalidraw-state') return;
    return orig.call(this, k, v);
  };
}

// Persist edited elements and reload. Deletes fractional `index` fields so
// Excalidraw re-derives ordering from array order.
function saveAndReload(els) {
  els.forEach(e => delete e.index);
  localStorage.setItem(KEY, JSON.stringify(els));
  blockAppOverwrite();
  location.reload();
}

// Example:
//   backupCanvas();
//   const els = load();
//   wrapInNewFrame(els, newLooseElements().map(e => e.id), 'BA-03 Sequence: publish');
//   arrangeBaFramesInRow(els, 0, 5000);
//   saveAndReload(els);
//   // after reload, re-paste this file, then: verifyUserElementsUnchanged()
