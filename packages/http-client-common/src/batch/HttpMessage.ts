import { BatchCorrelationError } from "./BatchErrors";

export const CRLF = "\r\n";

export interface ParsedHttpMessage {
  startLine: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Parses a run of "key: value" header lines starting at `startIndex`, stopping at the first blank line.
 * Shared by `parseHttpMessage` (headers start after a start line) and `MimeMultipart`'s part parser
 * (a MIME part has no start line - its headers begin at line 0).
 */
export function parseHeaderBlock(
  lines: ReadonlyArray<string>,
  startIndex: number,
): { headers: Record<string, string>; bodyStartIndex: number } {
  const headers: Record<string, string> = {};

  let i = startIndex;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") {
      i++;
      break;
    }
    const colon = line.indexOf(":");
    const key = (colon === -1 ? line : line.slice(0, colon)).trim().toLowerCase();
    const value = colon === -1 ? "" : line.slice(colon + 1).trim();
    headers[key] = value;
  }

  return { headers, bodyStartIndex: i };
}

/**
 * Parses a single HTTP request or response message - start line, headers, body - as it appears inside a
 * multipart part's body. Headers end at the first blank line; everything after it is the body verbatim,
 * so a body containing "\r\n\r\n" of its own is not mistaken for another header/body boundary.
 */
export function parseHttpMessage(raw: string): ParsedHttpMessage {
  const lines = raw.split(CRLF);
  const startLine = lines[0];
  const { headers, bodyStartIndex } = parseHeaderBlock(lines, 1);

  return { startLine, headers, body: lines.slice(bodyStartIndex).join(CRLF) };
}

export function parseStatusLine(startLine: string): { status: number; statusText: string } {
  const match = startLine.match(/^HTTP\/1\.1 (\d{3})(?: (.*))?$/);
  if (!match) {
    throw new BatchCorrelationError(`Not a valid HTTP status line: "${startLine}"`);
  }
  return { status: Number(match[1]), statusText: match[2] ?? "" };
}

export interface ParsedHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export function parseHttpResponseMessage(raw: string): ParsedHttpResponse {
  const { startLine, headers, body } = parseHttpMessage(raw);
  const { status, statusText } = parseStatusLine(startLine);
  return { status, statusText, headers, body };
}

/**
 * Writes an HTTP request message. `method` is upper-cased on the wire regardless of the lower-case
 * `BatchHttpMethod` it came from - the request-line grammar requires it, matching the CAP capture
 * ("GET Books?$top=1 HTTP/1.1").
 */
export function buildHttpRequestMessage(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: string,
): string {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
  return [`${method.toUpperCase()} ${url} HTTP/1.1`, ...headerLines, "", body ?? ""].join(CRLF);
}
