import { inject } from "vitest";

/** Base URL of the running CAP "Library" V4 service, provided by `globalSetup`. */
export const BASE_URL = inject("libraryBaseUrl");

export const DEFAULT_HEADERS = { Accept: "application/json", "Content-Type": "application/json" };

// Fixed key from the seed data (`db/data/*.csv` in the test-server-cap repo) - "Der Prozess", a book with
// well-known values, used for read-only assertions.
export const BOOK_DER_PROZESS = "11111111-1111-1111-1111-111111111111";
export const UNKNOWN_BOOK_ID = "00000000-0000-0000-0000-000000000000";

export const booksUrl = `${BASE_URL}/Books`;

export function bookUrl(id: string): string {
  return `${booksUrl}(${id})`;
}
