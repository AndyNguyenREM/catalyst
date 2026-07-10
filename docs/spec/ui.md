# UI

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Audience and product-education goals behind UI choices. |
| [Stack](stack.md) | UI libraries and styling technologies. |
| [Content Management](content-management.md) | Makeswift theme and visual editing controls. |
| [Catalog Navigation](catalog-navigation.md) | Header/footer/nav behavior. |
| [Product Discovery](product-discovery.md) | Product cards, filters, PLP layout. |
| [Product Detail](product-detail.md) | PDP layout, product options, gallery, accordions. |
| [Source Map](source-map.md) | UI file references. |

## Overview

The UI builds on Catalyst's Vibes/Soul design system with application-specific brand styling, product card ratios, custom slideshow behavior, product-detail layout changes, and Makeswift-editable theme/header/footer components. The visual direction observed in code is practical, product-forward, and manufacturing-oriented: high-contrast neutrals, red brand accent, large product imagery, Futura display treatments, and category-specific hero imagery.

## Brand and Theme

| Element | Current Behavior | Confidence |
|---------|------------------|------------|
| Primary brand color | Red `--primary: 357 81% 52%`; used for buttons/focus/underlines/hovers per CSS comment. | Observed |
| Neutral palette | White background, near-black foreground, grayscale contrast ramp. | Observed |
| Display/accent font | Futura PT loaded from Adobe Typekit and exposed in Makeswift font controls. | Observed |
| Default font tokens | Heading: DM Serif Text, body: Inter, accent/mono: Roboto Mono, with Futura available as option. | Observed |
| Makeswift theme | Site theme snapshot controls fonts and component-level CSS variables; aliases maintain older variable names. | Observed |
| Gift certificate styling | Dark red gradient variables override gift certificate card background. | Observed |

## Layout Principles

| Surface | Pattern |
|---------|---------|
| Site shell | Header, main, footer inside localized default layout; root layout provides providers, theme, consent, analytics, age verification. |
| Header | Logo-left, desktop nav middle, actions right; mobile hamburger with tiered link groups. Desktop nav wraps links. |
| Footer | Contact/social/logo/copyright plus category and page sections; mobile and desktop orders have been customized. |
| PLP | Full-width section with breadcrumb, heading/count, sort, filters, product grid, pagination. Desktop filters in sticky sidebar; mobile filters in side panel. |
| Custom category | Hero image band above standard PLP content. Uses separate mobile/desktop assets. |
| PDP | Large landscape gallery left on desktop, product details right; mobile gallery moves below price/rating before options. |
| Slideshow | Full-bleed hero with image/video slides, overlay text, CTAs, progress controls, mobile aspect ratio controls. |

## Product Card Standard

Product cards are a central visual unit across PLP, search, related products, and Makeswift product modules.

| Property | Current Behavior |
|----------|------------------|
| Image ratio | `4:3` in PLP/category/search contexts; configurable in Makeswift product components. |
| Image behavior | Cover fit, hover zoom, rounded image container. |
| Text | Product title, optional brand subtitle, price, rating, inventory message. |
| Link | Entire card image/content region links to product if `href !== '#'`. |
| Compare | Optional compare control; hidden on category pages but can appear in shop-all/product-list contexts. |
| Empty/no image | Falls back to large low-opacity title text. |

## Product Detail UI

| Element | Current Behavior |
|---------|------------------|
| Gallery | Sticky desktop gallery with landscape `3:2` default and thumbnails; mobile gallery appears within detail column. |
| Options | Supports select, radio, swatch, card, and button option styles; option selections persist in query params. |
| Dependent variants | Option lists shrink to values that match at least one purchasable variant with current selections. Invalid query selections are cleared. |
| CTA | Quantity input, add-to-cart/preorder/out-of-stock/unavailable button, wishlist button as additional action. |
| Inventory | Stock and backorder messages reserve vertical space to reduce layout shift. |
| Accordions | Product Specifications, Compatibility, Warranty; uppercased mono-style headings and prose content. |
| Videos | Section layout with video thumbnail cards and play overlay. |

## Slideshow UI

| Capability | Current Behavior |
|------------|------------------|
| Media | Supports images and uploaded video files by extension. |
| Timing | Global interval plus per-image hold duration; video slides advance on `ended`. |
| Controls | Progress segment, slide count, play/pause button. |
| Mobile layout | Selectable mobile aspect ratio including landscape, square, portrait. |
| Content placement | Horizontal left/center/right and vertical top/center/bottom controls. |
| CTAs | Primary and secondary buttons plus independent red accent line. |
| Typography | Futura outlined title effect plus optional second title and description. |

## Responsive Behavior

| Breakpoint Behavior | Current Behavior |
|---------------------|------------------|
| Header | Mobile popover menu below `@4xl`; desktop nav at `@4xl`. |
| PLP filters | Mobile side panel below `@3xl`; sticky desktop aside at `@3xl` and up. |
| Product grid | 1 column mobile, then 2/3/4/5 columns across container breakpoints. |
| PDP | Single-column mobile; desktop two-column at `@2xl` with larger gallery column. |
| Slideshow | Aspect-ratio-based below `lg`; `80vh` fixed-height style at `lg` and up. |

## Loading and Empty States

| Surface | Current Behavior |
|---------|------------------|
| Streamable data | Skeletons for breadcrumbs, sort, product list, product detail, gallery, price, rating, description, accordions. |
| Product lists | Empty state overlays skeleton grid with title/subtitle. |
| Makeswift product/blog/video components | Skeletons while SWR fetches; message boxes when no item or fetch failure. |
| Side panel | Optional sticky apply button closes the mobile filter drawer. |

## Accessibility Notes

| Pattern | Current Support |
|---------|-----------------|
| Icons | Lucide icons used for actions; key controls have aria-labels. |
| Keyboard access | Video cards and hotspots use role/button and Enter/Space handling. |
| Dialogs/popovers | Radix primitives handle modal/popover/dropdown behavior. |
| Forms | Labels, field errors, Conform validation, focus rings. |
| Search/nav | Search input, buttons, navigation links, locale/currency menus. |

## Risks and UI Questions

| Risk | Spec Link |
|------|-----------|
| Image Hotspot uses blue indicators rather than brand red. | [Open Questions](open-questions.md#cms-and-content) |
| Futura/transparent slideshow title effect may be a workaround. | [Open Questions](open-questions.md#ui-and-brand) |
| Makeswift BaseColors still include green primary defaults before custom/theme overrides. | Needs visual confirmation in live environment. |
| Custom category CSS uses broad selectors against `group/products-list-section`. | Could affect all PLPs, not only custom categories. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use Vibes/Soul components as the application UI base. | Build bespoke components; use a different design system. | Current app composes and customizes Vibes primitives/sections. | Observed |
| Use red as the brand primary/accent. | Catalyst default green; blue/purple theme. | Global CSS explicitly sets brand primary red and comments describe intended usage. | Observed |
| Use `4:3` product-card imagery for browse/search surfaces. | Default `5:6`; square; per-category ratios. | Multiple commits and props enforce `4:3` on PLPs/search/custom categories. | Observed |
| Make mobile filters an explicit side panel with apply/close control. | Inline mobile filters; auto-close on each filter tap. | Code adds `Apply filters` sticky footer in side panel. | Observed |

