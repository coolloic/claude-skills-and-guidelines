# Tool Development Pattern — Toolk1t Client

Every tool in toolk1t-client MUST follow this directory and component pattern.

## Directory Structure

```
toolk1t-client/
├── app/tools/<toolname>/
│   └── page.tsx                  # Next.js page route (the entry point)
├── tools/<toolname>/
│   ├── <component-a>.tsx         # Tool-specific components
│   ├── <component-b>.tsx
│   └── ...
├── components/ui/                # Shared reusable UI primitives
│   ├── glass-card.tsx
│   ├── search-bar.tsx
│   ├── info-card.tsx
│   ├── badge.tsx
│   ├── detail-list.tsx
│   ├── icon-box.tsx
│   └── copy-button.tsx
├── components/layout/            # Shared layout components
│   ├── header.tsx
│   └── footer.tsx
└── ...
```

## Rules

1. **Route page** lives in `app/tools/<toolname>/page.tsx`
   - This is a `'use client'` page that composes tool-specific components
   - Uses mock data initially, wired to API later

2. **Tool-specific components** live in `tools/<toolname>/`
   - These are components unique to this tool
   - They import reusable components from `@/components/ui/`
   - They should NOT be imported by other tools

3. **Reusable UI components** live in `components/ui/`
   - Generic, tool-agnostic primitives
   - Accept props, no hardcoded data
   - Use CSS custom properties for brand colors: `var(--tk-color-primary-500)`

4. **Imports** use the `@/` path alias (maps to project root)
   ```tsx
   import { GlassCard } from '@/components/ui/glass-card'
   import { IpHeroCard } from '@/tools/ipcheck/ip-hero-card'
   ```

5. **Styling**: Tailwind utility classes + SCSS (never plain `.css`), reference `--tk-*` CSS custom properties for brand colors

6. **Responsive**: Mobile-first. Use Tailwind responsive prefixes (`md:`, `lg:`)

7. **Component extraction**: If a component could be used by 2+ tools, extract it to `components/ui/`

8. **Testing** (MANDATORY): Every tool MUST be verified using the `webapp-testing` skill
   - Testing is a **delivery requirement** — a tool is not complete without verification
   - Cover: page load, core user flow, error states, loading states, responsive layout, keyboard access
   - Use the `webapp-testing` skill to launch a browser, navigate, interact, and verify behavior

## Example: IP Check Tool

```
app/tools/ipcheck/page.tsx          → route entry, composes everything
tools/ipcheck/ip-hero-card.tsx      → hero card with IP display
tools/ipcheck/ip-info-grid.tsx      → 4-card info grid
tools/ipcheck/location-detail.tsx   → location details + map
tools/ipcheck/location-map.tsx      → Leaflet map (dynamic import, ssr: false)
```

Reusable components used:
- `components/ui/glass-card.tsx`
- `components/ui/search-bar.tsx`
- `components/ui/info-card.tsx`
- `components/ui/badge.tsx`
- `components/ui/detail-list.tsx`
- `components/ui/icon-box.tsx`
- `components/ui/copy-button.tsx`
