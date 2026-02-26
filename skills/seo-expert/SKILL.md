---
name: seo-expert
description: Use when optimizing pages for search engines, analyzing meta tags, improving Core Web Vitals, adding structured data, or auditing SEO issues
---

# SEO Expert

## Overview

Comprehensive SEO optimization skill for web applications. Analyzes pages for search engine best practices, generates optimized meta tags, implements structured data, and identifies performance issues affecting rankings.

## When to Use

- Optimizing blog posts or pages for search
- Auditing meta tags (title, description, OG, Twitter)
- Adding Schema.org structured data (JSON-LD)
- Analyzing Core Web Vitals issues
- Improving image SEO (alt text, lazy loading, sizing)
- Checking canonical URLs and redirects
- Generating sitemaps
- Analyzing heading structure (H1-H6)

## SEO Audit Checklist

### 1. Meta Tags

| Tag | Best Practice | Max Length |
|-----|---------------|------------|
| `<title>` | Unique, keyword-rich, brand at end | 60 chars |
| `meta description` | Compelling, includes CTA | 155 chars |
| `og:title` | Same as title or slightly different | 60 chars |
| `og:description` | Engaging summary | 155 chars |
| `og:image` | 1200x630px minimum | - |
| `twitter:card` | `summary_large_image` for articles | - |
| `canonical` | Always set, absolute URL | - |

**Check for:**
```typescript
// Next.js App Router metadata
export const metadata: Metadata = {
  title: "Primary Keyword - Secondary | Brand",
  description: "Compelling description with CTA under 155 chars",
  openGraph: {
    title: "...",
    description: "...",
    images: [{ url: "...", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://example.com/page",
  },
};
```

### 2. Structured Data (JSON-LD)

**Article Schema:**
```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Article Title",
  description: "Article description",
  image: "https://example.com/image.jpg",
  author: {
    "@type": "Person",
    name: "Author Name",
    url: "https://example.com/author",
  },
  publisher: {
    "@type": "Organization",
    name: "Site Name",
    logo: {
      "@type": "ImageObject",
      url: "https://example.com/logo.png",
    },
  },
  datePublished: "2024-01-15",
  dateModified: "2024-01-16",
};
```

**Product Schema:**
```typescript
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Product Name",
  image: "https://example.com/product.jpg",
  description: "Product description",
  brand: {
    "@type": "Brand",
    name: "Brand Name",
  },
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "99.00",
    highPrice: "149.00",
    priceCurrency: "AUD",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "89",
  },
};
```

**Breadcrumb Schema:**
```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com" },
    { "@type": "ListItem", position: 2, name: "Category", item: "https://example.com/category" },
    { "@type": "ListItem", position: 3, name: "Page" },
  ],
};
```

### 3. Heading Structure

```
H1: Primary Keyword (ONE per page)
  H2: Section heading
    H3: Subsection
    H3: Subsection
  H2: Another section
    H3: Subsection
```

