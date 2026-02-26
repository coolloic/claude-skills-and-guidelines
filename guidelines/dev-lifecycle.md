# Development Lifecycle — Toolk1t

Every feature MUST follow this lifecycle. No phase can be skipped. All roles participate at defined points.

---

## Team Roles

| Role | Skill | Responsibility |
|---|---|---|
| **Product Owner (PO)** | `product-owner` | Product vision, PRD, backlog priority, feature approval, iteration decisions |
| **Business Analyst (BA)** | `business-analyst` | Translate business needs into functional specs, user stories, acceptance criteria, edge case analysis |
| **UX Designer** | `ux-designer` | User research, user flows, wireframes, interaction design, usability heuristics |
| **UI Designer** | `ui-designer` | Visual design, color/typography, component specs, dark mode, design consistency |
| **Software Architect** | `architect` | System design, tech stack, NFRs (security, performance, caching, scalability) |
| **Front-end Developer** | `ui-ux-react-dev` | React/Next.js implementation, responsive layouts, accessibility, client-side logic |
| **Back-end Developer** | `api-dev` | API endpoints, validation, auth, rate limiting, caching, database |
| **SEO Specialist** | `seo-expert` | Meta tags, structured data, Core Web Vitals, semantic HTML |
| **QA Engineer** | `qa-engineer` | Test planning, test cases, manual testing, `webapp-testing` verification, bug reports |
| **QA Lead** | `qa-engineer` | Test strategy, quality standards, sign-off authority, regression scope |

---

## Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  Phase 1               Phase 2               Phase 3                     │
│  DISCOVERY             BUILD                  REVIEW                     │
│  ──────────            ─────                  ──────                     │
│  PO + BA + UX + UI     Dev + QA (parallel)    PO + UX + UI + QA          │
│  + Architect                                                             │
│                                                                          │
│  PRD                   Implementation         PO Review (7 dims)         │
│  User Stories          Front-end + Back-end   UX Heuristic Review        │
│  UX Flows              webapp-testing (QA)         UI Visual Review           │
│  UI Specs              QA Test Cases          QA Sign-off                │
│  Architecture          Build passes           Architect NFR check        │
│                                                                          │
│                                                    │                     │
│                                                    ▼                     │
│                                              ┌──────────┐               │
│                                              │APPROVED? │               │
│                                              └─────┬────┘               │
│                                              YES   │   NO               │
│                                              ▼     │   ▼                │
│                                           RELEASE  │  Back to Phase 1   │
│                                                    │  (refine & iterate)│
│                                                    │                     │
│                       ◄───────────────────────────┘                     │
│                                                                          │
│  Max 3 iterations per feature before forced release                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 — Discovery

**Duration**: Before any code is written
**Goal**: Define what we're building, why, and how it should look and work

### Role Responsibilities

| Role | What They Do | Output |
|---|---|---|
| **PO** | Writes PRD, defines vision, prioritizes, approves scope | PRD (`.claude/prd/<feature>.md`) |
| **BA** | Elicits requirements, writes user stories + ACs, maps edge cases | User stories with Given/When/Then ACs inside PRD |
| **UX Designer** | User research, persona, user flow, interaction design, state design | User flows, wireframes, 5-state design inside PRD |
| **UI Designer** | Visual specs, color/typography, component specs, dark mode plan | Component visual specs inside PRD |
| **Architect** | Technical feasibility, NFR assessment (security, perf, cache, scale) | Architecture section in PRD, NFR checklist |
| **QA Lead** | Reviews ACs for testability, plans test strategy | Initial test plan (`.claude/qa/<feature>-test-plan.md`) |

### Workflow Order

```
1. PO defines problem statement + target user + success metrics
2. BA elicits detailed requirements, writes user stories + ACs
3. UX designs user flows, wireframes, interaction specs, 5 states
4. UI designs visual specs, component styling, dark mode plan
5. Architect reviews feasibility, defines NFRs (security, perf, cache)
6. QA Lead reviews ACs for testability, drafts test strategy
7. PO performs competitive scan + final review
8. PO approves PRD → GATE to Phase 2
```

### PRD (MANDATORY)

Every feature MUST have a PRD before development begins.

**Location**: `.claude/prd/<feature-name>.md`

