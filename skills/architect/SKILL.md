---
name: architect
description: Use when making architectural decisions, designing system structure, choosing patterns, planning feature implementations, evaluating trade-offs between approaches, structuring monorepo packages, or reviewing overall application architecture.
---

# Software Architect

## Overview

Architectural decision-making skill for designing scalable, maintainable systems. Covers monorepo structure, component architecture, data flow patterns, state management, caching strategies, and technology selection.

## When to Use

- Planning new features or tools before implementation
- Choosing between architectural approaches (SSR vs CSR, REST vs tRPC)
- Structuring monorepo packages and dependencies
- Designing data flow and state management
- Evaluating third-party library trade-offs
- Planning database schema and API design
- Reviewing system for scalability concerns

---

## 1. HandyTool Architecture

### Monorepo Structure

```
handytool-workspace/
├── pnpm-workspace.yaml           # Workspace config
├── handytool-client/             # Public-facing Next.js app
│   ├── app/tools/<toolname>/     # Tool routes (one dir per tool)
│   ├── tools/<toolname>/         # Tool-specific components
│   ├── components/ui/            # Shared UI primitives
│   ├── components/layout/        # Layout components
│   └── lib/                      # Utilities, API clients
├── handytool-admin/              # Admin dashboard (Next.js)
├── handytool-ui/                 # Shared component library
│   ├── src/components/           # React components
│   └── src/styles/               # SCSS design tokens
└── designs/                      # Design references
```

### Dependency Graph

```
handytool-client  →  handytool-ui (workspace:*)
handytool-admin   →  handytool-ui (workspace:*)
```

**Rules:**
- `handytool-ui` has NO dependencies on client or admin
- Client and admin NEVER import from each other
- Shared logic goes in `handytool-ui` or a new shared package

---

## 2. Decision Framework

### When Adding a New Tool

1. Create route: `app/tools/<toolname>/page.tsx`
2. Create tool components: `tools/<toolname>/`
3. Identify reusable components → extract to `components/ui/`
4. Mock data first, API integration later
5. Mobile-first responsive layout

### When Choosing Rendering Strategy

| Pattern | When to Use |
|---------|-------------|
| **Static (SSG)** | Content doesn't change often (docs, marketing) |
| **Server Components** | Data fetching on page load, SEO-critical pages |
| **Client Components** | Interactivity (forms, maps, real-time updates) |
| **Dynamic Import** | Heavy libraries (maps, charts), below-fold content |
| **Streaming** | Slow data sources, progressive loading |

### When Choosing State Management

| Need | Solution |
|------|----------|
| Local component state | `useState` / `useReducer` |
| Form state | `useActionState` / React Hook Form |
| Server data | Server Components + `fetch` |
| Client-side cache | `useSWR` or `@tanstack/react-query` |
| Global client state | React Context (simple) or Zustand (complex) |
| URL state | `useSearchParams` / `nuqs` |

---

## 3. Component Architecture Principles

### Extraction Rules

| Condition | Action |
|-----------|--------|
| Used by 1 tool only | Keep in `tools/<toolname>/` |
| Used by 2+ tools | Extract to `components/ui/` |
| Used by client + admin | Extract to `handytool-ui` package |
| Pure logic, no UI | Extract to `lib/` |

### Composition Over Configuration

```tsx
// ❌ Bad: mega-component with many config props
<Card variant="glass" glow showHeader headerTitle="..." footerAction="..." />

// ✅ Good: composable components
<GlassCard glow>
  <CardHeader>
    <h2>...</h2>
  </CardHeader>
  <CardBody>...</CardBody>
  <CardFooter>
    <Button>...</Button>
  </CardFooter>
</GlassCard>
```

### Data Flow Pattern

```
Page (server/client) → fetches data
  ↓ passes as props
Tool Component (client) → composes UI primitives
  ↓ passes as props
UI Primitive (client) → renders with Tailwind
```

---

## 4. Performance Architecture

### Code Splitting Strategy

```tsx
// Split by route (automatic in Next.js App Router)
app/tools/ipcheck/page.tsx  → separate bundle
app/tools/dns/page.tsx      → separate bundle

// Split heavy components
const Map = dynamic(() => import('./map'), { ssr: false })
const Chart = dynamic(() => import('./chart'), { ssr: false })
```

### Caching Layers

