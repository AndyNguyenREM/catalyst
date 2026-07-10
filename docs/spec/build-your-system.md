# Build Your System (Builder Page)

> Status: 🔲 Draft — v1 scope agreed; some business inputs still open (see Open Questions).

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Product Detail](product-detail.md) | Reuses product options, variant matrix, pricing, images, metafields. |
| [Customer Commerce](customer-commerce.md) | Reuses add-to-cart (bulk line items). |
| [Content Management](content-management.md) | Builder may be registered as a Makeswift component. |
| [UI](ui.md) | Must match brand colors/fonts (site theme tokens). |
| [Open Questions](open-questions.md) | Compatibility data + color scope decisions. |

## Overview

A guided, step-by-step "Build Your Ultradyne Shooting System" page where a customer assembles
a multi-product system (e.g. chassis + barrel/muzzle + sights + accessories), sees a live
running price and product images update as they choose, picks a finish (color), and adds the
whole configured system to the cart in one action. Styled to match the existing site.

Replaces/expands the current marketing-only `/buy-shooting-system` showcase page, inspired by
the old site's "UD Chassis Builder" configurable product.

## Goals

| Goal | Why |
|------|-----|
| Let shoppers assemble a complete system in a guided flow | Higher-value orders; matches "Build Your Ultradyne" brand message. |
| Show live price + images as choices are made | Confidence and transparency before purchase. |
| One-click "add entire build to cart" | Reduce friction vs. buying parts one at a time. |
| Match existing site look & feel | Consistency; no jarring custom design. |

## v1 Scope (build now — depends on nothing missing)

A multi-step wizard:

1. **Steps** = product slots (e.g. Step 1 Chassis, Step 2 Barrel/Muzzle, Step 3 Sights, Step 4 Accessories).
   Which products appear in each step is configured by an editor (curated list), not auto-discovered.
2. **Each step** shows the eligible products as selectable cards (image, name, price). Customer picks one
   (some steps optional/skippable).
3. **Options** for a chosen product (including its available **Color/finish**) are selectable, reusing the
   existing option/variant logic. Only options that actually exist are shown.
4. **Color/finish** — see Open Question Q-BUILD-02 (one finish for the whole system vs. per-part).
5. **Live summary** — running total price + thumbnails of chosen parts, updating as they go.
6. **Compatibility guidance** — show each product's existing human-readable "Compatibility" notes as
   reference text (NO automatic filtering yet — see Q-BUILD-01).
7. **Add to cart** — adds all chosen products/variants in a single cart operation, then routes to cart.

## v2 Scope (later — needs business data)

- **Smart compatibility filtering**: once structured "what fits what" data exists, incompatible products
  are automatically hidden/disabled per step based on earlier choices.

## What we reuse (already built by Andy / Catalyst)

| Need | Existing code |
|------|---------------|
| Add multiple items to cart at once | `core/lib/cart/*` — cart mutation accepts a `lineItems[]` array |
| Product options + variant resolution | `core/data-transformers/variant-option-matrix.ts` |
| Product price/images/options data | `core/app/[locale]/(default)/product/[slug]/page-data.ts` |
| Compatibility text | `Compat` metafield (free-form HTML) |
| New Makeswift component pattern | `core/lib/makeswift/components/*` + `components.ts` |
| New page route | `core/app/[locale]/(default)/<route>/page.tsx` |
| Brand colors/fonts | Tailwind theme tokens (`bg-primary`, `font-heading`, etc.) |

## Approach (proposed)

- Build as a **new page route** (e.g. `/build-your-system`) and/or a **registered Makeswift component**
  so marketing can place/configure it. Decision: Q-BUILD-03.
- Editor curates which products belong to each step (using the existing product-picker control).

## Open Questions

| ID | Question | Needed for | Priority |
|----|----------|-----------|----------|
| Q-BUILD-01 | Is there a structured compatibility chart (which parts fit which systems), and where will it live? | v2 smart filtering | High |
| Q-BUILD-02 | Color/finish: one finish applied to the whole system, or chosen per part? | v1 wizard design | High |
| Q-BUILD-03 | Should the builder be a fixed page, a Makeswift-configurable component, or both? | v1 build | Medium |
| Q-BUILD-04 | What product steps/categories make up a "system" (chassis, barrel, muzzle, sights, accessories, tripod…)? | v1 content | High |
| Q-BUILD-05 | Are any steps required vs. optional? Minimum to "build"? | v1 flow | Medium |
| Q-BUILD-06 | Should the build add as separate cart line items, or is there a bundle/kit concept in BigCommerce? | v1 cart behavior | Medium |

## Acceptance (v1)

- Customer can move through steps, pick a product per step, choose its color/finish and options.
- Running price and chosen-part images update live.
- "Add to cart" adds all selections as cart line items in one action.
- Page matches site brand styling and works on mobile and desktop.
