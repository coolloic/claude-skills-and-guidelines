# API Implementation Guideline — Toolk1t API

This guideline MUST be followed for all API development in `toolk1t-api`.
Use the **api-dev** skill (`~/.claude/skills/api-dev/SKILL.md`) as reference when building endpoints.

---

## 0. API Design First — OpenAPI / Swagger Spec (MANDATORY)

**No endpoint may be implemented until the API spec is designed and approved.**

### Workflow

```
1. Write OpenAPI 3.0 spec (YAML)       → docs/api/v1/<endpoint>.yaml
2. Present spec to user for review      → get explicit approval
3. Implement the approved spec          → app/api/v1/<endpoint>/route.ts
4. Verify implementation matches spec   → post-implementation check
```

### Spec File Location

```
toolk1t-api/
├── docs/
│   └── api/
│       └── v1/
│           ├── ipcheck.yaml          # IP Check endpoint spec
│           ├── dns.yaml              # DNS lookup endpoint spec
│           └── [future-tools].yaml
```

### OpenAPI Spec Template

Every new endpoint MUST start with this YAML spec:

```yaml
openapi: 3.0.3
info:
  title: Toolk1t API — <Endpoint Name>
  version: 1.0.0

paths:
  /api/v1/<endpoint>:
    get:  # or post, put, delete
      summary: <Short description>
      description: <Detailed description>
      tags:
        - <Tool Name>
      security:
        - apiKey: []       # or bearerAuth, or [] for public
      parameters:
        - name: <param>
          in: query         # or path, header
          required: true
          schema:
            type: string
          description: <What this param does>
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      # define response fields here
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          description: Rate limited
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: x-api-key
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Error:
      type: object
      required: [error, code]
      properties:
        error:
          type: string
          description: Human-readable error message
        code:
          type: string
          description: Machine-readable error code
        details:
          type: object
          description: Additional error details (validation errors, etc.)
```

### Spec Requirements

- **ALL** request parameters, headers, and body fields documented
- **ALL** response fields with types and descriptions
- **ALL** error responses listed (400, 401, 403, 404, 429, 500)
- **Auth level** clearly specified in `security`
- **Rate limit** noted in endpoint description
- **Examples** included for request and response where helpful

### Approval Gate

Before ANY implementation:

1. Write the spec YAML file in `docs/api/v1/`
2. Present the spec to the user with a summary:
   - Endpoint: `GET /api/v1/<endpoint>`
   - Auth: Public / API Key / JWT
   - Parameters: list all with types
   - Success response: key fields
   - Error cases: list all
3. **Wait for explicit approval** — do NOT proceed without it
4. If changes requested, update spec and re-present

### Post-Implementation Verification

After implementation, verify:
- [ ] All request parameters match the spec
- [ ] Response shape matches the spec exactly
- [ ] All documented error codes are returned correctly
- [ ] Auth level matches what was specified
- [ ] Rate limiting matches the spec description

---

## 1. Every Route Handler MUST Follow This Order

```
1. Rate limiting check          (.env configurable per endpoint)
2. Authentication               (who is the caller?)
3. Authorization                (does the caller have permission?)
4. Input validation             (Zod schema)
5. Cache check                  (.env configurable TTL per endpoint)
6. Business logic               (fetch upstream, compute, etc.)
7. Cache store                  (store result if cacheable)
8. Response                     (include rate limit + cache headers)
```

**No step can be skipped. No shortcutting validation.**

---

## 2. API Route Structure

```
toolk1t-api/
├── app/api/
│   ├── health/route.ts                 # Health check (public)
│   └── v1/                             # Versioned API
│       ├── ipcheck/route.ts
│       ├── myip/route.ts
│       ├── dns/route.ts
│       └── [future-tools]/route.ts
├── lib/
│   ├── api/
│   │   ├── response.ts                 # apiSuccess, apiError, API_ERRORS
│   │   ├── auth.ts                     # requireAuth, requireApiKey, requireRole
│   │   ├── rate-limit.ts               # checkRateLimit (uses rate-limit-config)
│   │   ├── rate-limit-config.ts        # getRateLimitConfig (reads .env)
│   │   ├── cache.ts                    # cacheGet, cacheSet, cacheInvalidate (uses cache-config)
│   │   ├── cache-config.ts             # getCacheTtl (reads .env)
│   │   └── validate.ts                 # validateRequest helper
│   ├── geo/
│   │   └── ip-lookup.ts                # IP geolocation via ip-api.com
│   └── supabase/
│       └── client.ts                   # Service-role Supabase client
├── .env                                # Rate limits, cache TTLs, DB credentials
└── .env.example                        # Template with all env vars documented
```

