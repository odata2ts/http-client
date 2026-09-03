import { BatchCorrelationError } from "./BatchErrors";
import { CRLF, parseHeaderBlock } from "./HttpMessage";

export interface MimePart {
  headers: Record<string, string>;
  body: string;
}

/**
 * A MIME part has no HTTP start line - unlike `parseHttpMessage`, its headers begin at line 0.
 */
function parseMimePart(raw: string): MimePart {
  const lines = raw.split(CRLF);
  const { headers, bodyStartIndex } = parseHeaderBlock(lines, 0);

  return { headers, body: lines.slice(bodyStartIndex).join(CRLF) };
}

/**
 * A random-enough boundary, prefixed so a nested change-set boundary is visually distinct from the outer
 * one. Not cryptographic - it only has to be unlikely to occur inside the payload, which the format's own
 * request/response bodies (JSON, plain OData URLs) never do in practice.
 */
export function generateBoundary(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function extractBoundary(contentType: string | undefined): string {
  const match = contentType?.match(/boundary=("?)([^;"\s]+)\1/i);
  if (!match) {
    throw new BatchCorrelationError(`Missing multipart boundary in Content-Type: "${contentType ?? ""}"`);
  }
  return match[2];
}

/**
 * Splits a `multipart/mixed` body into its parts. Stops at the closing `--boundary--` delimiter; a
 * trailing epilogue after it (never emitted by any server this workspace has captured) is ignored.
 */
export function splitMultipart(raw: string, boundary: string): Array<MimePart> {
  const marker = `--${boundary}`;
  const withoutPreamble = raw.startsWith(marker) ? raw.slice(marker.length) : raw;
  const rawParts = withoutPreamble.split(`${CRLF}${marker}`);
  const parts: Array<MimePart> = [];

  for (const rawPart of rawParts) {
    if (rawPart.startsWith("--")) {
      break;
    }
    const withoutLeadingCrlf = rawPart.startsWith(CRLF) ? rawPart.slice(CRLF.length) : rawPart;
    parts.push(parseMimePart(withoutLeadingCrlf));
  }

  return parts;
}

export function buildMultipartBody(parts: ReadonlyArray<MimePart>, boundary: string): string {
  const rendered = parts.map((part) => {
    const headerLines = Object.entries(part.headers).map(([key, value]) => `${key}: ${value}`);
    return [`--${boundary}`, ...headerLines, "", part.body].join(CRLF);
  });
  return [...rendered, `--${boundary}--`].join(CRLF) + CRLF;
}
