# Open Questions

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Most business-intent questions originate here. |
| [Content Management](content-management.md) | CMS/editor workflow questions. |
| [Catalog Navigation](catalog-navigation.md) | Header, footer, all-products, and search questions. |
| [Product Discovery](product-discovery.md) | PLP/category/filter questions. |
| [Product Detail](product-detail.md) | PDP data, option, metafield, and media questions. |
| [Customer Commerce](customer-commerce.md) | Dealer/DTC/account questions. |
| [Analytics and Compliance](analytics-and-compliance.md) | Consent, age gate, analytics, regulated-content questions. |

## Status

This document is intentionally separate from feature specs. All items below are unresolved until the project owner answers them or code/data makes the answer unambiguous.

## Business and Audience

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-BIZ-01 | What is the company/brand name this storefront should use in specs and user-facing references? | Specs currently say "manufacturing company"; brand name may affect product language, SEO, and design rationale. | User-confirmed context omitted name | Medium |
| Q-BIZ-02 | What product category or industry terms should be used? Current code suggests shooting systems, chassis systems, muzzle devices, and iron sights. | Determines whether specs should explicitly mention regulated firearms-adjacent products or keep broader manufacturing language. | Observed code/Inferred | High |
| Q-BIZ-03 | What does "dealer sales" mean for this site: dealer locator, dealer-only pricing, dealer-only content, dealer accounts, wholesale ordering, or lead generation? | Current code only shows customer group content targeting; dealer commerce requirements are not defined. | User-confirmed dealer channel/Inferred | High |
| Q-BIZ-04 | Are DTC and dealer shoppers meant to share the same catalog and pricing unless logged into a dealer group? | Affects customer group slots, BigCommerce price lists/customer groups, and account UX. | Inferred | High |

## Repo Provenance and Migration

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-PROV-01 | Are all AndyNguyenREM-authored custom content components intended to remain product surface, or are any retired experiments that should be marked historical only? | Components such as YouTube, blog, hotspot, brand carousel, Constant Contact, and customer group slot are registered locally, but live Makeswift page usage is remote. | Observed history/Observed code | Medium |
| Q-PROV-02 | Which Catalyst v1.4 restoration changes represent durable product requirements versus upgrade cleanup? | Upgrade commits restored many custom integrations; the spec should preserve product intent without over-documenting temporary migration mechanics. | Observed history | Medium |

## Catalog and Navigation

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-CAT-01 | Is the "all-products" category the intended primary catalog root for navigation and CTAs, or only a migration fallback for `/shop-all`? | `getAllProductsCategoryPath` and footer logic prefer that category, but product intent should be confirmed. | Observed | High |
| Q-CAT-02 | Should the header intentionally rely only on Makeswift-configured links, with no automatic BigCommerce category links? | Header code sets `streamableLinks` to an empty array before Makeswift merges editor links. | Observed | Medium |
| Q-CAT-03 | Should product comparison stay hidden on category/custom category pages even when BigCommerce has product comparisons enabled? | Category pages fetch compare products but pass `showCompare={false}`. Shop-all can show compare. | Observed | Medium |
| Q-CAT-04 | Are custom category pages intended for only four paths: `/iron-sights/`, `/chassis-systems/`, `/muzzle-devices/`, `/shooting-system/`? | Registry is path-based and empty by category ID. | Observed | Medium |
| Q-CAT-05 | Should custom category pages keep their current duplicated implementation, or should the spec call for a shared reusable custom-category component? | Duplication is implementation risk but might be acceptable post-upgrade. | Observed | Low |

## Product Detail

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-PDP-01 | What is the canonical namespace/key contract for product specifications: namespace `Info`, key `Info`, `info`, or something else? | Code fetches namespace from env for streamable product and separately queries namespaces `Info` and `Compat` with likely keys. | Observed | High |
| Q-PDP-02 | What HTML structure is expected inside Product Specifications and Compatibility metafield values? | Code sanitizes specs/compat values and renders HTML; content conventions should be documented for catalog admins. | Observed | High |
| Q-PDP-03 | Are SKU, condition, and weight intentionally excluded from product specifications? | Git history references excluding SKU/condition from specs, but current custom accordions use metafields and warranty. | Observed history | Medium |
| Q-PDP-04 | Should Compatibility be visible only when metafield content exists, or should products without compatibility data display an empty/fallback state? | Code only creates accordion when content exists. | Observed | Low |
| Q-PDP-05 | Are product videos expected to come only from native BigCommerce product videos, or also Makeswift/YouTube components on PDP content slots? | PDP has native video section; CMS has separate video/YouTube modules. | Observed | Medium |
| Q-PDP-06 | Should related product CTA always go to the all-products category fallback, or should it be category/product-family specific? | PDP related-products CTA calls `getAllProductsCategoryPath`. | Observed/Inferred | Medium |
| Q-PDP-07 | What are acceptable limits for products with more than 10,000 purchasable variants? | Variant matrix fetch caps at 200 pages of 50 variants and then marks `hasNextPage` false. | Observed | Low |

