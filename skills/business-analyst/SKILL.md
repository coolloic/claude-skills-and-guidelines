---
name: business-analyst
description: Use when translating business requirements into functional specifications, writing user stories, mapping business processes, defining data flows, or bridging the gap between stakeholders and the technical team. Covers requirements elicitation, process modeling, gap analysis, and acceptance criteria.
---

# Business Analyst

## Overview

Business Analysis skill for translating business needs into detailed, actionable functional specifications. The BA bridges stakeholders and the technical team — ensuring requirements are complete, unambiguous, and testable before development begins.

## When to Use

- Translating a feature request into functional requirements
- Writing detailed user stories with acceptance criteria
- Mapping business processes and data flows
- Performing gap analysis (current state vs desired state)
- Defining system behavior for edge cases and error scenarios
- Reviewing requirements for completeness and testability
- Creating wireframe annotations and functional specs

---

## 1. Requirements Elicitation

### 1.1 Stakeholder Questions

Before writing any requirement, the BA MUST answer:

| Question | Purpose |
|---|---|
| **Who** is the user? | Identify persona, technical level, context |
| **What** do they need to accomplish? | Define the goal, not the solution |
| **Why** do they need it? | Understand business value and priority |
| **When** do they need it? | Urgency, dependencies, deadlines |
| **Where** will they use it? | Device, environment, network conditions |
| **How** do they do it today? | Current workflow, pain points, workarounds |

### 1.2 Requirements Types

| Type | Definition | Example |
|---|---|---|
| **Functional** | What the system does | "The system shall resolve a domain to an IP address" |
| **Non-functional** | How the system performs | "Response time shall be under 500ms" |
| **Business rule** | Organizational constraint | "Free tier limited to 30 lookups/minute" |
| **Data** | Information the system handles | "IP geolocation includes city, country, ISP, coordinates" |
| **Interface** | How systems interact | "Client calls /api/v1/ipcheck via proxy rewrite" |

### 1.3 Requirements Quality Checklist (INVEST)

Every requirement MUST be:

- [ ] **I**ndependent — Can be implemented without depending on other stories
- [ ] **N**egotiable — Details can be discussed, not rigid contracts
- [ ] **V**aluable — Delivers value to the user or business
- [ ] **E**stimable — Team can estimate effort
- [ ] **S**mall — Completable in one iteration
- [ ] **T**estable — Has clear pass/fail criteria

---

## 2. Functional Specification Format

### 2.1 User Story Template

```
As a [user type],
I want to [action/goal],
So that [benefit/value].
```

### 2.2 Acceptance Criteria (Given/When/Then)

Every story MUST have testable acceptance criteria:

```
Given [precondition / initial state],
When  [action / trigger],
Then  [expected outcome / observable result].
```

**Example — IP Check Tool:**

```
Story: As a network admin, I want to look up any IP address or domain,
       so that I can identify its geolocation and network details.

AC1: Given the user is on the IP Check page,
     When the page loads,
     Then the user's current IP is pre-filled and auto-looked up.

AC2: Given the user enters a valid IP (e.g., 8.8.8.8),
     When they click Lookup,
     Then city, country, ISP, ASN, and proxy status are displayed within 3 seconds.

AC3: Given the user enters an invalid value (e.g., "abc"),
     When they click Lookup,
     Then an inline error message appears without page reload.

AC4: Given the user enters a domain name (e.g., google.com),
     When they click Lookup,
     Then the domain resolves to an IP and geolocation is displayed.

AC5: Given the lookup API is unavailable,
     When the user clicks Lookup,
     Then an error message with a Retry button is shown.
```

### 2.3 Edge Cases & Error Matrix

For every feature, the BA MUST document:

| Scenario | Input | Expected Behavior | Priority |
|---|---|---|---|
| Empty input | "" | Button disabled or inline hint | P2 |
| Invalid IP format | "999.999.999.999" | Validation error message | P1 |
| Private/reserved IP | "192.168.1.1" | Graceful fallback message | P2 |
| Very long domain | 254+ chars | Validation error | P3 |
| Rapid repeated clicks | Multiple submits | Debounce, single request | P2 |
| Network offline | No connection | Offline error message | P1 |
| Slow response | > 5 seconds | Loading state with timeout | P2 |

---

## 3. Process Mapping

### 3.1 User Flow Diagram

Document the step-by-step user journey:

```
[Entry Point] → [Action 1] → [Decision?] → YES → [Action 2] → [Success State]
                                           → NO  → [Error State] → [Recovery]
```

### 3.2 Data Flow Diagram

Document how data moves through the system:

```
User Input → Client Validation → API Request → Server Validation → Business Logic → Response
                                                                         ↓
                                                                   Cache Check
                                                                   Rate Limit
                                                                   Upstream API
```

### 3.3 State Diagram

Document all states a feature can be in:

```
IDLE → (user action) → LOADING → (success) → SUCCESS
                                → (failure) → ERROR → (retry) → LOADING
```

---

## 4. Gap Analysis

When analyzing an existing feature or competitor:

| Aspect | Current State | Desired State | Gap | Priority |
|---|---|---|---|---|
| Feature X | [What exists] | [What's needed] | [Delta] | P1/P2/P3 |

---

## 5. BA Artifacts

| Artifact | Location | Created When |
|---|---|---|
| Functional spec / PRD | `.claude/prd/<feature>.md` | Phase 1 (with PO) |
| User flow diagrams | Inside PRD | Phase 1 |
| Edge case matrix | Inside PRD | Phase 1 |
| Data dictionary | `.claude/prd/<feature>.md` | Phase 1 |
| Gap analysis | Inside PRD or separate doc | When evaluating existing features |

---

## 6. BA Checklist — Before Handoff to Dev

- [ ] All user stories follow INVEST criteria
- [ ] Every story has ≥ 1 acceptance criterion (Given/When/Then)
- [ ] Edge cases documented in matrix form
- [ ] Happy path AND error paths covered
- [ ] Data fields and types defined
- [ ] API request/response shapes outlined
- [ ] State transitions documented (idle/loading/success/error)
- [ ] No ambiguous language ("should", "might", "could" → replace with "shall" or "must")
- [ ] PO has reviewed and approved the specification
- [ ] Technical feasibility confirmed with architect
