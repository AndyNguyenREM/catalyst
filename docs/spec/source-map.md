# Source Map

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Explains why these files matter to the product. |
| [Stack](stack.md) | Maps stack decisions to concrete files. |
| [Backend](backend.md) | Maps server/API/routing seams. |
| [UI](ui.md) | Maps UI and theme files. |
| [Content Management](content-management.md) | Maps Makeswift integrations and custom content components. |
| [Product Discovery](product-discovery.md) | Maps PLP/category/search files. |
| [Product Detail](product-detail.md) | Maps PDP/product education files. |
| [Customer Commerce](customer-commerce.md) | Maps customer/dealer/commerce seams. |

## Purpose

This file keeps the reverse spec traceable. Each spec should point back to the code that justified it, and each application-specific code surface should be easy to locate from the spec.

## Authorship Boundary

| Evidence | Interpretation for Reverse Spec |
|----------|---------------------------------|
| User stated this repo is a fork of BigCommerce Catalyst. | Treat upstream Catalyst as framework substrate, not project-owned product intent. |
| User stated to look for commits under AndyNguyenREM. | Prioritize AndyNguyenREM-authored history when deciding what is application-specific. |
| `git shortlog --all` showed 72 commits from `AndyNguyenREM <danguyen@realequitymanagement.com>` and 2 from `AndyNguyenREM <163557871+AndyNguyenREM@users.noreply.github.com>` at inspection time. | The author-specific commit set is large enough to establish a product customization arc. |
| Upgrade/security/migration commits under AndyNguyenREM. | Use as evidence of custom integration ownership only when the commit restores or preserves custom storefront behavior. |
| Untouched `packages/` and broad Catalyst internals. | Document only when they form an app seam, such as Storefront API access, routing, CLI/runtime requirements, or generated types. |

## Repo-Level Shape

| Path | Role | Notes |
|------|------|-------|
| `core/` | Primary Next.js storefront application. | Most product-specific behavior lives here, especially files touched by AndyNguyenREM commits. |
| `packages/` | Catalyst CLI/client/tooling packages. | Treated as framework/tooling unless an app change depends on the package seam. |
| `docs/spec-strategy.md` | Spec methodology. | Source for multi-file spec structure and decision tracking. |
| `docs/spec/templates/` | Spec templates. | Used as structural guidance; reverse spec docs are written directly. |
| `AGENTS.md`, `AGENTS.md.template`, `README 2.md`, `docs/` | Untracked bootstrap/spec files at inspection time. | Existing untracked files were not overwritten by this reverse spec. |

## Product Discovery and Catalog Source Files

| File | Spec Area | Observed Behavior |
|------|-----------|-------------------|
| `core/app/[locale]/(default)/(faceted)/fetch-faceted-search.ts` | [Product Discovery](product-discovery.md) | Parses public query params, maps them to BigCommerce product search filters, default page size `16`, and caches search results. |
| `core/app/[locale]/(default)/(faceted)/category/[slug]/page.tsx` | [Product Discovery](product-discovery.md) | Default category PLP, custom category dispatch, filters, sorting, pagination, top/bottom Makeswift slots, category viewed analytics. |
| `core/app/[locale]/(default)/(faceted)/category/[slug]/_lib/get-custom-category-page.ts` | [Product Discovery](product-discovery.md) | Path-based registry for custom category pages. |
| `core/app/[locale]/(default)/(faceted)/category/[slug]/_lib/get-category-id-by-path.ts` | [Product Discovery](product-discovery.md), [Backend](backend.md) | Resolves category path to BigCommerce category entity ID. |
| `core/app/[locale]/(default)/(faceted)/category/[slug]/custom/*.tsx` | [Product Discovery](product-discovery.md), [UI](ui.md) | Custom hero-image PLPs for iron sights, chassis systems, muzzle devices, shooting system. |
| `core/app/[locale]/(default)/(faceted)/shop-all/page.tsx` | [Product Discovery](product-discovery.md), [Catalog Navigation](catalog-navigation.md) | Standalone all-products search/listing page with filters, sort, compare, and pagination. |
| `core/lib/get-all-products-category-path.ts` | [Catalog Navigation](catalog-navigation.md) | Finds an all-products category path and falls back to `/shop-all`. |
| `core/vibes/soul/sections/products-list-section/index.tsx` | [Product Discovery](product-discovery.md), [UI](ui.md) | Shared PLP shell, mobile filter drawer, desktop filters, sort, product list, pagination. |
| `core/vibes/soul/sections/product-list/index.tsx` | [Product Discovery](product-discovery.md), [UI](ui.md) | Responsive product-card grid and compare drawer integration. |
| `core/vibes/soul/primitives/product-card/index.tsx` | [UI](ui.md), [Product Discovery](product-discovery.md) | Product card visual and data contract. |

