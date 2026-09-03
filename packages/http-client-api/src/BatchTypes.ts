export type BatchHttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface BatchRequestObject {
  id: string;
  method: BatchHttpMethod;
  /** Relative to the service root - never carries the service base path again. */
  url: string;
  atomicityGroup?: string;
  dependsOn?: Array<string>;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface BatchRequestBody {
  requests: Array<BatchRequestObject>;
}

export interface BatchResponseObject {
  id: string;
  status: number;
  atomicityGroup?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface BatchResponseBody {
  responses: Array<BatchResponseObject>;
  /**
   * How each response was correlated with its request: `"id"` where the server stated it (the `id` field
   * in JSON batch, the `Content-ID` header in multipart), `"request-order"` where it did not and the
   * position in the response had to stand in - see OData JSON Format V4.01 §19.5 on `Content-ID` not
   * being required outside change sets.
   */
  resolvedBy: "id" | "request-order";
}

export type BatchFormat = "multipart" | "json";

export interface BatchClientOptions {
  /** @default "multipart" */
  format?: BatchFormat;
  /** @default false */
  continueOnError?: boolean;
}
