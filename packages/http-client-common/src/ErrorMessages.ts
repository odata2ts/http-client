/**
 * What a client reports when neither the response nor the failure itself yielded a message.
 */
export const DEFAULT_ERROR_MESSAGE = "No error message!";

/**
 * The server answered, and its error document is what the message is built from.
 */
export const FAILURE_RESPONSE_MESSAGE = "OData server responded with error: ";

/**
 * The request was sent, but no response ever arrived - a network failure, a timeout, CORS.
 */
export const FAILURE_NO_RESPONSE = "No response from server! Failure: ";

/**
 * Prefixes the cause with what the client was doing at the time.
 *
 * The cause may be a plain string or an `Error`, since it comes straight from whatever the transport
 * threw; anything else - and an `Error` without a message - falls back to {@link DEFAULT_ERROR_MESSAGE},
 * so the prefix is never left dangling.
 */
export function buildErrorMessage(prefix: string, error: any): string {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}