## Dealer and Customer Segmentation

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-DEALER-01 | Which BigCommerce customer groups represent dealers, if any? | Customer group slot can target group IDs but the mapping is store data, not repo data. | Observed/Inferred | High |
| Q-DEALER-02 | Should dealer-specific content be editor-managed in Makeswift through `Customer Group Slot`, or should it be enforced server-side? | Editor-managed targeting is flexible but client-fetched and content-focused; pricing/security requirements may need platform enforcement. | Observed/Inferred | High |
| Q-DEALER-03 | Do dealers need separate checkout, purchase order, tax exemption, minimum order quantity, or restricted product visibility behavior? | Not visible in code; BigCommerce may handle some via customer groups. | User-confirmed dealer channel | High |

## CMS and Content

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-CMS-01 | Which Makeswift components are actively used on live pages versus available but experimental? | Repo registers many custom components; actual remote page snapshots are not present. | Observed | Medium |
| Q-CMS-02 | Should the Image Hotspot component use brand colors instead of blue hotspot indicators? | Current hotspot uses blue by default, while brand primary is red. This may be accidental. | Observed/Inferred | Low |
| Q-CMS-03 | Should the YouTube Video Modal component continue using mock metadata when given only a URL, or should it fetch real metadata like the card component? | Current modal wrapper constructs mock metadata. | Observed | Low |
| Q-CMS-04 | Is the hard-coded Constant Contact `_ctct_m` default value correct for this company? | Component includes a specific default. | Observed | High |
| Q-CMS-05 | Are Makeswift header/footer/theme snapshots intended to be required on every environment? | Runtime expects snapshots by default, but fallback behavior depends on Makeswift response. | Observed | Medium |

## UI and Brand

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-UI-01 | Is Futura PT the intended primary brand/display font, or only for slideshow/editor compatibility? | Futura PT is loaded from Adobe Fonts and exposed to Makeswift, while default font tokens use Inter/DM Serif/Roboto Mono. | Observed | Medium |
| Q-UI-02 | Is the invisible first slideshow title intentional for outlined text effects, or a workaround that should be described differently? | Slideshow renders title text transparent with Futura outline styling. | Observed | Low |
| Q-UI-03 | Should custom category hero images always be image-manager assets with `*-mobile.jpeg` and `*-desktop.jpeg` naming? | Custom category pages hard-code those filenames. | Observed | Medium |
| Q-UI-04 | Should product listing cards use `4:3` everywhere, including search results and custom categories? | Many app changes enforce 4:3 for PLPs/search/category and search popover cards. | Observed | Medium |

## SEO, Analytics, and Compliance

| ID | Question | Why It Matters | Source | Priority |
|----|----------|----------------|--------|----------|
| Q-SEO-01 | Are vanity product URLs always the canonical target, with `/product/:slug` permanently redirected? | Middleware applies a 301 for `/product/:slug`. | Observed | High |
| Q-SEO-02 | Are there additional legacy URL patterns from the previous storefront that need redirects? | Code handles `/product/:slug` and `/xmlsitemap.php`; store-level redirects may handle others. | Observed/Inferred | Medium |
| Q-COMP-01 | Is age verification legally required for the whole site, specific categories, or just present from the template? | Root layout always includes `AgeVerification`. | Observed/Inferred | High |
| Q-COMP-02 | What consent categories should gate Constant Contact, YouTube embeds, Vercel analytics, BigCommerce analytics, and third-party scripts? | Consent manager is present, but component-specific consent requirements are not specified. | Observed/Inferred | High |
| Q-AN-01 | Which analytics events are business-critical beyond product viewed and add-to-cart? | Code includes BigCommerce analytics, Vercel analytics, product viewed, category viewed, compare/cart events. | Observed | Medium |
