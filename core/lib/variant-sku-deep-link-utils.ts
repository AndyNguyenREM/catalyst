/**
 * Heuristic: avoid N+1 SKU lookups for obvious phrase searches.
 *
 * @param {string} term raw search string
 * @returns {boolean} whether the term looks like a catalog SKU / code
 */
export function isLikelySkuSearchTerm(term: string): boolean {
  const t = term.trim();

  if (t.length < 3 || /\s/.test(t)) {
    return false;
  }

  return /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/.test(t);
}

/**
 * Case-insensitive SKU equality (trimmed).
 *
 * @param {string} a first SKU
 * @param {string} b second SKU
 * @returns {boolean} whether both refer to the same SKU
 */
export function skusMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * SKU strings to pass to `variants(skus: …)` so lookup tolerates casing differences.
 *
 * @param {string} sku raw SKU from search
 * @returns {string[]} distinct lookup keys (original, upper, lower)
 */
export function skuLookupKeys(sku: string): string[] {
  const trimmed = sku.trim();

  if (!trimmed) {
    return [];
  }

  return [...new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()])];
}

/**
 * Appends persisted PDP option query pairs to a product path.
 *
 * @param {string} path storefront product path (may already include `?…`)
 * @param {string} queryString serialized query string (e.g. `123=456&789=012`, no leading `?`)
 * @returns {string} path with query merged
 */
export function appendPersistedSelectionsToPath(path: string, queryString: string): string {
  if (!queryString) {
    return path;
  }

  const sep = path.includes('?') ? '&' : '?';

  return `${path}${sep}${queryString}`;
}

/** Quick-search product row used to pick an Enter-key destination. */
export interface SkuQuickSearchProduct {
  href: string;
}

/**
 * PDP href to open on Enter when quick search has already resolved a variant SKU.
 *
 * @param {string} query search box value
 * @param {SkuQuickSearchProduct[]} products quick-search product rows
 * @returns {string | null} product href, or null to fall back to the search results page
 */
export function pickSkuDeepLinkHrefFromQuickSearchResults(
  query: string,
  products: readonly SkuQuickSearchProduct[] | null | undefined,
): string | null {
  if (!isLikelySkuSearchTerm(query) || products == null || products.length === 0) {
    return null;
  }

  const withSelections = products.filter((product) => {
    const i = product.href.indexOf('?');

    return i !== -1 && product.href.length > i + 1;
  });

  const [onlyWithSelections] = withSelections;

  if (withSelections.length === 1 && onlyWithSelections) {
    return onlyWithSelections.href;
  }

  const [onlyProduct] = products;

  if (products.length === 1 && onlyProduct) {
    return onlyProduct.href;
  }

  return null;
}
