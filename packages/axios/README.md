[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-axios?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-axios)

# Axios OData HTTP Client

The **Axios OData Client** serves as HTTP client for [odata2ts](https://github.com/odata2ts/odata2ts)
and uses - as its name suggests - [axios](https://github.com/axios/axios) for realizing the HTTP communication.

It's V2 as well as V4 compatible and represents the reference implementation
of the [odata-client-api](https://www.npmjs.com/package/@odata2ts/odata-client-api).

It supports:

- request configuration
- automatic CSRF token handling

## Installation

Install package `@odata2ts/http-client-axios` as runtime dependency:

```bash
npm install --save @odata2ts/http-client-axios
```

Axios is a peer-dependency of this package, so it's not contained in or installed through this package
and must be installed separately.

## Documentation

[Axios HTTP Client Documentation](https://odata2ts.github.io/docs/odata-client/http-client/axios)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

Admittedly, there are no unit tests as of now.

However, the Axios OData Client is used by most integration tests.
See [examples](#examples) and watch out for the `int-test` folder:
[Trippin example](https://github.com/odata2ts/odata2ts/blob/main/examples/trippin/int-test/TrippinIntegration.test.ts).

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/http-client/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
