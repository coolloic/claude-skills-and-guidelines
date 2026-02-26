---
name: ui-designer
description: Use when designing visual layouts, choosing colors and typography, creating component visual specs, ensuring design consistency, or reviewing the visual quality of implementations. Covers visual hierarchy, color theory, spacing systems, design tokens, and brand consistency.
---

# UI Designer (User Interface)

## Overview

User Interface design skill for the visual aspects of the product — layout, graphics, colors, typography, spacing, and interactive element styling. The UI Designer focuses on **how things look** — creating an appealing, consistent, and polished interface that reinforces the brand.

## When to Use

- Designing the visual layout of a new page or component
- Choosing colors, typography, or spacing for new elements
- Reviewing visual consistency across the product
- Creating or updating design tokens and theme variables
- Ensuring dark mode visual quality
- Reviewing implementation against design reference
- Defining component visual specifications

---

## 1. Visual Design System — HandyTool

### 1.1 Brand Colors

All colors MUST use CSS custom properties — never hardcode hex values.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--ht-color-primary-500` | #3D79F2 | #3D79F2 | Primary actions, links, focus rings |
| `--ht-color-primary-600` | #3D6AF2 | #3D6AF2 | Hover states, text on white (better contrast) |
| `--ht-color-secondary-500` | #32A9D9 | #32A9D9 | Accents, secondary actions |
| `--ht-color-secondary-600` | #32D9D9 | #32D9D9 | Teal/cyan accents |

**Contrast rules** (WCAG AA):
- Primary on white (#3D79F2 on #fff) = 3.38:1 — **fails** for small text, use `--ht-color-primary-600` for text
- Primary on dark bg (#3D79F2 on #0f172a) = 5.2:1 — **passes**

### 1.2 Typography

| Element | Size | Weight | Line Height | Token |
|---|---|---|---|---|
| Display / hero | `clamp(2rem, 5vw, 3.5rem)` | 700 | 1.1 | Fluid |
| H1 | `clamp(1.5rem, 3vw, 2.25rem)` | 700 | 1.25 | Fluid |
| H2 | `clamp(1.25rem, 2.5vw, 1.75rem)` | 600 | 1.3 | Fluid |
| H3 | 1.125rem (18px) | 600 | 1.4 | Static |
| Body | 0.875rem–1rem (14–16px) | 400 | 1.5 | Static |
| Caption / label | 0.75rem (12px) | 500 | 1.4 | Static |

Font stack: System fonts — no external font loading.

### 1.3 Spacing Scale

Use Tailwind's spacing scale consistently:

| Token | Value | Usage |
|---|---|---|
| `gap-1` / `p-1` | 4px | Tight: between icon and label |
| `gap-2` / `p-2` | 8px | Compact: between list items |
| `gap-4` / `p-4` | 16px | Standard: card padding, form gaps |
| `gap-6` / `p-6` | 24px | Comfortable: section padding |
| `gap-8` / `p-8` | 32px | Spacious: between major sections |
| `gap-12` / `p-12` | 48px | Page-level: top/bottom margins |

### 1.4 Border Radius

| Element | Radius | Tailwind |
|---|---|---|
| Small chips, badges | 9999px (full) | `rounded-full` |
| Buttons, inputs | 8px–12px | `rounded-lg` / `rounded-xl` |
| Cards, panels | 12px–16px | `rounded-xl` / `rounded-2xl` |
| Modal, hero sections | 16px–24px | `rounded-2xl` / `rounded-3xl` |

### 1.5 Shadows & Elevation

| Level | Tailwind | Usage |
|---|---|---|
| Level 0 | No shadow | Flat elements, inline items |
| Level 1 | `shadow-sm` | Cards, panels |
| Level 2 | `shadow-md` | Dropdowns, popovers |
| Level 3 | `shadow-xl` | Modals, hero cards |
| Glass | `shadow-xl backdrop-blur-xl` | Glass morphism cards |

---

## 2. Component Visual Specifications

### 2.1 Card Patterns

```
┌─────────────────────────────────┐
│  [Icon]  Label                   │  ← Header: p-4, border-b
│──────────────────────────────────│
│                                  │
│  Primary content                 │  ← Body: p-4 or p-6
│  Secondary text in muted color   │
│                                  │
│──────────────────────────────────│
│  [Action Button]                 │  ← Footer: p-4, border-t (optional)
└─────────────────────────────────┘
```

**Visual rules:**
- Background: `bg-white dark:bg-slate-900`
- Border: `border border-slate-200 dark:border-slate-800`
- Glass variant: `bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/30 dark:border-white/10`

### 2.2 Form Input Pattern

| State | Border | Background | Text |
|---|---|---|---|
| Default | `border-slate-200 dark:border-slate-800` | `bg-white dark:bg-slate-900` | `text-slate-900 dark:text-slate-100` |
| Focus | `ring-2 ring-[var(--ht-color-primary-500)]` | Same | Same |
| Error | `border-red-500` | Same | Same + red helper text |
| Disabled | `border-slate-100 dark:border-slate-800` | `bg-slate-50 dark:bg-slate-800` | `text-slate-400` |

### 2.3 Button Patterns

| Variant | Style |
|---|---|
| Primary | `bg-[var(--ht-color-primary-500)] text-white` |
| Secondary | `bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300` |
| Ghost | `bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800` |
| Danger | `bg-red-500 text-white` |
| All | `rounded-lg px-4 py-2 font-bold text-sm cursor-pointer` |

---

## 3. Dark Mode Design

### 3.1 Color Mapping

| Light Mode | Dark Mode | Rule |
|---|---|---|
| `bg-white` | `bg-slate-900` or `bg-slate-950` | Page backgrounds |
| `bg-slate-50` | `bg-slate-800/50` | Subtle card backgrounds |
| `text-slate-900` | `text-white` or `text-slate-100` | Primary text |
| `text-slate-600` | `text-slate-400` | Secondary text (must pass 4.5:1) |
| `text-slate-500` | `text-slate-400` | Muted text (check contrast!) |
| `border-slate-200` | `border-slate-800` | Borders |
| `shadow-sm` | `shadow-sm` (but less visible) | Keep same class |

### 3.2 Common Dark Mode Mistakes

| Mistake | Fix |
|---|---|
| `text-slate-500` on `bg-slate-900` (3.5:1) | Use `dark:text-slate-400` (4.6:1) |
| Pure white `text-white` everywhere | Use `text-slate-100` for body text |
| Same shadow values | Shadows are less effective on dark — reduce or add subtle border |
| Colored text too dim | Lighten accent colors by 1 stop in dark mode |
| Background patterns invisible | Add dark mode variant for patterns (`.canvas-dots`) |

---

## 4. Visual Consistency Rules

### 4.1 Cross-Tool Consistency

| Element | Must Be Identical Across Tools |
|---|---|
| Search bar | Same component, same styling, same behavior |
| Card panels | Same border-radius, shadow, padding |
| Error messages | Same red alert design, same retry button style |
| Loading skeletons | Same pulse animation, same neutral colors |
| Breadcrumbs | Same font, same separator, same link style |
| Page layout | Same max-width, same padding, same vertical rhythm |

### 4.2 Visual Review Checklist

When reviewing visual quality:

- [ ] All colors use CSS custom properties (no hardcoded hex)
- [ ] Text passes WCAG AA contrast (4.5:1 normal, 3:1 large)
- [ ] Consistent spacing (no arbitrary pixel values — use Tailwind scale)
- [ ] Consistent border-radius per element type
- [ ] Dark mode tested — no invisible text, no missing borders
- [ ] Icons are consistent size and stroke weight
- [ ] Alignment: elements on the same row share a baseline
- [ ] Typography hierarchy is clear (only one visual "loudest" element per section)
- [ ] No orphan elements (lonely single items in a grid row)
- [ ] Hover/focus/active states defined for all interactive elements

---

## 5. Design Handoff Format

When specifying visual design for a component:

```markdown
## Component: [Name]

**Dimensions**: width × height (or responsive behavior)
**Spacing**: padding, margins, gaps (use Tailwind tokens)
**Typography**: font-size, weight, line-height, color
**Colors**: background, border, text (light + dark mode)
**Border**: width, color, radius
**Shadow**: elevation level
**States**: default, hover, focus, active, disabled, error
**Animation**: transition property, duration, easing
**Responsive**: breakpoint changes (mobile → tablet → desktop)
```

---

## 6. UI Artifacts

| Artifact | Location | Created When |
|---|---|---|
| Component visual specs | Inside PRD or design files | Phase 1 (with UX) |
| Design tokens | `handytool-ui/src/styles/` | When tokens change |
| Visual review report | `.claude/reviews/<feature>-ui-review.md` | Phase 3 |
| Dark mode audit | Part of visual review | Phase 3 |
