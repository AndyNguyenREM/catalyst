# Catalog Navigation

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | DTC/dealer storefront navigation goals. |
| [UI](ui.md) | Header/footer/nav visual behavior. |
| [Backend](backend.md) | Header/footer data fetching and all-products helper. |
| [Content Management](content-management.md) | Makeswift-managed header/footer controls. |
| [Product Discovery](product-discovery.md) | Browse destinations and PLP behavior. |
| [Routing and SEO](routing-seo.md) | Public URL resolution and redirects. |
| [Open Questions](open-questions.md) | Unconfirmed all-products/header intent. |

## Overview

Navigation combines dynamic BigCommerce data with Makeswift-edited global surfaces. The header is primarily editor-configured through Makeswift rather than auto-populated from the category tree. The footer uses BigCommerce category/content/settings data and can be extended/overridden through Makeswift.

## Header

| Element | Current Behavior |
|---------|------------------|
| Logo | BigCommerce store logo transformed, with Makeswift desktop/mobile override controls. |
| Links | Code passes an empty link array; Makeswift header snapshot provides additional links and nested groups. |
| Desktop nav | Logo-left, links in center/left/right per editor control, action icons right. Links wrap to avoid overflow. |
| Mobile nav | Hamburger opens popover; top-level links can expand into grouped/tiered links with a back button. |
| Search | Icon opens search popover when search action is available; submit goes to `/search` using `term`. |
| Account | Icon link to `/login`. |
| Cart | Shopping cart icon link to `/cart`, with async cart quantity badge. |
| Gift certificates | Icon appears only when BigCommerce gift certificate settings are enabled for active currency. |
| Locale | Dropdown when more than one locale is configured. |
| Currency | Dropdown for transactional currencies; switching refreshes route/cache. |
| Banner | Makeswift header can show a dismissible or non-dismissible banner slot. |

## Search Popover

| Behavior | Details |
|----------|---------|
| Debounced search | Runs header search action after 300ms as the query changes. |
| Full submit | Form action navigates to search page. |
| Results | Can render link groups and product cards. |
| Product card ratio | Search product cards use `4:3`. |
| Empty/error state | Displays localized empty/error messages after stale pending state clears. |

## Footer

| Element | Current Behavior |
|---------|------------------|
| Logo | BigCommerce store logo with Makeswift override/show controls. |
| Contact | BigCommerce store contact address and phone. |
| Social links | BigCommerce social links mapped to known icons: Facebook, X/Twitter, Pinterest, Instagram, YouTube. |
| Copyright | `© {year} {storeName} – Powered by BigCommerce`, overrideable by Makeswift footer. |
| Categories section | Uses children of the all-products category if found; otherwise top-level `categoryTree`. |
| Navigate section | Gift certificate link when enabled plus root content pages. |
| Makeswift sections | Editor sections are merged with passed BigCommerce sections by title. |

## All-Products Path

`getAllProductsCategoryPath` searches the BigCommerce category tree for a category whose lowercase name is one of:

- `all-products`
- `all products`
- includes `all-product`
- includes both `all` and `product`

The category must have children. If found, its path is used for "shop all" style CTAs and footer category sourcing. If not found or fetch fails, the app falls back to `/shop-all`.

Current users of this helper include homepage slideshow wrapper, cart continue-shopping behavior, PDP related-products CTA, and footer category selection.

## Navigation Data Sources

| Data | Source |
|------|--------|
| Header logo/settings/currencies | BigCommerce LayoutQuery. |
| Header gift certificate visibility | BigCommerce settings by active currency. |
| Header links | Makeswift site-header snapshot. |
| Footer contact/social/logo/settings | BigCommerce LayoutQuery. |
| Footer category/page links | BigCommerce GetLinksAndSectionsQuery. |
| Footer editor overrides | Makeswift site-footer snapshot. |
| Cart count | BigCommerce cart query by current cart ID. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use Makeswift-configured header links instead of automatic category-tree links. | Auto-populate header from BigCommerce categories; hard-code nav links. | Header code deliberately passes no dynamic links and lets Makeswift merge editor links. | Observed |
| Use all-products category children for footer catalog navigation. | Always use top-level categories; hard-code footer categories. | Footer implementation searches for all-products and uses children when available. | Observed |
| Use icon-only header actions for cart/account/search/gift certificates. | Text links; mixed text/icon buttons. | Navigation component renders Lucide icons with aria-labels and compact action layout. | Observed |
| Preserve locale/currency controls from Catalyst. | Hide locale/currency; custom selectors. | Code retains locale and currency dropdowns with BigCommerce transactional currency filtering. | Observed |

