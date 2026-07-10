# Product Discovery

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Product category and browsing goals. |
| [Stack](stack.md) | BigCommerce search, Next, nuqs, Streamable. |
| [Backend](backend.md) | Faceted search and category data flow. |
| [UI](ui.md) | PLP layout, product cards, filters. |
| [Catalog Navigation](catalog-navigation.md) | Entry points to category/search/shop-all pages. |
| [Routing and SEO](routing-seo.md) | Category/brand/search URL behavior. |
| [Open Questions](open-questions.md) | Custom category and compare questions. |

## Overview

Product discovery includes category, brand, search, and shop-all pages. The app uses BigCommerce faceted search for products, filters, sorting, and pagination. Application-specific changes emphasize larger product-card imagery, mobile-friendly filters, custom hero banners for key categories, and a default page size of 16.

## PLP Types

| Page Type | Route | Behavior |
|-----------|-------|----------|
| Category | `/{locale}/category/{entityId}` internal, public vanity path via middleware | Category data, breadcrumbs, subcategory links, facets, sort, pagination, optional Makeswift top/bottom slots. |
| Custom category | Same category route, path registry dispatch | Hero image above standard PLP behavior for key category paths. |
| Brand | `/{locale}/brand/{entityId}` internal | Product list filtered by brand, with mobile filter drawer support. |
| Search | `/{locale}/search` | Product search by `term`, filters, sort, empty state. |
| Shop All | `/{locale}/shop-all` | All-product search/listing page independent of a category entity. |

## Faceted Search

| Capability | Current Behavior |
|------------|------------------|
| Default limit | 16 products per page. |
| Pagination | Cursor params `before`/`after`, stable query key ordering in pagination links. |
| Sort | Featured, newest, best selling, A-Z, Z-A, best reviewed, lowest price, highest price, relevance. |
| Filters | Brand, category/categoryIn, featured, price, rating, stock, shipping, search term, product attributes via `attr_*`. |
| Category facets | Category search filter is removed from category PLPs; subcategories are represented as link-group filters. |
| Empty filters | Filter panel/trigger is hidden when no filters exist. |
| Empty parser guard | Avoids nuqs empty-cache errors by returning `null` if no filter parsers exist. |
| Auth/customer token | Search fetch uses `no-store` when customer token exists; anonymous uses 300-second revalidation. |

## Product List UI

| Element | Behavior |
|---------|----------|
| Breadcrumbs | Render only when more than one breadcrumb exists. |
| Heading | Category/search/shop-all title plus total product count. |
| Sort control | Next to filter trigger in heading row. |
| Desktop filters | Sticky sidebar starting at `@3xl`; hidden entirely when no filters. |
| Mobile filters | Side panel with optional sticky `Apply filters` button that closes the panel. |
| Product cards | Responsive grid, `4:3` aspect ratio on PLPs/custom categories/search popover. |
| Compare | Data plumbing exists, but category/custom category pages pass `showCompare={false}`. Shop-all uses `getShowCompare`. |
| Pagination | Below product grid with previous/next icon buttons. |

## Custom Category Pages

Custom category pages currently exist for:

| Path | Component | Hero Assets |
|------|-----------|-------------|
| `/iron-sights/` | `IronSightsCategoryPage` | `iron-sights-mobile.jpeg`, `iron-sights-desktop.jpeg` |
| `/chassis-systems/` | `ChassisSystemsCategoryPage` | `chassis-systems-mobile.jpeg`, `chassis-systems-desktop.jpeg` |
| `/muzzle-devices/` | `MuzzleDevicesCategoryPage` | `muzzle-devices-mobile.jpeg`, `muzzle-devices-desktop.jpeg` |
| `/shooting-system/` | `ShootingSystemCategoryPage` | `shooting-system-mobile.jpeg`, `shooting-system-desktop.jpeg` |

The registry is path-based and strips locale prefixes before matching. Custom pages can also resolve category IDs from paths when the route slug is not numeric.

Each custom page keeps the same PLP feature set as the default category page except it adds a hero section and does not include category top/bottom Makeswift slots.

## Custom Category Hero Behavior

| Property | Behavior |
|----------|----------|
| Source | BigCommerce Image Manager via `imageManagerImageUrl`. |
| Mobile asset | Visible below `@xl`. |
| Desktop asset | Visible at `@xl` and up. |
| Height | 400px base, 500px at `@xl`, 600px at `@2xl`. |
| Alt text | Category name. |
| Priority | Hero images load with priority. |

## Shop All

Shop All is a standalone all-products search page. It fetches all product facets, builds filter parsers, applies query params, and renders the same `ProductsListSection`.

The app increasingly prefers a real BigCommerce "all-products" category path via [Catalog Navigation](catalog-navigation.md#all-products-path), with `/shop-all` as fallback.

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Default PLP page size is 16. | Catalyst default; 12/20/24. | Current `fetchFacetedSearch` defaults `limit = 16`; commit explicitly names this fix. | Observed |
| Hide filters UI when no filters exist. | Show empty filter sidebar/panel. | Avoids blank filter UI and matches recent feature commit. | Observed |
| Use mobile side panel with sticky apply button. | Inline filters; auto-close on selection. | Code adds `filtersPanelApplyLabel` and side-panel footer button. | Observed |
| Use path-based custom category registry. | Category ID-only registry; CMS-managed category heroes. | Current registry maps known public paths and handles locale stripping. | Observed |
| Use image-manager hero assets for custom categories. | Local assets; CMS fields; BigCommerce category image. | Custom pages hard-code image-manager filenames. | Observed |

