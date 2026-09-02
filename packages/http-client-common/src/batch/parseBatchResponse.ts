import { BatchFormat, BatchRequestBody, BatchResponseBody } from "@odata2ts/http-client-api";

export interface ParseBatchResponseOptions {
  format: BatchFormat;
  contentType?: string;
}

export function parseBatchResponse(
  raw: string | Pick<BatchResponseBody, "responses">,
  request: BatchRequestBody,
  options: ParseBatchResponseOptions,
): BatchResponseBody {
  if (options.format === "json") {
    const parsed: Pick<BatchResponseBody, "responses"> = typeof raw === "string" ? JSON.parse(raw) : raw;
    return { responses: parsed.responses, resolvedBy: "id" };
  }

  throw new Error(`parseBatchResponse: format "${options.format}" is not yet implemented.`);
}