## Product Detail Source Files

| File | Spec Area | Observed Behavior |
|------|-----------|-------------------|
| `core/app/[locale]/(default)/product/[slug]/page.tsx` | [Product Detail](product-detail.md) | PDP orchestration for product data, options, pricing, images, inventory, metafield accordions, videos, related products, reviews, wishlist, analytics, schema. |
| `core/app/[locale]/(default)/product/[slug]/page-data.ts` | [Product Detail](product-detail.md), [Backend](backend.md) | GraphQL fragments/queries for product metadata, options, variants, metafields, pricing, related products, inventory. |
| `core/data-transformers/variant-option-matrix.ts` | [Product Detail](product-detail.md) | Builds purchasable variant option matrix and filters impossible option combinations. |
| `core/vibes/soul/sections/product-detail/index.tsx` | [Product Detail](product-detail.md), [UI](ui.md) | Product detail layout and section composition. |
| `core/vibes/soul/sections/product-detail/product-detail-form.tsx` | [Product Detail](product-detail.md) | Product option form, query-param state, add-to-cart action, inventory/backorder display, option prefetching, matrix filtering. |
| `core/vibes/soul/sections/product-detail/product-gallery.tsx` | [Product Detail](product-detail.md), [UI](ui.md) | Landscape sticky gallery with thumbnails. |
| `core/app/[locale]/(default)/product/[slug]/_components/videos.tsx` | [Product Detail](product-detail.md), [Content Management](content-management.md) | Native BigCommerce product videos rendered as playable cards. |
| `core/vibes/soul/primitives/accordion/index.tsx` | [Product Detail](product-detail.md), [UI](ui.md) | Accordion styling used by PDP metafields/description. |

## Content Management Source Files

| File | Spec Area | Observed Behavior |
|------|-----------|-------------------|
| `core/app/[locale]/(default)/page.tsx` | [Content Management](content-management.md) | Homepage rendered as Makeswift page at `/`. |
| `core/app/[locale]/(default)/[...rest]/page.tsx` | [Content Management](content-management.md), [Routing and SEO](routing-seo.md) | Catch-all localized Makeswift pages. |
| `core/lib/makeswift/page.tsx` | [Content Management](content-management.md) | Loads page snapshots and returns 404 if none. |
| `core/lib/makeswift/client.ts` | [Content Management](content-management.md), [Backend](backend.md) | Makeswift client, snapshot loading, locale normalization, error handling. |
| `core/app/api/makeswift/[...makeswift]/route.ts` | [Content Management](content-management.md), [Analytics and Compliance](analytics-and-compliance.md) | Makeswift API handler, publish revalidation, editor font list. |
| `core/lib/makeswift/components.ts` | [Content Management](content-management.md) | Central registry import list for standard and custom Makeswift components. |
| `core/lib/makeswift/components/site-header/*` | [Catalog Navigation](catalog-navigation.md), [Content Management](content-management.md) | Editable header snapshot and controls. |
| `core/lib/makeswift/components/site-footer/*` | [Catalog Navigation](catalog-navigation.md), [Content Management](content-management.md) | Editable footer snapshot and controls. |
| `core/lib/makeswift/components/site-theme/*` | [UI](ui.md), [Content Management](content-management.md) | Editable theme tokens, font tokens, component styles, base colors. |
| `core/lib/makeswift/components/slideshow/*` | [Content Management](content-management.md), [UI](ui.md) | Editable hero slideshow with images/videos, timing, mobile aspect ratio, CTAs, accent line. |
| `core/lib/makeswift/components/constant-contact-subscribe/*` | [Content Management](content-management.md), [Analytics and Compliance](analytics-and-compliance.md) | Constant Contact popup script and newsletter-page CTA. |
| `core/lib/makeswift/components/image-hotspot/*` | [Content Management](content-management.md), [Product Detail](product-detail.md) | Image hotspot module for educational/product callouts. |
| `core/lib/makeswift/components/youtube-*` and `core/lib/youtube/utils.ts` | [Content Management](content-management.md) | YouTube cards, carousels, playlist switcher, modal, API data transformation. |
| `core/lib/makeswift/components/blog-post-*` and `core/lib/makeswift/utils/use-blog-posts.ts` | [Content Management](content-management.md) | Blog card/carousel components using local API routes. |
| `core/lib/makeswift/components/brand-carousel/*` | [Content Management](content-management.md), [UI](ui.md) | Editable manufacturer/brand logo carousel. |
| `core/lib/makeswift/components/customer-group-slot/*` | [Customer Commerce](customer-commerce.md), [Content Management](content-management.md) | Customer group targeted content slots. |

