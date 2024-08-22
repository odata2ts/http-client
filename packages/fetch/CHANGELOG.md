# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.7.1...@odata2ts/http-client-fetch@0.7.2) (2024-08-22)

**Note:** Version bump only for package @odata2ts/http-client-fetch

## [0.7.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.7.0...@odata2ts/http-client-fetch@0.7.1) (2024-08-14)

### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))

# [0.7.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.6.2...@odata2ts/http-client-fetch@0.7.0) (2024-08-13)

### Code Refactoring

* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))

### Features

* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))

### BREAKING CHANGES

* switch to ESM tends to break stuff

## [0.6.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.6.1...@odata2ts/http-client-fetch@0.6.2) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-fetch

## [0.6.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.6.0...@odata2ts/http-client-fetch@0.6.1) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-fetch

# [0.6.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.4.0...@odata2ts/http-client-fetch@0.6.0) (2023-09-13)

### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))

### Features

* **fetch:** allow for query params ([#13](https://github.com/odata2ts/http-client/issues/13)) ([1507ed1](https://github.com/odata2ts/http-client/commit/1507ed13c2020de051827db516ae1fc9c7f4b0ac))

### BREAKING CHANGES

* additional headers are now part of the config parameter

* fix: don't lose configuration when CSRF token is active

* add new option which prevents FetchClient from evaluating response body (not needed for fetching csrf tokens & makes trouble with SAP's mockServer)

* fix: add headers for content-type and accept for main methods

# [0.5.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.4.0...@odata2ts/http-client-fetch@0.5.0) (2023-09-05)

### Features

* **fetch:** allow for query params ([#13](https://github.com/odata2ts/http-client/issues/13)) ([1507ed1](https://github.com/odata2ts/http-client/commit/1507ed13c2020de051827db516ae1fc9c7f4b0ac))

# [0.4.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.3.1...@odata2ts/http-client-fetch@0.4.0) (2023-08-03)

### Code Refactoring

* **fetch:** remove default headers ([39bea92](https://github.com/odata2ts/http-client/commit/39bea92a2b8335af8a1588a4156974fcbd5ae417))

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))

### BREAKING CHANGES

* **fetch:** removed default accept & content-type headers; removed merge & retrieveBigNumbersAsString methods (base-lib); all of these settings can now be configured per operation via the `additionalHeaders` option.

## [0.3.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.3.0...@odata2ts/http-client-fetch@0.3.1) (2023-07-26)

**Note:** Version bump only for package @odata2ts/http-client-fetch

# [0.3.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.2.0...@odata2ts/http-client-fetch@0.3.0) (2023-06-10)

### Features

* conventionalize client errors ([#5](https://github.com/odata2ts/http-client/issues/5)) ([a8e8912](https://github.com/odata2ts/http-client/commit/a8e89125eeda47436d48507d6a71efc90953f878))

# [0.2.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-fetch@0.1.0...@odata2ts/http-client-fetch@0.2.0) (2023-06-03)

### Features

* switch to http-client-api ([52d1b86](https://github.com/odata2ts/http-client/commit/52d1b868ee82dbaf45486da6b22fdcf4c773dfb8))

* switch to http-client-api ([5a6da23](https://github.com/odata2ts/http-client/commit/5a6da23053b3ea5adb866bb7e30b469f1b8ed260))

# 0.1.0 (2023-05-29)

### Features

* **fetch:** full fetch client implementation ([a8e5fb7](https://github.com/odata2ts/http-client/commit/a8e5fb73594cf2d446eefc69e77b8b5e4bcae1ca))
