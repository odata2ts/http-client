import { BatchFormat, BatchRequestBody, BatchRequestObject } from "@odata2ts/http-client-api";
import { JSON_MIME_TYPE } from "../RequestHeaders";
import { BatchBlock, groupIntoBlocks, validateContiguousGroups } from "./BatchBlocks";
import { BatchTranslationError } from "./BatchErrors";
import { buildHttpRequestMessage } from "./HttpMessage";
import { buildMultipartBody, generateBoundary, MimePart } from "./MimeMultipart";

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

  return serializeMultipartBatch(body, options.boundary);
}

function serializeMultipartBatch(body: BatchRequestBody, boundary = generateBoundary("batch")): SerializedBatchRequest {
  const blocks = groupIntoBlocks(body.requests);
  validateContiguousGroups(blocks);
  validateDependsOn(body.requests);

  const parts: Array<MimePart> = blocks.map((block) => {
    if (block.group === undefined) {
      return buildRequestPart(block.requests[0]);
    }
    const changeSetBoundary = generateBoundary("changeset");
    return {
      headers: { "Content-Type": `multipart/mixed; boundary=${changeSetBoundary}` },
      body: buildMultipartBody(block.requests.map(buildRequestPart), changeSetBoundary),
    };
  });

  return {
    contentType: `multipart/mixed; boundary=${boundary}`,
    accept: "multipart/mixed",
    payload: buildMultipartBody(parts, boundary),
  };
}

function buildRequestPart(request: BatchRequestObject): MimePart {
  const bodyText = request.body === undefined ? undefined : JSON.stringify(request.body);
  const httpHeaders = { ...(request.headers ?? {}) };
  if (bodyText !== undefined && !Object.keys(httpHeaders).some((key) => key.toLowerCase() === "content-type")) {
    httpHeaders["Content-Type"] = JSON_MIME_TYPE;
  }

  return {
    headers: {
      "Content-Type": "application/http",
      "Content-Transfer-Encoding": "binary",
      "Content-ID": request.id,
    },
    body: buildHttpRequestMessage(request.method, request.url, httpHeaders, bodyText),
  };
}

/**
 * Enforces the three throwing translation rules (spec "Three translation rules"): a forward reference, a
 * dependency crossing an atomicity-group boundary, and one joining two members of the same group - order
 * within a change set guarantees nothing (§11.7.2), so none of these can be expressed positionally.
 */
function validateDependsOn(requests: ReadonlyArray<BatchRequestObject>): void {
  const index = new Map(requests.map((request, position) => [request.id, { position, group: request.atomicityGroup }]));

  requests.forEach((request, position) => {
    for (const dependencyId of request.dependsOn ?? []) {
      const dependency = index.get(dependencyId);
      if (!dependency) {
        throw new BatchTranslationError(`Request "${request.id}" depends on unknown request "${dependencyId}".`);
      }

      const sameGroup = dependency.group !== undefined && dependency.group === request.atomicityGroup;
      if (sameGroup) {
        throw new BatchTranslationError(
          `Request "${request.id}" depends on "${dependencyId}", a member of the same atomicity group ` +
            `"${request.atomicityGroup}" - multipart change sets may execute members in any order (§11.7.2), ` +
            `so this dependency cannot be expressed.`,
        );
      }

      if (dependency.group !== request.atomicityGroup) {
        throw new BatchTranslationError(
          `Request "${request.id}" depends on "${dependencyId}" across an atomicity-group boundary - ` +
            `multipart cannot express this; use format: "json".`,
        );
      }

      if (dependency.position >= position) {
        throw new BatchTranslationError(
          `Request "${request.id}" depends on "${dependencyId}", which does not precede it - multipart ` +
            `cannot express a forward dependency; use format: "json".`,
        );
      }
    }
  });
}
