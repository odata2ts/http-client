# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.6.1...@odata2ts/http-client-api@0.6.2) (2024-08-22)

**Note:** Version bump only for package @odata2ts/http-client-api

## [0.6.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.6.0...@odata2ts/http-client-api@0.6.1) (2024-08-14)

### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))

# [0.6.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.5.1...@odata2ts/http-client-api@0.6.0) (2024-08-13)

### Code Refactoring

* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))

### Features

* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))

### BREAKING CHANGES

* switch to ESM tends to break stuff

## [0.5.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.5.0...@odata2ts/http-client-api@0.5.1) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-api

# [0.5.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.4.0...@odata2ts/http-client-api@0.5.0) (2023-09-13)

### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))

### BREAKING CHANGES

* additional headers are now part of the config parameter

* fix: don't lose configuration when CSRF token is active

* add new option which prevents FetchClient from evaluating response body (not needed for fetching csrf tokens & makes trouble with SAP's mockServer)

* fix: add headers for content-type and accept for main methods

# [0.4.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.3.0...@odata2ts/http-client-api@0.4.0) (2023-08-03)

### Code Refactoring

* **api:** remove merge & retrieveBigNumbersAsString methods ([a99f89e](https://github.com/odata2ts/http-client/commit/a99f89ee7782733ba75543b3abd03a3060e5e7dc))

### Features

* **api:** additional headers for all operations ([#9](https://github.com/odata2ts/http-client/issues/9)) ([6379511](https://github.com/odata2ts/http-client/commit/637951126118aeb020d68ce16e48ea80e98987e1))

### BREAKING CHANGES

* **api:** removed remove merge & retrieveBigNumbersAsString methods; use the additionalHeaders option on the appropriate operations

# [0.3.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.2.0...@odata2ts/http-client-api@0.3.0) (2023-07-26)

### Features

* big numbers as string ([#7](https://github.com/odata2ts/http-client/issues/7)) ([5119923](https://github.com/odata2ts/http-client/commit/5119923a79c2e61ca7762d5cba01fbac8e9ae759))

# 0.2.0 (2023-06-10)

### Features

* **http-client-api:** conventionalize client errors ([65ee7b8](https://github.com/odata2ts/http-client/commit/65ee7b811379881332839236692889b0414bd008))

# 0.1.0 (2023-06-03)

### Features

* force new minor for new http-client-api ([5628666](https://github.com/odata2ts/odata2ts/commit/56286668abf6fe5f3c0639f07a4a9f99cc549068))
