# Claude Skills & Guidelines

Reusable Claude Code skills, agents, commands, and project guidelines extracted from production workspaces.

## Skills

Skills are placed in `~/.claude/skills/<skill-name>/SKILL.md` to make them available globally.

| Skill | Description |
|---|---|
| **api-dev** | API development (REST, validation, auth, rate limiting, caching) |
| **architect** | System architecture, NFRs, monorepo structure, decision frameworks |
| **business-analyst** | Requirements elicitation, user stories, acceptance criteria, process mapping |
| **product-owner** | PRD authoring, feature review (7 dimensions), iteration cycles |
| **qa-engineer** | Test strategy, test cases, Playwright E2E, bug reporting, sign-off |
| **seo-expert** | Meta tags, structured data (JSON-LD), Core Web Vitals, sitemap |
| **ui-designer** | Visual design system, colors, typography, spacing, dark mode |
| **ui-ux-react-dev** | React/Next.js implementation, WCAG accessibility, responsive design |
| **ux-designer** | User research, flows, wireframes, heuristic evaluation, mobile UX |

## Agents

Custom agents are placed in `.claude/agents/` within a project repo.

| Agent | Description |
|---|---|
| **browser-dom-crawler** | Web scraping with Playwright — DOM analysis, selector strategy, data extraction |
| **code-review-expert** | Comprehensive code review — security, architecture, cross-layer analysis |
| **database-optimizer** | SQL query optimization, index design, migrations, caching strategies |
| **fullstack-monorepo-engineer** | Full-stack monorepo implementation — Next.js, tRPC, TypeScript, pnpm workspaces |

## Commands

Custom slash commands are placed in `.claude/commands/` within a project repo.

| Command | Description |
|---|---|
| **updateclaudemd** | Review recent merge commits and update CLAUDE.md with missing descriptions |

## Guidelines

Project-level guidelines placed in `.claude/` within a project repo.

| Guideline | Description |
|---|---|
| **api-guideline.md** | API implementation rules (OpenAPI-first, rate limiting, caching, error handling) |
| **dev-lifecycle.md** | 3-phase development lifecycle (Discovery, Build, Review) with iteration cycles |
| **tool-pattern.md** | Tool directory structure and component organization |
| **ui-ux-guideline.md** | UI/UX rules (accessibility, responsive, compact desktop, error handling, SEO) |

## Usage

### Install skills globally

```bash
# Clone this repo
git clone git@github.com:coolloic/claude-skills-and-guidelines.git
cd claude-skills-and-guidelines

# Symlink skills to ~/.claude/skills/
for skill in skills/*/; do
  name=$(basename "$skill")
  ln -sf "$(pwd)/$skill" ~/.claude/skills/"$name"
done
```

### Copy agents to a project

```bash
cp agents/*.md /path/to/your/project/.claude/agents/
```

### Copy commands to a project

```bash
cp commands/*.md /path/to/your/project/.claude/commands/
```

### Copy guidelines to a project

```bash
cp guidelines/*.md /path/to/your/project/.claude/
```

Then reference them from your project's `CLAUDE.md`.
