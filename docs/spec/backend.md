# Backend

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Stack](stack.md) | Technologies and external services used by backend surfaces. |
| [Routing and SEO](routing-seo.md) | Middleware and route-resolution behavior. |
| [Content Management](content-management.md) | Makeswift API/snapshot interactions. |
| [Product Discovery](product-discovery.md) | Search/filter/category API/data flow. |
| [Product Detail](product-detail.md) | Product GraphQL data orchestration. |
| [Customer Commerce](customer-commerce.md) | Customer group, account, cart, checkout, and auth surfaces. |
| [Source Map](source-map.md) | File-level traceability. |

## Overview

The "backend" is primarily a Next.js App Router server application using BigCommerce as the data source and Makeswift as the visual-content source. There is no separate application database in the observed code. Server responsibilities are data fetching, route resolution, request-time caching, API proxying, validation, transformation, and server actions for commerce mutations.

## Project Structure

| Area | Path | Responsibility |
|------|------|----------------|
| Storefront app | `core/app/` | App Router pages, layouts, API routes, route handlers, server actions. |
| Commerce client | `core/client/` | BigCommerce GraphQL client, fragments, queries, tags, revalidation. |
| Auth | `core/auth/` | Customer session and access-token handling. |
| Middleware | `core/middleware.ts`, `core/middlewares/` | Auth, Makeswift, i18n, analytics cookies, channel id, route resolver. |
| Data transformers | `core/data-transformers/` | Convert BigCommerce shapes into Vibes/UI contracts. |
| Makeswift integration | `core/lib/makeswift/` | Runtime, client, page/component snapshots, registered components and controls. |
| UI/components | `core/vibes/soul/`, `core/components/` | Presentation components plus some framework/application bridge components. |
| KV/cache | `core/lib/kv/` | Runtime cache abstraction for route/status caching. |

## Framework Seam

Catalyst provides most commerce primitives. App-specific backend behavior is concentrated in:

| App-Specific Seam | Behavior |
|-------------------|----------|
| Legacy URL redirect | `/product/:slug` redirects to vanity `/:slug` while preserving locale/query where appropriate. |
| Custom category dispatch | Category route checks path/category ID against custom page registry before rendering default PLP. |
| All-products resolution | Finds all-products category path for homepage/cart/PDP/footer CTAs, falling back to `/shop-all`. |
| PDP metafields | Reads `Info` and `Compat` product metafields and renders them as custom accordions. |
| PDP variant matrix | Fetches all purchasable variants to filter invalid product option combinations. |
| Native product videos | Reads BigCommerce product videos and maps YouTube/Vimeo URLs into video cards. |
| Makeswift registrations | Adds custom product/content/media components and editable header/footer/theme. |
| Customer group slots | Provides current customer group and all customer groups for targeted Makeswift content. |
| YouTube/blog product APIs | Local API routes adapt BigCommerce/YouTube data for editor/client components. |

## Server Data Fetching

| Pattern | Usage | Notes |
|---------|-------|-------|
| React `cache()` | BigCommerce fetch wrappers, route/category/product data, local helpers. | Memoizes per request and reduces duplicate fetches. |
| `Streamable.from()` | PDP, PLP, shop-all, header/footer, related data. | Defers expensive data and composes Suspense boundaries. |
| Customer token aware caching | Authenticated requests often use `cache: 'no-store'`; anonymous requests use `next.revalidate`. | Prevents leaking customer-specific data. |
| `nuqs` search parsing | Facets, filters, product options, pagination. | Keeps query params typed and synchronized. |
| Zod validation | Search params, API response parsing, route param validation. | Used in app-specific API routes and transforms. |

## API Routes

