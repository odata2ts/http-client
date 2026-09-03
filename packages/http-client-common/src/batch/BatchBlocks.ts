import { BatchRequestObject } from "@odata2ts/http-client-api";
import { BatchTranslationError } from "./BatchErrors";

export interface BatchBlock {
  group?: string;
  requests: Array<BatchRequestObject>;
}

/**
 * Groups requests into contiguous runs by `atomicityGroup` - a request with no group becomes a block of
 * one, since a top-level request stands alone. Used both to decide what a multipart serialization turns
 * into a change set, and, on parsing, to know which response part belongs to which requests.
 */
export function groupIntoBlocks(requests: ReadonlyArray<BatchRequestObject>): Array<BatchBlock> {
  const blocks: Array<BatchBlock> = [];
  for (const request of requests) {
    const last = blocks[blocks.length - 1];
    if (last && request.atomicityGroup !== undefined && last.group === request.atomicityGroup) {
      last.requests.push(request);
    } else {
      blocks.push({ group: request.atomicityGroup, requests: [request] });
    }
  }
  return blocks;
}

/**
 * A group id reappearing in a later, separate block means something else was interleaved between its
 * members - multipart represents a change set as one contiguous block, so this cannot be expressed.
 */
export function validateContiguousGroups(blocks: ReadonlyArray<BatchBlock>): void {
  const seen = new Set<string>();
  for (const block of blocks) {
    if (block.group === undefined) {
      continue;
    }
    if (seen.has(block.group)) {
      throw new BatchTranslationError(`Atomicity group "${block.group}" is not contiguous.`);
    }
    seen.add(block.group);
  }
}