```
Browser Cache ← CDN Cache ← Server Cache ← Database
     ↑               ↑            ↑
  Cache-Control   Edge cache   fetch cache
  headers         (Vercel)     (Next.js)
```

### Image Strategy

- Use Next.js `<Image>` for automatic optimization
- WebP format preferred
- Set explicit `width`/`height` (prevents CLS)
- Use `priority` for above-fold, `loading="lazy"` for below

---

## 5. Non-Functional Requirements (NFR)

Every architectural decision MUST consider these non-functional qualities. NFRs are not optional extras — they are first-class requirements evaluated at design time.

### 5.1 Security

#### Defense in Depth

```
Client Input → Validation (Zod) → Auth Check → Authorization → Business Logic → Database
                                                                                    ↓
Client ← Sanitized Response ← Error Handler ← Rate Limiter ← Cache Layer ← Query
```

#### Security Principles

1. **Never trust client input** — validate everything server-side with Zod
2. **Principle of least privilege** — minimal permissions per role
3. **Fail closed** — deny by default, allow explicitly
4. **Defense in depth** — multiple layers, not single point
5. **Secure by default** — safe configurations out of the box

#### Encryption & Sensitive Data

| Data State | Requirement | Implementation |
|---|---|---|
| **In transit** | TLS 1.2+ mandatory | HTTPS everywhere, HSTS headers |
| **At rest** | Encrypt sensitive fields | Supabase column encryption, encrypted backups |
| **In memory** | Minimize exposure | Clear secrets after use, no logging of PII |
| **API keys** | Never expose to client | Server-side only, `.env` files, never commit |
| **User passwords** | Never store plaintext | bcrypt/argon2 via Supabase Auth |
| **Tokens (JWT)** | Short-lived, httpOnly | Rotate refresh tokens, secure cookie flags |

#### Security Checklist for Every Feature

- [ ] No secrets in client-side code or git history
- [ ] All user input validated and sanitized (Zod `.safeParse()`)
- [ ] SQL injection prevented (parameterized queries via Supabase)
- [ ] XSS prevented (React escaping + CSP headers)
- [ ] CSRF protection on state-changing operations
- [ ] Auth tokens stored in httpOnly cookies, never localStorage
- [ ] Sensitive data excluded from logs (`console.error` must not log PII)
- [ ] Rate limiting applied to all public endpoints
- [ ] CORS configured to allow only known origins
- [ ] File uploads validated (type, size, content) before processing

### 5.2 Performance

#### Response Time Targets

| Tier | Target | Examples |
|---|---|---|
| **Instant** | < 100ms | Cache hits, static content, UI interactions |
| **Fast** | < 500ms | Simple API lookups (IP check, DNS), local computation |
| **Acceptable** | < 2s | Complex queries, upstream API calls, file processing |
| **Background** | < 30s | PDF conversion, image processing, batch operations |

#### Throughput Targets

| Metric | Target | Measured By |
|---|---|---|
| Concurrent users | 100+ without degradation | Load testing |
| API requests/sec | 50+ per instance | Rate limiter config headroom |
| Page load (LCP) | < 2.5s | Lighthouse, Core Web Vitals |
| Interaction delay (INP) | < 200ms | Lighthouse, Core Web Vitals |
| Layout stability (CLS) | < 0.1 | Lighthouse, Core Web Vitals |

#### Performance Architecture

```
Browser Cache ← CDN Cache ← Server Cache ← Database
     ↑               ↑            ↑
  Cache-Control   Edge cache   In-memory cache
  headers         (Vercel)     (lib/api/cache.ts)
```

- **Client**: Code splitting, lazy imports, image optimization, skeleton loading
- **Server**: In-memory cache with TTL (`.env` configurable), fetch deduplication
- **Database**: Indexed queries, connection pooling, query result caching
- **Network**: Gzip/Brotli compression, CDN for static assets, HTTP/2

### 5.3 Caching Strategy

Every data source MUST have a defined caching strategy:

| Data Source | Cache Layer | TTL | Invalidation |
|---|---|---|---|
| IP geolocation | Server in-memory | 5 min (`.env`) | TTL expiry |
| DNS records | Server in-memory | 2 min (`.env`) | TTL expiry |
| Static pages | CDN + browser | 1 hour | Redeploy |
| User sessions | Supabase Auth | 1 hour (refresh token) | Logout / expiry |
| API responses | `Cache-Control` header | Varies by endpoint | `X-Cache` header |
| Database queries | Supabase + server cache | Per-query TTL | Write-through invalidation |