## Navigation, Routing, SEO, and Layout Source Files

| File | Spec Area | Observed Behavior |
|------|-----------|-------------------|
| `core/components/header/index.tsx` | [Catalog Navigation](catalog-navigation.md) | Header data fetch, cart count, gift certificate visibility, currency/locale, search action, Makeswift header handoff. |
| `core/vibes/soul/primitives/navigation/index.tsx` | [Catalog Navigation](catalog-navigation.md), [UI](ui.md) | Header navigation UI, search popover, icon actions, cart icon/count, mobile tiered nav. |
| `core/components/footer/index.tsx` | [Catalog Navigation](catalog-navigation.md) | Footer data fetch, all-products category child links, content page links, contact/social. |
| `core/components/footer/fragment.ts` | [Catalog Navigation](catalog-navigation.md), [Backend](backend.md) | GraphQL fragment for footer store settings, pages, brands, category tree. |
| `core/middleware.ts` | [Routing and SEO](routing-seo.md), [Backend](backend.md) | Middleware composition order. |
| `core/middlewares/with-routes.ts` | [Routing and SEO](routing-seo.md) | BigCommerce route resolution, store status, redirects, legacy `/product/:slug` redirect, internal rewrites. |
| `core/app/[locale]/layout.tsx` | [Stack](stack.md), [Analytics and Compliance](analytics-and-compliance.md), [UI](ui.md) | Root layout, fonts, Makeswift provider, SiteTheme, consent, analytics, age verification, Vercel analytics. |
| `core/app/sitemap.xml/route.ts` | [Routing and SEO](routing-seo.md) | Proxies BigCommerce sitemap index. |
| `core/app/xmlsitemap.php/route.ts` | [Routing and SEO](routing-seo.md) | Redirects legacy Stencil sitemap URL to `/sitemap.xml`. |
| `core/app/robots.txt/route.ts` | [Routing and SEO](routing-seo.md) | Serves BigCommerce robots content with sitemap URL. |
| `core/app/favicon.ico/route.ts` | [Routing and SEO](routing-seo.md) | Proxies BigCommerce favicon. |

## Customer and Commerce Source Files

| File | Spec Area | Observed Behavior |
|------|-----------|-------------------|
| `core/app/[locale]/(default)/cart/*` | [Customer Commerce](customer-commerce.md) | Cart page and server actions for coupons, gift certificates, shipping, quantity, line items. |
| `core/app/[locale]/(default)/checkout/route.ts` | [Customer Commerce](customer-commerce.md) | Checkout redirect route. |
| `core/app/[locale]/(default)/(auth)/*` | [Customer Commerce](customer-commerce.md) | Login, register, logout, forgot/change password flows. |
| `core/app/[locale]/(default)/account/*` | [Customer Commerce](customer-commerce.md) | Orders, addresses, wishlists, account settings. |
| `core/app/api/customer/group/route.ts` | [Customer Commerce](customer-commerce.md) | Current customer group lookup. |
| `core/app/api/customer/groups/route.ts` | [Customer Commerce](customer-commerce.md), [Backend](backend.md) | Store-level customer groups API for editor options; requires BigCommerce access token. |
| `core/lib/makeswift/components/customer-group-slot/*` | [Customer Commerce](customer-commerce.md) | Runtime and editor-facing targeted slots by customer group. |

## AndyNguyenREM Git History Signals

The following signals are selected from the AndyNguyenREM-authored commit list and associated file paths. They should be read as evidence, not as final business intent where an open question already exists.