```markdown
# PRD: [Feature Name]

**Author**: Product Owner
**Date**: YYYY-MM-DD
**Status**: Draft | In Review | Approved | In Progress | Done
**Iteration**: 1

## 1. Problem Statement
[What problem? Who has it? Why does it matter?]

## 2. Target User
**Persona**: [Name / Role]
**Technical Level**: Beginner / Intermediate / Advanced
**Context**: Desktop / Mobile / Both
**Goals**: [What they want to accomplish]
**Frustrations**: [Current pain points]

## 3. Success Metrics
| Metric | Target | How to Measure |
|---|---|---|
| Task completion | > 90% | webapp-testing verification |
| Time to result | < 3 seconds | Performance monitoring |
| Error rate | < 5% | Error logging |

## 4. Competitive Landscape
| Criteria | Competitor A | Competitor B | Competitor C | Our Target |
|---|---|---|---|---|
| Core features | | | | |
| UX quality | | | | |
| Performance | | | | |
| Our differentiator | | | | |

## 5. User Stories (BA)

### Story 1: [Title]
As a [user type], I want to [action], so that [benefit].

**Acceptance Criteria:**
- Given [precondition], When [action], Then [outcome].
- Given [precondition], When [action], Then [outcome].

### Story 2: [Title]
...

## 6. User Experience (UX Designer)

### User Flow
1. User lands on [page]
2. User sees [initial state]
3. User [action]
4. System [response]
5. ...

### 5-State Design
| State | What User Sees | UX Notes |
|---|---|---|
| Empty | [First visit] | [Helpful hint, invitation] |
| Loading | [Waiting] | [Skeleton UI, perceived progress] |
| Success | [Results] | [Clear hierarchy, actions] |
| Error | [Failure] | [Explanation + recovery action] |
| Partial | [Some data] | [Graceful degradation] |

### Interaction Notes
[Micro-interactions, transitions, feedback behaviors]

## 7. Visual Design (UI Designer)

### Component Specs
[Visual specifications for key components — colors, spacing, typography, states]

### Dark Mode
[Dark mode color mapping, known contrast issues to watch]

### Responsive Breakpoints
[Mobile-specific layout changes, touch target notes]

## 8. Scope
### In Scope
- [Feature/behavior included]

### Out of Scope
- [Explicitly excluded]

## 9. Edge Cases & Error States (BA)
| Scenario | Input | Expected Behavior | Priority |
|---|---|---|---|
| Empty input | "" | [What happens] | P2 |
| Invalid input | [bad data] | [What happens] | P1 |
| Network failure | offline | [What happens] | P1 |
| Extreme input | [very long] | [What happens] | P3 |

## 10. Architecture & NFRs (Architect)

### Technical Approach
[High-level architecture, key technology choices]

### Non-Functional Requirements
| NFR | Requirement | Implementation |
|---|---|---|
| Security | [e.g., input validation, no PII in logs] | [Zod, sanitization] |
| Performance | [e.g., < 500ms response] | [Cache TTL, code splitting] |
| Caching | [e.g., 5-min TTL for geo data] | [.env configurable] |
| Rate Limiting | [e.g., 30 req/min] | [.env configurable] |
| Scalability | [e.g., stateless API] | [No server sessions] |

## 11. Open Questions
- [Unresolved items]
```

### Phase 1 Gate — Checklist

Before moving to Phase 2, ALL must be checked:

- [ ] **PO**: PRD written with problem statement, target user, success metrics
- [ ] **BA**: All user stories have Given/When/Then acceptance criteria
- [ ] **BA**: Edge cases documented in matrix form
- [ ] **UX**: User flows designed (happy path + error paths)
- [ ] **UX**: All 5 states designed (empty, loading, success, error, partial)
- [ ] **UI**: Visual specs defined (colors, spacing, typography, dark mode)
- [ ] **Architect**: Technical feasibility confirmed
- [ ] **Architect**: NFRs assessed (security, performance, cache, rate limit)
- [ ] **QA Lead**: ACs reviewed for testability, test strategy drafted
- [ ] **PO**: Competitive scan completed
- [ ] **PO**: Scope boundaries defined (in scope AND out of scope)
- [ ] **PO**: Final approval — explicit "go" decision

---

## Phase 2 — Build

**Duration**: Development + testing in parallel
**Goal**: Implement the approved PRD with full test coverage

### Role Responsibilities

