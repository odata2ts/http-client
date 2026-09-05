[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-common?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-common)

# OData HTTP Client Common

Transport-agnostic building blocks shared by all [odata2ts](https://github.com/odata2ts/odata2ts) HTTP clients:

- OData error message retrieval (V2 & V4) and the error message wording every client reports
- CSRF token state: the cached token, the configurable header key, and the rule for when an expired token is
  worth one repetition
- the JSON content negotiation constants, the default headers of a request and their precedence
- In-memory ETag store behind optimistic concurrency control: a bounded `ConcurrencyHandler`, plus the
  `blindConcurrencyWrites` mode which resolves an unknown ETag to `*` rather than failing
- In-memory resource identity store behind cross-route cache invalidation: a bounded `ResourceIdentityHandler`
  remembering which request cache keys were observed to resolve to which canonical resource, so that a write
  reached via one route invalidates the keys of every other route to the same resource
- batch support in form of a JSON format facade: the batch
  call is specified in the JSON format, translated by default to the `multipart/mixed` format on the wire,
  and the response comes back as JSON again; this is the only code in the ecosystem that knows the
  multipart grammar

None of it touches a transport, which is why it can be shared by `@odata2ts/http-client-base` — the base class
behind the fetch, axios and jQuery clients — as well as by `@odata2ts/http-client-angular`, which implements the
client contract on Angular's own `HttpClient` instead.

## Installation

Install package `@odata2ts/http-client-common` as dependency:

```bash
npm install --save @odata2ts/http-client-common
```

## Documentation

[HTTP Client Documentation](https://odata2ts.github.io/docs/http-client/overview)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/http-client/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further
information.

## License

MIT - see [License](./LICENSE).