| Route | Purpose | Data Source | Error Behavior |
|-------|---------|-------------|----------------|
| `/api/makeswift/[...makeswift]` | Makeswift editor/runtime API handler and publish hook. | Makeswift runtime. | Requires `MAKESWIFT_SITE_API_KEY`. |
| `/api/youtube/video` | Fetch one YouTube video by URL. | YouTube Data API. | 400 invalid/missing URL, 404 missing video, 500 missing key/fetch failure. |
| `/api/youtube/videos` | Fetch videos by channel or playlist. | YouTube Data API. | 400 missing channel/playlist, 404 channel not found, 500 missing key/fetch failure. |
| `/api/blog-posts` | Fetch BigCommerce blog posts with optional limit/tag. | BigCommerce GraphQL. | 400 invalid params, 500 fetch failure. |
| `/api/blog-posts/[id]` | Fetch one BigCommerce blog post. | BigCommerce GraphQL. | 400 invalid ID, 404 missing post, 500 fetch failure. |
| `/api/products/[entityId]` | Fetch one product for Makeswift product card. | BigCommerce GraphQL. | 400 invalid locale; otherwise returns product JSON. |
| `/api/products/ids` | Fetch product list by entity IDs. | BigCommerce client query. | 400 invalid locale or missing `ids`. |
| `/api/products/group/[group]` | Fetch best-selling, featured, or newest products. | BigCommerce client queries. | 400 invalid locale/group. |
| `/api/customer/group` | Fetch current customer's group ID. | BigCommerce customer query/session. | Returns customer group data. |
| `/api/customer/groups` | Fetch all customer groups for editor comboboxes. | BigCommerce REST v2. | 403 when store-level token missing; throws on fetch failure. |

## Data Ownership

| Data | Owner | App Role |
|------|-------|----------|
| Product catalog, categories, brands, pricing, variants, inventory, reviews, videos | BigCommerce | Fetch, transform, and present. |
| Cart, checkout, coupons, gift certificates, shipping, customer account | BigCommerce | Use Catalyst actions/routes and display flows. |
| BigCommerce pages/blog/settings/social/contact/redirects | BigCommerce | Fetch for routing, footer, metadata, content APIs. |
| Page layouts and editable marketing modules | Makeswift | Load snapshots and render registered components. |
| Product/category hero image assets | BigCommerce Image Manager/CDN | Reference by filename in custom pages. |
| YouTube metadata | YouTube Data API | Fetch and transform for CMS components. |
| Newsletter popup behavior | Constant Contact | Load third-party script and set `_ctct_m`. |

## Routing and Middleware

Backend route behavior is middleware-first. Incoming storefront requests pass through auth, Makeswift, i18n, analytics-cookie, channel-id, and BigCommerce-route middleware. The route middleware resolves the incoming path against BigCommerce, handles store maintenance status, applies redirects, and rewrites to internal localized routes such as `/[locale]/product/[entityId]`, `/[locale]/category/[entityId]`, or Makeswift/catch-all pages.

See [Routing and SEO](routing-seo.md) for full behavior.

## Caching and Revalidation

| Cache | Scope | Behavior |
|-------|-------|----------|
| BigCommerce `next.revalidate` | Anonymous catalog/content/settings fetches. | Uses shared `revalidate` target. |
| `cache: 'no-store'` | Customer-token authenticated fetches. | Avoids caching customer-specific results. |
| Middleware KV route cache | Route and store status lookups. | Route cache expires after 30 minutes; store status after 5 minutes. |
| SWR in client components | YouTube/blog/product/customer group client components. | Some hooks disable focus/reconnect revalidation; YouTube dedupes for 5 minutes. |
| Makeswift publish hook | App layout path. | `onPublish` calls `revalidatePath('/', 'layout')`. |

## Internal Contracts

| Contract | Shape |
|----------|-------|
| Product cards | Vibes `Product` with `id`, `title`, `href`, optional `image`, `price`, `subtitle`, `badge`, `rating`, inventory message. |
| PLP filters | Vibes `Filter[]` from BigCommerce facets plus optional category link-group. |
| Cursor pagination | `startCursor`, `endCursor` plus param names (`before`, `after`). |
| Product option fields | Vibes product-detail `Field[]` transformed from BigCommerce product options. |
| Variant matrix rows | Record of option entity ID string to value entity ID string for purchasable variants. |
| YouTube video | `id`, `title`, `description`, `thumbnail`, `publishedAt`, `viewCount`, `duration`, `href`. |
| Blog post card | `id`, `title`, `author`, `content`, `date`, optional `image`, `href`. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Keep BigCommerce as the backend system of record instead of introducing an app database. | Add local DB; cache/catalog mirror; headless CMS source of truth. | Current code already delegates commerce and content settings to BigCommerce and Makeswift. | Observed |
| Use local API routes for editor-friendly/client-friendly data adaptation. | Call BigCommerce/YouTube directly from browser components. | API routes hide keys, validate inputs, and normalize responses for Makeswift components. | Observed |
| Treat customer-token requests as non-cacheable. | Cache all GraphQL data uniformly. | Authenticated pricing/customer/cart data must not leak between users. | Observed |
| Keep framework details documented only at app seam. | Full Catalyst architecture spec. | User requested not to document framework architecture in itself. | User-confirmed |