| Date / Commit | Area | Spec Implication | Confidence |
|---------------|------|------------------|------------|
| 2025-06-24 `f444b4c4` Futura PT font integration | [UI](ui.md), [Content Management](content-management.md) | Brand typography and editor font controls matter to the storefront presentation. | Observed/Inferred |
| 2025-06-26 `4b2d1e40` brands carousel component | [Content Management](content-management.md) | CMS-authored brand/manufacturer logo presentation is part of the marketing system. | Observed |
| 2025-07-01 `3122ef59` Constant Contact widget | [Content Management](content-management.md), [Analytics and Compliance](analytics-and-compliance.md) | Newsletter/lead-capture integration is app-specific. | Observed |
| 2025-07-02 `8ecfbdc4` Blog card and carousel | [Content Management](content-management.md) | Blog content is intended to be merchandised inside Makeswift pages. | Observed |
| 2025-07-09 `a6a5edcd` YouTube Video Card and Carousel | [Content Management](content-management.md) | YouTube video content is a reusable CMS building block. | Observed |
| 2025-07-23 `a00b6906` slideshow videos and 2025-10-09 `f9a29b3d` slide alignment controls | [Content Management](content-management.md), [UI](ui.md) | Hero/slideshow content needs video, alignment, spacing, timing, and editor control beyond stock Catalyst. | Observed |
| 2025-07-23 `5368bb74` updated footer and 2025-08-20 `27cffb2c` updated header | [Catalog Navigation](catalog-navigation.md), [UI](ui.md) | Header/footer are app-owned presentation and navigation seams, even though they sit on Catalyst primitives. | Observed |
| 2025-09-16 `ec1a6d7b` age verification popup | [Analytics and Compliance](analytics-and-compliance.md) | Age gating is app-specific enough to document, but legal scope remains an open question. | Observed/Inferred |
| 2025-09-16 `ae2d8d40` custom mobile navigation and 2025-09-25 `fba108cd` clickable mobile group headers | [Catalog Navigation](catalog-navigation.md), [UI](ui.md) | Mobile navigation was intentionally customized for nested catalog/link groups. | Observed |
| 2025-09-18 `fe908c14`, 2025-09-25 `a0861ce7`, 2025-10-29 `e3decd97`, 2025-10-30 `1b5ca040` YouTube playlist/card/carousel work | [Content Management](content-management.md) | YouTube content evolved into channel/playlist/card/carousel components with editor controls. | Observed |
| 2025-10-30 `de9ba71b` image hotspot component with modal and CMS integration | [Content Management](content-management.md), [Product Detail](product-detail.md) | Interactive image callouts support product education or feature explanation content. | Observed/Inferred |
| 2025-11-05 `e136ff79` added shop all page and 2026-01-26 `810bb735` replace shop-all links with all-products category | [Catalog Navigation](catalog-navigation.md), [Product Discovery](product-discovery.md) | Catalog entry points moved from a standalone shop-all route toward a BigCommerce all-products category when present. | Observed/Inferred |
| 2025-11-13 `06a3fb39` custom Iron Sights category page and 2025-12-29 `ca4ba180` chassis/muzzle/shooting category pages | [Product Discovery](product-discovery.md), [UI](ui.md) | Priority categories need custom hero imagery and presentation while keeping faceted product lists. | Observed/Inferred |
| 2025-12-18 `48246a47` product cards 4:3 | [Product Discovery](product-discovery.md), [UI](ui.md) | Product cards should present imagery in a consistent 4:3 frame across discovery surfaces. | Observed |
| 2025-12-29 `2c3187f0` exclude SKU and Condition from product page specifications | [Product Detail](product-detail.md) | PDP specifications are curated for shopper-useful attributes, not a dump of every catalog field. | Observed/Inferred |
| 2026-01-09 `bfe763b2` and 2026-01-16 `b7c057c8` Catalyst v1.4 upgrade/restored custom integrations | [Backend](backend.md), [Content Management](content-management.md), [Product Discovery](product-discovery.md) | Custom category pages, Makeswift components, YouTube/blog APIs, customer group slots, and age verification are important enough to preserve through framework upgrades. | Observed |
| 2026-01-28 `4a990519` native BigCommerce product videos | [Product Detail](product-detail.md), [Content Management](content-management.md) | PDPs should render catalog-managed product videos, separate from CMS YouTube modules. | Observed |
| 2026-02-06 `d07185f4` Hypa Info/Product Specifications and 2026-02-11 `a196a16c` Compatibility accordion | [Product Detail](product-detail.md) | Product specs and compatibility metafields are first-class PDP education requirements. | Observed |
| 2026-04-21 `78350cc1` legacy `/product/:slug` redirects | [Routing and SEO](routing-seo.md) | Legacy product URLs must preserve SEO through permanent redirects to vanity product paths. | Observed |
| 2026-04-28 `6d0bd4e0` dependent variant option filtering | [Product Detail](product-detail.md) | PDP option selection must prevent impossible or non-purchasable variant combinations. | Observed |
| 2026-05-08 `3ecd9f40` default product listing page size `16` | [Product Discovery](product-discovery.md) | PLP density is intentionally set to 16 items per page. | Observed |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Treat AndyNguyenREM-authored app files as high-priority spec evidence. | Read every Catalyst framework file equally. | User identified AndyNguyenREM history as the project-owned work in this fork. | User-confirmed/Observed |
| Include git history as evidence, not as final product intent. | Ignore history; treat history as authoritative. | Commit messages reveal motivation but may include migration/fix context that still needs owner confirmation. | Observed |
