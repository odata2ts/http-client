import { BatchFormat, BatchRequestBody, BatchResponseBody, BatchResponseObject } from "@odata2ts/http-client-api";
import { BatchBlock, groupIntoBlocks } from "./BatchBlocks";
import { BatchCorrelationError } from "./BatchErrors";
import { ParsedHttpResponse, parseHttpResponseMessage } from "./HttpMessage";
import { extractBoundary, MimePart, splitMultipart } from "./MimeMultipart";

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

  if (typeof raw !== "string") {
    throw new BatchCorrelationError("A multipart batch response must be handed over as raw text.");
  }
  return parseMultipartBatchResponse(raw, request, options.contentType);
}

function parseMultipartBatchResponse(
  raw: string,
  request: BatchRequestBody,
  contentType: string | undefined,
): BatchResponseBody {
  const boundary = extractBoundary(contentType);
  const topLevelParts = splitMultipart(raw, boundary);
  const blocks = groupIntoBlocks(request.requests);

  const responses: Array<BatchResponseObject> = [];
  let everyPartLabelledAndMatching = true;

  topLevelParts.forEach((part, index) => {
    const block = blocks[index];
    if (!block) {
      throw new BatchCorrelationError("The batch response contains more parts than the batch request had.");
    }

    if (!wellLabelled(part, block)) {
      everyPartLabelledAndMatching = false;
    }

    if (block.group === undefined) {
      responses.push(toResponseObject(block.requests[0].id, parseHttpResponseMessage(part.body)));
      return;
    }

    if (/^multipart\/mixed/i.test(part.headers["content-type"] ?? "")) {
      responses.push(...expandCommittedChangeSet(part, block));
    } else {
      responses.push(...expandFailedChangeSet(part, block));
    }
  });

  return { responses, resolvedBy: everyPartLabelledAndMatching ? "id" : "request-order" };
}

function wellLabelled(part: MimePart, block: BatchBlock): boolean {
  const contentId = part.headers["content-id"];
  if (block.group === undefined) {
    return contentId === block.requests[0].id;
  }
  // a change-set part's own Content-ID (if any) names the failed member, not the whole block - checked
  // per member in expandCommittedChangeSet/expandFailedChangeSet instead.
  return true;
}

function expandCommittedChangeSet(part: MimePart, block: BatchBlock): Array<BatchResponseObject> {
  const nestedBoundary = extractBoundary(part.headers["content-type"]);
  const nestedParts = splitMultipart(part.body, nestedBoundary);
  if (nestedParts.length !== block.requests.length) {
    throw new BatchCorrelationError(
      `Change set "${block.group}" answered with ${nestedParts.length} parts for ${block.requests.length} requests.`,
    );
  }

  return block.requests.map((memberRequest, i) =>
    toResponseObject(memberRequest.id, parseHttpResponseMessage(nestedParts[i].body), block.group),
  );
}

function expandFailedChangeSet(part: MimePart, block: BatchBlock): Array<BatchResponseObject> {
  const inner = parseHttpResponseMessage(part.body);
  const namedId = part.headers["content-id"];

  return block.requests.map((memberRequest) =>
    namedId && memberRequest.id === namedId
      ? toResponseObject(memberRequest.id, inner, block.group)
      : { id: memberRequest.id, status: 424, atomicityGroup: block.group, headers: {}, body: undefined },
  );
}

function toResponseObject(id: string, inner: ParsedHttpResponse, atomicityGroup?: string): BatchResponseObject {
  return {
    id,
    status: inner.status,
    ...(atomicityGroup ? { atomicityGroup } : {}),
    headers: inner.headers,
    body: inner.body ? tryParseJson(inner.body) : undefined,
  };
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
