# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.5.5](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.4...@odata2ts/http-client-base-v0.5.5) (2026-01-22)


### Features

* create blob request ([#28](https://github.com/odata2ts/http-client/issues/28)) ([4cc238d](https://github.com/odata2ts/http-client/commit/4cc238d3fbe07c09d56732b4b12d0b1b875a3ef5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.3 to ^0.6.4

## [0.5.4](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.5.3...@odata2ts/http-client-base-v0.5.4) (2025-03-26)


### Bug Fixes

* always build all packages before release ([#26](https://github.com/odata2ts/http-client/issues/26)) ([a316f6c](https://github.com/odata2ts/http-client/commit/a316f6ce54c4360c8d6f87799ba6fd9c53bff52c))
* delete requests with Accept json header ([ea1b06d](https://github.com/odata2ts/http-client/commit/ea1b06d509b490e1e899e96a62a10eac3f65da8e))
* deploy with code ([#25](https://github.com/odata2ts/http-client/issues/25)) ([3e0e78c](https://github.com/odata2ts/http-client/commit/3e0e78cd2e0b0c3215bc0ed97dd62c75d8b6c5ea))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.2 to ^0.6.3

## [0.5.3](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.5.2...@odata2ts/http-client-base@0.5.3) (2024-08-24)

**Note:** Version bump only for package @odata2ts/http-client-base

## [0.5.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.5.1...@odata2ts/http-client-base@0.5.2) (2024-08-22)

**Note:** Version bump only for package @odata2ts/http-client-base

## [0.5.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.5.0...@odata2ts/http-client-base@0.5.1) (2024-08-14)

### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))

# [0.5.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.4.2...@odata2ts/http-client-base@0.5.0) (2024-08-13)

### Code Refactoring

* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))

### Features

* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))

### BREAKING CHANGES

* switch to ESM tends to break stuff

## [0.4.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.4.1...@odata2ts/http-client-base@0.4.2) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-base

## [0.4.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.4.0...@odata2ts/http-client-base@0.4.1) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-base

# [0.4.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.3.0...@odata2ts/http-client-base@0.4.0) (2023-09-13)

### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))

### BREAKING CHANGES

* additional headers are now part of the config parameter

* fix: don't lose configuration when CSRF token is active

* add new option which prevents FetchClient from evaluating response body (not needed for fetching csrf tokens & makes trouble with SAP's mockServer)

* fix: add headers for content-type and accept for main methods

# [0.3.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.2.0...@odata2ts/http-client-base@0.3.0) (2023-08-03)

### Code Refactoring

* **http-client-base:** remove merge & retrieveBigNumbersAsString method ([2b1df56](https://github.com/odata2ts/http-client/commit/2b1df5677c42457430a968b3e61132818a83dc57))

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))

### BREAKING CHANGES

* **http-client-base:** removed remove merge & retrieveBigNumbersAsString methods; use the additionalHeaders option on the appropriate operations

# [0.2.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base@0.1.0...@odata2ts/http-client-base@0.2.0) (2023-07-26)

### Features

* big numbers as string ([#7](https://github.com/odata2ts/http-client/issues/7)) ([5119923](https://github.com/odata2ts/http-client/commit/5119923a79c2e61ca7762d5cba01fbac8e9ae759))

# 0.1.0 (2023-06-10)

### Features

* **http-client-base:** promote feature version & add some more documentation ([3216cf3](https://github.com/odata2ts/http-client/commit/3216cf34750732e9e3f064270351f56dac49e581))