**All cache TTLs are configured via `.env`** — see api-guideline.md section 7.

### 5.4 Reliability & Error Handling

| Concern | Strategy |
|---|---|
| **Upstream API failure** | Graceful degradation — serve cached data or meaningful error |
| **Database unavailable** | Health check fails, return 503 with retry-after header |
| **Rate limit exceeded** | 429 with `Retry-After` header, clear error message |
| **Malformed input** | 400 with specific validation errors, never crash |
| **Unhandled exception** | Catch-all returns 500, logs full error server-side, no stack trace to client |
| **Timeout** | Set per-request timeouts on upstream calls, fail fast |

#### Circuit Breaker Pattern (for upstream APIs)

```
CLOSED (normal) → failures exceed threshold → OPEN (reject fast)
                                                     │
                                              after cooldown
                                                     ↓
                                              HALF-OPEN (probe)
                                                     │
                                           success → CLOSED
                                           failure → OPEN
```

Use for external APIs (ip-api.com, etc.) to prevent cascading failures.

### 5.5 Scalability

| Dimension | Current | Design For |
|---|---|---|
| **Horizontal scale** | Single instance | Stateless API (no server-side sessions) |
| **Database** | Supabase free tier | Connection pooling, indexed queries |
| **Cache** | In-memory (per instance) | Redis-ready interface (swap later without code change) |
| **File storage** | Local / client-side | Supabase Storage or S3-compatible (when needed) |
| **Background jobs** | Not needed yet | Queue-ready patterns (when needed) |

**Design principle**: Stateless services, externalized state, config via `.env`.

### 5.6 Observability

| Signal | What to Capture | Where |
|---|---|---|
| **Logs** | Errors with context (endpoint, IP, timestamp), no PII | `console.error()` structured |
| **Metrics** | Response time, cache hit rate, error rate, rate limit triggers | Response headers (`X-Cache`, `X-RateLimit-*`) |
| **Health** | `/api/health` returns service status, uptime, dependencies | Health endpoint |

### 5.7 NFR Decision Matrix

When designing a feature, evaluate each NFR:

| NFR | Question | Default |
|---|---|---|
| **Security** | Does this handle user data or auth? | Always validate, encrypt sensitive data |
| **Encryption** | Is any data sensitive (PII, tokens, keys)? | Encrypt at rest and in transit |
| **Cache** | Does this call an external API or database? | Cache with TTL via `.env` |
| **Performance** | What's the expected response time? | Fast tier (< 500ms) for lookups |
| **Throughput** | How many concurrent requests expected? | Rate limit via `.env` |
| **Reliability** | What happens if upstream fails? | Graceful degradation + cached fallback |
| **Scalability** | Will this work with 10x users? | Stateless, externalized state |

---

## 6. Architectural Review Checklist

When reviewing or planning architecture:

### Functional
- [ ] Is the rendering strategy optimal for each page?
- [ ] Are components at the right level of abstraction?
- [ ] Is state managed at the correct level?
- [ ] Are there unnecessary client components that could be server?
- [ ] Is code splitting happening at sensible boundaries?
- [ ] Are API calls efficient (no waterfalls, proper caching)?
- [ ] Is the dependency graph clean (no circular deps)?
- [ ] Are shared concerns properly extracted?
- [ ] Is the solution the simplest that works?
- [ ] Does it follow existing project patterns?

### Non-Functional
- [ ] **Security**: Input validated, auth enforced, no secrets exposed, XSS/CSRF prevented?
- [ ] **Encryption**: Sensitive data encrypted at rest and in transit? Tokens in httpOnly cookies?
- [ ] **Cache**: Cacheable data has TTL configured in `.env`? Cache headers in responses?
- [ ] **Performance**: Response time within target tier? No N+1 queries? Lazy loading for heavy content?
- [ ] **Throughput**: Rate limits configured per endpoint in `.env`? Upstream API limits respected?
- [ ] **Reliability**: Upstream failures handled gracefully? Errors recoverable? Timeouts set?
- [ ] **Scalability**: Service stateless? State externalized? Can scale horizontally?
- [ ] **Observability**: Errors logged with context? Health check endpoint exists?
