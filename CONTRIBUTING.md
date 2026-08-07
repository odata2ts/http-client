# Contribution Guidelines

We welcome any contribution to `odata2ts`:

- bug reports
- feature requests
- pull requests
- suggestions
- usage questions
- ...

We're using [Github Issues](https://github.com/odata2ts/http-client/issues) and
[Pull Requests](https://github.com/odata2ts/http-client/pulls) as main line of communication.

## Having Questions

We expect that you've read the [odata2ts documentation](https://odata2ts.github.io/docs/intro).
A lot of work went into it and it should be your prime source to get the information you need.

However, as soon as the documentation does not live up to this standard
(you don't find the documentation or don't get the answer you actually need, etc.),
then by all means **open an issue** on Github. Please feel encouraged to do so, because it indicates
a shortcoming of the documentation.

Also, if your OData service doesn't behave according to the specification, please create an issue as well.
The world's not perfect and `odata2ts` should cope with that
(see [issue odata2ts #144](https://github.com/odata2ts/odata2ts/issues/144) for an example).

## Creating Issues

Currently, there's no template in place for creating issues.
Use the closed issues as examples, they were all relevant and pretty well written.

So, you have read the relevant documentation parts and skimmed through the existing issues,
then [go for it](https://github.com/odata2ts/http-client/issues/new).

## Code Contributions

### Prerequisites

- Node.js
- Yarn

### Setup

Clone the repo.

```shell
yarn install
yarn build
```

### Running Unit Tests

To run the **unit tests** of all modules:

```shell
yarn test
```

Each module should come with its own set of unit tests in folder `test`.
To execute only unit tests of a specific module, change to the module in question and call `yarn test` from there.

### Running Integration Tests

Integration tests run all HTTP clients (fetch, axios, jquery, angular) against a real OData V4 server -
the [test-server-cap](https://github.com/odata2ts/test-server-cap) "Library" model, started as a Docker
container via [testcontainers](https://node.testcontainers.org/). They live in `int-test/`, analogous to
`odata2ts`'s own `int-test` workspace group.

By calling `yarn int-test` from the root folder, they are executed. Requires a running Docker daemon;
alternatively, point at an already-running server with `LIBRARY_BASE_URL=<url> yarn int-test`.

### Commits & Pull Requests

We love [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) and use them to drive
our semantic versioning. Try to adhere to these conventions. We uses the following `types`:

- `fix`: Bug fixes, fixing typos, etc.
- `feat`: New features
- `chore`: minor dependency updates, boy scout stuff, small maintenance tasks
- `doc`: Documentation changes
- `refactor`: Refactoring code
- `build`: changes to the build process

Try to scope the commit message when it belongs to only one package, e.g. `fix(http-client-fetch): ...`.
Use the package name as scope without the `@odata2ts/` prefix.

Breaking changes are announced via an exclamation mark after the scope, e.g. `feat(http-client-api)!: ...` or
`feat!: ...` without scope. Also add an own paragraph in the body starting with "BREAKING CHANGE:".

We will probably squash your commits before merging them into the `main` branch.
So also adhere to conventional commits within the title of your pull request.

## Release

We use [release-please](https://github.com/googleapis/release-please) which has the following workflow:

- create PR's against `main`
- after merging into `main`, release-please will create an own PR which will execute the release, when merged
  Realised via Release-Please.