---

## 3. Authentication & Permission Access

### API Key Authentication (for external clients)

```typescript
// lib/api/auth.ts
import { type NextRequest } from 'next/server'
import { API_ERRORS } from '@/lib/api/response'
import { createClient } from '@/lib/supabase/client'

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Validate API key from request header.
 * Returns the associated user/org or throws AuthError.
 */
export async function requireApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    throw new AuthError('Missing API key')
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, permissions, rate_limit, is_active')
    .eq('key', apiKey)
    .single()

  if (error || !data || !data.is_active) {
    throw new AuthError('Invalid or inactive API key')
  }

  return data
}

/**
 * Validate Supabase JWT from Authorization header.
 * Returns the authenticated user or throws AuthError.
 */
export async function requireAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new AuthError('Missing authorization token')
  }

  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new AuthError('Invalid or expired token')
  }

  return user
}

/**
 * Check if authenticated user has a specific permission.
 * Throws AuthError(403) if denied.
 */
export async function requirePermission(
  userId: string,
  permission: string,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId)
    .eq('permission', permission)
    .single()

  if (error || !data) {
    throw new AuthError('Insufficient permissions', 403)
  }

  return true
}
```

### Auth Levels

| Level | Header | Use case | Helper |
|---|---|---|---|
| **Public** | None | Health check, public tool lookups | No auth needed |
| **API Key** | `x-api-key: <key>` | External integrations, programmatic access | `requireApiKey()` |
| **JWT Token** | `Authorization: Bearer <token>` | Logged-in users, dashboard | `requireAuth()` |
| **Permission** | JWT + role check | Admin-only, write operations | `requireAuth()` + `requirePermission()` |

---

## 4. Schema Validation (Zod)

### Rules

- **EVERY** endpoint MUST define a Zod schema for its input
- Schemas live at the top of the route file or in a shared `schemas/` directory
- Use `.safeParse()` — NEVER `.parse()` (it throws, breaking the error flow)
- Return `API_ERRORS.VALIDATION(parsed.error.flatten())` on failure

### Validation Helper

```typescript
// lib/api/validate.ts
import { type ZodSchema } from 'zod'
import { type NextRequest } from 'next/server'
import { API_ERRORS } from '@/lib/api/response'

/**
 * Validate query params against a Zod schema.
 * Returns parsed data or a 400 error response.
 */
export function validateQuery<T>(request: NextRequest, schema: ZodSchema<T>) {
  const params = Object.fromEntries(request.nextUrl.searchParams)
  const parsed = schema.safeParse(params)

  if (!parsed.success) {
    return { success: false as const, response: API_ERRORS.VALIDATION(parsed.error.flatten()) }
  }

  return { success: true as const, data: parsed.data }
}

/**
 * Validate JSON body against a Zod schema.
 * Returns parsed data or a 400 error response.
 */
export async function validateBody<T>(request: NextRequest, schema: ZodSchema<T>) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { success: false as const, response: API_ERRORS.VALIDATION({ message: 'Invalid JSON body' }) }
  }

  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return { success: false as const, response: API_ERRORS.VALIDATION(parsed.error.flatten()) }
  }

  return { success: true as const, data: parsed.data }
}
```

### Common Schema Patterns

```typescript
import { z } from 'zod'

// Pagination (reuse across all list endpoints)
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// IP address
export const IpSchema = z.string().ip()

// Domain name
export const DomainSchema = z.string().min(1).max(253).regex(
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  'Invalid domain name',
)

// UUID
export const UuidSchema = z.string().uuid()
```

---

## 5. Error Handling

