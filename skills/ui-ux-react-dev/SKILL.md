---
name: ui-ux-react-dev
description: Use when building UI components, implementing responsive layouts, improving accessibility, optimizing frontend performance, or reviewing React/Next.js code for UI/UX best practices. Covers WCAG accessibility, color contrast, responsive design, Core Web Vitals, and component architecture.
---

# UI/UX React Development Expert

## Overview

Comprehensive UI/UX implementation skill for React and Next.js applications. Enforces accessibility (WCAG 2.1 AA), responsive design, performance optimization, and modern component patterns.

## When to Use

- Building new UI components or pages
- Reviewing existing UI for accessibility compliance
- Implementing responsive layouts (mobile-first)
- Optimizing frontend performance (Core Web Vitals)
- Checking color contrast ratios
- Structuring component architecture
- Implementing design system tokens

---

## 1. Accessibility (WCAG 2.1 AA)

### Color Contrast

| Element | Minimum Ratio | Standard |
|---------|--------------|----------|
| Normal text (<18px) | **4.5:1** | WCAG AA |
| Large text (≥18px bold, ≥24px) | **3:1** | WCAG AA |
| UI components & icons | **3:1** | WCAG AA |
| Enhanced (AAA) normal text | **7:1** | WCAG AAA |
| Enhanced (AAA) large text | **4.5:1** | WCAG AAA |

**Validation tools:**
```bash
# Check contrast programmatically
npx @accessibility/contrast-checker "#3D79F2" "#ffffff"

# Lighthouse accessibility audit
npx lighthouse https://example.com --only-categories=accessibility --view
```

**Rules:**
- NEVER use color as the only indicator (add icons, underlines, or patterns)
- Test with grayscale filter to verify non-color cues
- Ensure focus indicators have ≥3:1 contrast against adjacent colors
- Dark mode must meet the same contrast requirements

### Keyboard Navigation

```tsx
// Every interactive element must be keyboard accessible
<button onClick={handleAction}>...</button>  // ✅ Native keyboard support
<div onClick={handleAction}>...</div>        // ❌ Not keyboard accessible

// If using non-semantic elements, add proper ARIA:
<div
  role="button"
  tabIndex={0}
  onClick={handleAction}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleAction()
    }
  }}
>...</div>
```

**Focus management checklist:**
- All interactive elements are focusable via Tab
- Focus order follows visual order (no positive `tabIndex` values)
- Focus is visible with a clear ring (≥2px, ≥3:1 contrast)
- Modal dialogs trap focus within
- Focus returns to trigger when dialogs close
- Skip navigation link for keyboard users

### Semantic HTML

```tsx
// ✅ Correct semantic structure
<header>...</header>
<nav aria-label="Main navigation">...</nav>
<main>
  <article>
    <h1>Page Title</h1>
    <section aria-labelledby="section-heading">
      <h2 id="section-heading">Section</h2>
    </section>
  </article>
</main>
<aside>...</aside>
<footer>...</footer>
```

**Rules:**
- One `<h1>` per page
- Headings are sequential (h1 → h2 → h3, never skip)
- Use `<button>` for actions, `<a>` for navigation
- Lists use `<ul>`, `<ol>`, `<dl>` appropriately
- Forms use `<label>` with `htmlFor` or wrapping
- Tables use `<th>`, `<caption>`, and `scope`

### ARIA Guidelines

```tsx
// Images
<Image alt="Descriptive text for screen readers" ... />  // ✅ Informative
<Image alt="" role="presentation" ... />                  // ✅ Decorative

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Loading states
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Spinner aria-label="Loading results" /> : <Results />}
</div>

// Expandable sections
<button aria-expanded={isOpen} aria-controls="panel-id">Toggle</button>
<div id="panel-id" role="region">{isOpen && <Content />}</div>
```

### Screen Reader Testing Checklist

1. Every image has meaningful `alt` or is marked decorative
2. Form inputs have visible labels
3. Error messages are associated with inputs via `aria-describedby`
4. Dynamic content updates use `aria-live`
5. Custom components have correct ARIA roles
6. Page title describes the page content

---

## 2. Responsive Design (Mobile-First)

### Breakpoint System

```
xs:  0       → Mobile (default styles, no media query)
sm:  640px   → Large phone / small tablet
md:  768px   → Tablet portrait
lg:  1024px  → Tablet landscape / small desktop
xl:  1280px  → Desktop
2xl: 1536px  → Wide desktop
```

### Implementation Pattern

```tsx
// ✅ Mobile-first: start with mobile, add complexity up
<div className="
  grid grid-cols-1          // mobile: single column
  md:grid-cols-2            // tablet: 2 columns
  lg:grid-cols-4            // desktop: 4 columns
  gap-4                     // consistent gap
  px-4 md:px-6 lg:px-8     // progressive padding
">
```

