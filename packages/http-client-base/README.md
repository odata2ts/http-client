[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-base?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-base)

# OData HTTP Client Base

Base implementation for [odata2ts](https://github.com/odata2ts/odata2ts) compatible HTTP clients:

- implements automatic CSRF token handling
  - allows user to set custom CSRF token header key (default: `x-csrf-token`)
- implements standard error message retrieval method for OData error responses
  - works for V2 & V4
  - allows user to set custom retrieval method
  - decodes the error document of a failed binary request, which arrives as a `Blob` or unparsed text
- streamlines all HTTP calls (POST, GET, ...) into one method
- holds the ETags seen by this client, so that `@odata2ts/odata-service` can send `If-Match` on a write to
  a resource under optimistic concurrency control
- implements OData batch requests (`$batch`), as `multipart/mixed` or as JSON batch (`batch()`) - shared by
  every client extending this base class

The parts of this which need no transport — the CSRF token state, the error message retrieval, the header
defaults — live in [`@odata2ts/http-client-common`](../http-client-common) and are shared with
`@odata2ts/http-client-angular`, which cannot extend this base class.

## Installation

Install package `@odata2ts/http-client-base` as dependency:

```bash
npm install --save @odata2ts/http-client-base
```

## Usage

Extend the class `BaseHttpClient` to simplify your HttpClient implementation.
You need to implement two abstract methods:

```ts
import { BaseHttpClient, BaseRequestConfig } from "@odata2ts/http-client-base";

export interface MyRequestConfig {}

export class MyHttpClient extends BaseHttpClient<MyRequestConfig> {
  constructor(clientOptions: BaseHttpClientOptions) {
    super(clientOptions);
  }

  protected async executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig: MyRequestConfig | undefined,
    // always handed over, so no fallback is needed for it
    internalConfig: BaseRequestConfig,
  ): Promise<HttpResponseModel<ResponseModel>> {
    // your implementation
  }
}
```

Compare any of the existing clients.

## Documentation

[HTTP Client Documentation](https://odata2ts.github.io/docs/http-client)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

See folder [test](https://github.com/odata2ts/http-client/tree/main/packages/core/test)
for unit tests.

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/http-client/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
