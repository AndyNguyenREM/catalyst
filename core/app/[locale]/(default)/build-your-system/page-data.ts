import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { ProductVariantMatrixFragment } from '~/app/[locale]/(default)/product/[slug]/page-data';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { buildVariantOptionMatrix } from '~/data-transformers/variant-option-matrix';

/**
 * Data layer for the "Build Your System" configurator.
 *
 * Each slot maps to one of Ultradyne's product categories, auto-detected by
 * name from the live catalog (so we don't hard-code category paths/IDs).
 * We fetch each category's products with price, image, SKU, stock status, and
 * multiple-choice options (incl. Color/Finish).
 *
 * NOTE: real compatibility rules (which parts fit which chassis) do not exist
 * as structured data yet — see docs/spec/build-your-system.md (Q-BUILD-01).
 */

// ---------- Public types (also imported by the client component + action) ----------

export interface BuilderOptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
  hexColors: string[];
}

export interface BuilderOption {
  entityId: number;
  displayName: string;
  isRequired: boolean;
  isColor: boolean;
  values: BuilderOptionValue[];
}

export interface BuilderProduct {
  entityId: number;
  name: string;
  path: string;
  sku: string;
  inStock: boolean;
  image: string | null;
  price: number | null;
  currency: string;
  categoryIds: number[];
  options: BuilderOption[];
}

export interface BuilderStep {
  id: string;
  title: string;
  optional: boolean;
  products: BuilderProduct[];
}

/** A single chosen product + its option selections, sent to the add-to-cart action. */
export interface BuildSelectionItem {
  productEntityId: number;
  multipleChoices: Array<{ optionEntityId: number; optionValueEntityId: number }>;
}

// ---------- Config ----------

/**
 * Configurator slots, in order. Each is matched against a catalog category by
 * name. Chassis is the required base; everything else is optional.
 */
const STEP_CONFIG: Array<{
  id: string;
  title: string;
  optional: boolean;
  match: (name: string) => boolean;
  // When true, this slot shows the ACCESSORY products of its matched category
  // (instead of the main parts). Used for per-component accessory slots.
  accessoriesOf?: boolean;
  // Optional name filter applied to the slot's products (e.g. only "grip"s).
  nameFilter?: RegExp;
  // Optional name filter that EXCLUDES matching products (e.g. everything but grips).
  excludeNameFilter?: RegExp;
}> = [
  { id: 'chassis', title: 'Chassis', optional: false, match: (n) => /chassis/.test(n) && !/stock/.test(n) },
  { id: 'buttstock', title: 'Butt Stocks', optional: true, match: (n) => /stock/.test(n) },
  {
    id: 'buttstock-accessories',
    title: 'Butt Stock Accessories',
    optional: true,
    match: (n) => /stock/.test(n),
    accessoriesOf: true,
  },
  { id: 'shooting', title: 'Shooting Systems', optional: true, match: (n) => /shooting/.test(n) },
  // Grips live inside "Chassis Accessories"; pull them out by name into their own slot.
  {
    id: 'grips',
    title: 'Grips',
    optional: true,
    match: (n) => n === 'chassis accessories',
    accessoriesOf: true,
    nameFilter: /grip/i,
  },
  {
    id: 'chassis-accessories',
    title: 'Chassis Accessories',
    optional: true,
    match: (n) => n === 'chassis accessories',
    accessoriesOf: true,
    excludeNameFilter: /grip/i,
  },
];

const COLOR_OPTION_RE = /colou?r|finish/i;
const PRODUCTS_PER_STEP = 50;

// ---------- Queries ----------

const CategoryTreeQuery = graphql(`
  query BuilderCategoryTreeQuery {
    site {
      categoryTree {
        entityId
        name
        path
        children {
          entityId
          name
          path
          children {
            entityId
            name
            path
          }
        }
      }
    }
  }
`);

const CategoryProductsQuery = graphql(
  `
  query BuilderCategoryProductsQuery($entityId: Int!, $first: Int!) {
    site {
      category(entityId: $entityId) {
        entityId
        name
        products(first: $first) {
          edges {
            node {
              entityId
              name
              path
              sku
              inventory {
                isInStock
              }
              categories(first: 10) {
                edges {
                  node {
                    entityId
                  }
                }
              }
              defaultImage {
                altText
                url: urlTemplate(lossy: true)
              }
              prices {
                price {
                  value
                  currencyCode
                }
              }
              productOptions(first: 20) {
                edges {
                  node {
                    __typename
                    entityId
                    displayName
                    isRequired
                    ... on MultipleChoiceOption {
                      displayStyle
                      isVariantOption
                      values(first: 50) {
                        edges {
                          node {
                            __typename
                            entityId
                            label
                            isDefault
                            ... on SwatchOptionValue {
                              hexColors
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
              ...ProductVariantMatrixFragment
            }
          }
        }
      }
    }
  }
`,
  [ProductVariantMatrixFragment],
);

// ---------- Fetchers ----------

interface FlatCategory {
  entityId: number;
  name: string;
  path: string;
}

