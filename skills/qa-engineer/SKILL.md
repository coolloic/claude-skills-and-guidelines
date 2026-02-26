---
name: qa-engineer
description: Use when planning test strategy, writing test cases, reviewing test coverage, validating acceptance criteria, performing regression testing, or ensuring the product matches requirements. Covers test planning, manual testing, automated testing (Playwright E2E), bug reporting, and quality standards.
---

# QA Engineer & QA Lead

## Overview

Quality Assurance skill covering both QA Engineer (hands-on testing) and QA Lead (strategy and standards) responsibilities. Ensures the product matches initial requirements, identifies bugs and vulnerabilities through systematic testing, and enforces quality standards across the team.

## When to Use

- Planning test strategy for a new feature
- Writing test cases from acceptance criteria
- Reviewing existing test coverage for gaps
- Performing systematic exploratory testing
- Writing bug reports
- Validating that fixes actually resolve the reported issue
- Reviewing E2E test quality and completeness
- Ensuring industry and project quality standards are met

---

## 1. Test Strategy (QA Lead)

### 1.1 Test Pyramid

```
          ┌───────────┐
          │   E2E     │  ← Fewest: critical user journeys (Playwright)
          │  Tests    │     ~10-20% of total tests
         ┌┴───────────┴┐
         │ Integration  │  ← Middle: API endpoints, component interactions
         │   Tests      │     ~20-30% of total tests
        ┌┴─────────────┴┐
        │   Unit Tests   │  ← Most: functions, utils, validators
        │                │     ~50-60% of total tests
        └────────────────┘
```

### 1.2 Test Types for HandyTool

| Type | Tool | Scope | When to Run |
|---|---|---|---|
| **E2E** | Playwright | Full user journey in browser | Pre-release, CI |
| **Integration** | Vitest/Jest | API routes, data transformations | Every commit |
| **Unit** | Vitest/Jest | Pure functions, validators, helpers | Every commit |
| **Visual regression** | Playwright screenshots | Layout, dark mode, responsive | Pre-release |
| **Accessibility** | axe-core + Playwright | WCAG compliance | Pre-release |
| **Performance** | Lighthouse CI | Core Web Vitals | Pre-release |

### 1.3 Quality Standards

| Standard | Threshold | Enforcement |
|---|---|---|
| E2E coverage | Every tool has a spec file | CI gate |
| Build pass | Zero errors | CI gate |
| TypeScript strict | Zero type errors | CI gate |
| WCAG AA | Zero critical violations | Pre-release check |
| Lighthouse performance | Score ≥ 90 | Pre-release check |
| Response time (API) | P95 < 500ms for lookups | Monitoring |

---

## 2. Test Planning (from Acceptance Criteria)

### 2.1 AC → Test Case Mapping

Every acceptance criterion becomes one or more test cases:

```
AC: Given the user enters a valid IP,
    When they click Lookup,
    Then geolocation data is displayed within 3 seconds.

Test Cases:
  TC1: Enter "8.8.8.8" → click Lookup → verify city, country, ISP visible
  TC2: Enter "1.1.1.1" → click Lookup → verify results within 3s timeout
  TC3: Enter IPv6 "2001:4860:4860::8888" → click Lookup → verify results
```

### 2.2 Test Case Template

```markdown
**TC-[ID]**: [Short title]
**Priority**: P1 (Critical) / P2 (High) / P3 (Medium) / P4 (Low)
**Precondition**: [Setup required before test]
**Steps**:
  1. [Action]
  2. [Action]
  3. [Action]
**Expected Result**: [What should happen]
**Actual Result**: [Fill during execution]
**Status**: Pass / Fail / Blocked / Skipped
```

### 2.3 Test Coverage Matrix

For every feature, create a coverage matrix:

| Area | Happy Path | Error Path | Edge Case | Mobile | Dark Mode | a11y |
|---|---|---|---|---|---|---|
| Page load | TC-01 | TC-02 | - | TC-10 | TC-15 | TC-20 |
| Search/submit | TC-03 | TC-04 | TC-05 | TC-11 | TC-16 | TC-21 |
| Results display | TC-06 | TC-07 | TC-08 | TC-12 | TC-17 | TC-22 |
| Refresh/retry | TC-09 | - | - | TC-13 | TC-18 | TC-23 |

---

## 3. E2E Testing with Playwright

### 3.1 Test Structure

```
e2e/
├── <toolname>.spec.ts       # One spec per tool
├── fixtures/                 # Shared test data
│   └── mock-responses.ts     # API mock data
└── helpers/                  # Shared test utilities
    └── setup.ts              # Common setup (routes, etc.)
```

### 3.2 What Every E2E Spec MUST Cover

