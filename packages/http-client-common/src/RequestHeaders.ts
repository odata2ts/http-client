import { ODataHttpMethods } from "@odata2ts/http-client-api";

export const JSON_MIME_TYPE = "application/json";
export const PLAIN_TEXT_MIME_TYPE = "text/plain";
export const CONTENT_TYPE_HEADER = "content-type";

/**
 * The methods which never carry a request body, so declaring a content type for them says nothing.
 */
export const BODYLESS_METHODS: ReadonlyArray<ODataHttpMethods> = [ODataHttpMethods.Get, ODataHttpMethods.Delete];

/**
 * The JSON defaults of a request: `Accept` always, `Content-Type` only where a body travels.
 */
export function getJsonHeaders(withContentType: boolean): Record<string, string> {
  return withContentType ? { Accept: JSON_MIME_TYPE, "Content-Type": JSON_MIME_TYPE } : { Accept: JSON_MIME_TYPE };
}

/**
 * The JSON defaults for a given method - see {@link getJsonHeaders} and {@link BODYLESS_METHODS}.
 */
export function getDefaultJsonHeaders(method: ODataHttpMethods): Record<string, string> {
  return getJsonHeaders(!BODYLESS_METHODS.includes(method));
}

/**
 * Whether the headers declare the request body as plain text, in which case it must be passed to the
 * server as it is: serializing it as JSON would wrap it into double quotes.
 *
 * The header name is matched case-insensitively, since callers are free to choose their own spelling.
 * Of multiple matches the last one wins, mirroring how the headers were merged in the first place.
 */
export function isPlainTextBody(headers?: Record<string, string>): boolean {
  const contentType = Object.entries(headers ?? {})
    .filter(([key]) => key.toLowerCase() === CONTENT_TYPE_HEADER)
    .pop()?.[1];

  return !!contentType?.toLowerCase().startsWith(PLAIN_TEXT_MIME_TYPE);
}

/**
 * Merges header layers with increasing precedence, i.e. the last one wins. The order every odata2ts
 * client uses is: the JSON defaults as the fallback, then `additionalHeaders` passed alongside the
 * request, then the headers of the request's own configuration.
 */
export function mergeHeaders(...layers: Array<Record<string, string> | undefined>): Record<string, string> {
  return layers.reduce<Record<string, string>>((merged, layer) => ({ ...merged, ...(layer ?? {}) }), {});
}
