/**
 * Makes the body of an error response readable for an {@link ErrorMessageRetriever}.
 *
 * A request's data type describes the *successful* response - bytes for a media resource, a stream for a
 * large one. A failing request is answered with an OData error document all the same, so reading that
 * document the way the successful payload would have been read buries the server's message in a `Blob`
 * nobody ever looks into: every failure then comes out carrying the client's default message.
 *
 * Hence the body is decoded and parsed here instead. What is neither JSON nor decodable is handed back as
 * it is - a caller may still make sense of it through a custom retriever, and an XML error document is at
 * least readable as text.
 *
 * @param body the raw error response body as the client got hold of it
 * @return the parsed error document, the plain text, or the body untouched
 */
export async function parseErrorResponseBody(body: unknown): Promise<unknown> {
  const text = await asText(body);
  if (text === undefined) {
    return body;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // not JSON - an XML error document for instance
    return trimmed;
  }
}

/**
 * The textual content of the body, or `undefined` if it is not the kind of thing that has one.
 *
 * Strings pass through: axios hands back an unparsed one whenever it was told to expect something other
 * than JSON.
 */
async function asText(body: unknown): Promise<string | undefined> {
  if (typeof body === "string") {
    return body;
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return body.text();
  }
  return undefined;
}
