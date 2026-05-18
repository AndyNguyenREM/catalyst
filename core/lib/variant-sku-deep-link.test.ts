import { describe, expect, it } from 'vitest';

import {
  appendPersistedSelectionsToPath,
  isLikelySkuSearchTerm,
  pickSkuDeepLinkHrefFromQuickSearchResults,
  skuLookupKeys,
  skusMatch,
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

describe('skusMatch', () => {
  it('matches SKUs regardless of case', () => {
    expect(skusMatch('ABC-123', 'abc-123')).toBe(true);
    expect(skusMatch('  sku_01  ', 'SKU_01')).toBe(true);
  });

  it('rejects different SKUs', () => {
    expect(skusMatch('ABC-123', 'ABC-124')).toBe(false);
  });
});

describe('skuLookupKeys', () => {
  it('includes original, upper, and lower forms', () => {
    expect(skuLookupKeys('AbC-1')).toEqual(['AbC-1', 'ABC-1', 'abc-1']);
  });
});

describe('pickSkuDeepLinkHrefFromQuickSearchResults', () => {
  it('returns null for non-SKU queries', () => {
    expect(pickSkuDeepLinkHrefFromQuickSearchResults('red shirt', [{ href: '/a?1=2' }])).toBeNull();
  });

  it('returns the only product with variant option params', () => {
    expect(
      pickSkuDeepLinkHrefFromQuickSearchResults('SKU-1', [
        { href: '/parent' },
        { href: '/parent?101=202' },
      ]),
    ).toBe('/parent?101=202');
  });

  it('returns null when multiple products lack a unique variant link', () => {
    expect(
      pickSkuDeepLinkHrefFromQuickSearchResults('SKU-1', [{ href: '/a' }, { href: '/b' }]),
    ).toBeNull();
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
