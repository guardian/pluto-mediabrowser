/**
 * converts a raw query string to a Map
 * @param qs querystring
 */
function BreakDownQueryString(qs: string): Map<string, string> {
  return qs
    .replace(/^\?/, "")
    .split("&")
    .map((param) => param.split("="))
    .reduce((acc, elem) => acc.set(elem[0], elem[1]), new Map());
}

export { BreakDownQueryString };
