---
name: product-owner
description: Use when starting a new feature (Phase 1 BA/discovery), reviewing completed implementation (Phase 3 PO review), or deciding whether a feature meets the quality bar. Covers user story refinement, acceptance criteria, UX review, competitive benchmarking, and iterative improvement cycles.
---

# Product Owner

## Overview

Product Owner skill for evaluating features from the user's perspective. Operates at two critical points in the development lifecycle: **Phase 1** (discovery & requirements) and **Phase 3** (review & improvement). The PO ensures every feature ships with clear intent, polished UX, and competitive quality — iterating until it "looks awesome."

## When to Use

- **Phase 1 — Discovery**: Before any implementation begins, to define what we're building and why
- **Phase 3 — Review**: After development and testing are complete, to evaluate the result
- **Improvement cycle**: When the PO review identifies gaps, to refine requirements for the next iteration
- **Prioritization**: When deciding which features or improvements to tackle next
- **Quality gate**: Before marking a feature as "done" or creating a release

---

## 1. Phase 1 — Discovery & Requirements (with BA)

The PO works alongside Business Analysis to define the feature before any code is written.

### 1.1 PRD (Product Requirements Document) — MANDATORY

Every feature MUST have a PRD before development begins. The PO writes and maintains the PRD throughout the lifecycle.

**Location**: `.claude/prd/<feature-name>.md`

**PRD Contents** (all sections required):

| Section | Purpose |
|---|---|
| **Problem Statement** | What problem, who has it, why it matters |
| **Target User** | Primary user persona, context (mobile/desktop, technical level) |
| **Success Metrics** | Measurable outcomes (task completion rate, time-on-task, error rate) |
| **Competitive Landscape** | Top 3 competitors evaluated with comparison table |
| **User Stories** | All stories with Given/When/Then acceptance criteria |
| **Scope** | In scope AND out of scope (prevents scope creep) |
| **User Flow** | Step-by-step happy path + error paths |
| **Edge Cases & Error States** | Table of scenarios and expected behaviors |
| **Technical Notes** | Constraints, API limits, dependencies |
| **Open Questions** | Unresolved items to discuss before dev starts |

**PRD Lifecycle**:
- **Phase 1**: PO creates the PRD, status = `Draft` → `Approved`
- **Phase 2**: Status = `In Progress` (dev references it)
- **Phase 3**: If NEEDS ITERATION, PO appends an iteration section (never overwrites original)
- **Release**: Status = `Done`

The PRD is the **single source of truth** for what the feature should do. Dev implements against the PRD. PO reviews against the PRD.

### 1.2 User Story Format

Every feature MUST start with a user story:

```
As a [user type],
I want to [action/goal],
So that [benefit/value].
```

### 1.3 Acceptance Criteria (MANDATORY)

Each user story MUST have measurable acceptance criteria using Given/When/Then:

```
Given [precondition],
When [action],
Then [expected outcome].
```

**Example — IP Check Tool:**
```
Story: As a network admin, I want to look up any IP address, so that I can identify its location and ISP.

AC1: Given the user is on the IP Check page,
     When they enter a valid IP (e.g., 8.8.8.8) and click Lookup,
     Then the page shows city, country, ISP, ASN, and proxy status within 3 seconds.

AC2: Given the user enters an invalid value (e.g., "abc"),
     When they click Lookup,
     Then an inline error message appears without page reload.

AC3: Given the user enters a domain name (e.g., google.com),
     When they click Lookup,
     Then the domain resolves to an IP and geolocation is displayed.
```

### 1.4 Discovery Checklist

Before approving for development:

- [ ] **Problem statement** — What problem does this solve? Who has this problem?
- [ ] **Target user** — Who is the primary user? What's their context (mobile, desktop, technical level)?
- [ ] **Success metric** — How do we know this feature is working? (e.g., task completion rate, time-on-task)
- [ ] **Competitive scan** — How do the top 3 competitors handle this? What can we do better?
- [ ] **Scope boundary** — What is explicitly OUT of scope for this iteration?
- [ ] **User flow** — Step-by-step flow from entry to completion (happy path + error paths)
- [ ] **Acceptance criteria** — All ACs written and testable
- [ ] **Edge cases** — Empty states, error states, loading states, extreme inputs documented
- [ ] **Mobile consideration** — How does this work on a 375px screen?
- [ ] **Accessibility** — Any special a11y considerations beyond standard WCAG AA?

### 1.5 Competitive Benchmarking

For every new tool, the PO MUST evaluate the top 3 existing solutions:

| Criteria | Competitor A | Competitor B | Competitor C | Our Target |
|---|---|---|---|---|
| Core feature set | | | | |
| Load time | | | | |
| Mobile UX | | | | |
| Unique differentiator | | | | |
| Weaknesses we can exploit | | | | |

**Goal**: Not just parity — find one thing we do noticeably better.

---

## 2. Phase 3 — PO Review (Post-Development, Post-Test)

After development is complete and tests pass, the PO reviews the implementation against the original requirements.

### 2.1 Review Dimensions

The PO evaluates across 7 dimensions, scoring each 1–5:

