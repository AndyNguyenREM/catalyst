# Product Detail

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Product education and purchase goals. |
| [Stack](stack.md) | BigCommerce, Streamable, forms, query-state, media services. |
| [Backend](backend.md) | Product GraphQL queries, caching, API boundaries. |
| [UI](ui.md) | PDP layout and product option UI. |
| [Content Management](content-management.md) | Makeswift product detail edit seam and media components. |
| [Customer Commerce](customer-commerce.md) | Wishlist, cart, reviews, account-sensitive behavior. |
| [Routing and SEO](routing-seo.md) | PDP metadata, schema, and product route rewriting. |
| [Open Questions](open-questions.md) | Metafield and product-video questions. |

## Overview

The product detail page is the richest app-specific commerce surface. It combines BigCommerce product data, option selection, variant compatibility filtering, pricing, inventory/backorder messaging, wishlist/add-to-cart actions, product education accordions, native product videos, related products, reviews, analytics, and structured data.

## PDP Data Flow

1. Public product vanity URL resolves through middleware to internal `/{locale}/product/{entityId}`.
2. `generateMetadata` fetches product SEO and default image metadata.
3. Page fetches base product and settings, including options and a variant matrix.
4. Search params are parsed as selected option entity/value IDs.
5. Streamable product/pricing/inventory/images/videos/accordions/related products are created.
6. Vibes `ProductDetail` renders the layout; `ProductDetailForm` handles option state and add-to-cart.
7. Analytics/schema/viewed components render with product/pricing data.

## Product Information

| Element | Source | Behavior |
|---------|--------|----------|
| Title | BigCommerce product name | Main heading. |
| Brand | BigCommerce product brand | Subtitle above title. |
| Price | Pricing query with active currency | Rendered with price transformer. |
| Description | Base product description | Rendered as sanitized/prose-like HTML region via React HTML. |
| Images | Streamable product images/default image | Default image first, followed by other images excluding duplicates. |
| Reviews/rating | BigCommerce review summary/settings | Rating link or write-review prompt depending settings. |
| Min/max quantity | BigCommerce min/max purchase quantity | Applied to quantity input. |
| Availability | BigCommerce `availabilityV2` and inventory | CTA label/disabled state and stock/backorder messaging. |

## Product Options and Variants

| Capability | Behavior |
|------------|----------|
| Supported option controls | Select, radio, swatch radio, card radio, button radio, checkbox, number, text, date, textarea. |
| Query persistence | Persisted fields store option selections in URL query params. |
| Prefetch | Hovering an option can prefetch the URL with that selection. |
| Validation | Conform + Zod schema validates product fields and quantity. |
| Add to cart | Server action receives form data, emits analytics add-to-cart event, and revalidates cart on success. |
| Invalid selections | Variant matrix can clear query params that no longer match a purchasable variant. |

## Dependent Variant Filtering

The app builds a matrix of purchasable variants where each row maps variant option entity ID to selected value entity ID. UI fields are filtered so each option only displays values that can coexist with other active selections.

| Behavior | Details |
|----------|---------|
| Purchasable only | Non-purchasable variants are excluded. |
| Multiple pages | Variant matrix fetches up to 200 pages of 50 variants each. |
| Multiple option values | Picks default value when multiple values exist; otherwise first value. |
| Dedupe | Unique rows are serialized and deduplicated. |
| Field scope | Applies to persisted multiple-choice field types only. |
| Query cleanup | If selections are impossible, clears reverse-ordered selected fields until a valid combination remains. |

## Product Specifications and Compatibility

| Accordion | Source | Behavior |
|-----------|--------|----------|
| Product Specifications | Product metafields with key `Info` or `info`; extra query to namespace `Info`. | Sanitizes and renders HTML from metafield values. |
| Compatibility | Product metafields with key `compat` or `Compat`; extra query to namespace `Compat`. | Sanitizes and renders HTML from metafield values. |
| Warranty | BigCommerce product warranty | Renders HTML when present. |

The Product Specifications/Compatibility contract needs owner confirmation, especially namespace/key naming and expected HTML structure.

## Product Videos

| Behavior | Details |
|----------|---------|
| Source | Native BigCommerce product videos on streamable product query. |
| URL parsing | YouTube and Vimeo URLs are parsed for embed IDs. |
| Display | Section titled from translation `ProductDetails.videos`; grid of video thumbnail cards. |
| Play | YouTube uses generated thumbnail and embed; Vimeo embeds when ID parsed; fallback uses source URL. |
| Empty | Video section is not rendered when no videos exist. |

## Inventory and Backorder

| Element | Behavior |
|---------|----------|
| CTA status | Unavailable disables CTA; preorder enabled with preorder label; out of stock disables CTA. |
| Variant inventory | If product has variant inventory, selected SKU variant inventory is fetched. |
| Stock display | Honors BigCommerce inventory settings: show/hide out-of-stock message, stock level display, warning level. |
| Backorder prompt | Shows availability prompt when configured and backorder availability exists. |
| Backorder quantity | When order quantity exceeds available on hand and settings allow, shows quantity that will be backordered. |
| Location message | Uses first inventory location backorder message if available. |

## Related Products

Related products are fetched from BigCommerce with pricing and transformed into product cards. The carousel CTA label is `Shop all`; CTA href uses the all-products category path if available, otherwise `/shop-all`.

## Reviews

| Behavior | Details |
|----------|---------|
| Rating shown | If reviews enabled and display setting shows product rating, page renders rating link and reviews section. |
| Write review prompt | If reviews enabled but display setting does not show rating, product detail renders write-review trigger. |
| User data | Review form pre-fills/uses session email and obfuscated first name + last initial when available. |

## Wishlist

The PDP includes a visible wishlist button and a detached hidden wishlist form. It passes product ID and streamable SKU, letting wishlist behavior track the currently selected variant/SKU.

## SEO and Analytics

| Surface | Behavior |
|---------|----------|
| Metadata | Product SEO title/description/keywords, default image Open Graph. |
| Product schema | Renders product structured data with pricing. |
| Product viewed | Renders `ProductViewed`; route middleware also sends product viewed data event. |
| Product analytics provider | Provides ID, name, SKU, brand, price, currency. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use product metafields for specs and compatibility. | Custom fields; hard-coded specs; rich description only. | Current PDP creates Product Specifications and Compatibility accordions from metafields. | Observed |
| Filter variant option choices by purchasable combinations. | Allow all option values and show errors later; disable impossible values. | Current implementation removes impossible values and clears invalid query selections. | Observed |
| Show native BigCommerce product videos on PDP. | Only CMS YouTube components; no PDP videos. | Product video section reads BigCommerce video data and renders when present. | Observed |
| Use all-products path for related-products CTA. | Link to current category; hide CTA; link to `/shop-all` always. | Code calls `getAllProductsCategoryPath`. | Observed |
| Keep product detail editable through a private Makeswift wrapper. | Fully code-only PDP; fully CMS-authored PDP. | Current wrapper lets Makeswift override summary/description/accordions while app passes dynamic product context. | Observed |