**Rules:**
- Exactly ONE `<h1>` per page
- Sequential nesting (don't skip from H2 to H4)
- Include keywords naturally
- Each heading should be descriptive

### 4. Image SEO

| Attribute | Requirement |
|-----------|-------------|
| `alt` | Descriptive, keyword-rich, <125 chars |
| `width/height` | Always set to prevent CLS |
| `loading` | `lazy` for below-fold images |
| `srcset` | Responsive variants |
| Format | WebP preferred, fallback to JPEG |
| Size | <200KB for typical images |

**Next.js Image component:**
```tsx
<Image
  src="/image.webp"
  alt="Descriptive alt text with keyword"
  width={800}
  height={600}
  loading="lazy"  // or priority for above-fold
  placeholder="blur"
  blurDataURL="..."
/>
```

### 5. Core Web Vitals

| Metric | Target | What to Check |
|--------|--------|---------------|
| LCP | <2.5s | Largest image/text block load time |
| FID | <100ms | JavaScript execution blocking |
| CLS | <0.1 | Layout shifts (missing image dimensions) |
| INP | <200ms | Interaction responsiveness |

**Common Fixes:**
- **LCP**: Preload hero images, use CDN, optimize image sizes
- **FID/INP**: Reduce JavaScript, defer non-critical scripts
- **CLS**: Set width/height on images/embeds, avoid dynamic content injection

### 6. URL Structure

**Good:**
```
/blog/how-to-save-money-on-groceries
/products/apple-iphone-15-pro
/category/electronics/smartphones
```

**Bad:**
```
/blog?id=123
/p/12345
/category.php?cat=1&sub=2
```

**Rules:**
- Lowercase
- Hyphens (not underscores)
- Keywords included
- No query parameters for indexable pages
- <75 characters

### 7. Internal Linking

- Link to related content with descriptive anchor text
- Use breadcrumbs for navigation
- Create topic clusters (pillar + cluster pages)
- Fix orphan pages (no internal links)
- Avoid over-optimization (keyword stuffing anchors)

### 8. Technical SEO

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml
```

**sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/page</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Next.js sitemap generation:**
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    { url: 'https://example.com', lastModified: new Date() },
    ...posts.map((post) => ({
      url: `https://example.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}
```

## SEO Audit Process

### Phase 1: Technical Audit
1. Check `robots.txt` allows crawling
2. Verify sitemap exists and is valid
3. Check canonical URLs are set correctly
4. Verify HTTPS everywhere
5. Check for redirect chains
6. Test mobile responsiveness

### Phase 2: On-Page Audit
1. Review title tags (unique, <60 chars, keyword)
2. Check meta descriptions (unique, <155 chars, CTA)
3. Verify H1 tags (one per page, includes keyword)
4. Audit heading hierarchy (H1→H2→H3)
5. Check image alt text
6. Review internal linking

### Phase 3: Content Audit
1. Identify thin content (<300 words)
2. Find duplicate content
3. Check keyword density (1-2% target)
4. Verify content freshness (dateModified)
5. Review readability (short paragraphs, bullet points)

### Phase 4: Structured Data
1. Add Article schema for blog posts
2. Add Product schema for products
3. Add Breadcrumb schema
4. Add Organization schema
5. Validate with Google Rich Results Test

### Phase 5: Performance
1. Run Lighthouse audit
2. Check Core Web Vitals
3. Optimize images (WebP, sizing)
4. Review JavaScript bundle size
5. Check server response time

## Tools & Commands

**Validate structured data:**
```bash
# Google Rich Results Test
open "https://search.google.com/test/rich-results?url=YOUR_URL"

# Schema.org Validator
open "https://validator.schema.org/"
```

**Check indexing:**
```bash
# Google Search Console
open "https://search.google.com/search-console"

# Check if indexed
site:example.com/page-url
```

**Lighthouse CLI:**
```bash
npx lighthouse https://example.com --view
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Duplicate titles | Make each page title unique |
| Missing meta description | Add compelling 155-char description |
| Multiple H1 tags | Keep only one H1 per page |
| Missing alt text | Add descriptive alt to all images |
| No canonical URL | Add canonical to prevent duplicates |
| Missing structured data | Add relevant JSON-LD schema |
| Slow LCP | Optimize hero image, use preload |
| High CLS | Add width/height to images |
| Broken internal links | Fix or remove dead links |
| Thin content | Expand with valuable information |

## WhatsCheap-Specific SEO

### Blog Posts
- Title format: "Topic - Subtopic | WhatsCheap"
- Include product links with proper anchor text
- Add Article schema with author info
- Use card images for social sharing (800x600)

### Product Pages
- Include Product schema with price, availability
- Add AggregateRating if reviews exist
- Use product images with descriptive alt text
- Include price comparison data

### Category Pages
- Add ItemList schema for product listings
- Include pagination for large lists
- Use descriptive category titles
