[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/odata2ts/http-client/coverage.yml?branch=main&style=for-the-badge)](https://github.com/odata2ts/http-client/actions/workflows/coverage.yml)
[![Coveralls](https://img.shields.io/coveralls/github/odata2ts/http-client?style=for-the-badge)](https://coveralls.io/github/odata2ts/http-client?branch=main)

# HTTP Clients for odata2ts

This repository contains all official OData HTTP client implementations available
for [odata2ts](https://github.com/odata2ts/odata2ts).

The main implementations are:

- [fetch](./packages/fetch)
- [Axios](./packages/axios)
- [jQuery](./packages/jquery)

## Documentation

[Http Client Documentation](https://odata2ts.github.io/docs/odata-client/http-client/)

Main documentation for the odata2ts eco system:
[https://odata2ts.github.io](https://odata2ts.github.io/)

## Support, Feedback, Contributing

If you have any sorts of questions use [GitHub Discussions](https://github.com/odata2ts/odata2ts/discussions)
of the main `odata2ts` repository.

This project is open to feature requests, suggestions, bug reports, and the like
via [GitHub issues](https://github.com/odata2ts/odata2ts/issues) of the main `odata2ts` repository.

Contributions and feedback are encouraged and always welcome.

See the [contribution guidelines](https://github.com/odata2ts/http-client/blob/main/CONTRIBUTING.md) for further information.

## Spirit

This project has been created and is maintained in the following spirit:

- adhere to the **OData specification** as much as possible
  - support any OData service implementation which conforms to the spec
  - allow to work around faulty implementations if possible
- stability matters
  - exercise Test Driven Development
  - bomb the place with unit tests (code coverage > 95%)
  - ensure that assumptions & understanding are correct by creating integration tests

## License

MIT - see [License](./LICENSE).
