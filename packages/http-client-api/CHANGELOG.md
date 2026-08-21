# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.8](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api-v0.6.7...@odata2ts/http-client-api-v0.6.8) (2026-08-21)


### Features

* **http-client-angular:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** declare the ETag store used for optimistic concurrency ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** ETag store for optimistic concurrency control ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-base:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** bounded in-memory ETag store, with a blind-write mode ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))

## [0.6.7](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api-v0.6.6...@odata2ts/http-client-api-v0.6.7) (2026-08-02)


### Features

* upload binary data as a stream ([#44](https://github.com/odata2ts/http-client/issues/44)) ([ccee77a](https://github.com/odata2ts/http-client/commit/ccee77a7f6ad13bcf147485b2b9b91ac3a899fc2))

## [0.6.6](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api-v0.6.5...@odata2ts/http-client-api-v0.6.6) (2026-07-31)


### Bug Fixes

* update typescript to 6.0.3 and migrate to nodenext resolution ([f713098](https://github.com/odata2ts/http-client/commit/f71309861d7a58b7f0fb65cf8395f0262a932a9f))

## [0.6.5](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api-v0.6.4...@odata2ts/http-client-api-v0.6.5) (2026-06-10)


### Features

* add generic request method ([#31](https://github.com/odata2ts/http-client/issues/31)) ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))
* **api:** introducing `request` method ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))
* **base:** implementation of `request` method ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))

## [0.6.4](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api-v0.6.3...@odata2ts/http-client-api-v0.6.4) (2026-06-10)


### Features

* create blob request ([#28](https://github.com/odata2ts/http-client/issues/28)) ([4cc238d](https://github.com/odata2ts/http-client/commit/4cc238d3fbe07c09d56732b4b12d0b1b875a3ef5))

## [0.6.3](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-api@0.6.2...@odata2ts/http-client-api-v0.6.3) (2025-03-26)


### Bug Fixes

* always build all packages before release ([#26](https://github.com/odata2ts/http-client/issues/26)) ([a316f6c](https://github.com/odata2ts/http-client/commit/a316f6ce54c4360c8d6f87799ba6fd9c53bff52c))
* deploy with code ([#25](https://github.com/odata2ts/http-client/issues/25)) ([3e0e78c](https://github.com/odata2ts/http-client/commit/3e0e78cd2e0b0c3215bc0ed97dd62c75d8b6c5ea))

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
