import { describe, expect, it } from 'vitest';

import { getPersistedVariantOptionSelectionsForVariant } from './variant-option-matrix';

describe('getPersistedVariantOptionSelectionsForVariant', () => {
  it('returns null when not purchasable', () => {
    expect(
      getPersistedVariantOptionSelectionsForVariant({
        isPurchasable: false,
        productOptions: { edges: [] },
      }),
    ).toBeNull();
  });

  it('maps MultipleChoiceOptionValue selections', () => {
    const row = getPersistedVariantOptionSelectionsForVariant({
      isPurchasable: true,
      productOptions: {
        edges: [
          {
            node: {
              __typename: 'MultipleChoiceOption',
              entityId: 10,
              isVariantOption: true,
              values: {
                edges: [
                  {
                    node: {
                      __typename: 'MultipleChoiceOptionValue',
                      entityId: 100,
                      isDefault: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    expect(row).toEqual({ '10': '100' });
  });

  it('maps SwatchOptionValue selections', () => {
    const row = getPersistedVariantOptionSelectionsForVariant({
      isPurchasable: true,
      productOptions: {
        edges: [
          {
            node: {
              __typename: 'MultipleChoiceOption',
              entityId: 20,
              isVariantOption: true,
              values: {
                edges: [
                  {
                    node: {
                      __typename: 'SwatchOptionValue',
                      entityId: 200,
                      isDefault: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    expect(row).toEqual({ '20': '200' });
  });

  it('prefers default when multiple values exist', () => {
    const row = getPersistedVariantOptionSelectionsForVariant({
      isPurchasable: true,
      productOptions: {
        edges: [
          {
            node: {
              __typename: 'MultipleChoiceOption',
              entityId: 30,
              isVariantOption: true,
              values: {
                edges: [
                  {
                    node: {
                      __typename: 'MultipleChoiceOptionValue',
                      entityId: 301,
                      isDefault: false,
                    },
                  },
                  {
                    node: {
                      __typename: 'MultipleChoiceOptionValue',
                      entityId: 302,
                      isDefault: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    expect(row).toEqual({ '30': '302' });
  });

  it('skips non-variant options', () => {
    const row = getPersistedVariantOptionSelectionsForVariant({
      isPurchasable: true,
      productOptions: {
        edges: [
          {
            node: {
              __typename: 'MultipleChoiceOption',
              entityId: 40,
              isVariantOption: false,
              values: {
                edges: [
                  {
                    node: {
                      __typename: 'MultipleChoiceOptionValue',
                      entityId: 400,
                      isDefault: true,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    });

    expect(row).toBeNull();
  });
});
