[![npm (scoped)](https://img.shields.io/npm/v/@odata2ts/http-client-jquery?style=for-the-badge)](https://www.npmjs.com/package/@odata2ts/http-client-jquery)

# JQuery HTTP Client

[odata2ts](https://github.com/odata2ts/odata2ts) compatible odata client based on [JQuery](https://jquery.com/)
and its [ajax method](https://api.jquery.com/Jquery.ajax/).

JQuery is used by this client but not installed (declared as peer dependency).
The existing JQuery instance must be provided when initializing the client.

The whole client is meant to support usage of `odata2ts` in UI5 apps, which use Jquery for HTTP communication.

## Installation

Install package `@odata2ts/http-client-jquery` as runtime dependency:

```bash
npm install --save @odata2ts/http-client-jquery
```

JQuery is a peer-dependency of this package, so it's not contained in or installed through this package.

## Documentation

[JQuery Client Documentation](https://odata2ts.github.io/docs/odata-client/http-client/jquery)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Tests

See folder [test](https://github.com/odata2ts/http-client/tree/main/packages/jquery/test)
for unit tests.

## Support, Feedback, Contributing

This project is open to feature requests, suggestions, bug reports, usage questions etc.
via [GitHub issues](https://github.com/odata2ts/odata2ts/issues).

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/odata2ts/blob/main/CONTRIBUTING.md) for further information.

## License

MIT - see [License](./LICENSE).