| Role | What They Do | Output |
|---|---|---|
| **Front-end Dev** | Implement UI per PRD specs, responsive, accessible, dark mode | Page + components in `app/tools/`, `tools/` |
| **Back-end Dev** | Implement API endpoints, validation, rate limiting, caching | Routes in `app/api/v1/`, helpers in `lib/` |
| **Architect** | Code review for patterns, NFR compliance | Review feedback |
| **QA Engineer** | Verify via `webapp-testing` skill, write test cases, begin manual testing | Test cases, verification results |
| **QA Lead** | Review test coverage, ensure standards met | Coverage matrix |
| **SEO Specialist** | Meta tags, structured data, heading hierarchy | SEO metadata |
| **UX Designer** | Available for clarifications on flows/interactions | Ad-hoc guidance |
| **UI Designer** | Available for clarifications on visual specs | Ad-hoc guidance |

### Workflow (Parallel Tracks)

```
Track A: Development                    Track B: QA (parallel)
─────────────────────                   ──────────────────────
1. Architect plans approach             1. QA writes detailed test cases from ACs
2. Front-end implements UI              2. QA reviews testability of implementation
3. Back-end implements API              3. QA begins manual exploratory testing
4. SEO adds meta + structured data      4. QA verifies via webapp-testing skill
5. Dev self-reviews against ACs         5. QA files bugs during testing
6. Dev commits to feature branch
```

### Phase 2 Gate — Checklist

Before requesting Phase 3 review:

