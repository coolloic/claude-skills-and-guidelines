---
name: ux-designer
description: Use when researching user behaviors, designing user flows, creating wireframes, conducting usability reviews, or ensuring the product is intuitive and user-friendly. Covers user research, information architecture, interaction design, usability heuristics, and user journey mapping.
---

# UX Designer (User Experience)

## Overview

User Experience design skill for researching user behaviors, pain points, and preferences to ensure the product is intuitive, logical, and user-friendly. The UX Designer focuses on **how things work** — the structure, flow, and logic of the user's interaction with the product.

## When to Use

- Designing user flows for new features
- Reviewing existing features for usability issues
- Creating wireframes and interaction specifications
- Conducting heuristic evaluations
- Mapping user journeys and identifying pain points
- Defining information architecture
- Reviewing mobile vs desktop experience differences

---

## 1. User Research

### 1.1 User Persona Template

For each tool, define the primary user:

```markdown
**Persona**: [Name]
**Role**: [e.g., Network Admin, Developer, Student]
**Technical Level**: Beginner / Intermediate / Advanced
**Context**: [Desktop at work / Mobile on-the-go / Both]
**Goals**: [What they want to accomplish]
**Frustrations**: [Current pain points with existing solutions]
**Quote**: "[Something this persona would say]"
```

### 1.2 Competitive UX Audit

Evaluate the top 3 competitors on UX dimensions:

| Dimension | Competitor A | Competitor B | Competitor C | Our Target |
|---|---|---|---|---|
| Task completion steps | | | | Fewer steps |
| Time to first result | | | | < 3 seconds |
| Error recovery | | | | Clear & recoverable |
| Mobile usability | | | | Full parity |
| Cognitive load | | | | Minimal |
| Learning curve | | | | Zero — instant understanding |

---

## 2. Information Architecture

### 2.1 Content Hierarchy

Every page MUST have a clear content hierarchy:

```
1. Primary action / input         (most prominent, above fold)
2. Primary result / content       (immediate feedback)
3. Supporting details             (expandable or secondary)
4. Related actions                (refresh, export, share)
```

### 2.2 Navigation Principles

| Principle | Rule |
|---|---|
| **Discoverability** | Every action should be visible or one click away |
| **Feedback** | Every action produces immediate, visible feedback |
| **Consistency** | Same action = same pattern across all tools |
| **Reversibility** | Users can undo or go back without penalty |
| **Efficiency** | Frequent actions require fewest steps |

---

## 3. Interaction Design

### 3.1 User Flow Template

```
[Entry] ─── What does the user see first?
   │
   ▼
[Primary Action] ─── What's the main thing they do?
   │
   ├── Success Path ─── What happens when it works?
   │        │
   │        ▼
   │   [Result Display] ─── Is the result clear and useful?
   │        │
   │        ▼
   │   [Next Actions] ─── What can they do next? (copy, export, new search)
   │
   └── Error Path ─── What happens when it fails?
            │
            ▼
       [Error Message] ─── Does it explain what happened AND what to do?
            │
            ▼
       [Recovery] ─── Can they fix it without starting over?
```

### 3.2 State Design (MANDATORY)

Every interactive feature MUST design all 5 states:

| State | What the User Sees | UX Requirement |
|---|---|---|
| **Empty** | No data yet, first visit | Helpful hint, example input, invitation to act |
| **Loading** | Waiting for data | Skeleton UI (not spinner), perceived progress |
| **Success** | Data loaded | Clear hierarchy, scannable, actionable |
| **Error** | Something failed | What happened + what to do + retry action |
| **Partial** | Some data, some missing | Graceful degradation, show what we have |

### 3.3 Micro-interactions

| Interaction | Expected Behavior |
|---|---|
| Button click | Immediate visual feedback (press state) |
| Form submit | Button shows loading state, input disabled |
| Copy to clipboard | Tooltip/toast "Copied!" for 2 seconds |
| Error appears | Smooth entrance animation, red highlight |
| Data refreshes | Skeleton briefly, then cross-fade to new data |
| Hover on info | Tooltip appears after 300ms delay |

---

## 4. Usability Heuristics (Nielsen's 10)

Use these to evaluate every feature:

| # | Heuristic | Check |
|---|---|---|
| 1 | **Visibility of system status** | Does the user always know what's happening? (loading, success, error) |
| 2 | **Match real world** | Does the language match what users expect? (no jargon) |
| 3 | **User control & freedom** | Can users undo, cancel, or go back easily? |
| 4 | **Consistency & standards** | Do similar things look and work the same way? |
| 5 | **Error prevention** | Does the UI prevent errors before they happen? (validation, confirmation) |
| 6 | **Recognition over recall** | Are options visible rather than requiring memory? |
| 7 | **Flexibility & efficiency** | Are there shortcuts for expert users? (keyboard, URL params) |
| 8 | **Aesthetic & minimalist** | Is every element necessary? No visual noise? |
| 9 | **Help users recover from errors** | Are error messages helpful and actionable? |
| 10 | **Help & documentation** | Are hints, placeholders, and tooltips sufficient? |

---

## 5. Mobile UX Considerations

| Concern | Requirement |
|---|---|
| **Touch targets** | Minimum 44x44px, 8px spacing between targets |
| **Thumb zone** | Primary actions reachable with one thumb (bottom half of screen) |
| **Input** | Use correct input types (`inputMode="numeric"` for IP, etc.) |
| **Keyboard** | Virtual keyboard doesn't obscure active input |
| **Orientation** | Works in portrait; landscape is bonus |
| **Scroll** | No horizontal scroll, vertical scroll for content |
| **Loading** | Even more important on mobile (slower networks) |

---

## 6. UX Review Checklist

When reviewing a feature for UX:

- [ ] User can complete the primary task in ≤ 3 steps
- [ ] First-time user understands what to do without instructions
- [ ] All 5 states designed (empty, loading, success, error, partial)
- [ ] Error messages explain what happened AND what to do
- [ ] User can recover from errors without starting over
- [ ] Mobile experience works without horizontal scrolling
- [ ] Touch targets are ≥ 44px
- [ ] Loading feedback appears within 100ms of action
- [ ] No dead ends (user always has a next action)
- [ ] Language is plain, no technical jargon visible to end users
- [ ] Consistent patterns with other tools in the suite

---

## 7. UX Artifacts

| Artifact | Location | Created When |
|---|---|---|
| User persona | Inside PRD | Phase 1 (with BA + PO) |
| User flow diagram | Inside PRD | Phase 1 |
| Wireframe annotations | Inside PRD or design files | Phase 1 |
| Heuristic evaluation | `.claude/reviews/<feature>-ux-review.md` | Phase 3 (with PO review) |
| Competitive UX audit | Inside PRD | Phase 1 |
