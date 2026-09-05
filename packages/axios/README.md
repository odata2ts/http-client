[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-axios?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-axios)

# Axios HTTP Client

The **Axios HTTP Client** uses - as its name suggests - [axios](https://github.com/axios/axios) for realizing
the HTTP communication for [odata2ts](https://github.com/odata2ts/odata2ts).

It supports:

- request configuration
- automatic CSRF token handling
- uploading binary data (`createBlob` / `updateBlob`)
- batch support in form of a JSON format facade
  - you specify the batch call in the JSON format
  - the client translates it by default to the `multipart/mixed` format for you
  - on the way back you get JSON as result again

It does **not** support:

- **streaming** in either direction (`getStream`, `createStream` / `updateStream`): axios' XHR adapter
  cannot stream at all, and its http adapter neither accepts a `ReadableStream` as request body nor
  yields one as response. The call is refused with an error.
- **binary responses in node.js** (`getBlob`, and a write answering with the stored content):
  without `XMLHttpRequest` axios falls back to its http adapter, which decodes the response as text.
  Refused with an error instead of handing back a string that only claims to be a `Blob`.

Use the [Fetch Client](https://www.npmjs.com/package/@odata2ts/http-client-fetch) if you need either.

### Resource identity

The client options carry the resource identity store. It remembers which request cache keys were observed to
resolve to which canonical resource, so that a write reached via one route invalidates the keys of every other
route to the same resource:

```ts
new AxiosClient(undefined, {
  // or bring your own store: to bound it differently, to keep its mappings across a page reload, or to
  // seed it with entries another instance dehydrated (e.g. server-side)
  // resourceIdentityHandler: myHandler,
});
```

Optional: without it the client keeps a bounded in-memory store.

## Installation

Install package `@odata2ts/http-client-axios` as runtime dependency:

```bash
npm install --save @odata2ts/http-client-axios
```

## Documentation

[Axios HTTP Client Documentation](https://odata2ts.github.io/docs/odata-client/http-client/axios)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

See folder [test](https://github.com/odata2ts/http-client/tree/main/packages/axios/test)
for unit tests.

See folder [int-test](https://github.com/odata2ts/http-client/tree/main/packages/axios/int-test) for
integration tests.

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/http-client/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
