# Content Management

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | Why editable marketing/product education content matters. |
| [Stack](stack.md) | Makeswift and external content services. |
| [Backend](backend.md) | API routes and snapshot loading. |
| [UI](ui.md) | Theme, layout, and visual component behavior. |
| [Catalog Navigation](catalog-navigation.md) | Editable header/footer surfaces. |
| [Product Detail](product-detail.md) | Product detail edit seam and media modules. |
| [Analytics and Compliance](analytics-and-compliance.md) | Third-party content scripts and embeds. |
| [Open Questions](open-questions.md) | Unconfirmed editor workflow questions. |

## Overview

Makeswift is the visual CMS/editor layer. The homepage and catch-all pages render Makeswift page snapshots, while key global surfaces like header, footer, and site theme use Makeswift component snapshots. The code registers a mix of standard Catalyst/Makeswift components and custom content modules for products, videos, blogs, newsletter, brand logos, hotspots, and customer-group targeting.

## Page Model

| Page Type | Behavior |
|-----------|----------|
| Homepage | `core/app/[locale]/(default)/page.tsx` renders Makeswift page path `/`. |
| Catch-all pages | `core/app/[locale]/(default)/[...rest]/page.tsx` renders Makeswift page for the rest path. |
| Missing snapshot | `Page` returns `notFound()` after `connection()` to support editor behavior. |
| Locale | Makeswift snapshot calls normalize default locale to `undefined` and pass non-default locales. |

## Component Snapshot Model

| Component | Snapshot ID | Purpose |
|-----------|-------------|---------|
| Site Theme | `site-theme` | Global font tokens, color/component theme variables. |
| Site Header | `site-header` | Editable header layout, logo, links, banner. |
| Site Footer | `site-footer` | Editable footer logo/sections/copyright. |
| Category top/bottom content slots | `category-{categoryId}-top-content`, `category-{categoryId}-bottom-content` | Optional category-specific editable content around default PLP content. |
| Product Detail | private component type | Editable product detail summary/description/accordions when wrapped with PDP context. |

## Registered Components

| Component Type | Label | Purpose |
|----------------|-------|---------|
| `section-slideshow` | Sections / Slideshow | Image/video hero slideshow with CTAs, timing, mobile aspect ratio, accent line. |
| `catalog-product-card` | Catalog / Product Card | Single selected BigCommerce product card. |
| `primitive-products-list` | Catalog / Products List | Product grid from collection plus additional selected products. |
| `primitive-products-carousel` | Catalog / Products Carousel | Product carousel from collection plus additional selected products. |
| `blog-post-card` | Content / Blog Post Card | Selected BigCommerce blog post card. |
| `blog-post-carousel` | Content / Blog Post Carousel | Latest or tag-filtered BigCommerce blog posts. |
| `youtube-video-card` | Content / YouTube Video Card | Single YouTube video card by URL. |
| `youtube-video-carousel` | Content / YouTube Video Carousel | Latest videos from channel/playlist; desktop list and mobile carousel. |
| `youtube-video-carousel-row` | Content / YouTube Video Carousel (Row) | Row/grid carousel with playlist switch events and display toggles. |
| `youtube-playlist-switcher` | Content / YouTube Playlist Switcher | Buttons that dispatch playlist-switch events to a carousel. |
| `youtube-video-modal` | Content / YouTube Video Modal | Button-triggered YouTube modal. |
| Built-in `Video` override | Video | YouTube thumbnail/play behavior and HTML5 video fallback. |
| `ImageHotspot` | Image Hotspot | Interactive image callouts with modal details. |
| `brand-carousel` | Brand Carousel | Editable logo/brand carousel. |
| `constant-contact-subscribe` | Marketing / Newsletter Subscribe | Constant Contact popup script and newsletter-page button. |
| `catalyst-customer-group-slot` | Catalyst / Customer Group Slot | Content targeted by current/simulated BigCommerce customer group. |

## Content Data Sources

| Content Type | Data Source | Local Adapter |
|--------------|-------------|---------------|
| Pages/layout content | Makeswift snapshots | `core/lib/makeswift/client.ts`, `Page`, `Component`. |
| Products | BigCommerce GraphQL/product API routes | `/api/products/*`, `useProducts`, `useBcProductToVibesProduct`. |
| Blog posts | BigCommerce GraphQL via local API | `/api/blog-posts`, `/api/blog-posts/[id]`, `useBlogPosts`, `searchBlogPosts`. |
| YouTube videos | YouTube Data API via local API | `/api/youtube/video`, `/api/youtube/videos`, `useYouTubeVideos`. |
| Customer groups | BigCommerce REST/customer query via local API | `/api/customer/groups`, `/api/customer/group`. |
| Newsletter popup | Constant Contact script | `constant-contact-subscribe`. |

## Editor Controls

| Area | Key Controls |
|------|--------------|
| Header | Banner show/close/id/slot, desktop/mobile logo, logo link, additional links, nested groups, link position. |
| Footer | Logo show/src/size/alt, sections with links, copyright text. |
| Theme | Font tokens, component theme groups, Futura PT support, CSS variable aliases. |
| Slideshow | Slide title, second title, description visibility, image, image duration, accent line, primary/secondary buttons, alignment, autoplay, interval, mobile aspect ratio. |
| Product modules | Collection type, limit, selected additional products, aspect ratio, color scheme, badge, compare visibility. |
| Video modules | URLs, channel/playlist IDs, limits, buttons, scrollbar, view/date/description toggles, grid wrapping. |
| Customer group slot | Targeted group slots, simulated group for builder preview, no-group slot. |

## Publish and Revalidation

The Makeswift API handler registers an `onPublish` event that calls `revalidatePath('/', 'layout')`. This is intended to refresh app layout/page data after Makeswift publishes. It may not be sufficient for every dynamic path or all component snapshots; confirm expected publish propagation in live usage.

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use Makeswift for homepage and editable catch-all pages. | Code-authored marketing pages; BigCommerce pages only. | Current localized homepage and catch-all route render Makeswift `Page`. | Observed |
| Make header/footer/theme hidden Makeswift components with fixed snapshot IDs. | Pure code header/footer/theme; editable page-level header/footer instances. | Lets global layout be edited visually while the app passes dynamic commerce data. | Observed |
| Register custom content/media components for product education. | Use generic rich text only; rely solely on product data. | Custom components support product cards, YouTube, blog, hotspots, brand logos, and newsletter CTA. | Observed/Inferred |
| Use customer group slot for content targeting, not security enforcement. | Server-only customer group rendering; no customer group content. | Current component fetches group client-side and swaps slots; suitable for personalization. | Observed/Inferred |

