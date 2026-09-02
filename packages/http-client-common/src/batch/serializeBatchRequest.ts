import { BatchFormat, BatchRequestBody } from "@odata2ts/http-client-api";
import { JSON_MIME_TYPE } from "../RequestHeaders";

export interface SerializeBatchRequestOptions {
  format: BatchFormat;
  /** Injectable purely so tests can pin it; production omits it and gets a random one. */
  boundary?: string;
}

export interface SerializedBatchRequest {
  contentType: string;
  accept: string;
  payload: string;
}

export function serializeBatchRequest(
  body: BatchRequestBody,
  options: SerializeBatchRequestOptions,
): SerializedBatchRequest {
  if (options.format === "json") {
    return { contentType: JSON_MIME_TYPE, accept: JSON_MIME_TYPE, payload: JSON.stringify(body) };
  }

  throw new Error(`serializeBatchRequest: format "${options.format}" is not yet implemented.`);
}