| Dimension | What to Evaluate | Pass Threshold |
|---|---|---|
| **Functional completeness** | Do all acceptance criteria pass? Any missing behavior? | All ACs met |
| **UX polish** | Does it feel smooth? Transitions, feedback, micro-interactions? | Score ≥ 4 |
| **Visual quality** | Alignment, spacing, typography, color consistency? | Score ≥ 4 |
| **Error handling** | Are errors clear, actionable, and recoverable? | Score ≥ 4 |
| **Performance feel** | Does it feel fast? Loading states smooth? No jank? | Score ≥ 4 |
| **Mobile experience** | Does it work well on phone? Touch targets, layout, scroll? | Score ≥ 3 |
| **Delight factor** | Would a user think "this is nice"? Any wow moments? | Score ≥ 3 |

### 2.2 Review Output Format

The PO review MUST produce a structured report:

```markdown
## PO Review: [Feature Name]

**Date**: YYYY-MM-DD
**Build/Commit**: [hash]
**Reviewer**: Product Owner

### Scores
| Dimension | Score (1-5) | Notes |
|---|---|---|
| Functional completeness | | |
| UX polish | | |
| Visual quality | | |
| Error handling | | |
| Performance feel | | |
| Mobile experience | | |
| Delight factor | | |

### Verdict: APPROVED / NEEDS ITERATION

### What's Great
- [List things that work well — acknowledge good work]

### Improvements Required (if NEEDS ITERATION)
1. [Specific, actionable improvement with priority: P1/P2/P3]
2. [Another improvement]

### Suggestions (Nice-to-Have)
- [Optional enhancements for future iterations]
```

### 2.3 Severity Levels for Improvements

| Priority | Meaning | Action |
|---|---|---|
| **P1 — Blocker** | Broken functionality, missing AC, accessibility violation | Must fix before release |
| **P2 — Important** | Poor UX, confusing flow, visual inconsistency | Fix in current iteration |
| **P3 — Polish** | Minor visual tweaks, nice-to-have enhancements | Fix if time permits, else next iteration |

### 2.4 Common PO Review Catches

Things the PO should specifically look for:

- **Empty states**: What does the page look like before any action? Is it helpful or just blank?
- **Loading perception**: Does the loading state feel fast? Skeleton > spinner > nothing
- **Error recovery**: Can the user recover from errors without starting over?
- **Copy/text quality**: Are labels clear? Is anything ambiguous or too technical?
- **Consistency**: Does this match the look and feel of other tools in the suite?
- **First impression**: What does a new user see? Is the value proposition clear in 5 seconds?
- **Edge cases**: Very long text, missing data, slow network, rapid clicking

---

## 3. The Iteration Cycle

When a PO review results in "NEEDS ITERATION," the cycle restarts:

```
Phase 3 Review → NEEDS ITERATION
    ↓
Phase 1 (Refined)
    - Update acceptance criteria based on PO feedback
    - Add new ACs for identified improvements
    - Re-scope if needed
    ↓
Phase 2 (Dev + Test)
    - Implement improvements
    - Run tests (unit + E2E)
    ↓
Phase 3 (Re-review)
    - PO re-evaluates
    - Focus on previously flagged items
    - Score must improve or maintain
    ↓
APPROVED → Release
```

### Iteration Rules

- **Maximum 3 iterations** per feature before forced release (avoid perfection paralysis)
- Each iteration should be **smaller and faster** than the previous one
- P1 items from review MUST be fixed; P3 items MAY be deferred
- The PO documents what was deferred and why (backlog transparency)
- Iteration 2+ reviews should take < 30 minutes (focused on deltas only)

---

## 4. Prioritization Framework

When multiple features or improvements compete for attention:

### RICE Score

```
RICE = (Reach × Impact × Confidence) / Effort

Reach:      How many users does this affect? (1-10)
Impact:     How much does it improve their experience? (0.25, 0.5, 1, 2, 3)
Confidence: How sure are we about the estimates? (50%, 80%, 100%)
Effort:     Person-hours to implement (1, 2, 4, 8, 16, 32)
```

### Quick Prioritization for Improvements

| If the improvement is... | Then... |
|---|---|
| Broken functionality | Fix immediately (P1) |
| User-facing confusion | Fix this iteration (P2) |
| Visual polish | Fix if < 30 min effort, else defer (P3) |
| Nice-to-have enhancement | Add to backlog, prioritize by RICE |
| Competitive gap | Evaluate reach/impact, schedule if RICE > threshold |

---

## 5. Quality Bar — "Looks Awesome" Definition

A feature is "awesome" when:

- [ ] All acceptance criteria pass without workarounds
- [ ] A non-technical user can complete the task without help
- [ ] The loading experience feels instant or has smooth progressive disclosure
- [ ] Error messages tell the user what happened AND what to do next
- [ ] It works on mobile without horizontal scrolling or tiny touch targets
- [ ] It matches or exceeds the top competitor on at least one dimension
- [ ] The PO would be proud to demo it to a stakeholder
- [ ] No dimension scores below 3 in the review
- [ ] Average score across all dimensions is ≥ 4

---

## 6. PO Artifacts

The PO maintains these documents:

| Artifact | Location | Updated When |
|---|---|---|
| Feature backlog | `.claude/backlog.md` | New features identified |
| User stories | `.claude/stories/<feature>.md` | Phase 1 discovery |
| PO review reports | `.claude/reviews/<feature>-review.md` | Phase 3 review |
| Competitive benchmarks | `.claude/benchmarks/<tool>.md` | New tool planned |
| Iteration log | `.claude/session-log.md` | Each iteration cycle |
