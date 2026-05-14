import { describe, expect, it } from 'vitest';

import {
  appendPersistedSelectionsToPath,
  isLikelySkuSearchTerm,
} from './variant-sku-deep-link-utils';

describe('isLikelySkuSearchTerm', () => {
  it('rejects empty and short strings', () => {
    expect(isLikelySkuSearchTerm('')).toBe(false);
    expect(isLikelySkuSearchTerm('  ')).toBe(false);
    expect(isLikelySkuSearchTerm('ab')).toBe(false);
    expect(isLikelySkuSearchTerm('  abc  ')).toBe(true);
  });

  it('rejects phrases with spaces', () => {
    expect(isLikelySkuSearchTerm('red shirt')).toBe(false);
    expect(isLikelySkuSearchTerm('SKU 1')).toBe(false);
  });

  it('accepts trimmed SKU-like tokens', () => {
    expect(isLikelySkuSearchTerm('  SKU-1  ')).toBe(true);
  });

  it('accepts typical SKU-like tokens', () => {
    expect(isLikelySkuSearchTerm('ABC-123')).toBe(true);
    expect(isLikelySkuSearchTerm('SKU_01')).toBe(true);
    expect(isLikelySkuSearchTerm('a/b/c')).toBe(true);
    expect(isLikelySkuSearchTerm('9START')).toBe(true);
  });

  it('rejects tokens that do not start with alphanumeric', () => {
    expect(isLikelySkuSearchTerm('-BAD')).toBe(false);
    expect(isLikelySkuSearchTerm('_BAD')).toBe(false);
  });
});

describe('appendPersistedSelectionsToPath', () => {
  it('appends with ? when path has no query', () => {
    expect(appendPersistedSelectionsToPath('/widget', '101=202')).toBe('/widget?101=202');
  });

  it('appends with & when path already has a query', () => {
    expect(appendPersistedSelectionsToPath('/widget?x=1', '101=202')).toBe('/widget?x=1&101=202');
  });

  it('returns path unchanged for empty query string', () => {
    expect(appendPersistedSelectionsToPath('/widget', '')).toBe('/widget');
  });
});
