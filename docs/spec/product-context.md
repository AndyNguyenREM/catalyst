# Product Context

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Stack](stack.md) | Platform capabilities and external services available to the storefront. |
| [UI](ui.md) | Brand and interface principles that express the product context. |
| [Catalog Navigation](catalog-navigation.md) | How users enter and move through catalog content. |
| [Product Discovery](product-discovery.md) | How shoppers browse manufacturing product categories. |
| [Product Detail](product-detail.md) | How product details explain fit, specs, media, and purchase readiness. |
| [Customer Commerce](customer-commerce.md) | DTC, dealer, account, and commerce flows. |
| [Open Questions](open-questions.md) | Unconfirmed business intent. |

## Overview

The site is a commerce and product-education storefront for a manufacturing company. It supports direct-to-consumer purchase flows while also leaving room for dealer-oriented experiences through customer groups, account flows, and targeted CMS content.

The storefront is built as a fork of BigCommerce Catalyst and uses Makeswift for editable marketing pages and layout surfaces. The application-specific work mostly customizes catalog presentation, product detail education, CMS components, navigation/footer behavior, and integrations around product and content media.

For this reverse spec, AndyNguyenREM-authored commits are the main historical evidence for project-owned intent. Upstream Catalyst architecture is documented only where it carries application behavior, such as route resolution, BigCommerce data fetching, Makeswift registration, cart/account seams, and shared UI primitives modified for this storefront.

## Audiences

| Audience | Needs | Current Support | Confidence |
|----------|-------|-----------------|------------|
| Direct-to-consumer shoppers | Browse product categories, understand compatibility/specs, add to cart, checkout, manage account/wishlist. | BigCommerce catalog, PLP/PDP, cart, checkout, account, wishlist, reviews. | User-confirmed/Observed |
| Dealers or trade customers | Potentially see dealer-specific content, account-specific experiences, or targeted messaging. | Customer group slot can display different Makeswift content by customer group. Dealer-specific business rules are not yet confirmed. | User-confirmed/Inferred |
| Content editors/marketers | Build pages, hero sections, product/content carousels, video modules, blog modules, brand/logo sections, and newsletter CTAs without code changes. | Makeswift page system and registered custom components. | Observed |
| Search engines and crawlers | Stable product/category URLs, redirects, sitemap, metadata, structured data. | BigCommerce route resolver, legacy product redirects, sitemap/robots/favicon proxies, PDP metadata/schema. | Observed |
| Customer support/admin stakeholders | Product details, compatibility data, inventory/backorder messaging, contact/navigation pages. | BigCommerce data surfaces and account flows. Admin workflow not documented in repo. | Inferred |

## Product Goals

| Goal | Description | Evidence | Confidence |
|------|-------------|----------|------------|
| Sell manufactured products online | Let shoppers browse products, choose options, add items to cart, and checkout through BigCommerce. | Product list/detail/cart/checkout code paths under `core/app/[locale]/(default)/`. | User-confirmed/Observed |
| Explain product fit and specs before purchase | Use product specifications, compatibility accordions, videos, reviews, images, and option filtering to reduce uncertainty. | Product metafields, `Compat` accordion, variant matrix, video section, product gallery. | Observed/Inferred |
| Support category-specific merchandising | Give key categories custom hero imagery while preserving normal PLP filtering/sorting. | Custom category pages for `/iron-sights/`, `/chassis-systems/`, `/muzzle-devices/`, `/shooting-system/`. | Observed |
| Keep marketing content editable | Use Makeswift for homepage/catch-all pages, site theme, header/footer, and custom content modules. | `core/lib/makeswift/components.ts` and Makeswift catch-all page. | Observed |
| Preserve SEO from legacy/catalog URLs | Resolve BigCommerce routes dynamically and redirect legacy `/product/:slug` URLs to vanity paths. | `core/middlewares/with-routes.ts`. | Observed |
| Accommodate DTC and dealer channels | Use account/customer-group concepts and potentially targeted CMS content. | User statement plus customer-group slot component. | User-confirmed/Inferred |

## Current Product Shape

| Surface | Role |
|---------|------|
| Homepage and CMS pages | Makeswift-authored brand, product, education, and marketing content. |
| Header | Editable site header with logo, links, search, account, cart, gift certificate, locale, and currency controls. |
| Footer | Store contact/social/copyright plus categories from the all-products category and content pages. |
| Product listing pages | Category/search/brand/shop-all browse surfaces with filters, sort, pagination, and product cards. |
| Custom category pages | Category PLPs with hero images loaded from BigCommerce Image Manager. |
| Product detail pages | Product gallery, pricing, options, dependent variant filtering, stock/backorder, wishlist, add to cart, descriptions, specs, compatibility, warranty, videos, related products, reviews, analytics, and schema. |
| Content integrations | Blog cards/carousels, YouTube cards/carousels/playlists, image hotspots, brand carousel, Constant Contact popup support. |
| Customer areas | Account settings, orders, addresses, wishlists, change password, login/register/forgot password. These appear mostly Catalyst-provided. |

## Glossary

| Term | Meaning |
|------|---------|
| Catalyst | BigCommerce's Next.js storefront framework. In this spec, Catalyst internals are documented only when they affect app behavior. |
| Vibes/Soul | Catalyst UI component system used by product cards, product detail, forms, navigation, footer, slideshow, and sections. |
| Makeswift | Visual CMS/editor used for page snapshots and registered components. |
| PLP | Product listing page: category, brand, search, or shop-all pages. |
| PDP | Product detail page. |
| All-products category | A BigCommerce category whose children are used as primary catalog sections and as a fallback replacement for `/shop-all`. |
| Customer group | BigCommerce customer segmentation concept used by the customer group slot, likely relevant for dealer content. |
| Product metafield | BigCommerce product metadata field used here for Product Specifications and Compatibility accordions. |

## Constraints

| Constraint | Implication | Confidence |
|------------|-------------|------------|
| BigCommerce is the source of truth for catalog, routes, redirects, settings, cart, customer/account, reviews, blog, and content pages. | App code should not duplicate catalog or customer state except for display transformation and caching. | Observed |
| Makeswift page content is remote. | Local specs can document component capabilities and runtime behavior, but not actual live page layouts unless fetched from Makeswift or described by the user. | Observed |
| Framework code is large and partly upstream-owned. | Specs should describe app-specific behavior and seam contracts, not every framework module. | User-confirmed |
| Author-specific history distinguishes app work from inherited framework code. | Commits authored by AndyNguyenREM receive higher weight as app-specific evidence; upstream framework changes receive lower weight unless they restore or support custom storefront behavior. | User-confirmed/Observed |
| Some implementation may be accidental or migration-driven. | Open questions should flag uncertain intent rather than treating every detail as final requirement. | User-confirmed |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Treat the site as a DTC storefront with dealer-support seams rather than a fully specified dealer portal. | Full dealer portal; DTC-only storefront. | User confirmed both DTC and dealer sales, but code only clearly exposes customer-group targeting and account flows for dealer differentiation. | User-confirmed/Inferred |
| Use current behavior as source material but flag uncertain product intent. | Assume all code is intentional; ask before documenting anything. | User asked for a complete reverse spec and said accidental/incomplete areas can be flagged as questions. | User-confirmed |
| Emphasize product education in the spec. | Treat product pages as standard ecommerce only. | Product specs, compatibility, videos, image hotspots, YouTube/blog components, and custom category visuals all point toward education-heavy merchandising. | Inferred |
