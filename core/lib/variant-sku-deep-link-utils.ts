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
