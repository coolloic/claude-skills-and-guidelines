---
name: api-dev
description: Use when designing, building, or reviewing API endpoints including REST and tRPC APIs. Covers input validation, error handling, authentication, rate limiting, pagination, caching, and API documentation best practices.
---

# API Development Expert

## Overview

Comprehensive API development skill for building robust, secure, and well-documented APIs in Next.js and Node.js environments. Covers REST API routes, tRPC procedures, input validation, authentication, error handling, and performance.

## When to Use

- Creating new API routes or endpoints
- Implementing data fetching patterns (server actions, API routes)
- Adding input validation and error handling
- Implementing authentication/authorization middleware
- Designing pagination, filtering, and sorting
- Setting up API rate limiting and caching
- Reviewing API security

---

## 1. Next.js API Routes (App Router)

### Route Handlers

```typescript
// app/api/tools/ipcheck/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ip = searchParams.get('ip')

    if (!ip) {
      return NextResponse.json(
        { error: 'Missing required parameter: ip' },
        { status: 400 }
      )
    }

    const data = await lookupIp(ip)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('IP lookup failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Server Actions

```typescript
// app/actions/ipcheck.ts
'use server'

import { z } from 'zod'

const IpSchema = z.object({
  ip: z.string().ip({ message: 'Invalid IP address' }),
})

export async function lookupIp(formData: FormData) {
  const parsed = IpSchema.safeParse({
    ip: formData.get('ip'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // ... fetch and return data
}
```

---

## 2. Input Validation

### Always Validate at Boundaries

```typescript
import { z } from 'zod'

// Define schemas for all inputs
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const IpLookupSchema = z.object({
  ip: z.string().ip().optional(),
  domain: z.string().min(1).max(253).optional(),
}).refine(
  (data) => data.ip || data.domain,
  { message: 'Either ip or domain is required' }
)

// Use in route handler
export async function GET(request: NextRequest) {
  const params = Object.fromEntries(new URL(request.url).searchParams)
  const parsed = IpLookupSchema.safeParse(params)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  // parsed.data is fully typed and validated
}
```

---

## 3. Error Handling

### Consistent Error Response Shape

```typescript
// lib/api/errors.ts
interface ApiError {
  error: string
  code: string
  details?: unknown
}

export function apiError(
  message: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json({ error: message, code, details }, { status })
}

// Standard error codes
export const API_ERRORS = {
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
} as const
```

---

## 4. Authentication & Authorization

```typescript
// lib/api/auth.ts
import { createClient } from '@/lib/supabase/server'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Unauthorized')
  }

  return user
}

// Usage in route handler
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    // ... proceed with authenticated request
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }
    throw error
  }
}
```

---

## 5. Pagination

```typescript
// Standard pagination response
interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

function paginate<T>(items: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}
```

---

## 6. Rate Limiting

```typescript
// Simple in-memory rate limiter (use Redis for production)
const rateLimit = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60_000
): boolean {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}
```

---

## 7. Caching

```typescript
// Next.js fetch caching
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 }, // Cache for 1 hour
})

// Route segment config
export const revalidate = 3600

// Response headers
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
})
```

---

## 8. Security Checklist

- [ ] Validate ALL inputs with Zod schemas
- [ ] Sanitize user input before database queries
- [ ] Use parameterized queries (never string concatenation)
- [ ] Set CORS headers appropriately
- [ ] Rate limit all public endpoints
- [ ] Log errors server-side, return generic messages to clients
- [ ] Never expose internal error details or stack traces
- [ ] Authenticate before authorizing
- [ ] Use HTTPS everywhere
- [ ] Set security headers (CSP, X-Frame-Options, etc.)

## 9. API Design Rules

- Use HTTP verbs correctly: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Return appropriate status codes (200, 201, 204, 400, 401, 403, 404, 429, 500)
- Use consistent URL patterns: `/api/tools/ipcheck`, `/api/users/:id`
- Version APIs when breaking changes are needed: `/api/v2/...`
- Always return JSON with consistent shape
- Document all endpoints with examples
