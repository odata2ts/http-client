[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-fetch?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-fetch)

# Fetch HTTP Client

Fetch based HTTP client for [odata2ts](https://github.com/odata2ts/odata2ts).
This client uses - as its name suggests - [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
for realizing the HTTP communication.

It supports:

- request configuration
- automatic CSRF token handling
- binary data in both directions: as `Blob` (`getBlob` / `createBlob` / `updateBlob`) and as stream
  (`getStream` / `createStream` / `updateStream`), the latter being the only client able to do so
- batch support in form of a JSON format facade
  - you specify the batch call in the JSON format
  - the client translates it by default to the `multipart/mixed` format for you
  - on the way back you get JSON as result again

Works also for Node.js v18+, but is still marked as **experimental**.

### Resource identity

The client options carry the resource identity store. It remembers which request cache keys were observed to
resolve to which canonical resource, so that a write reached via one route invalidates the keys of every other
route to the same resource:

```ts
new FetchClient(undefined, {
  // or bring your own store: to bound it differently, to keep its mappings across a page reload, or to
  // seed it with entries another instance dehydrated (e.g. server-side)
  // resourceIdentityHandler: myHandler,
});
```

Optional: without it the client keeps a bounded in-memory store.

## Installation

Install package `@odata2ts/http-client-fetch` as runtime dependency:

```bash
npm install --save @odata2ts/http-client-fetch
```

## Documentation

[Fetch Client Documentation](https://odata2ts.github.io/docs/odata-client/http-client/fetch)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

See folder [test](https://github.com/odata2ts/http-client/tree/main/packages/fetch/test)
for unit tests.

See folder [int-test](https://github.com/odata2ts/http-client/tree/main/packages/fetch/int-test) for
integration tests.

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/http-client/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