### Consistent Response Shape

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": { ... }   // optional, validation errors etc.
}
```

### Existing Helpers (lib/api/response.ts)

| Helper | Status | Use when |
|---|---|---|
| `apiSuccess(data, status?, headers?)` | 200 | Successful response (pass rate limit + cache headers) |
| `API_ERRORS.VALIDATION(details)` | 400 | Zod validation failed |
| `API_ERRORS.UNAUTHORIZED()` | 401 | No/invalid auth token |
| `API_ERRORS.FORBIDDEN()` | 403 | Authenticated but no permission |
| `API_ERRORS.NOT_FOUND(resource)` | 404 | Resource doesn't exist |
| `API_ERRORS.RATE_LIMITED()` | 429 | Rate limit exceeded |
| `API_ERRORS.INTERNAL()` | 500 | Unexpected server error |

### Additional Helpers

| Helper | Location | Use when |
|---|---|---|
| `checkRateLimit(endpoint, clientKey)` | `lib/api/rate-limit.ts` | Step 1 — rate limit check |
| `getRateLimitConfig(endpoint)` | `lib/api/rate-limit-config.ts` | Load rate limit from `.env` |
| `cacheGet(endpoint, key)` | `lib/api/cache.ts` | Step 5 — check cache before upstream call |
| `cacheSet(endpoint, key, data)` | `lib/api/cache.ts` | Step 7 — store result after upstream call |
| `getCacheTtl(endpoint)` | `lib/api/cache-config.ts` | Load cache TTL from `.env` |

### Error Rules

- **NEVER** expose stack traces, SQL errors, or internal details to the client
- **ALWAYS** `console.error()` server-side with the full error for debugging
- **ALWAYS** wrap the entire handler in `try/catch` with `API_ERRORS.INTERNAL()` as fallback
- Handle `AuthError` explicitly → map to 401 or 403 based on `statusCode`
- Return specific error codes so clients can react programmatically

### Comprehensive Error Logging (MANDATORY)

Every error MUST be logged with sufficient context for post-incident debugging. A bare `console.error(error)` is NOT enough — always include **who**, **what**, **where**, and **why**.

#### Required Log Fields

Every `console.error()` call MUST include:

| Field | Example | Purpose |
|---|---|---|
| **Endpoint** | `[ipcheck]` | Which route handler |
| **Operation** | `upstream_call`, `db_query`, `validation` | What step failed |
| **Error message** | `err.message` | Human-readable error |
| **Error code/status** | HTTP status, error code | Machine-readable classification |
| **Request context** | Client IP, request ID, query params | Reproduce the issue |
| **Timestamp** | Auto from logger, or `new Date().toISOString()` | When it happened |
| **Duration** (if applicable) | `elapsed: 2340ms` | Performance context |

#### Logging Pattern

```typescript
// ✅ Correct — comprehensive log
console.error(`[${ENDPOINT}] upstream_call failed`, {
  operation: 'ip-api.com/json',
  error: err.message,
  status: err.status ?? 'unknown',
  clientIp,
  query: parsed.data,
  elapsed: `${Date.now() - startTime}ms`,
  timestamp: new Date().toISOString(),
})

// ❌ Wrong — bare error, no context
console.error(error)

