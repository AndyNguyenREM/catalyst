# Specification Index

## Overview

This is a reverse-engineered specification for an existing BigCommerce Catalyst storefront customized for a manufacturing company that sells direct to consumer and through dealer-oriented flows. The codebase was not originally built from this spec process, so these documents separate what is directly observed in the repo, what has been confirmed by the user, and what is inferred from implementation and commit history.

## Confidence Legend

| Label | Meaning |
|-------|---------|
| User-confirmed | Stated directly by the project owner in conversation. |
| Observed | Directly visible in current code, comments, configuration, or git history. |
| Inferred | Reasonable product or intent interpretation from observed behavior; should be confirmed before using as a requirement. |

## Provenance

This repo is a fork of BigCommerce's Catalyst repository. For reverse-spec purposes, AndyNguyenREM-authored commits are treated as the strongest code-history signal for app-specific work, while untouched upstream Catalyst code is treated as framework context unless it forms an application seam.

Migration, dependency, and security commits are still useful because they show which custom integrations had to be restored after framework upgrades, but they are not treated as product intent on their own.

## Spec Components

### Planning

| Document | Status | Description |
|----------|--------|-------------|
| [Build Order](build-order.md) | 🔲 Draft | Validation and future-spec sequencing for this already-built storefront. |
| [Open Questions](open-questions.md) | 🔲 Draft | Dedicated list of unresolved product intent, business, and implementation questions. |

### Shared Specs

| Document | Status | Description |
|----------|--------|-------------|
| [Product Context](product-context.md) | 🔲 Draft | Audience, business shape, glossary, and current product goals. |
| [Stack](stack.md) | 🔲 Draft | Technology choices, services, environment, and data flow. |
| [Backend](backend.md) | 🔲 Draft | App architecture, framework seams, server/API routes, caching, and data ownership. |
| [UI](ui.md) | 🔲 Draft | Design system, brand styling, responsive behavior, and app-level UI conventions. |
| [Routing and SEO](routing-seo.md) | 🔲 Draft | Dynamic BigCommerce routing, legacy redirects, metadata, sitemap, robots, and SEO behavior. |
| [Analytics and Compliance](analytics-and-compliance.md) | 🔲 Draft | Analytics, consent, age gate, third-party scripts, and compliance-sensitive surfaces. |
| [Source Map](source-map.md) | 🔲 Draft | Traceability map from spec areas to code files and git-history signals. |

### Feature Specs

| Document | Status | Description |
|----------|--------|-------------|
| [Content Management](content-management.md) | 🔲 Draft | Makeswift-managed pages, theme, header/footer snapshots, custom CMS components, and publish behavior. |
| [Catalog Navigation](catalog-navigation.md) | 🔲 Draft | Header, footer, search entry points, all-products behavior, locale/currency controls, and navigation structure. |
| [Product Discovery](product-discovery.md) | 🔲 Draft | Category/search/brand/shop-all listing pages, facets, sorting, custom category heroes, and product cards. |
| [Product Detail](product-detail.md) | 🔲 Draft | PDP layout, product options, variant compatibility filtering, metafields, videos, inventory, related products, wishlist, reviews, and structured data. |
| [Customer Commerce](customer-commerce.md) | 🔲 Draft | DTC commerce flows, account/wishlist/cart/checkout, gift certificates, newsletter preferences, and dealer/customer-group seams. |

## Current Scope

| Area | Current Understanding | Confidence |
|------|----------------------|------------|
| Storefront business | Manufacturing company selling both DTC and through dealers. | User-confirmed |
| Repo provenance | Fork of BigCommerce Catalyst with app-specific intent primarily inferred from AndyNguyenREM commits and current customized `core/` files. | User-confirmed/Observed |
| Commerce platform | BigCommerce Catalyst storefront with Storefront GraphQL API backing catalog, cart, account, content, redirects, and settings. | Observed |
| CMS/editor | Makeswift manages homepage, catch-all pages, site header/footer/theme snapshots, and several custom marketing/content components. | Observed |
| Product education | Product pages and CMS content emphasize specifications, compatibility, videos, blog content, image hotspots, and YouTube content. | Inferred |
| Dealer support | Customer group slots can target content to logged-in customer groups; dealer-specific requirements are not yet confirmed. | Observed/Inferred |
| Framework boundary | Specs document Catalyst/Makeswift only where application behavior touches them; framework internals are intentionally out of scope. | User-confirmed |

## Reading Paths

For a product merchandising or category-page question, start with [Product Context](product-context.md), then [Product Discovery](product-discovery.md), [Product Detail](product-detail.md), [Catalog Navigation](catalog-navigation.md), and [Source Map](source-map.md).

For a CMS or content-editor question, start with [Content Management](content-management.md), then [UI](ui.md), [Catalog Navigation](catalog-navigation.md), [Analytics and Compliance](analytics-and-compliance.md), and [Source Map](source-map.md).

For a backend/API or platform question, start with [Stack](stack.md), [Backend](backend.md), [Routing and SEO](routing-seo.md), and [Source Map](source-map.md).

For dealer or customer-specific behavior, start with [Customer Commerce](customer-commerce.md), then [Content Management](content-management.md), [Backend](backend.md), and [Open Questions](open-questions.md).

## Out of Scope

| Item | Reason |
|------|--------|
| Full Catalyst framework internals | User requested only the seam where framework code interfaces with the app. |
| BigCommerce admin/catalog configuration not represented in code | Requires user or store-admin confirmation. |
| Makeswift page content stored remotely | The repo contains component definitions and snapshot-loading behavior, not the remote page content itself. |
| Final implementation readiness | These are draft reverse specs and require owner review before being treated as approved requirements. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use many cross-referenced spec files rather than one monolithic reverse spec. | One large spec document; feature-only notes. | Matches `docs/spec-strategy.md`, improves traceability, and lets application features evolve independently. | User-confirmed/Observed |
| Mark reverse-engineered material by confidence level. | Treat current code as fully intentional; omit confidence labels. | The original intent was not fully captured when built, and user asked for inferred intent where possible. | User-confirmed |
| Keep questions in a dedicated document. | Inline questions in each spec only. | User explicitly requested a separate open questions document. | User-confirmed |
