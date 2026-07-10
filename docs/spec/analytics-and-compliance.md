# Analytics and Compliance

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Stack](stack.md) | Analytics, consent, and third-party service technologies. |
| [Backend](backend.md) | Middleware and API routes that support analytics/compliance. |
| [Routing and SEO](routing-seo.md) | Product/category viewed events and robots/sitemap behavior. |
| [Content Management](content-management.md) | Third-party content components like YouTube and Constant Contact. |
| [Product Detail](product-detail.md) | PDP analytics/schema/video behavior. |
| [Customer Commerce](customer-commerce.md) | Account/newsletter/cart-related compliance surfaces. |
| [Open Questions](open-questions.md) | Age, consent, and regulated-product questions. |

## Overview

The app includes BigCommerce analytics, optional Vercel analytics/performance scripts, consent management, third-party script/content integrations, and an age verification primitive. The exact legal/compliance intent is not fully inferable from code and needs owner confirmation, especially because current product/category names suggest a regulated or firearms-adjacent manufacturing context.

## Analytics Surfaces

| Surface | Implementation | Behavior |
|---------|----------------|----------|
| BigCommerce analytics provider | `core/components/analytics/provider.tsx` via root layout | Receives channel ID, cookie-consent setting, store analytics settings. |
| Analytics cookies | `withAnalyticsCookies` middleware | Provides visitor/visit cookies used for data events. |
| Product viewed | `with-routes.ts` and PDP `ProductViewed` | Middleware sends product viewed when route node is product; PDP also renders viewed event component. |
| Category viewed | Category/custom category pages | Renders `CategoryViewed` with category and current product results. |
| Add to cart | Product detail form | Calls analytics event hook `events.onAddToCart?.(formData)`. |
| Vercel Analytics | Root layout | Enabled only on Vercel unless disabled by env. |
| Vercel Speed Insights | Root layout | Enabled only on Vercel unless disabled by env. |

## Consent and Scripts

| Surface | Behavior |
|---------|----------|
| Consent manager | Root layout uses BigCommerce privacy settings and transformed BigCommerce scripts. |
| Cookie notifications | Server toast/cookie notifications can render in root layout. |
| BigCommerce scripts | Store content scripts are transformed and passed through consent manager. |
| Constant Contact | Custom Makeswift component injects Constant Contact signup popup script and sets `window._ctct_m`. |
| YouTube embeds | Product and CMS video components render YouTube/Vimeo iframes or YouTube thumbnails. |
| CSP | `frame-ancestors` allows Makeswift app origin only when Makeswift is enabled; otherwise `none`. Other directives are largely not enforced in code. |

## Age Verification

`AgeVerification` is included globally in the root layout. The code does not show why it is required, what age threshold applies, or whether it should apply globally or to specific categories only.

This is high-priority to confirm because the observed catalog categories may be regulated or firearms-adjacent.

## SEO/Compliance Assets

| Asset | Behavior |
|-------|----------|
| Robots | BigCommerce robots content plus sitemap URL. |
| Sitemap | BigCommerce sitemap index. |
| Favicon | BigCommerce favicon. |
| Product schema | Structured product data on PDP. |
| Metadata | Store/product/category settings from BigCommerce. |

## Third-Party Services

| Service | Purpose | Data/Privacy Considerations |
|---------|---------|-----------------------------|
| BigCommerce | Commerce platform, analytics, customer/cart/catalog data. | Customer/session data and commerce events. |
| Makeswift | Visual CMS/editor and remote snapshots. | Editor runtime and page content. |
| YouTube | Video metadata and embeds. | API calls server-side for metadata; embeds load third-party iframe/player. |
| Constant Contact | Newsletter popup behavior. | Third-party marketing script and newsletter interactions. |
| Vercel | Hosting analytics/speed insights. | Optional analytics/performance telemetry in hosted environment. |
| Adobe Fonts/Typekit | Futura PT stylesheet. | External font stylesheet loaded in document head. |

## Risks and Unknowns

| Risk | Why It Matters |
|------|----------------|
| Consent gating for YouTube and Constant Contact is unclear. | Third-party scripts/iframes may need user consent before loading. |
| Age gate requirement is unclear. | If legally required, UX, copy, persistence, and category scope matter. |
| CSP is permissive/incomplete beyond `frame-ancestors`. | Third-party scripts and embeds may need explicit security policy choices. |
| Product-viewed may be sent from both middleware and PDP component. | Could be intentional session/event tracking, or duplicate analytics risk. |
| Dealer/customer group content is client-fetched. | Fine for personalization/marketing, not sufficient for protecting sensitive dealer-only information. |

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use BigCommerce analytics and data events as primary commerce analytics seam. | Custom analytics-only implementation; Vercel-only analytics. | Current code wraps BigCommerce analytics and sends commerce data events. | Observed |
| Include Vercel Analytics and Speed Insights only in Vercel runtime. | Always include; never include. | Root layout checks `VERCEL === '1'` and disable flags. | Observed |
| Use Constant Contact popup script rather than inline widget. | Inline embedded form; BigCommerce newsletter only. | Component comment and commit history state popup-only behavior. | Observed |
| Keep compliance open questions explicit. | Assume template-provided age/consent behavior is correct. | Business category and third-party integrations make assumptions risky. | Inferred |