**Developer:**
- [ ] All acceptance criteria implemented
- [ ] Responsive layout works on mobile (375px) and desktop (1280px)
- [ ] Dark mode works correctly
- [ ] Loading, error, and empty states implemented
- [ ] API rate limiting and caching configured (`.env`)
- [ ] Build passes (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Code committed to feature branch

**QA Engineer:**
- [ ] Verified via `webapp-testing` skill (core flows, error states, responsive)
- [ ] All P1/P2 test cases executed
- [ ] Zero critical/major bugs open
- [ ] Mobile viewport tested (375px)
- [ ] Dark mode tested

**Architect:**
- [ ] NFRs met (security, performance, caching, rate limiting)
- [ ] Code follows project patterns

---

## Phase 3 — Review

**Duration**: All reviewers evaluate the implementation
**Goal**: Verify the feature meets quality bar across all dimensions

### Role Responsibilities

| Role | What They Do | Output |
|---|---|---|
| **PO** | Reviews against PRD, scores 7 dimensions, decides verdict | PO review report (`.claude/reviews/<feature>-review.md`) |
| **UX Designer** | Heuristic evaluation (Nielsen's 10), usability check | UX review notes in PO report |
| **UI Designer** | Visual consistency check, dark mode audit, spacing/color review | UI review notes in PO report |
| **QA Engineer** | Final regression, exploratory testing, sign-off | QA sign-off (`.claude/reviews/<feature>-qa-signoff.md`) |
| **QA Lead** | Reviews test coverage completeness, approves QA sign-off | QA approval |
| **Architect** | NFR spot-check (security, performance, error handling) | Architecture notes in PO report |

### Review Workflow

```
1. QA Engineer runs full test suite + exploratory testing → QA Sign-off
2. UX Designer evaluates usability (heuristics, flow, states)
3. UI Designer evaluates visual quality (consistency, dark mode, spacing)
4. Architect spot-checks NFRs (security, caching, rate limits, error handling)
5. PO collects all inputs, scores 7 dimensions, writes review report
6. PO renders verdict: APPROVED or NEEDS ITERATION
```

### 7 Review Dimensions (PO Scores)

| Dimension | Evaluators | Pass Threshold |
|---|---|---|
| **Functional completeness** | PO + QA | All ACs met, QA sign-off |
| **UX polish** | UX Designer | Score ≥ 4 |
| **Visual quality** | UI Designer | Score ≥ 4 |
| **Error handling** | QA + Architect | Score ≥ 4 |
| **Performance feel** | Architect + QA | Score ≥ 4 |
| **Mobile experience** | UX + UI + QA | Score ≥ 3 |
| **Delight factor** | PO + UX | Score ≥ 3 |

### Verdict Rules

| Verdict | Criteria | Action |
|---|---|---|
| **APPROVED** | All dimensions pass, average ≥ 4, QA signed off | Proceed to release |
| **NEEDS ITERATION** | Any dimension below threshold OR QA rejected | Back to Phase 1 with improvement list |

### Phase 3 Output

1. **PO Review Report** — scores, what's great, improvements required (P1/P2/P3)
2. **QA Sign-off** — test results, open bugs, regression status
3. **Updated PRD** — if iterating, PO appends iteration section

---

## Iteration Cycle

When Phase 3 results in NEEDS ITERATION:

```
Phase 3 (NEEDS ITERATION)
    │
    ▼
Phase 1 (Iteration N+1) — REFINED
    - PO updates PRD with iteration section
    - BA refines ACs based on review feedback
    - UX addresses usability findings
    - UI addresses visual quality findings
    - Architect addresses NFR findings
    - QA updates test plan for new/changed ACs
    │
    ▼
Phase 2 (Focused implementation)
    - Dev implements P1 and P2 improvements only
    - QA re-verifies changed behavior via webapp-testing
    - Build passes
    │
    ▼
Phase 3 (Re-review — focused)
    - Each reviewer focuses on their previously flagged items
    - Scores must improve or maintain
    - Review should take < 30 minutes (delta only)
    │
    ▼
APPROVED → Release
   or
NEEDS ITERATION → another cycle (max 3 total)
```

### Iteration Rules

| Rule | Detail |
|---|---|
| **Max iterations** | 3 per feature before forced release |
| **Scope per iteration** | Each iteration is smaller and faster than the previous |
| **P1 items** | MUST be fixed — no exceptions |
| **P2 items** | Fix in current iteration if possible |
| **P3 items** | MAY be deferred to backlog with documentation |
| **PRD updates** | PO adds iteration section to PRD, never overwrites original |
| **Deferred items** | Documented in PRD with reason and backlog reference |

### PRD Iteration Section (appended by PO)

```markdown
## Iteration 2 — [Date]

**Trigger**: PO Review — NEEDS ITERATION
**Review reference**: `.claude/reviews/<feature>-review.md`

### Improvements to Address
| # | Description | Owner | Priority | Status |
|---|---|---|---|---|
| 1 | [From PO review] | UX | P1 | Pending |
| 2 | [From UI review] | Front-end Dev | P2 | Pending |
| 3 | [From QA] | Back-end Dev | P1 | Pending |

### Updated/New Acceptance Criteria
- AC-new-1: Given [...], When [...], Then [...]

### Deferred to Backlog
- [Item] — Reason: [why deferred]
```

---

## File Locations

```
.claude/
├── prd/
│   ├── ip-check.md                     # PRD per feature
│   ├── my-ip.md
│   └── [feature-name].md
├── reviews/
│   ├── ip-check-review.md              # PO review report
│   ├── ip-check-qa-signoff.md          # QA sign-off
│   └── [feature]-review.md
├── qa/
│   ├── ip-check-test-plan.md           # QA test plan per feature
│   ├── bugs/                           # Bug reports
│   └── regression/                     # Regression results
├── dev-lifecycle.md                    # This file
├── session-log.md                      # Session continuity log
├── tool-pattern.md                     # Tool directory pattern
├── ui-ux-guideline.md                  # UI/UX rules + webapp-testing
└── api-guideline.md                    # API rules + rate limit + cache
```

---

## Quick Reference — Who Does What, When

### Phase 1 — Discovery

| Role | Deliverable | Skill |
|---|---|---|
| PO | PRD, vision, competitive scan, approval | `product-owner` |
| BA | User stories, ACs, edge cases, data flows | `business-analyst` |
| UX Designer | User flows, wireframes, 5-state design, personas | `ux-designer` |
| UI Designer | Visual specs, color/typography, component specs, dark mode | `ui-designer` |
| Architect | Feasibility, NFRs, technical approach | `architect` |
| QA Lead | Testability review, test strategy | `qa-engineer` |

### Phase 2 — Build

| Role | Deliverable | Skill |
|---|---|---|
| Front-end Dev | UI implementation, responsive, accessible | `ui-ux-react-dev` |
| Back-end Dev | API endpoints, validation, rate limit, cache | `api-dev` |
| Architect | Code review, pattern compliance | `architect` |
| QA Engineer | `webapp-testing` verification, test cases, exploratory testing | `qa-engineer` |
| SEO Specialist | Meta tags, structured data | `seo-expert` |

### Phase 3 — Review

| Role | Deliverable | Skill |
|---|---|---|
| PO | Review report, scores, verdict | `product-owner` |
| UX Designer | Heuristic evaluation, usability notes | `ux-designer` |
| UI Designer | Visual consistency audit, dark mode check | `ui-designer` |
| QA Engineer | Final testing, QA sign-off | `qa-engineer` |
| Architect | NFR spot-check | `architect` |
