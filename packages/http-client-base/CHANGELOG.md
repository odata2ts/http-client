# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.6.0...@odata2ts/http-client-base-v0.6.1) (2026-08-21)


### Features

* **http-client-base:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))


### Bug Fixes

* **http-client-base:** compare a custom CSRF token key case-insensitively ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))
* **http-client-base:** declare a content type only on a request that carries a body ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.7 to ^0.6.8
    * @odata2ts/http-client-common bumped from ^0.1.0 to ^0.1.1

## [0.6.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.8...@odata2ts/http-client-base-v0.6.0) (2026-08-08)


### ⚠ BREAKING CHANGES

* the responseData of an error thrown for a binary request is no longer the Blob or the ReadableStream the successful response would have carried, but the parsed error document - or its text, if it is not JSON. Code decoding that Blob itself has to stop doing so.

### Features

* **http-client-angular:** add Angular HTTP client ([#63](https://github.com/odata2ts/http-client/issues/63)) ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))


### Bug Fixes

* **http-client-base:** type delete()'s response body as undefined instead of void ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))
* surface the server's message when a binary request fails ([#47](https://github.com/odata2ts/http-client/issues/47)) ([c69ef66](https://github.com/odata2ts/http-client/commit/c69ef662171e7f2480fc928474b831fd18855133))

## [0.5.8](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.7...@odata2ts/http-client-base-v0.5.8) (2026-08-02)


### Features

* upload binary data as a stream ([#44](https://github.com/odata2ts/http-client/issues/44)) ([ccee77a](https://github.com/odata2ts/http-client/commit/ccee77a7f6ad13bcf147485b2b9b91ac3a899fc2))


### Bug Fixes

* **http-client-base:** honor a custom token key when a token expires ([#43](https://github.com/odata2ts/http-client/issues/43)) ([0201c55](https://github.com/odata2ts/http-client/commit/0201c55aad4971609b93cdb22da7ee6f339b1278))
* **http-client-base:** repeat a request at most once after token expiration ([#41](https://github.com/odata2ts/http-client/issues/41)) ([08e32f5](https://github.com/odata2ts/http-client/commit/08e32f50b05414438159a4e95beabc33bec53128))
* **http-client-base:** repeat the identical request after token expiration ([#38](https://github.com/odata2ts/http-client/issues/38)) ([3155bba](https://github.com/odata2ts/http-client/commit/3155bba94818b073e8b9a9f5f2a908089a7b06cd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.6 to ^0.6.7

## [0.5.7](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.6...@odata2ts/http-client-base-v0.5.7) (2026-07-31)


### Bug Fixes

* send a plain text request body as it is ([#35](https://github.com/odata2ts/http-client/issues/35)) ([2d44aff](https://github.com/odata2ts/http-client/commit/2d44aff43d4804070d53ea84dae271365bab4cf8))
* update typescript to 6.0.3 and migrate to nodenext resolution ([f713098](https://github.com/odata2ts/http-client/commit/f71309861d7a58b7f0fb65cf8395f0262a932a9f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.5 to ^0.6.6

## [0.5.6](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.5...@odata2ts/http-client-base-v0.5.6) (2026-06-10)


### Features

* add generic request method ([#31](https://github.com/odata2ts/http-client/issues/31)) ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))
* **api:** introducing `request` method ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))
* **base:** implementation of `request` method ([73f2c7c](https://github.com/odata2ts/http-client/commit/73f2c7c676ca40813ba6c0a722bc4382652a7b18))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.4 to ^0.6.5

## [0.5.5](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-base-v0.5.4...@odata2ts/http-client-base-v0.5.5) (2026-06-10)


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
