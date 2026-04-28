/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable valid-jsdoc */
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ResultOf } from 'gql.tada';

import { Field } from '@/vibes/soul/sections/product-detail/schema';
import { ProductVariantMatrixFragment } from '~/app/[locale]/(default)/product/[slug]/page-data';

export type VariantOptionRow = Record<string, string>;

type VariantsInMatrix = ResultOf<typeof ProductVariantMatrixFragment>['variants'];

/**
 * For each purchasable variant, maps variant option entityId → value entityId.
 */
export function buildVariantOptionMatrix(
  variants: VariantsInMatrix | null | undefined,
): VariantOptionRow[] {
  if (!variants) {
    return [];
  }

  const uniqueRows = new Set<string>();
  const rows: VariantOptionRow[] = [];

  for (const variant of removeEdgesAndNodes(variants)) {
    if (!variant.isPurchasable) {
      continue;
    }

    const options = removeEdgesAndNodes(variant.productOptions);
    const row: VariantOptionRow = {};

    for (const option of options) {
      if (option.__typename !== 'MultipleChoiceOption' || !option.isVariantOption) {
        continue;
      }

      const valueNodes = removeEdgesAndNodes(option.values).filter(
        (
          value,
        ): value is {
          __typename: 'MultipleChoiceOptionValue';
          entityId: number;
          isDefault: boolean;
        } => value.__typename === 'MultipleChoiceOptionValue',
      );

      if (valueNodes.length === 0) {
        continue;
      }

      const chosen =
        valueNodes.length === 1
          ? valueNodes[0]!
          : (valueNodes.find((n) => n.isDefault) ?? valueNodes[0]!);

      row[option.entityId.toString()] = chosen.entityId.toString();
    }

    if (Object.keys(row).length === 0) {
      continue;
    }

    const serialized = JSON.stringify(row, Object.keys(row).sort());

    if (!uniqueRows.has(serialized)) {
      uniqueRows.add(serialized);
      rows.push(row);
    }
  }

  return rows;
}

function getActiveSelectionsForFilter(
  matrix: VariantOptionRow[],
  allSelections: Record<string, string | null | undefined>,
  targetOptionName: string,
  allValueIds: string[],
): string[] {
  if (matrix.length === 0) {
    return [];
  }

  return allValueIds.filter((valueId) =>
    matrix.some((row) => {
      if (row[targetOptionName] !== valueId) {
        return false;
      }

      for (const k of Object.keys(row)) {
        if (k === targetOptionName) {
          continue;
        }

        const selected = allSelections[k];

        if (selected == null || selected === '') {
          continue;
        }

        if (row[k] !== String(selected)) {
          return false;
        }
      }

      return true;
    }),
  );
}

function pruneInvalidQuerySelections(
  matrix: VariantOptionRow[],
  fieldNames: string[],
  allSelections: Record<string, string | null | undefined>,
): Record<string, null> | null {
  if (matrix.length === 0) {
    return null;
  }

  const allKeys = new Set(matrix.flatMap((m) => Object.keys(m)));
  const patch: Record<string, null> = {};
  const next: Record<string, string | null | undefined> = { ...allSelections };

  const matchesMatrix = (sel: typeof next) => {
    return matrix.some((row) => {
      for (const k of allKeys) {
        const s = sel[k];

        if (s == null || s === '') {
          continue;
        }

        if (row[k] !== String(s)) {
          return false;
        }
      }

      return true;
    });
  };

  if (matchesMatrix(next)) {
    return null;
  }

  for (const name of [...fieldNames].reverse()) {
    if (!allKeys.has(name) || next[name] == null || next[name] === '') {
      continue;
    }

    patch[name] = null;
    next[name] = null;

    if (matchesMatrix(next)) {
      return patch;
    }
  }

  return null;
}

const VARIANT_FIELD_TYPES = new Set([
  'select',
  'radio-group',
  'swatch-radio-group',
  'card-radio-group',
  'button-radio-group',
] as const);

/**
 * Filter variant field options to valid combinations; strip impossible query params.
 */
export function applyVariantMatrixToFields(
  fields: Field[],
  matrix: VariantOptionRow[] | null | undefined,
  querySelections: Record<string, string | null | undefined>,
): { clearQuery: Record<string, null> | null; fields: Field[] } {
  if (!matrix || matrix.length === 0) {
    return { clearQuery: null, fields };
  }

  const matrixKeys = new Set(matrix.flatMap((m) => Object.keys(m)));

  if (matrixKeys.size === 0) {
    return { clearQuery: null, fields };
  }

  const variantFieldNames = fields
    .filter(
      (f) =>
        f.persist === true &&
        matrixKeys.has(f.name) &&
        'options' in f &&
        VARIANT_FIELD_TYPES.has(f.type),
    )
    .map((f) => f.name);

  const clearQuery = pruneInvalidQuerySelections(matrix, variantFieldNames, querySelections);
  const merged: Record<string, string | null | undefined> = { ...querySelections };

  if (clearQuery) {
    for (const k of Object.keys(clearQuery)) {
      merged[k] = null;
    }
  }

  const filtered = fields.map((field) => {
    if (
      field.persist !== true ||
      !matrixKeys.has(field.name) ||
      !('options' in field) ||
      !VARIANT_FIELD_TYPES.has(field.type)
    ) {
      return field;
    }

    const allIds = field.options.map((o) => o.value);
    const allowed = getActiveSelectionsForFilter(matrix, merged, field.name, allIds);
    const allow = new Set(allowed);
    const next = field.options.filter((o) => allow.has(o.value));

    if (next.length === allIds.length) {
      return field;
    }

    return { ...field, options: next } as Field;
  });

  return { clearQuery, fields: filtered };
}
