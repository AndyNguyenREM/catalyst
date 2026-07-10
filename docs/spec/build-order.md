# Build Order

## Related Specs

| Spec | Relevance |
|------|-----------|
| [Open Questions](open-questions.md) | Questions to resolve before specs become implementation-ready. |
| [Source Map](source-map.md) | Code evidence for this reverse spec. |
| [Product Context](product-context.md) | Business validation order. |
| [Product Discovery](product-discovery.md) | Category/PLP validation. |
| [Product Detail](product-detail.md) | PDP validation. |
| [Customer Commerce](customer-commerce.md) | DTC/dealer validation. |
| [Content Management](content-management.md) | Makeswift/editor validation. |

## Purpose

This project already exists, so this is not an implementation build order. It is a validation and future-spec order: the sequence for turning reverse-engineered drafts into approved living specs and, later, implementation-ready requirements.

## Step 1: Product Intent Validation

What: Confirm business identity, primary audiences, product category language, DTC/dealer meaning, and compliance posture.

Why first: These decisions affect every downstream spec, especially dealer behavior, age/consent requirements, product-language choices, and whether inferred product-education goals are correct.

Spec: [Product Context](product-context.md), [Open Questions](open-questions.md#business-and-audience), [Analytics and Compliance](analytics-and-compliance.md).

Status: Draft.

## Step 2: Catalog and Navigation Validation

What: Confirm all-products category intent, header link ownership, footer category sourcing, custom category list, and product compare visibility.

Why next: Catalog entry points determine how DTC and dealer shoppers find products and whether current category customizations represent final merchandising rules.

Spec: [Catalog Navigation](catalog-navigation.md), [Product Discovery](product-discovery.md), [Routing and SEO](routing-seo.md).

Status: Draft.

## Step 3: Product Detail Data Contract Validation

What: Confirm metafield namespace/key rules, Product Specifications and Compatibility content format, product video source expectations, related-products CTA behavior, and variant filtering edge cases.

Why next: PDP is the most app-specific commerce surface and carries purchase-confidence/product-fit intent.

Spec: [Product Detail](product-detail.md), [Backend](backend.md), [Open Questions](open-questions.md#product-detail).

Status: Draft.

## Step 4: Dealer/Customer Segmentation Validation

What: Define what dealer sales require in the storefront: content targeting only, customer-group pricing, restricted catalog, quote/order workflow, tax/payment rules, or separate navigation.

Why next: Current code has a personalization seam but not a complete dealer requirements model.

Spec: [Customer Commerce](customer-commerce.md), [Content Management](content-management.md), [Open Questions](open-questions.md#dealer-and-customer-segmentation).

Status: Draft.

## Step 5: CMS and Editor Workflow Validation

What: Confirm which Makeswift custom components are actively used, expected page ownership, publish/revalidation needs, newsletter ownership, and editor-safe defaults.

Why next: Makeswift stores remote page content not visible in repo, so owner/editor workflow confirmation is needed to complete specs.

Spec: [Content Management](content-management.md), [UI](ui.md), [Analytics and Compliance](analytics-and-compliance.md).

Status: Draft.

## Step 6: Implementation Readiness Review

What: Mark approved sections complete, leave unresolved questions linked, and identify any future code changes from the validated specs.

Why last: Per the spec strategy, implementation should only start after relevant spec sections are approved, dependencies are clear, UX is defined, and no blocking questions remain.

Spec: All specs, especially [Open Questions](open-questions.md).

Status: Pending user review.

## Decisions

| Decision | Alternatives Considered | Why This Choice | Confidence |
|----------|------------------------|-----------------|------------|
| Use validation order instead of build order for the existing app. | Pretend the app is greenfield; omit planning doc. | The user asked to reverse-spec an existing repo, not start a new build. | User-confirmed/Inferred |
| Validate product/dealer/compliance intent before UI/code refinements. | Start with code architecture or component details. | Business intent is least recoverable from code and highest impact. | Inferred |
| Keep all docs in Draft until owner approval. | Mark observed code as Complete. | Spec strategy requires user approval before sections are complete. | Observed |

