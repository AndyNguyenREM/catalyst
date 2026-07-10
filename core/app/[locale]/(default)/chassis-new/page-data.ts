import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

/**
 * Data for the new Chassis landing page: the real Chassis products (accessories
 * excluded), resolved from the catalog by category name — same approach as the
 * Build Your System configurator.
 */

export interface ChassisProduct {
  entityId: number;
  name: string;
  path: string;
  image: string | null;
  price: number | null;
  currency: string;
}

const CategoryTreeQuery = graphql(`
  query ChassisPageCategoryTree {
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

const CategoryProductsQuery = graphql(`
  query ChassisPageProducts($entityId: Int!, $first: Int!) {
    site {
      category(entityId: $entityId) {
        products(first: $first) {
          edges {
            node {
              entityId
              name
              path
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
            }
          }
        }
      }
    }
  }
`);

interface FlatCategory {
  entityId: number;
  name: string;
}

const getCategoryTree = cache(async (): Promise<FlatCategory[]> => {
  const response = await client.fetch({
    document: CategoryTreeQuery,
    fetchOptions: { next: { revalidate } },
  });

  const flat: FlatCategory[] = [];

  for (const top of response.data.site.categoryTree) {
    flat.push({ entityId: top.entityId, name: top.name });

    for (const child of top.children) {
      flat.push({ entityId: child.entityId, name: child.name });

      for (const grandchild of child.children) {
        flat.push({ entityId: grandchild.entityId, name: grandchild.name });
      }
    }
  }

  return flat;
});

function resolveImage(url: string | null | undefined): string | null {
  if (!url) return null;

  return url.replace('{:size}', '500x500');
}

function mapProduct(node: {
  entityId: number;
  name: string;
  path: string;
  defaultImage?: { url: string } | null;
  prices?: { price?: { value: number; currencyCode: string } | null } | null;
}): ChassisProduct {
  return {
    entityId: node.entityId,
    name: node.name,
    path: node.path,
    image: resolveImage(node.defaultImage?.url),
    price: node.prices?.price?.value ?? null,
    currency: node.prices?.price?.currencyCode ?? 'USD',
  };
}

export const getChassisAccessories = cache(async (): Promise<ChassisProduct[]> => {
  const categories = await getCategoryTree();

  // The "Chassis Accessories" category (not "Chassis System Accessories").
  const accessoryCategory = categories.find((c) => /chassis accessor/i.test(c.name));

  if (!accessoryCategory) return [];

  const response = await client.fetch({
    document: CategoryProductsQuery,
    variables: { entityId: accessoryCategory.entityId, first: 50 },
    fetchOptions: { next: { revalidate } },
  });

  const category = response.data.site.category;

  if (!category) return [];

  return removeEdgesAndNodes(category.products).map(mapProduct);
});

export const getChassisProducts = cache(async (): Promise<ChassisProduct[]> => {
  const categories = await getCategoryTree();

  // The specific "Chassis" category = shortest-named match (not the broad
  // "Chassis Systems" parent, not the "Chassis Accessories" sub-cat).
  const chassisCategory = categories
    .filter((c) => /chassis/i.test(c.name) && !/stock/i.test(c.name))
    .sort((a, b) => a.name.length - b.name.length)[0];

  if (!chassisCategory) return [];

  const accessoryCategoryIds = new Set(
    categories.filter((c) => /accessor/i.test(c.name)).map((c) => c.entityId),
  );

  const response = await client.fetch({
    document: CategoryProductsQuery,
    variables: { entityId: chassisCategory.entityId, first: 50 },
    fetchOptions: { next: { revalidate } },
  });

  const category = response.data.site.category;

  if (!category) return [];

  return removeEdgesAndNodes(category.products)
    .filter((node) => {
      const ids = removeEdgesAndNodes(node.categories).map((c) => c.entityId);

      return !ids.some((id) => accessoryCategoryIds.has(id));
    })
    .map((node) => ({
      entityId: node.entityId,
      name: node.name,
      path: node.path,
      image: resolveImage(node.defaultImage?.url),
      price: node.prices?.price?.value ?? null,
      currency: node.prices?.price?.currencyCode ?? 'USD',
    }));
});