// ❌ Wrong — missing operation and request context
console.error(`[ipcheck] Error:`, error.message)
```

### Third-Party API & External Service Logging (MANDATORY)

When calling any external service (upstream APIs, databases, cloud services, email providers, payment gateways), apply **extra logging discipline**. Third-party failures are the hardest to debug because we don't control them.

#### Before the Call — Log the Attempt

```typescript
const startTime = Date.now()
console.info(`[${ENDPOINT}] upstream_request`, {
  service: 'ip-api.com',
  url: requestUrl,
  method: 'GET',
  timeout: TIMEOUT_MS,
  timestamp: new Date().toISOString(),
})
```

#### After Failure — Log Full Context

```typescript
console.error(`[${ENDPOINT}] upstream_error`, {
  service: 'ip-api.com',
  url: requestUrl,
  method: 'GET',
  status: response?.status ?? 'no_response',
  statusText: response?.statusText ?? '',
  responseBody: truncate(responseText, 500),  // first 500 chars only
  error: err.message,
  elapsed: `${Date.now() - startTime}ms`,
  clientIp,
  query: parsed.data,
  retryable: isRetryableError(err),
  timestamp: new Date().toISOString(),
})
```

#### After Success — Log Summary (debug level)

```typescript
console.info(`[${ENDPOINT}] upstream_success`, {
  service: 'ip-api.com',
  status: response.status,
  elapsed: `${Date.now() - startTime}ms`,
  cached: false,
})
```

#### External Service Error Classification

Classify upstream errors for clearer alerting and client responses:

| Upstream Status | Classification | Client Response | Retryable? |
|---|---|---|---|
| Network timeout | `UPSTREAM_TIMEOUT` | 502 + `"Service temporarily unavailable"` | Yes |
| Connection refused | `UPSTREAM_UNREACHABLE` | 502 + `"External service unreachable"` | Yes |
| 4xx from upstream | `UPSTREAM_CLIENT_ERROR` | 502 + `"External service rejected request"` | No |
| 5xx from upstream | `UPSTREAM_SERVER_ERROR` | 502 + `"External service error"` | Yes |
| Invalid response body | `UPSTREAM_PARSE_ERROR` | 502 + `"Invalid response from external service"` | No |
| Rate limited by upstream | `UPSTREAM_RATE_LIMITED` | 429 + `"Rate limit exceeded"` | Yes (after delay) |

#### Implementation Pattern

```typescript
// lib/api/response.ts — add upstream error helpers
export const API_ERRORS = {
  // ... existing helpers ...
  UPSTREAM_ERROR(service: string, classification: string) {
    const messages: Record<string, string> = {
      UPSTREAM_TIMEOUT: 'Service temporarily unavailable — please try again',
      UPSTREAM_UNREACHABLE: 'External service unreachable — please try again later',
      UPSTREAM_CLIENT_ERROR: 'External service rejected the request',
      UPSTREAM_SERVER_ERROR: 'External service error — please try again',
      UPSTREAM_PARSE_ERROR: 'Invalid response from external service',
      UPSTREAM_RATE_LIMITED: 'Rate limit exceeded — please try again later',
    }
    return NextResponse.json(
      { error: messages[classification] ?? 'External service error', code: classification, service },
      { status: classification === 'UPSTREAM_RATE_LIMITED' ? 429 : 502 },
    )
  },
}
```

#### Sensitive Data in Logs

- **NEVER** log full API keys, tokens, passwords, or PII
- **Mask** credentials: `apiKey: '***' + key.slice(-4)`
- **Truncate** large response bodies: first 500 characters max
- **Redact** user emails and personal data in log context
- Log request IDs and IP addresses (needed for debugging, covered by privacy policy)

#### Timeout & Retry Logging

When implementing retries for flaky external services, log every attempt:

```typescript
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    const result = await fetchWithTimeout(url, TIMEOUT_MS)
    if (attempt > 1) {
      console.info(`[${ENDPOINT}] upstream_retry_success`, { service, attempt, elapsed })
    }
    return result
  } catch (err) {
    console.warn(`[${ENDPOINT}] upstream_retry_attempt`, {
      service,
      attempt,
      maxRetries: MAX_RETRIES,
      error: err.message,
      nextRetryIn: attempt < MAX_RETRIES ? `${RETRY_DELAY_MS * attempt}ms` : 'giving_up',
    })
    if (attempt === MAX_RETRIES) throw err
    await sleep(RETRY_DELAY_MS * attempt)
  }
}
```

---

## 6. Rate Limiting (.env Configurable)

Every API endpoint MUST apply rate limiting. Limits are defined per endpoint in `.env` and loaded via a central config.

### .env Variables

```bash
# Rate Limiting — format: RATE_LIMIT_<ENDPOINT>_<PARAM>
# Limits are per-IP for public endpoints, per-API-key for authenticated endpoints.

# Global default (applied when no endpoint-specific limit is set)
RATE_LIMIT_DEFAULT_MAX=60            # max requests per window
RATE_LIMIT_DEFAULT_WINDOW_MS=60000   # window duration in ms (60s)

# Per-endpoint overrides
RATE_LIMIT_IPCHECK_MAX=30            # IP Check: 30 req/min (upstream ip-api.com is 45/min)
RATE_LIMIT_IPCHECK_WINDOW_MS=60000
RATE_LIMIT_MYIP_MAX=20               # My IP: 20 req/min
RATE_LIMIT_MYIP_WINDOW_MS=60000
RATE_LIMIT_SPEEDTEST_MAX=10          # Speed Test: 10 req/min (heavy resource)
RATE_LIMIT_SPEEDTEST_WINDOW_MS=60000
RATE_LIMIT_PDF_MAX=5                 # PDF Converter: 5 req/min (CPU intensive)
RATE_LIMIT_PDF_WINDOW_MS=60000
```

### Rate Limit Config Loader

```typescript
// lib/api/rate-limit-config.ts

interface RateLimitConfig {
  max: number
  windowMs: number
}