| Category | Tests Required |
|---|---|
| **Page load** | Renders without errors, key elements visible |
| **Core flow** | Primary use case end-to-end (search → results) |
| **Error handling** | Invalid input, API failure, network error |
| **Loading state** | Skeleton/spinner appears during async ops |
| **Responsive** | Mobile (375px) + Desktop (1280px) layouts |
| **Keyboard** | Tab navigation, Enter to submit, Escape to close |
| **Dark mode** | All content visible in `prefers-color-scheme: dark` |

### 3.3 E2E Best Practices

| Practice | Rule |
|---|---|
| **Locators** | Use `getByRole()`, `getByLabel()`, `getByText()` — never CSS selectors |
| **API mocking** | Always `page.route()` for deterministic tests |
| **Independence** | Each `test()` runs independently, no shared state |
| **Assertions** | `expect(locator).toBeVisible()` over `waitForSelector` |
| **Timeouts** | Set reasonable timeouts, don't rely on arbitrary waits |
| **Data** | Use realistic but deterministic test data |

### 3.4 Playwright Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('[Tool Name]', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/v1/<endpoint>*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { /* mock data */ } }),
      }),
    )
    await page.goto('/tools/<toolname>')
  })

  test('loads page with key elements visible', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible()
    // Verify primary UI elements
  })

  test('completes primary user flow', async ({ page }) => {
    // Perform main action
    // Verify result
  })

  test('handles errors gracefully', async ({ page }) => {
    await page.route('**/api/v1/<endpoint>*', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Failed' }) }),
    )
    // Trigger action
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    // Verify layout
  })

  test('keyboard accessible', async ({ page }) => {
    // Tab to input, type, Enter to submit
    // Verify result without mouse
  })
})
```

---

## 4. Bug Reporting

### 4.1 Bug Report Template

```markdown
## Bug: [Short descriptive title]

**Severity**: Critical / Major / Minor / Cosmetic
**Priority**: P1 / P2 / P3 / P4
**Environment**: Browser, OS, viewport, dark/light mode
**Build/Commit**: [hash or version]

### Steps to Reproduce
1. [Step]
2. [Step]
3. [Step]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshot / Recording
[Attach if applicable]

### Additional Context
[Console errors, network responses, related issues]
```

### 4.2 Severity Classification

| Severity | Definition | Example | SLA |
|---|---|---|---|
| **Critical** | Feature broken, no workaround, data loss | App crashes on submit, blank page | Fix immediately |
| **Major** | Feature impaired, workaround exists | Error not shown, wrong data displayed | Fix this iteration |
| **Minor** | Feature works but UX is poor | Misaligned element, slow loading | Fix next iteration |
| **Cosmetic** | Visual imperfection only | 1px border missing, wrong shade | Backlog |

---

## 5. Regression Testing

### 5.1 When to Run Regression

| Trigger | Scope |
|---|---|
| New feature merged | Full regression on affected tool + smoke test all tools |
| Bug fix merged | Targeted regression on fixed area + smoke test |
| Dependency update | Full regression all tools |
| Pre-release | Full regression all tools + cross-browser |

### 5.2 Smoke Test Checklist (All Tools)

Quick pass to verify nothing is broken:

- [ ] `/tools` page loads, all tool cards visible
- [ ] Each tool page loads without console errors
- [ ] Primary action works on each tool (search, upload, convert, etc.)
- [ ] Dark mode toggle works across all pages
- [ ] Mobile layout doesn't break on any page

---

## 6. QA Review in Dev Lifecycle

### Phase 2 — During Development

- QA reviews acceptance criteria for testability
- QA writes test cases in parallel with development
- QA sets up E2E test stubs (before implementation is complete)

### Phase 3 — After Development

- QA executes all test cases (manual + automated)
- QA performs exploratory testing (beyond scripted tests)
- QA files bugs with severity/priority
- QA signs off with **QA Approval** or **QA Rejected** (with bug list)

### QA Sign-Off Criteria

- [ ] All P1/P2 test cases pass
- [ ] Zero critical/major bugs open
- [ ] E2E tests pass on Chromium, Firefox, WebKit
- [ ] Mobile viewport tested (375px)
- [ ] Dark mode tested
- [ ] Accessibility check passes (no critical axe violations)
- [ ] Regression smoke test passes on all other tools

---

## 7. QA Artifacts

| Artifact | Location | Created When |
|---|---|---|
| Test plan | `.claude/qa/<feature>-test-plan.md` | Phase 2 (parallel with dev) |
| Test cases | Inside test plan | Phase 2 |
| Bug reports | `.claude/qa/bugs/` | Phase 3 (during testing) |
| QA sign-off | `.claude/reviews/<feature>-qa-signoff.md` | Phase 3 (after testing) |
| E2E test code | `handytool-client/e2e/<toolname>.spec.ts` | Phase 2 |
| Regression results | `.claude/qa/regression/` | Pre-release |
