# Routing and SEO

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Stack](stack.md) | Next.js, BigCommerce, and middleware stack. |
| [Backend](backend.md) | Server route and API architecture. |
| [Content Management](content-management.md) | Makeswift catch-all pages and snapshots. |
| [Catalog Navigation](catalog-navigation.md) | User-facing paths and catalog entry points. |
| [Product Discovery](product-discovery.md) | Category/search/brand/shop-all route behavior. |
| [Product Detail](product-detail.md) | PDP metadata/schema and legacy product redirects. |
| [Analytics and Compliance](analytics-and-compliance.md) | Route-triggered analytics and robots/sitemap behavior. |

## Overview

Routing is middleware-driven. Public URLs are resolved through BigCommerce's route API, then rewritten to internal localized App Router paths. This lets BigCommerce own vanity paths, redirects, and entity resolution while Next.js serves internal product/category/brand/blog/page routes.

## Middleware Stack

`core/middleware.ts` composes middleware in this order:

1. `withAuth`
2. `withMakeswift`
3. `withIntl`
4. `withAnalyticsCookies`
5. `withChannelId`
6. `withRoutes`

The matcher excludes API routes, admin, Next static/image internals, Vercel internals, favicon, sitemap, legacy sitemap, and robots routes.

## BigCommerce Route Resolution

| Public Entity | BigCommerce Node Type | Internal Rewrite |
|---------------|----------------------|------------------|
| Product vanity path | `Product` | `/{locale}/product/{entityId}` |
| Category vanity path | `Category` | `/{locale}/category/{entityId}` |
| Brand vanity path | `Brand` | `/{locale}/brand/{entityId}` |
| Blog index | `Blog` | `/{locale}/blog` |
| Blog post | `BlogPost` | `/{locale}/blog/{entityId}` |
| Normal page | `NormalPage` | `/{locale}/webpages/{id}/normal/` |
| Contact page | `ContactPage` | `/{locale}/webpages/{id}/contact/` |
| Raw HTML page | `RawHtmlPage` | Returns raw HTML response. |
| Unknown route | No node | Rewrites to localized clean pathname, which can be handled by Makeswift catch-all or Next 404. |

## Redirect Behavior

| Redirect Type | Behavior |
|---------------|----------|
| BigCommerce redirects | Uses `redirectBehavior: FOLLOW`, honors route redirect data, and returns 301 for product/category/brand/page/blog/manual redirects. |
| Query params | Preserves query params only when the source redirect path does not already include query params. |
| Manual redirects | Supports internal and external targets; internal manual redirects can preserve search params. |
| Same URL protection | Compares normalized internal URLs to avoid redirect loops. |
| Trailing slash | Honors `TRAILING_SLASH !== 'false'` in redirect config and comparison logic. |

## Legacy Product Redirect

Old storefront product URLs using `/product/:slug` are permanently redirected to vanity `/:slug` paths before BigCommerce route resolution.

| Example | Result |
|---------|--------|
| `/product/example-product` | `/example-product` |
| `/en/product/example-product?x=1` | `/en/example-product?x=1` |

This is a product-specific SEO migration requirement. See [Open Questions](open-questions.md#seo-analytics-and-compliance) for whether additional legacy patterns need coverage.

## Store Status

The route middleware fetches BigCommerce storefront status and caches it. If status is `MAINTENANCE`, requests rewrite to `/{locale}/maintenance` with status 503 intent.

| Cache | Duration |
|-------|----------|
| Route cache | 30 minutes |
| Store status cache | 5 minutes |

## Makeswift Page Routing

| Route | Behavior |
|-------|----------|
| `/{locale}` | Renders Makeswift page at `/`. |
| `/{locale}/...` catch-all | Renders Makeswift page for path if BigCommerce route/default Next route does not take over. |
| Missing Makeswift snapshot | Calls `connection()` then returns `notFound()` to support builder/editor behavior. |

## Metadata

| Surface | Metadata Source |
|---------|-----------------|
| Root layout | BigCommerce store settings SEO and store name. |
| PDP | Product SEO title/description/keywords, default image Open Graph, fallback plain-text description. |
| Category | Category SEO title/description/keywords, fallback category name. |
| Shop All | Static title `Shop All`. |
| Favicon | BigCommerce favicon URL proxied through `/favicon.ico`. |

## Sitemap and Robots

| Route | Behavior |
|-------|----------|
| `/sitemap.xml` | Proxies BigCommerce sitemap index for the default locale's channel. |
| `/xmlsitemap.php` | Redirects legacy Stencil sitemap path to `/sitemap.xml`. |
| `/robots.txt` | Fetches BigCommerce robots content and appends sitemap URL. |
| `/favicon.ico` | Fetches and returns BigCommerce favicon data; 404 if unavailable. |

## Structured Data and Analytics Signals

| Signal | Source |
|--------|--------|
| Product schema | PDP renders `ProductSchema` with product and pricing data. |
| Product viewed | Middleware records product visit; PDP renders `ProductViewed`. |
| Category viewed | Category/custom category pages render `CategoryViewed`. |
| Web analytics | Root layout provides analytics settings and scripts. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Resolve public URLs through BigCommerce rather than static Next file paths. | Use file-based routing only; duplicate route map locally. | Catalyst route middleware enables BigCommerce-owned vanity URLs, redirects, and entity mapping. | Observed |
| Redirect legacy `/product/:slug` to vanity root product URLs. | Keep old internal product paths visible; rely only on BigCommerce redirects. | Commit history names this as a legacy migration fix and middleware implements it early. | Observed |
| Proxy sitemap, robots, and favicon from BigCommerce. | Generate all SEO assets locally. | Store settings remain source of truth and preserve BigCommerce admin configuration. | Observed |