const DEFAULT_MAX = 60
const DEFAULT_WINDOW_MS = 60_000

/**
 * Load rate limit config for an endpoint from env vars.
 * Falls back to RATE_LIMIT_DEFAULT_*, then hardcoded defaults.
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  const key = endpoint.toUpperCase()
  return {
    max: parseInt(process.env[`RATE_LIMIT_${key}_MAX`] ?? process.env.RATE_LIMIT_DEFAULT_MAX ?? '', 10) || DEFAULT_MAX,
    windowMs: parseInt(process.env[`RATE_LIMIT_${key}_WINDOW_MS`] ?? process.env.RATE_LIMIT_DEFAULT_WINDOW_MS ?? '', 10) || DEFAULT_WINDOW_MS,
  }
}
```

### Rate Limiter Implementation

```typescript
// lib/api/rate-limit.ts
import { getRateLimitConfig } from './rate-limit-config'

const store = new Map<string, { count: number; resetAt: number }>()

// Periodic cleanup to prevent memory leak (run every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60_000)

export function checkRateLimit(
  endpoint: string,
  clientKey: string,
): { allowed: boolean; remaining: number; resetAt: number; limit: number } {
  const config = getRateLimitConfig(endpoint)
  const storeKey = `${endpoint}:${clientKey}`
  const now = Date.now()
  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.max - 1, resetAt: now + config.windowMs, limit: config.max }
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt, limit: config.max }
  }

  entry.count++
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt, limit: config.max }
}
```

### Usage in Route Handlers

```typescript
// Step 1 in every handler:
const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
const rateCheck = checkRateLimit('ipcheck', clientIp)
if (!rateCheck.allowed) {
  return API_ERRORS.RATE_LIMITED()
  // Response automatically includes rate limit headers (see below)
}
```

### Rate Limit Response Headers

**Add to EVERY response** (success and error), not just 429:

```typescript
headers: {
  'X-RateLimit-Limit': String(rateCheck.limit),
  'X-RateLimit-Remaining': String(rateCheck.remaining),
  'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
}
```

### Recommended Limits by Endpoint Type

| Endpoint Type | Default | Reasoning |
|---|---|---|
| Public lookup (IP, DNS) | 30/min | Upstream API limits (ip-api.com = 45/min) |
| Auto-fetch (My IP) | 20/min | Page load triggered, less frequent |
| Heavy compute (PDF, image) | 5/min | CPU/memory intensive |
| Speed test | 10/min | Network bandwidth intensive |
| Health check | 120/min | Monitoring, should be generous |
| Authenticated (API key) | 120/min | Paying users get higher limits |

---

## 7. Response Caching with TTL (.env Configurable)

API responses MUST be cached where appropriate to reduce load on upstream services and improve response times. Cache TTLs are configured via `.env`.

### .env Variables

```bash
# Cache TTL — format: CACHE_TTL_<ENDPOINT>_SECONDS
# Set to 0 to disable caching for an endpoint.

# Global default (applied when no endpoint-specific TTL is set)
CACHE_TTL_DEFAULT_SECONDS=60

# Per-endpoint overrides
CACHE_TTL_IPCHECK_SECONDS=300        # IP Check: 5 min (geo data rarely changes)
CACHE_TTL_MYIP_SECONDS=60            # My IP: 1 min (IP can change on reconnect)
CACHE_TTL_DNS_SECONDS=120            # DNS Lookup: 2 min (DNS propagation)
CACHE_TTL_SPEEDTEST_SECONDS=0        # Speed Test: no cache (must be real-time)
CACHE_TTL_PDF_SECONDS=0              # PDF Converter: no cache (unique per file)
```

### Cache Config Loader

```typescript
// lib/api/cache-config.ts

const DEFAULT_TTL_SECONDS = 60

/**
 * Load cache TTL for an endpoint from env vars.
 * Returns 0 if caching is disabled for this endpoint.
 */
export function getCacheTtl(endpoint: string): number {
  const key = endpoint.toUpperCase()
  const val = process.env[`CACHE_TTL_${key}_SECONDS`] ?? process.env.CACHE_TTL_DEFAULT_SECONDS
  return val !== undefined ? parseInt(val, 10) : DEFAULT_TTL_SECONDS
}
```

### In-Memory Cache Implementation

```typescript
// lib/api/cache.ts
import { getCacheTtl } from './cache-config'

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key)
  }
}, 5 * 60_000)

