/**
 * A `BatchRequestBody` states something the multipart format cannot express - a forward `dependsOn`, one
 * crossing an atomicity-group boundary, a non-contiguous group. Thrown by `serializeBatchRequest` rather
 * than silently altering what the batch means; the way out is `format: "json"`.
 */
export class BatchTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BatchTranslationError";
  }
}

/**
 * A batch response could not be correlated with the request that produced it - a missing/duplicate
 * boundary, a malformed status line, more or fewer parts than expected.
 */
export class BatchCorrelationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BatchCorrelationError";
  }
}