### Touch Targets

| Element | Minimum Size | Spacing |
|---------|-------------|---------|
| Buttons / links | **44x44px** | 8px between targets |
| Form inputs | **44px height** | - |
| Icon buttons | **44x44px** touch area (icon can be smaller) | 8px |

```tsx
// ✅ Adequate touch target even with small icon
<button className="p-3 min-w-[44px] min-h-[44px]">
  <Icon className="w-5 h-5" />
</button>
```

### Responsive Typography (Fluid)

Use `clamp()` for headings that scale smoothly:

```css
h1 { font-size: clamp(2rem, 1.5rem + 2.5vw, 3.5rem); }    /* 32px → 56px */
h2 { font-size: clamp(1.75rem, 1.35rem + 2vw, 3rem); }     /* 28px → 48px */
h3 { font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem); }  /* 24px → 36px */
h4 { font-size: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem); } /* 20px → 28px */
```

### Responsive Images

```tsx
<Image
  src="/hero.webp"
  alt="Descriptive alt text"
  width={1200}
  height={630}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px"
  priority  // above-the-fold only
  className="w-full h-auto"
/>
```

---

## 3. Performance (Core Web Vitals)

### Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | <2.5s | 2.5s–4.0s | >4.0s |
| **INP** (Interaction to Next Paint) | <200ms | 200ms–500ms | >500ms |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.1–0.25 | >0.25 |

### LCP Optimization

```tsx
// ✅ Preload hero images
<link rel="preload" as="image" href="/hero.webp" />

// ✅ Use priority prop on above-fold images
<Image src="/hero.webp" priority alt="..." width={1200} height={630} />

// ✅ Avoid lazy-loading above-fold content
// ❌ Don't: <Image loading="lazy" /> for hero images
```

### CLS Prevention

```tsx
// ✅ Always set dimensions on images/videos
<Image width={800} height={600} alt="..." src="..." />

// ✅ Reserve space for dynamic content
<div className="min-h-[300px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// ✅ Avoid injecting content above existing content
// ❌ Don't: dynamically insert banners above the fold
```

### INP Optimization

```tsx
// ✅ Defer expensive operations
function handleClick() {
  startTransition(() => {
    setExpensiveState(newValue)
  })
}

// ✅ Use dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./chart'), { ssr: false })

// ✅ Debounce rapid user input
const debouncedSearch = useDebouncedCallback((value) => {
  fetchResults(value)
}, 300)
```

### Bundle Optimization

```tsx
// ✅ Dynamic imports for below-fold or conditional components
const Map = dynamic(() => import('./map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

// ✅ Use server components by default (no 'use client' unless needed)
// Only add 'use client' when you need: useState, useEffect, onClick, etc.
```

---

## 4. Component Architecture

### Component Hierarchy

```
components/
├── ui/              # Atomic design tokens (button, badge, input)
├── layout/          # Structural (header, footer, sidebar)
└── [feature]/       # Feature-specific compositions

tools/
└── [toolname]/      # Tool-specific components (not shared)
```

### Component Rules

1. **Single responsibility** — each component does one thing
2. **Props over internal state** — parent controls behavior
3. **Composition over configuration** — use children/slots, not mega-props
4. **No hardcoded data** — all content via props
5. **Use CSS custom properties** — `var(--ht-color-primary-500)` for brand colors
6. **Accessible by default** — proper ARIA, keyboard support built-in

### Example Pattern

```tsx
// ✅ Good: Composable, accessible, responsive
interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 ${className}`}
      role="region"
    >
      {children}
    </div>
  )
}
```

---

## 5. Pre-Implementation Checklist

Before writing any UI component, verify:

- [ ] Color contrast meets 4.5:1 for text, 3:1 for UI elements
- [ ] Touch targets are ≥44x44px
- [ ] Layout is mobile-first with progressive enhancement
- [ ] All images have `alt`, `width`, `height`
- [ ] Interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Headings follow sequential hierarchy
- [ ] Dynamic content uses `aria-live` where needed
- [ ] Loading/error states are handled
- [ ] Dark mode meets same contrast standards

## 6. Post-Implementation Review

After building, run:

```bash
# Lighthouse full audit
npx lighthouse http://localhost:3000/page --view

# Accessibility audit
npx axe http://localhost:3000/page

# Check HTML validity
npx html-validate dist/**/*.html
```

Verify:
- [ ] Lighthouse accessibility score ≥90
- [ ] Lighthouse performance score ≥90
- [ ] No axe violations
- [ ] Renders correctly at 320px, 768px, 1280px, 1536px
- [ ] Dark mode renders correctly
- [ ] Keyboard-only navigation works end-to-end