/**
 * Get a cached value. Returns undefined if not found or expired.
 */
export function cacheGet<T>(endpoint: string, key: string): T | undefined {
  const storeKey = `${endpoint}:${key}`
  const entry = store.get(storeKey)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(storeKey)
    return undefined
  }
  return entry.data as T
}

/**
 * Store a value in cache. TTL is loaded from env for the endpoint.
 * Does nothing if endpoint TTL is 0 (caching disabled).
 */
export function cacheSet<T>(endpoint: string, key: string, data: T): void {
  const ttl = getCacheTtl(endpoint)
  if (ttl <= 0) return
  const storeKey = `${endpoint}:${key}`
  store.set(storeKey, { data, expiresAt: Date.now() + ttl * 1000 })
}

/**
 * Invalidate a specific cache entry.
 */
export function cacheInvalidate(endpoint: string, key: string): void {
  store.delete(`${endpoint}:${key}`)
}

/**
 * Invalidate all entries for an endpoint.
 */
export function cacheInvalidateAll(endpoint: string): void {
  const prefix = `${endpoint}:`
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
```

### Usage in Route Handlers

```typescript
import { cacheGet, cacheSet } from '@/lib/api/cache'

export async function GET(request: NextRequest) {
  // ... rate limit + validation ...

  const cacheKey = parsed.data.ip ?? parsed.data.domain

  // Check cache first
  const cached = cacheGet<GeoResult>('ipcheck', cacheKey)
  if (cached) {
    return apiSuccess(cached, 200, {
      'X-Cache': 'HIT',
    })
  }

  // Cache miss — fetch from upstream
  const result = await lookupIp(ip)
  cacheSet('ipcheck', cacheKey, result)

  return apiSuccess(result, 200, {
    'X-Cache': 'MISS',
  })
}
```

### Cache Response Headers

Add to every cacheable response:

| Header | Value | Purpose |
|---|---|---|
| `X-Cache` | `HIT` or `MISS` | Indicates whether the response was served from cache |
| `Cache-Control` | `public, max-age=<ttl>` | Client-side caching hint |

### Caching Rules

1. **Cache by unique input** — use the primary query parameter as cache key (e.g., IP address, domain, file hash)
2. **Never cache** user-specific data without including user ID in the key
3. **Never cache** error responses
4. **Never cache** real-time endpoints (speed test, health check)
5. **Invalidate** cache when upstream data is known to have changed
6. **Respect upstream TTL** — if the upstream API provides cache headers, use the shorter of upstream TTL and configured TTL

### Recommended TTLs by Data Type

| Data Type | TTL | Reasoning |
|---|---|---|
| IP geolocation | 5 min | Geo data changes infrequently |
| DNS records | 2 min | Records can change, but not every second |
| WHOIS | 1 hour | Registration data changes very rarely |
| Speed test | 0 (disabled) | Must reflect real-time measurement |
| File conversion | 0 (disabled) | Unique per input file |

---

### Complete .env Template for API

```bash
# toolk1t-api/.env

# ── Server ─────────────────────────────
PORT=3001

# ── Database (Supabase) ───────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# ── Rate Limiting ─────────────────────
RATE_LIMIT_DEFAULT_MAX=60
RATE_LIMIT_DEFAULT_WINDOW_MS=60000
RATE_LIMIT_IPCHECK_MAX=30
RATE_LIMIT_IPCHECK_WINDOW_MS=60000
RATE_LIMIT_MYIP_MAX=20
RATE_LIMIT_MYIP_WINDOW_MS=60000
RATE_LIMIT_SPEEDTEST_MAX=10
RATE_LIMIT_SPEEDTEST_WINDOW_MS=60000
RATE_LIMIT_PDF_MAX=5
RATE_LIMIT_PDF_WINDOW_MS=60000

# ── Response Cache TTL (seconds) ──────
CACHE_TTL_DEFAULT_SECONDS=60
CACHE_TTL_IPCHECK_SECONDS=300
CACHE_TTL_MYIP_SECONDS=60
CACHE_TTL_DNS_SECONDS=120
CACHE_TTL_SPEEDTEST_SECONDS=0
CACHE_TTL_PDF_SECONDS=0
```

---

## 8. Complete Route Handler Template

Every new endpoint should follow this template:

```typescript
import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, API_ERRORS } from '@/lib/api/response'
import { requireApiKey, AuthError } from '@/lib/api/auth'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { cacheGet, cacheSet } from '@/lib/api/cache'
import { validateQuery } from '@/lib/api/validate'

