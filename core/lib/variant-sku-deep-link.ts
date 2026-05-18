import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import {
  getPersistedVariantOptionSelectionsForVariant,
  type VariantOptionRow,
} from '~/data-transformers/variant-option-matrix';

import {
  appendPersistedSelectionsToPath,
  isLikelySkuSearchTerm,
  skuLookupKeys,
  skusMatch,
} from './variant-sku-deep-link-utils';

export { appendPersistedSelectionsToPath, isLikelySkuSearchTerm };

const BatchVariantSkuByProductIdsQuery = graphql(`
  query BatchVariantSkuByProductIds($entityIds: [Int!]!, $first: Int!, $skus: [String!]!) {
    site {
      products(entityIds: $entityIds, first: $first) {
        edges {
          node {
            entityId
            variants(skus: $skus) {
              edges {
                node {
                  sku
                  isPurchasable
                  productOptions(first: 30) {
                    edges {
                      node {
                        __typename
                        ... on MultipleChoiceOption {
                          entityId
                          isVariantOption
                          values(first: 50) {
                            edges {
                              node {
                                __typename
                                ... on MultipleChoiceOptionValue {
                                  entityId
                                  isDefault
                                }
                                ... on SwatchOptionValue {
                                  entityId
                                  isDefault
                                }
                                ... on ProductPickListOptionValue {
                                  entityId
                                  isDefault
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

function selectionsToQueryString(selections: VariantOptionRow): string {
  const params = new URLSearchParams();

  Object.entries(selections).forEach(([k, v]) => {
    params.set(k, v);
  });

  return params.toString();
}

const VARIANT_SKU_LOOKUP_CHUNK = 50;

async function fetchVariantSkuHrefQueryChunk(
  entityIds: number[],
  sku: string,
  customerAccessToken?: string,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();

  if (entityIds.length === 0) {
    return map;
  }

  const trimmed = sku.trim();
  const skus = skuLookupKeys(trimmed);

  if (skus.length === 0) {
    return map;
  }

  const { data } = await client.fetch({
    document: BatchVariantSkuByProductIdsQuery,
    variables: { entityIds, first: entityIds.length, skus },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const products = removeEdgesAndNodes(data.site.products);

  products.forEach((product) => {
    const variant = removeEdgesAndNodes(product.variants).find((candidate) =>
      skusMatch(candidate.sku, trimmed),
    );

    if (!variant) {
      return;
    }

    const row = getPersistedVariantOptionSelectionsForVariant(variant);

    if (!row) {
      return;
    }

    map.set(product.entityId, selectionsToQueryString(row));
  });

  return map;
}

export async function resolveVariantSkuHrefQueryStringForProduct(
  productEntityId: number,
  sku: string,
  customerAccessToken?: string,
): Promise<string | null> {
  if (!isLikelySkuSearchTerm(sku)) {
    return null;
  }

  const map = await fetchVariantSkuHrefQueryChunk(
    [productEntityId],
    sku.trim(),
    customerAccessToken,
  );

  return map.get(productEntityId) ?? null;
}

export async function resolveVariantSkuHrefQueryByProductIds(
  productEntityIds: number[],
  sku: string,
  customerAccessToken?: string,
): Promise<Map<number, string>> {
  const map = new Map<number, string>();

  if (!isLikelySkuSearchTerm(sku) || productEntityIds.length === 0) {
    return map;
  }

  const trimmed = sku.trim();
  const uniqueIds = [...new Set(productEntityIds)];
  const chunkCount = Math.ceil(uniqueIds.length / VARIANT_SKU_LOOKUP_CHUNK) || 0;
  const chunks = Array.from({ length: chunkCount }, (_, i) =>
    uniqueIds.slice(i * VARIANT_SKU_LOOKUP_CHUNK, (i + 1) * VARIANT_SKU_LOOKUP_CHUNK),
  );

  const chunkMaps = await Promise.all(
    chunks.map((chunk) => fetchVariantSkuHrefQueryChunk(chunk, trimmed, customerAccessToken)),
  );

  chunkMaps.forEach((chunkMap) => {
    chunkMap.forEach((value, key) => {
      map.set(key, value);
    });
  });

  return map;
}
