[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-angular?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-angular)

# Angular HTTP Client

[odata2ts](https://github.com/odata2ts/odata2ts) compatible odata client based on Angular's
[`HttpClient`](https://angular.dev/guide/http) (`@angular/common/http`).

`AngularODataClient` is an injectable service (`providedIn: "root"`) that wraps the `HttpClient` instance
provided through Angular's dependency injection - it does not create its own `HttpClient` or configure the
`HttpClientModule`/`provideHttpClient` setup, which remains the consuming application's responsibility. It
works the same either way regardless of which backend that setup chooses - `provideHttpClient()`
(`XhrBackend`) or `provideHttpClient(withFetch())` (`FetchBackend`).

It supports:

- request configuration (custom headers, query params)
- uploading and downloading binary data (`createBlob` / `updateBlob` / `getBlob`)
- customizing how the OData error message is extracted from a failed response's body
  (`setErrorMessageRetriever`)
- automatic CSRF token handling for the OData handshake (`useCsrfProtection` / `csrfTokenFetchUrl`,
  see below) - this is a **different** mechanism than Angular's own built-in XSRF protection
  (`withXsrfConfiguration`), which only echoes back a cookie the server already set and knows nothing about
  the `X-CSRF-Token: Fetch` / `Required` handshake OData services use

It does **not** support:

- **streaming** in either direction (`getStream`, `createStream` / `updateStream`): `HttpClient` always
  buffers the response body via this client's `observe: "response"` requests, regardless of the configured
  backend. Those calls are refused with an error at runtime - use the
  [Fetch Client](https://www.npmjs.com/package/@odata2ts/http-client-fetch) for streams.

### CSRF token handling

Because `AngularODataClient` is constructed by Angular's own DI container (`providedIn: "root"`), its options
cannot be passed as a plain constructor argument the way the other odata2ts HTTP clients accept them - there
is no `new AngularODataClient(options)` call for Angular to intercept. Provide the `ANGULAR_ODATA_CLIENT_OPTIONS`
injection token instead:

```ts
import { ANGULAR_ODATA_CLIENT_OPTIONS } from "@odata2ts/http-client-angular";

providers: [
  {
    provide: ANGULAR_ODATA_CLIENT_OPTIONS,
    useValue: { useCsrfProtection: true, csrfTokenFetchUrl: "/odata/my-service/" },
  },
];
```

With this in place, `AngularODataClient` fetches a token via a `GET` to `csrfTokenFetchUrl` (header
`x-csrf-token: Fetch`, configurable through `setCsrfTokenKey`) before the first mutating request
(`POST`/`PUT`/`PATCH`/`DELETE`), caches it, and re-fetches it once if the server answers `403` with the
same header set to `Required`.

## Installation

Install package `@odata2ts/http-client-angular` as runtime dependency:

```bash
npm install --save @odata2ts/http-client-angular
```

`@angular/core`, `@angular/common` and `rxjs` are peer dependencies of this package, so they are not
contained in or installed through this package.

## Documentation

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

See folder [test](https://github.com/odata2ts/http-client/tree/main/packages/angular/test)
for unit tests.

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/odata2ts/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/odata2ts/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