const ENDPOINT = 'ipcheck'

const QuerySchema = z.object({
  // define your params here
})

export async function GET(request: NextRequest) {
  try {
    // 1. Rate limiting (env: RATE_LIMIT_IPCHECK_MAX, RATE_LIMIT_IPCHECK_WINDOW_MS)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const rateCheck = checkRateLimit(ENDPOINT, clientIp)
    if (!rateCheck.allowed) {
      return API_ERRORS.RATE_LIMITED()
    }

    // 2. Authentication (skip for public endpoints)
    const apiKeyData = await requireApiKey(request)

    // 3. Authorization (skip if no permission model yet)
    // await requirePermission(apiKeyData.user_id, 'ipcheck:read')

    // 4. Input validation
    const result = validateQuery(request, QuerySchema)
    if (!result.success) return result.response

    // 5. Cache check (env: CACHE_TTL_IPCHECK_SECONDS)
    const cacheKey = result.data.ip ?? result.data.domain
    const cached = cacheGet(ENDPOINT, cacheKey)
    if (cached) {
      return apiSuccess(cached, 200, {
        'X-Cache': 'HIT',
        'X-RateLimit-Limit': String(rateCheck.limit),
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
      })
    }

    // 6. Business logic
    const data = await doBusinessLogic(result.data)

    // 7. Cache store
    cacheSet(ENDPOINT, cacheKey, data)

    // 8. Response
    return apiSuccess(data, 200, {
      'X-Cache': 'MISS',
      'X-RateLimit-Limit': String(rateCheck.limit),
      'X-RateLimit-Remaining': String(rateCheck.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateCheck.resetAt / 1000)),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return error.statusCode === 403
        ? API_ERRORS.FORBIDDEN()
        : API_ERRORS.UNAUTHORIZED()
    }
    console.error(`[${ENDPOINT}] Unexpected error:`, error)
    return API_ERRORS.INTERNAL()
  }
}
```

---

## 9. Pre-Implementation Checklist

Before writing any API endpoint:

- [ ] Define the Zod schema for all inputs (query, body, params)
- [ ] Decide auth level: public / API key / JWT / permission
- [ ] Determine rate limit and add `.env` vars (`RATE_LIMIT_<ENDPOINT>_MAX`, `_WINDOW_MS`)
- [ ] Determine cache TTL and add `.env` var (`CACHE_TTL_<ENDPOINT>_SECONDS`, use 0 for no cache)
- [ ] Define success response shape
- [ ] Define all possible error responses with codes
- [ ] Use existing helpers: `apiSuccess`, `API_ERRORS`, `validateQuery`, `validateBody`, `checkRateLimit`, `cacheGet`, `cacheSet`

## 10. Post-Implementation Checklist

After writing:

- [ ] Handler follows the step order (rate limit → auth → authz → validate → cache check → logic → cache store → response)
- [ ] All inputs validated with Zod `.safeParse()`
- [ ] All errors return consistent `{ error, code, details }` shape
- [ ] No stack traces or internal details exposed to client
- [ ] `try/catch` wraps entire handler
- [ ] Rate limit configured in `.env` with reasonable defaults
- [ ] Rate limit headers (`X-RateLimit-*`) included on every response
- [ ] Cache TTL configured in `.env` (or set to 0 if not cacheable)
- [ ] `X-Cache: HIT/MISS` header on cacheable responses
- [ ] Error responses are never cached
- [ ] Tested with invalid input, missing auth, rate limit exceeded, cache hit/miss, and happy path

### Error Logging Verification

- [ ] Every `console.error()` includes: endpoint, operation, error message, request context, timestamp
- [ ] No bare `console.error(error)` calls — all have structured context
- [ ] Third-party API calls log: service name, URL, HTTP method, status, elapsed time, response snippet
- [ ] Upstream errors classified correctly (timeout, unreachable, 4xx, 5xx, parse error, rate limited)
- [ ] Client receives generic 502 message for upstream failures (no internal details leaked)
- [ ] Sensitive data (API keys, tokens, PII) masked or omitted in logs
- [ ] Retry attempts logged with attempt number, delay, and outcome
- [ ] Successful upstream calls logged at info level with elapsed time