const getCategoryTree = cache(async (): Promise<FlatCategory[]> => {
  const response = await client.fetch({
    document: CategoryTreeQuery,
    fetchOptions: { next: { revalidate } },
  });

  const flat: FlatCategory[] = [];

  for (const top of response.data.site.categoryTree) {
    flat.push({ entityId: top.entityId, name: top.name, path: top.path });

    for (const child of top.children) {
      flat.push({ entityId: child.entityId, name: child.name, path: child.path });

      for (const grandchild of child.children) {
        flat.push({ entityId: grandchild.entityId, name: grandchild.name, path: grandchild.path });
      }
    }
  }

  return flat;
});

function resolveImage(url: string | null | undefined): string | null {
  if (!url) return null;

  // BigCommerce returns a template URL containing "{:size}".
  return url.replace('{:size}', '500x500');
}

async function fetchCategoryProducts(entityId: number): Promise<BuilderProduct[]> {
  const response = await client.fetch({
    document: CategoryProductsQuery,
    variables: { entityId, first: PRODUCTS_PER_STEP },
    fetchOptions: { next: { revalidate } },
  });

  const category = response.data.site.category;

  if (!category) return [];

  return removeEdgesAndNodes(category.products).map((node) => {
    // Purchasable variant combinations. We use this to drop variant option values
    // that are not purchasable (e.g. an "unchecked" variant in BigCommerce).
    const matrix = buildVariantOptionMatrix(node.variants);
    const purchasableValuesByOption = new Map<string, Set<string>>();

    for (const row of matrix) {
      for (const [optionId, valueId] of Object.entries(row)) {
        const set = purchasableValuesByOption.get(optionId) ?? new Set<string>();

        set.add(valueId);
        purchasableValuesByOption.set(optionId, set);
      }
    }

    const options: BuilderOption[] = removeEdgesAndNodes(node.productOptions)
      .map((option) => {
        if (option.__typename !== 'MultipleChoiceOption') return null;

        let values: BuilderOptionValue[] = removeEdgesAndNodes(option.values).map((value) => ({
          entityId: value.entityId,
          label: value.label,
          isDefault: value.isDefault,
          hexColors: 'hexColors' in value && Array.isArray(value.hexColors) ? value.hexColors : [],
        }));

        // For variant options, keep only values that appear in a purchasable variant.
        const purchasable = purchasableValuesByOption.get(String(option.entityId));

        if (option.isVariantOption && purchasable) {
          values = values.filter((value) => purchasable.has(String(value.entityId)));
        }

        return {
          entityId: option.entityId,
          displayName: option.displayName,
          isRequired: option.isRequired,
          isColor: COLOR_OPTION_RE.test(option.displayName),
          values,
        };
      })
      .filter((option): option is BuilderOption => option !== null);

    return {
      entityId: node.entityId,
      name: node.name,
      path: node.path,
      sku: node.sku ?? '',
      inStock: node.inventory?.isInStock ?? true,
      image: resolveImage(node.defaultImage?.url),
      price: node.prices?.price?.value ?? null,
      currency: node.prices?.price?.currencyCode ?? 'USD',
      categoryIds: removeEdgesAndNodes(node.categories).map((category) => category.entityId),
      options,
    };
  });
}

export const getBuilderData = cache(async (): Promise<BuilderStep[]> => {
  const categories = await getCategoryTree();

  // Every category whose name marks an add-on bucket (e.g. "Accessories",
  // "Chassis Accessories", "Muzzle Device Accessories"). Products in any of
  // these are add-ons and should not appear in the main component slots.
  const accessoryCategoryIds = new Set(
    categories
      .filter((category) => /accessor/i.test(category.name))
      .map((category) => category.entityId),
  );

  // Resolve which catalog category backs each slot.
  const resolved = STEP_CONFIG.map((config) => {
    const matches = categories.filter((item) => config.match(item.name.toLowerCase()));

    // For chassis, multiple categories can match (a broad "Chassis Systems"
    // parent vs. a specific "Chassis" category). Prefer the most specific =
    // shortest-named match.
    const category =
      config.id === 'chassis'
        ? [...matches].sort((a, b) => a.name.length - b.name.length)[0]
        : matches[0];

    return { config, categoryId: category?.entityId ?? null };
  });

  const isAccessory = (product: BuilderProduct) =>
    product.categoryIds.some((id) => accessoryCategoryIds.has(id));

  return Promise.all(
    resolved.map(async ({ config, categoryId }) => {
      let products = categoryId == null ? [] : await fetchCategoryProducts(categoryId);

      if (config.accessoriesOf) {
        // Per-component accessory slot: show only the add-ons in this category.
        products = products.filter(isAccessory);
      } else if (config.id !== 'accessories') {
        // Main component slot: show only the main parts (drop the add-ons).
        products = products.filter((product) => !isAccessory(product));
      }

      const { nameFilter, excludeNameFilter } = config;

      if (nameFilter) {
        products = products.filter((product) => nameFilter.test(product.name));
      }

      if (excludeNameFilter) {
        products = products.filter((product) => !excludeNameFilter.test(product.name));
      }

      return {
        id: config.id,
        title: config.title,
        optional: config.optional,
        products,
      };
    }),
  );
});
