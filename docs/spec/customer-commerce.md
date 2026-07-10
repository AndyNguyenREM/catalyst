# Customer Commerce

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Context](product-context.md) | DTC and dealer audience framing. |
| [Stack](stack.md) | BigCommerce, auth, forms, customer group API. |
| [Backend](backend.md) | API routes and server actions for customer/commerce. |
| [Content Management](content-management.md) | Customer group targeted content. |
| [Product Detail](product-detail.md) | Add-to-cart, wishlist, reviews, inventory. |
| [Catalog Navigation](catalog-navigation.md) | Account/cart/gift certificate navigation. |
| [Analytics and Compliance](analytics-and-compliance.md) | Consent, newsletter, account/customer data. |
| [Open Questions](open-questions.md) | Dealer-specific unresolved requirements. |

## Overview

The storefront supports standard DTC ecommerce flows through Catalyst/BigCommerce: browse, product detail, cart, checkout, account, wishlist, reviews, gift certificates, and newsletter preferences. Dealer-oriented behavior is visible mainly through BigCommerce customer groups and a Makeswift customer-group slot, but dealer-specific commerce rules are not yet specified.

## Direct-to-Consumer Flow

| Step | Current Behavior |
|------|------------------|
| Browse | Category/search/brand/shop-all PLPs with facets, sorting, and pagination. |
| Product detail | Options, price, inventory/backorder, wishlist, add-to-cart, specs, videos, related products, reviews. |
| Cart | Cart page with quantity updates, remove item, coupon code, gift certificate, shipping estimate/info, checkout preconnect. |
| Checkout | Checkout route redirects into BigCommerce checkout flow. |
| Account | Login/register/logout, forgot password, change password, orders, order details, addresses, account settings. |
| Wishlist | Account wishlist list/detail plus public wishlist share route and PDP wishlist button. |
| Gift certificates | Gift certificate browse/purchase/balance flows, enabled by BigCommerce settings. |

Most of these flows appear Catalyst-provided and should be documented at behavior level unless modified for this application.

## Dealer/Customer Group Support

| Capability | Current Behavior | Confidence |
|------------|------------------|------------|
| Current group lookup | `/api/customer/group` returns current customer group ID from BigCommerce customer query. | Observed |
| All group lookup | `/api/customer/groups` fetches BigCommerce REST v2 customer groups when `BIGCOMMERCE_ACCESS_TOKEN` is configured. | Observed |
| Editor targeting | Makeswift `Customer Group Slot` lets editors define content for selected groups and a no-group fallback. | Observed |
| Builder simulation | In Makeswift builder, editors can simulate a customer group. | Observed |
| Security boundary | Slot content is selected client-side after fetching group; this is appropriate for personalization, not secure content protection. | Inferred |
| Dealer commerce rules | Pricing, visibility, minimums, purchasing limits, tax rules, and checkout differences are not defined in repo. | User-confirmed dealer channel/Inferred |

## Customer Account

| Surface | Behavior |
|---------|----------|
| Auth routes | Login, register, token login, forgot password, change password, logout. |
| Account layout | Authenticated account pages under `/account`. |
| Orders | Order list and order detail pages. |
| Addresses | Address create/update/delete actions. |
| Settings | Customer profile, password change, newsletter subscription preference. |
| Wishlists | Wishlist list/detail, actions for new/rename/delete/change visibility/remove item/add to cart. |

## Cart and Checkout

| Surface | Behavior |
|---------|----------|
| Cart page | Shows cart items, checkout summary, shipping, coupons, gift certificates, proceed to checkout. |
| Quantity | Server actions update/remove line items. |
| Coupons | Apply, update, remove coupon code actions. |
| Gift certificates | Apply/update/remove gift certificate actions. |
| Shipping | Add/update shipping info and add shipping cost. |
| Checkout | Dedicated route leads to hosted checkout. |
| Empty cart CTA | Uses all-products category path fallback in related code paths. |

## Newsletter

There are two newsletter-related surfaces:

| Surface | Behavior |
|---------|----------|
| BigCommerce account settings | Account settings can subscribe/unsubscribe the customer to BigCommerce newsletter if store settings enable it. |
| Constant Contact Makeswift component | Loads Constant Contact popup script and renders a button linking to a newsletter page. |

The relationship between BigCommerce newsletter and Constant Contact list management is not confirmed.

## Gift Certificates

Gift certificate links and pages remain enabled/visible based on BigCommerce store settings and active currency. Header/footer conditionally show gift certificate navigation. Purchase and balance pages exist under `/gift-certificates`.

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use BigCommerce/Catalyst for core DTC cart, checkout, account, wishlist, and gift certificate flows. | Build custom commerce backend; disable account flows. | Current app retains Catalyst commerce pages/actions. | Observed |
| Use customer groups as the current dealer personalization seam. | Separate dealer portal; no dealer-specific code. | User confirmed dealer sales and code includes customer-group targeted Makeswift slot. | User-confirmed/Observed/Inferred |
| Treat customer-group slot as personalization unless proven otherwise. | Treat slot as secure dealer-only enforcement. | Client-side content switching should not be the only protection for sensitive pricing/content. | Inferred |
| Keep newsletter integration split pending confirmation. | Assume Constant Contact replaces BigCommerce newsletter; assume both are equivalent. | Code supports both surfaces but does not define business relationship. | Observed/Inferred |

