export interface ODataClientError {
  readonly name: string;
  readonly status?: number;
  readonly headers?: Record<string, string>;
  readonly cause?: Error;
}
