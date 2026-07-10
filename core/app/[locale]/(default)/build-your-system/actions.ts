'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';

import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';

import type { BuildSelectionItem } from './page-data';

interface AddBuildResult {
  ok: boolean;
  error?: string;
}

/**
 * Adds an entire configured build to the cart in a single operation.
 * The BigCommerce cart mutation accepts multiple line items at once, so each
 * chosen product becomes one line item with its selected options.
 */
export async function addBuildToCart(items: BuildSelectionItem[]): Promise<AddBuildResult> {
  if (items.length === 0) {
    return { ok: false, error: 'Please choose at least one product before adding to cart.' };
  }

  try {
    await addToOrCreateCart({
      lineItems: items.map((item) => ({
        productEntityId: item.productEntityId,
        quantity: 1,
        selectedOptions:
          item.multipleChoices.length > 0 ? { multipleChoices: item.multipleChoices } : {},
      })),
    });

    return { ok: true };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return { ok: false, error: error.errors.map(({ message }) => message).join(' ') };
    }

    if (error instanceof MissingCartError) {
      return { ok: false, error: 'Could not create a cart. Please try again.' };
    }

    if (error instanceof Error) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: 'Something went wrong adding your build to the cart.' };
  }
}
