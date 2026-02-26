# UI/UX Implementation Guideline — Toolk1t

This guideline MUST be followed for all UI implementation across toolk1t-client and toolk1t-admin.

## Core Principles

1. **Mobile-first** — Write base styles for mobile, add breakpoints up
2. **Compact desktop** — Maximize information density on desktop; avoid multi-page flows where a single-page layout works
3. **Accessible by default** — WCAG 2.1 AA compliance minimum
4. **Performance-first** — Target 90+ Lighthouse scores
5. **Rebrandable** — Use CSS custom properties, never hardcode brand colors
6. **SEO-optimized** — Semantic HTML, proper heading hierarchy, meta tags

## Accessibility Requirements

### Color Contrast (MANDATORY)

| Element | Minimum Ratio |
|---------|--------------|
| Normal text (<18px) | **4.5:1** |
| Large text (≥18px bold, ≥24px) | **3:1** |
| UI components, icons, focus rings | **3:1** |

- NEVER use color alone as an indicator — always pair with icon, text, or pattern
- Dark mode must meet same contrast standards
- Test brand colors (#3D79F2 on white = 3.38:1 — use #3D6AF2 or darker for text on white)

### Keyboard & Focus

- All interactive elements keyboard accessible via Tab
- Visible focus ring: ≥2px, ≥3:1 contrast against background
- Focus order matches visual order (no positive tabIndex)
- Modals trap focus, return focus on close
- Skip-to-content link on every page

### Semantic HTML

- ONE `<h1>` per page
- Sequential heading hierarchy (h1 → h2 → h3, no skipping)
- Use `<button>` for actions, `<a>` for navigation
- Forms use `<label>` with `htmlFor`
- Images have descriptive `alt` or `alt=""` + `role="presentation"` for decorative

### ARIA

- Use native HTML elements first, ARIA only when necessary
- Dynamic content uses `aria-live="polite"`
- Loading states use `aria-busy`
- Expandable content uses `aria-expanded` + `aria-controls`

## Graceful Error Handling (MANDATORY)

Every tool page MUST handle errors gracefully. Users should never see raw error messages, blank screens, or broken states. The UI must always remain usable — inform, explain, and offer a path forward.

### Error State Hierarchy

Handle errors at the right level — from most specific to most general:

| Level | Example | UI Treatment |
|---|---|---|
| **Field-level** | Invalid IP format, empty required input | Inline red text below the field, field border turns red |
| **Action-level** | API call failed, file upload rejected | Alert banner near the action area with message + retry button |
| **Section-level** | Map failed to load, chart data unavailable | Placeholder in the section with error icon + explanation |
| **Page-level** | Entire page data failed to load | Full-page error state with illustration + retry + home link |

### Error UI Patterns

#### Inline Field Errors

```tsx
<div className="space-y-1">
  <input className="... border-red-500 dark:border-red-400" />
  <p className="text-xs text-red-600 dark:text-red-400" role="alert">
    Please enter a valid IP address (e.g. 8.8.8.8)
  </p>
</div>
```

#### Action Error Banner

Use `role="alert"` so screen readers announce immediately:

```tsx
<div
  role="alert"
  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
             flex items-center justify-between gap-4"
>
  <div className="flex items-center gap-3">
    <ErrorIcon />
    <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
  </div>
  <button onClick={onRetry} className="text-sm font-bold text-red-600 dark:text-red-400 hover:underline">
    Retry
  </button>
</div>
```

#### Section Fallback

When a non-critical section fails (e.g., map won't load), show a graceful placeholder:

```tsx
<div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
  <WarningIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
  <p className="text-sm text-slate-500 dark:text-slate-400">Map could not be loaded</p>
  <button onClick={onRetry} className="text-xs text-[var(--tk-color-primary-500)] mt-2 hover:underline">
    Try again
  </button>
</div>
```

### Consistent Error Hint Styling (MANDATORY)

All error hints MUST use the exact same classes and structure across every tool and page. Never invent new error styles — copy from this spec.

#### Field-Level Error Hint (inline below input)

```
Text:    text-xs text-red-600 dark:text-red-400
Element: <p> with role="alert", id matching aria-describedby on the input
Spacing: mt-1 (or inside a space-y-1 wrapper)
```

```tsx
{error && (
  <p id="{fieldId}-error" className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
    {error}
  </p>
)}
```

#### Invalid Input Border

```
Normal:  border-slate-200 dark:border-slate-800
Invalid: border-red-500 dark:border-red-400
Focus:   focus:ring-red-500 (instead of the usual primary ring)
```

#### Action-Level Error Banner

```
Container: p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
Icon:      w-5 h-5 text-red-500 shrink-0
Text:      text-sm font-medium text-red-700 dark:text-red-300
Retry btn: text-sm font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer
Layout:    flex items-center justify-between gap-4
```

#### Warning Banner (non-blocking issues)

```
Container: p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800
Icon:      w-5 h-5 text-amber-500 shrink-0
Text:      text-sm font-medium text-amber-700 dark:text-amber-300
```

#### Info Banner (hints, tips)

```
Container: p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
Icon:      w-5 h-5 text-blue-500 shrink-0
Text:      text-sm font-medium text-blue-700 dark:text-blue-300
```

#### Rules

- **One style per level** — never mix banner colors or text sizes across tools
- **Same classes everywhere** — copy the exact classes above, don't approximate
- Field errors are always `text-xs text-red-600 dark:text-red-400` — not `text-sm`, not `text-red-500`
- Banners are always `p-4 rounded-xl` with the color scheme above — not `p-3 rounded-lg`
- When in doubt, look at the existing IP Check error banner as the reference implementation

### Error Message Rules

| Rule | Example |
|---|---|
| **User-friendly language** — no codes, no stack traces | "Unable to look up this IP address" (not "UPSTREAM_TIMEOUT") |
| **Explain what happened** — briefly, honestly | "The service is temporarily unavailable" |
| **Suggest what to do** — always offer a next step | "Please try again" / "Check your input" / "Go back to tools" |
| **Don't blame the user** unless it's input validation | "Something went wrong" (not "You broke it") |
| **Match the severity** — don't alarm for minor issues | Warning banner for non-critical, error banner for blocking |

### Mapping API Errors to UI

The API returns `{ error, code, service }`. Map these to user-friendly UI:

| API Code | User-Facing Message | UI Treatment |
|---|---|---|
| `VALIDATION` (400) | Show field-specific errors from `details` | Inline field errors |
| `UNAUTHORIZED` (401) | "Please sign in to continue" | Redirect to login or show sign-in prompt |
| `RATE_LIMITED` (429) | "Too many requests — please wait a moment" | Warning banner with auto-retry countdown |
| `UPSTREAM_TIMEOUT` (502) | "Service temporarily unavailable — please try again" | Error banner + retry button |
| `UPSTREAM_UNREACHABLE` (502) | "External service unreachable — please try again later" | Error banner + retry button |
| `UPSTREAM_SERVER_ERROR` (502) | "Something went wrong — please try again" | Error banner + retry button |
| `UPSTREAM_RATE_LIMITED` (429) | "Service is busy — please try again in a moment" | Warning banner + retry button |
| `INTERNAL` (500) | "Something went wrong — please try again" | Error banner + retry button |
| Network error (fetch failed) | "Unable to connect — check your internet connection" | Error banner + retry button |

### Required Error Handling Behaviors

- [ ] **Every `fetch()` call** wrapped in try/catch — handle both network errors and non-2xx responses
- [ ] **Loading → Error transition** is smooth — don't flash content, go directly from skeleton to error state
- [ ] **Retry button** on every error that could be transient (network, timeout, 5xx, 502)
- [ ] **No retry** for permanent errors (400 validation, 401 auth) — guide user to fix the issue instead
- [ ] **Partial rendering** — if one section fails, render the rest normally (e.g., IP info loads but map fails → show info, placeholder for map)
- [ ] **Error state clears** when user retries or changes input — don't show stale errors
- [ ] **Empty state** is distinct from error state — "No results found" ≠ "Something went wrong"
- [ ] **Offline handling** — if `navigator.onLine === false`, show a connection warning before attempting fetch
- [ ] **Timeout feedback** — if a request takes > 5s, show "Still loading..." to avoid perceived hang
- [ ] **`role="alert"`** on error messages so screen readers announce them immediately
- [ ] **Don't lose user input** on error — if a form submission fails, preserve the filled values for retry
- [ ] **Dark mode** error states use `dark:` variants — red/amber/blue banner patterns from existing tools

### Error Handling in fetch Calls

Standard pattern for API calls in tool pages:

```typescript
const [error, setError] = useState<string | null>(null)
const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

const fetchData = async (input: string) => {
  setState('loading')
  setError(null)
  try {
    const res = await fetch(`/api/v1/endpoint?q=${encodeURIComponent(input)}`)
    const json = await res.json()

    if (!res.ok || json.error) {
      // Map API error code to user-friendly message
      throw new Error(mapApiError(json.code, json.error))
    }

    setData(json.data)
    setState('success')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Something went wrong — please try again')
    setState('error')
  }
}

function mapApiError(code?: string, fallback?: string): string {
  const messages: Record<string, string> = {
    VALIDATION: fallback ?? 'Invalid input — please check and try again',
    RATE_LIMITED: 'Too many requests — please wait a moment',
    UPSTREAM_TIMEOUT: 'Service temporarily unavailable — please try again',
    UPSTREAM_UNREACHABLE: 'External service unreachable — please try again later',
    UPSTREAM_SERVER_ERROR: 'Something went wrong — please try again',
    UPSTREAM_RATE_LIMITED: 'Service is busy — please try again in a moment',
    UPSTREAM_PARSE_ERROR: 'Received unexpected data — please try again',
    INTERNAL: 'Something went wrong — please try again',
  }
  return messages[code ?? ''] ?? fallback ?? 'Something went wrong — please try again'
}
```

## Responsive Design

### Breakpoints

```
xs: 0       (mobile default)
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Touch Targets

- Minimum 44x44px for all interactive elements
- 8px minimum spacing between touch targets

### Typography

- Body text: static sizes (14px–18px)
- Headings: fluid `clamp()` (scales 320px → 1280px viewport)
- Line height: 1.5 for body, 1.25 for headings

## Compact Desktop Design (MANDATORY for ≥ md breakpoint)

Desktop users have large screens and precise input — use that to increase density and reduce clicks. Multi-page wizards, full-page modals, and one-item-per-screen layouts waste screen real estate. Prefer a single-page experience where the user can see input, controls, and results together.

### Layout Rules

| Rule | Why |
|---|---|
| **Single-page over multi-page** | Keep input + output on the same view; avoid step-by-step wizards unless the workflow truly has ordered dependencies |
| **Side-by-side panels** | On `≥ md`, show input/config on one side and live output/preview on the other (`grid-cols-2` or `flex` row) |
| **Collapsible sections** | Group secondary info into `<details>`/accordion — visible by summary, expandable on demand |
| **Inline editing** | Prefer inline edit over separate edit pages/modals |
| **Dense tables & grids** | Tighten row height, use `text-sm`, reduce cell padding — more rows visible without scrolling |
| **Sticky controls** | Keep primary actions (submit, search, apply) in a sticky bar or always-visible area — never behind a scroll |
| **Sticky toolbar header** | Tool editor toolbars (crop bar, format bar, settings bar) MUST be `sticky top-0 z-30` so they stay pinned above scrollable content |

### Spacing on Desktop

On `≥ md`, reduce vertical spacing to keep more content above the fold:

| Mobile | Desktop (`md:`) | Usage |
|---|---|---|
| `py-8` / `py-10` | `md:py-4` / `md:py-5` | Page-level vertical padding |
| `gap-8` | `md:gap-4` / `md:gap-5` | Between major sections |
| `gap-6` | `md:gap-3` / `md:gap-4` | Between cards / form groups |
| `p-8` / `p-6` | `md:p-5` / `md:p-4` | Card inner padding |
| `mb-8` / `mb-6` | `md:mb-4` / `md:mb-3` | After hero / search / breadcrumb |
| `mt-8` / `mt-6` | `md:mt-4` / `md:mt-3` | Before result sections |

Keep mobile spacing generous for touch; tighten desktop spacing for density.

### Typography on Desktop

Reduce headline sizes on desktop — large screens don't need oversized text for visual weight:

| Mobile | Desktop (`md:` / `lg:`) | Usage |
|---|---|---|
| `text-5xl` | Keep `text-5xl` (not larger) | Hero headline (IP address, main value) |
| `text-7xl` / `text-6xl` | Avoid on `md:`, use `text-5xl` max | Oversized display text wastes vertical space |
| `text-4xl` | `md:text-3xl` | Metric card values |
| `size-72` / `size-80` | `lg:size-[340px]` max | Gauges, circular elements — cap at ~340px |

Rule: if a single element pushes other content below the fold on 768px height, it's too big.

### Single-Page Tool Layout (Desktop)

For tools with input → output flow, use a two-column layout on desktop:

```
┌──────────────────────────────────────────────────────┐
│  Breadcrumb                                          │
├────────────────────────┬─────────────────────────────┤
│  Input / Config Panel  │  Output / Result Panel      │
│  (sticky or scrollable)│  (live preview / data)      │
│                        │                             │
│  [Action Button]       │                             │
├────────────────────────┴─────────────────────────────┤
│  Additional Details (collapsible / tabs)              │
└──────────────────────────────────────────────────────┘
```

On mobile (`< md`), stack vertically: input on top, output below.

### Editor-Style Tool Layout (MANDATORY)

For tools with a full-screen editor canvas (SVG Converter, Image Editor, PDF Converter), the entire page MUST NOT exceed 100dvh. The site header + site footer + workspace fill exactly the viewport. The workspace area scrolls internally — the page itself never scrolls.

#### Viewport Lock (MANDATORY)

Add this `<style>` tag in the tool's `layout.tsx` to lock the body to viewport height:

```tsx
<style dangerouslySetInnerHTML={{ __html: 'body{height:100dvh;overflow:hidden}' }} />
```

The tool page's root div MUST use `flex-1 min-h-0 overflow-hidden` so it shrinks within the flex layout:

```tsx
<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
```

- `flex-1` — fills remaining space between site header and footer
- `min-h-0` — allows the flex item to shrink below content size (critical!)
- `overflow-hidden` — clips internal overflow, workspace scrolls independently

#### Full Layout Structure

```
body (h-[100dvh] overflow-hidden flex flex-col)
├─ Site Header (shrink-0)
├─ Page (flex-1 min-h-0 flex flex-col overflow-hidden)
│  ├─ Tool Header / Breadcrumb (h-12 shrink-0)
│  ├─ Toolbar (shrink-0, sticky top-0 z-30)
│  ├─ Workspace (flex-1 relative overflow-hidden)
│  │  ├─ Scrollable area (absolute inset-0 overflow-auto)
│  │  │  └─ Zoomable content
│  │  ├─ Zoom controls (absolute bottom-4 z-20)
│  │  └─ Preview panel (absolute bottom-4 right-4 z-20)
│  └─ Status bar / hint bar (h-5 shrink-0, compact)
└─ Site Footer (shrink-0)
```

#### Rules

| Element | Requirement |
|---|---|
| **Body** | `height: 100dvh; overflow: hidden` — via style tag in tool layout |
| **Page root** | `flex-1 min-h-0 flex flex-col overflow-hidden` — shrinks within flex layout |
| **Toolbar** | `sticky top-0 z-30 bg-[#1a2333] border-b border-slate-700 shrink-0` — always visible above scroll |
| **Workspace** | `flex-1 relative overflow-hidden` — establishes positioning context for floating overlays |
| **Scrollable area** | `absolute inset-0 overflow-auto` — scrolls independently when content is zoomed |
| **Floating overlays** | `absolute z-20 pointer-events-auto` on the workspace (NOT inside the scrollable area) — stay pinned |
| **Status bar** | `h-5 shrink-0` — compact, always visible, never scrolls away |

**Key principle:** Floating UI (zoom controls, preview thumbnails, info badges) must be siblings of the scrollable area inside the workspace wrapper — never children of the scrollable area, or they scroll away when zoomed.

### When Multi-Page Is Acceptable

Only use separate pages / steps when:

- The workflow has **strict sequential dependencies** (e.g., upload file → crop → download)
- The combined view would exceed **reasonable cognitive load** (> 7 distinct input groups)
- Legal or compliance reasons require an explicit confirmation step

Even in these cases, show a progress indicator and allow navigating back without data loss.

### Compact Design Checklist

- [ ] Input and output visible on the same viewport (desktop)
- [ ] Side-by-side layout used for input/output when content allows
- [ ] No unnecessary whitespace eating up above-the-fold real estate
- [ ] Secondary information collapsed by default, expandable on demand
- [ ] Tables/grids use dense styling (`text-sm`, tight padding)
- [ ] Primary actions always visible without scrolling (sticky if needed)
- [ ] Mobile layout remains spacious and touch-friendly (compact applies to `≥ md` only)

## Performance

### Core Web Vitals Targets

- **LCP** < 2.5s — preload hero images, use `priority` prop
- **INP** < 200ms — defer expensive state, use `startTransition`
- **CLS** < 0.1 — always set `width`/`height` on images, reserve space for dynamic content

### Code Splitting

- Heavy libraries (Leaflet, charts) → `dynamic()` with `ssr: false`
- Server Components by default, `'use client'` only when needed
- Images: Next.js `<Image>` with explicit dimensions and `sizes`

## SEO

- Every page has unique `<title>` (<60 chars) and `meta description` (<155 chars)
- Open Graph and Twitter Card meta tags on all public pages
- Canonical URLs set on all pages
- Structured data (JSON-LD) for tool pages
- Clean URL structure: `/tools/ipcheck`, `/tools/dns-lookup`

## Brand Colors (CSS Custom Properties)

Always reference via `var(--tk-color-*)`, never hardcode hex values in components:

```tsx
// ✅ Correct
className="text-[var(--tk-color-primary-500)]"
className="bg-[var(--tk-color-primary-500)]/10"

// ❌ Wrong
className="text-[#3D79F2]"
```

## Styling

- **Always use `.scss` files** — never plain `.css`
- System font stack (no external font loading) — defined via `--tk-font-family-sans`
- Tailwind utility classes for component styling
- SCSS for global styles, variables, and complex selectors
- Brand colors via CSS custom properties: `var(--tk-color-primary-500)`

## Breadcrumbs (MANDATORY)

Every page MUST include a breadcrumb navigation at the top of the content area.

### Rules

- Use a `<nav aria-label="Breadcrumb">` wrapper with an `<ol>` list
- Home is always the first item, linking to `/`
- The current (last) page uses `aria-current="page"` and is not a link
- Separator: `/` or `>` character between items, hidden from screen readers with `aria-hidden="true"`
- Mobile: breadcrumbs should remain visible and wrap if needed (never truncate the current page name)

### Example

```tsx
<nav aria-label="Breadcrumb" className="mb-6">
  <ol className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
    <li><a href="/" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Home</a></li>
    <li aria-hidden="true">/</li>
    <li><a href="/tools" className="hover:text-[var(--tk-color-primary-500)] transition-colors">Tools</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page" className="text-slate-900 dark:text-white font-medium">IP Check</li>
  </ol>
</nav>
```

### Where to place

- Render breadcrumbs as the first child inside the page `<main>` element, before any other content
- Use the reusable `Breadcrumb` component from `components/ui/breadcrumb.tsx`

## Testing with webapp-testing Skill (MANDATORY)

Every tool page MUST be verified using the `webapp-testing` skill, which uses the Playwright MCP browser tools to interact with the running app in a real browser.

### How It Works

Instead of writing standalone E2E test files, invoke the `webapp-testing` skill to:
1. Navigate to the tool page in a real browser
2. Interact with UI elements (click, type, fill forms)
3. Take screenshots to verify visual state
4. Check accessibility snapshots for element presence
5. Inspect console logs and network requests for errors

### What to Verify (per tool)

Each tool MUST be verified for:

1. **Page load** — Page renders without errors, key elements visible
2. **Core user flow** — The primary use case works end-to-end (e.g., search IP → results shown, upload file → preview rendered)
3. **Error states** — Invalid input shows error message, failures handled gracefully
4. **Loading states** — Loading skeleton/spinner appears during async operations
5. **Responsive layout** — Key layout works on mobile (375px) and desktop (1280px) viewports
6. **Keyboard accessibility** — Primary actions reachable via Tab + Enter
7. **Dark mode** — Page renders correctly in dark mode

### When to Test

- **New tool**: Verify using `webapp-testing` as part of the tool delivery — not optional
- **Bug fix**: Verify the fix via browser before marking done
- **UI change**: Verify affected flows still work correctly

## New Tool Development Checklist (MANDATORY)

When adding a new tool to toolk1t-client, EVERY item below must be addressed before the tool is considered complete.

### SEO & Discoverability

- [ ] Add unique `<title>` and `meta description` for the tool page
- [ ] Add Open Graph / Twitter Card meta tags
- [ ] Add JSON-LD structured data for the tool
- [ ] **Update site-wide SEO keywords** — add the new tool's keywords to the homepage and `/tools` index page so search engines discover the new tool through the site's keyword graph
- [ ] Ensure clean URL: `/tools/<toolname>`

### Tool Registry & Navigation

- [ ] Add tool entry to `lib/tools.tsx` — this is the **SINGLE SOURCE OF TRUTH** for all tool listings
  - Required fields: `name`, `href`, `description`, `icon` (SVG), `color` (gradient)
- [ ] Verify tool appears on home page (`/tools`) — automatic from `lib/tools.tsx`
- [ ] Verify tool appears in header mega menu — automatic from `lib/tools.tsx`
- [ ] Verify tool appears in search autosuggestion — automatic from `lib/tools.tsx`

### Mobile-First Design

- [ ] Base styles written for mobile (xs), enhanced upward with `sm:`, `md:`, `lg:` breakpoints
- [ ] All interactive elements meet 44x44px minimum touch target
- [ ] Layout stacks vertically on mobile, side-by-side on `≥ md`
- [ ] Tested at 375px (iPhone SE), 768px (tablet), 1280px (desktop) viewports

### Theme Support (Light + Dark)

- [ ] All backgrounds, text, borders use Tailwind dark: variants or CSS custom properties
- [ ] Contrast ratios meet WCAG 2.1 AA in both light and dark modes
- [ ] No hardcoded colors — use `dark:bg-slate-*`, `dark:text-slate-*`, or `var(--tk-color-*)`
- [ ] Tested in both light mode and dark mode

### UX Behaviour Consistency

- [ ] Breadcrumb navigation present at top (Home → Tools → Tool Name)
- [ ] Loading states use skeleton/spinner with `aria-busy`
- [ ] Success feedback (toast, badge, animation) follows existing patterns
- [ ] Copy-to-clipboard uses same toast pattern as other tools
- [ ] Export/download follows same Blob+anchor pattern
- [ ] Toolbar/action bar layout matches existing tools (horizontal, grouped, icon+label)

### Graceful Error Handling (see Graceful Error Handling section)

- [ ] Every `fetch()` wrapped in try/catch with user-friendly error messages
- [ ] API error codes mapped to human-readable messages (no raw codes shown to user)
- [ ] Error banner with `role="alert"` + retry button for transient errors
- [ ] Partial rendering — non-critical section failure doesn't break the whole page
- [ ] Error state clears on retry or new input
- [ ] User input preserved on error (no lost form data)
- [ ] Empty state distinct from error state
- [ ] Dark mode error states use proper `dark:` variants

### Design Token & Style Consistency

- [ ] Brand colors via CSS custom properties: `var(--tk-color-primary-500)`, never hardcoded hex
- [ ] Font sizes follow existing scale (`text-xs`, `text-sm`, `text-[10px]` for labels)
- [ ] Spacing follows compact desktop rules (see Compact Desktop Design section)
- [ ] Border radius consistent: `rounded-xl` for panels, `rounded-lg` for buttons/inputs
- [ ] Shadow consistent: `shadow-sm` for cards, `shadow-2xl` for toasts/overlays
- [ ] Panel headers use `text-[10px] font-bold uppercase tracking-wider text-slate-400` pattern

### Component Reuse

- [ ] Check `components/ui/` for existing primitives before creating new ones (glass-card, badge, copy-button, etc.)
- [ ] Check `tools/` for patterns already solved in other tools (CodeEditor, toolbar groups, etc.)
- [ ] If a new reusable component emerges, extract to `components/ui/` if useful across tools
- [ ] Layout components (header, footer, breadcrumb) reused from `components/layout/`
- [ ] Shared UI across client + admin extracted to `toolk1t-ui` package

### Functional Requirements

- [ ] Core tool functionality works end-to-end
- [ ] Keyboard accessible (Tab navigation, Enter to submit, Escape to close)
- [ ] `pnpm build` passes with zero errors
- [ ] Verified using `webapp-testing` skill (see Testing section above)

## Input Components

### Search / Text Inputs — Clear Button (MANDATORY)

Every text input where the user types a query, search term, or filter MUST include a clear (×) button that appears when the input has content. Users should never have to manually select-all and delete.

#### Rules

- Clear button appears **only when the input has a value** (empty input = no button)
- Positioned inside the input, right-aligned (before any submit button)
- Uses an × (close) icon, `w-3.5 h-3.5` for compact inputs, `w-4 h-4` for full-size inputs
- `aria-label="Clear search"` (or "Clear input", "Clear filter" depending on context)
- `type="button"` to prevent form submission
- On click: clears the input value, optionally resets related state (suggestions, filters)
- Keyboard accessible via Tab
- Subtle style: `text-slate-400 hover:text-slate-600 dark:hover:text-slate-200`

#### Standard Pattern

```tsx
{/* Inside a relative-positioned input wrapper */}
{value && (
  <button
    type="button"
    onClick={() => setValue('')}
    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full
               text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
               hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    aria-label="Clear search"
  >
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
)}
```

#### When input has a submit button (e.g. SearchBar)

Position the clear button between the text and the submit button. Adjust `pr-*` on the input to make room for both.

```
┌─────────────────────────────────────────┐
│  🔍  user typed query here...    ✕  [Go]│
└─────────────────────────────────────────┘
```

#### Applies To

- `components/ui/search-bar.tsx` — main search bar (IP Check, etc.)
- `components/layout/header.tsx` — tool search (desktop + mobile)
- Any future filter/search inputs in tools

### Client-Side Form Validation (MANDATORY)

Every form MUST validate input on the client side **before** making any API request. Never send obviously invalid data to the server — catch it early, show the error instantly, and focus the user on the problem field.

#### Rules

1. **Validate before fetch** — All validation runs synchronously on submit, before any `fetch()` call
2. **Focus first error** — When validation fails, programmatically focus the first invalid field so the user knows exactly where to fix
3. **Inline error messages** — Show the error message directly below the invalid field (not in a toast or alert banner)
4. **Clear errors on change** — Remove a field's error message as soon as the user starts editing that field
5. **No wasted API calls** — Invalid input must never reach the server

#### Common Validation Patterns

```typescript
// IPv4 address
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/
function isValidIpv4(ip: string): boolean {
  if (!IPV4_REGEX.test(ip)) return false
  return ip.split('.').every((octet) => {
    const n = parseInt(octet, 10)
    return n >= 0 && n <= 255
  })
}

// IPv6 address
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^([0-9a-fA-F]{1,4}:)*:([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/
function isValidIpv6(ip: string): boolean {
  return IPV6_REGEX.test(ip)
}

// Domain name
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain) && domain.length <= 253
}

// IP or domain (for search bars that accept either)
function isValidIpOrDomain(input: string): boolean {
  return isValidIpv4(input) || isValidIpv6(input) || isValidDomain(input)
}

// Email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// URL
function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}
```

#### Focus-First-Error Pattern

```typescript
interface FieldError {
  field: string    // matches the input's id/name
  message: string
}

function validateAndSubmit(formData: Record<string, string>): FieldError[] {
  const errors: FieldError[] = []

  if (!formData.ip?.trim()) {
    errors.push({ field: 'ip', message: 'IP address is required' })
  } else if (!isValidIpOrDomain(formData.ip.trim())) {
    errors.push({ field: 'ip', message: 'Enter a valid IP address or domain (e.g. 8.8.8.8 or google.com)' })
  }

  // Add more field validations as needed...

  return errors
}

// On submit handler:
function handleSubmit() {
  const errors = validateAndSubmit(formValues)
  setFieldErrors(errors)

  if (errors.length > 0) {
    // Focus the first invalid field
    const firstErrorField = document.getElementById(errors[0].field)
    firstErrorField?.focus()
    return
  }

  // Validation passed — proceed with API call
  fetchData(formValues)
}
```

#### Inline Error Display

```tsx
<div className="space-y-1">
  <label htmlFor="ip-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
    IP Address
  </label>
  <input
    id="ip-input"
    type="text"
    value={value}
    onChange={(e) => { setValue(e.target.value); clearError('ip-input') }}
    aria-invalid={!!error}
    aria-describedby={error ? 'ip-input-error' : undefined}
    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
      error
        ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
        : 'border-slate-200 dark:border-slate-800 focus:ring-[var(--tk-color-primary-500)]'
    }`}
  />
  {error && (
    <p id="ip-input-error" className="text-xs text-red-600 dark:text-red-400" role="alert">
      {error}
    </p>
  )}
</div>
```

#### Accessibility Requirements for Validation

- `aria-invalid="true"` on invalid fields
- `aria-describedby` pointing to the error message element's `id`
- Error message element uses `role="alert"` so screen readers announce it
- Focus moves to the first invalid field — keyboard users don't have to hunt for the error
- Error text has sufficient contrast (red-600 on white = 4.5:1+)

#### Validation Checklist (per form/input)

- [ ] Empty/required check before submit
- [ ] Format validation (IP, email, URL, domain) before API call
- [ ] Range/length validation where applicable
- [ ] First invalid field receives focus on submit
- [ ] Inline error message shown below the invalid field
- [ ] `aria-invalid` and `aria-describedby` set on invalid fields
- [ ] Error clears when user edits the field
- [ ] Valid input proceeds to API call; invalid input never triggers fetch

## Toolbar Tooltips (MANDATORY)

Every toolbar button MUST show a tooltip on hover with a concise description of the action. This helps users understand what each button does before clicking, especially when icons are shown without labels on small screens.

### Rules

- **Every toolbar button** gets a tooltip — no icon-only buttons without explanation
- **Content**: Short description (3–8 words) of the action, plus keyboard shortcut if available
- **Position**: Below the button (`top-full`), centered horizontally
- **Timing**: Appears on hover with a slight delay (`group-hover` + `opacity` transition)
- **Style**: Dark pill with white text, small arrow pointing up
- **Accessibility**: `title` attribute as fallback for screen readers; tooltip is `aria-hidden="true"` (decorative)

### Standard Pattern

```tsx
function ToolbarButton({ icon, label, description, kbd, onClick, active }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={kbd ? `${label} (${kbd})` : label}
      className="group relative ..."
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="hidden sm:inline">{label}</span>

      {/* Tooltip */}
      <span
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2
                   px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px]
                   font-medium whitespace-nowrap opacity-0 group-hover:opacity-100
                   transition-opacity duration-150 z-50 shadow-lg"
        aria-hidden="true"
      >
        {description}
        {kbd && <span className="ml-1.5 text-slate-400 text-[10px]">{kbd}</span>}
        {/* Arrow */}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900 dark:border-b-slate-700" />
      </span>
    </button>
  )
}
```

### Tooltip Content Guidelines

| Button | Tooltip Text |
|---|---|
| Beautify | "Pretty-print with indentation" |
| Minify | "Remove whitespace and newlines" |
| Format | "Auto-format in place" |
| To YAML | "Convert JSON to YAML" |
| To JSON | "Convert YAML to JSON" |
| Validate | "Check OpenAPI spec validity" |
| Copy | "Copy to clipboard" |
| Export / Download | "Download as file" |

Keep descriptions action-oriented and jargon-free.

## Scrollbar Styling (MANDATORY)

All scrollable elements across the entire app use thin themed scrollbars. Styles are defined globally in `app/globals.scss` — do NOT add scrollbar styles in individual tool SCSS files.

### What's Applied Globally

- **Firefox**: `scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent` (dark: `#334155 transparent`)
- **WebKit** (Chrome, Safari, Edge): 6px wide/tall, transparent track, rounded thumb
- **Hover**: thumb color changes to `var(--tk-color-primary-500)` (dark: `var(--tk-color-primary-400)`)

### Rules

- **Never add scrollbar styles in tool-specific SCSS** — the global styles cover all `*` elements
- **Never use `overflow: overlay`** — it's deprecated; use `overflow-y: auto` or `overflow-x: auto`
- Any scrollable container (dropdowns, code editors, lists) automatically gets the thin themed scrollbar
- If a third-party library overrides scrollbar styles, use a scoped override in that tool's SCSS

### Verification

When adding any scrollable element (dropdown, textarea, code panel, list), visually confirm:
- [ ] Scrollbar is thin (6px) not the browser default thick scrollbar
- [ ] Light mode: light gray thumb on transparent track
- [ ] Dark mode: dark gray thumb on transparent track
- [ ] Hover: thumb turns brand primary color

## Component Patterns

- Reusable UI → `components/ui/`
- Layout → `components/layout/`
- Tool-specific → `tools/<toolname>/`
- See [tool-pattern.md](tool-pattern.md) for full directory structure
