import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';
import {
  appendPersistedSelectionsToPath,
  resolveVariantSkuHrefQueryByProductIds,
} from '~/lib/variant-sku-deep-link';

const GetQuickSearchResultsQuery = graphql(
  `
    query getQuickSearchResults(
      $filters: SearchProductsFiltersInput!
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters) {
            products(first: 5) {
              edges {
                node {
                  categories {
                    edges {
                      node {
                        name
                        path
                      }
                    }
                  }
                  ...ProductCardFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [ProductCardFragment],
);

export const getSearchResults = cache(async (searchTerm: string, locale?: string) => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    const response = await client.fetch({
      document: GetQuickSearchResultsQuery,
      variables: { filters: { searchTerm } },
      customerAccessToken,
      fetchOptions: {
        ...(locale && { headers: { 'Accept-Language': locale } }),
        ...(customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } }),
      },
    });

    const { products } = response.data.site.search.searchProducts;
    const productNodes = removeEdgesAndNodes(products);
    const hrefQueryByProductId = await resolveVariantSkuHrefQueryByProductIds(
      productNodes.map((p) => p.entityId),
      searchTerm.trim(),
      customerAccessToken,
    );

    return {
      status: 'success',
      data: {
        products: productNodes.map((p) => {
          const variantQuery = hrefQueryByProductId.get(p.entityId);

          return {
            ...p,
            path: variantQuery ? appendPersistedSelectionsToPath(p.path, variantQuery) : p.path,
          };
        }),
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
});
