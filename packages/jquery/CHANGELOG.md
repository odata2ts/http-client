# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.14.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery-v0.14.0...@odata2ts/http-client-jquery-v0.14.1) (2026-08-21)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.6.0 to ^0.6.1
    * @odata2ts/http-client-common bumped from ^0.1.0 to ^0.1.1

## [0.14.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery-v0.13.0...@odata2ts/http-client-jquery-v0.14.0) (2026-08-08)


### ⚠ BREAKING CHANGES

* the responseData of an error thrown for a binary request is no longer the Blob or the ReadableStream the successful response would have carried, but the parsed error document - or its text, if it is not JSON. Code decoding that Blob itself has to stop doing so.

### Bug Fixes

* surface the server's message when a binary request fails ([#47](https://github.com/odata2ts/http-client/issues/47)) ([c69ef66](https://github.com/odata2ts/http-client/commit/c69ef662171e7f2480fc928474b831fd18855133))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.8 to ^0.6.0

## [0.13.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery-v0.12.0...@odata2ts/http-client-jquery-v0.13.0) (2026-08-02)


### ⚠ BREAKING CHANGES

* the trailing constructor parameters of JQueryClientError are optional now, as they already are for AxiosClientError and FetchClientError. Reading error.jqXHR therefore yields JQuery.jqXHR | undefined and needs a check under strict TypeScript.

### Features

* upload binary data as a stream ([#44](https://github.com/odata2ts/http-client/issues/44)) ([ccee77a](https://github.com/odata2ts/http-client/commit/ccee77a7f6ad13bcf147485b2b9b91ac3a899fc2))


### Bug Fixes

* **http-client-jquery:** send binary data as it is ([#37](https://github.com/odata2ts/http-client/issues/37)) ([0615acc](https://github.com/odata2ts/http-client/commit/0615acc56ad183df7d93aaa9f55e5ee48a6db26a))
* report a refused or absent stream honestly ([#45](https://github.com/odata2ts/http-client/issues/45)) ([43be086](https://github.com/odata2ts/http-client/commit/43be086884c59cff45ae596b848e72a55b59ac83))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.7 to ^0.5.8

## [0.12.0](https://github.com/odata2ts/http-client/compare/@odata2ts/jquery-v0.11.1...@odata2ts/jquery-v0.12.0) (2026-07-31)


### Bug Fixes

* send a plain text request body as it is ([#35](https://github.com/odata2ts/http-client/issues/35)) ([2d44aff](https://github.com/odata2ts/http-client/commit/2d44aff43d4804070d53ea84dae271365bab4cf8))
* update typescript to 6.0.3 and migrate to nodenext resolution ([f713098](https://github.com/odata2ts/http-client/commit/f71309861d7a58b7f0fb65cf8395f0262a932a9f))
* **http-client-jquery:** stop pinning an external image's exact byte size ([fb3fece](https://github.com/odata2ts/http-client/commit/fb3fece1b5d39459acdd69d0d3c37798641a2288))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.6 to ^0.5.7

## [0.11.1](https://github.com/odata2ts/http-client/compare/@odata2ts/jquery-v0.11.0...@odata2ts/jquery-v0.11.1) (2026-06-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.5 to ^0.5.6

## [0.11.0](https://github.com/odata2ts/http-client/compare/@odata2ts/jquery-v0.10.0...@odata2ts/jquery-v0.11.0) (2026-06-10)


### ⚠ BREAKING CHANGES

* **jquery:** AjaxRequestConfig becomes JQueryRequestConfig

### Features

* create blob request ([#28](https://github.com/odata2ts/http-client/issues/28)) ([4cc238d](https://github.com/odata2ts/http-client/commit/4cc238d3fbe07c09d56732b4b12d0b1b875a3ef5))


### Code Refactoring

* **jquery:** benefit from api additions & improve config handling ([d08e4f3](https://github.com/odata2ts/http-client/commit/d08e4f30140d4c1d8968c71b89c9eb009ab44a93))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.4 to ^0.5.5

## [0.10.0](https://github.com/odata2ts/http-client/compare/@odata2ts/jquery-v0.9.3...@odata2ts/jquery-v0.10.0) (2025-03-26)


### ⚠ BREAKING CHANGES

* switch to ESM tends to break stuff
* additional headers are now part of the config parameter
* **jquery:** removed default accept & content-type headers as well as `dataType=json`; removed merge & retrieveBigNumbersAsString methods (base-lib); all of these settings can now be configured per operation via the `additionalHeaders` option.

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))
* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))
* conventionalize client errors ([#5](https://github.com/odata2ts/http-client/issues/5)) ([a8e8912](https://github.com/odata2ts/http-client/commit/a8e89125eeda47436d48507d6a71efc90953f878))
* **jquery:** allow for query params ([afd13a8](https://github.com/odata2ts/http-client/commit/afd13a862dc07485c0f619a3e39521f7ce6fc65e))
* **jquery:** copy over jquery-client and rename ([#3](https://github.com/odata2ts/http-client/issues/3)) ([55deb6c](https://github.com/odata2ts/http-client/commit/55deb6c75159bfc46b0ae87cb3c0ec3afda9508e))
* switch to http-client-api ([52d1b86](https://github.com/odata2ts/http-client/commit/52d1b868ee82dbaf45486da6b22fdcf4c773dfb8))
* switch to http-client-api ([5a6da23](https://github.com/odata2ts/http-client/commit/5a6da23053b3ea5adb866bb7e30b469f1b8ed260))


### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))
* always build all packages before release ([#26](https://github.com/odata2ts/http-client/issues/26)) ([a316f6c](https://github.com/odata2ts/http-client/commit/a316f6ce54c4360c8d6f87799ba6fd9c53bff52c))
* delete requests with Accept json header ([ea1b06d](https://github.com/odata2ts/http-client/commit/ea1b06d509b490e1e899e96a62a10eac3f65da8e))
* deploy with code ([#25](https://github.com/odata2ts/http-client/issues/25)) ([3e0e78c](https://github.com/odata2ts/http-client/commit/3e0e78cd2e0b0c3215bc0ed97dd62c75d8b6c5ea))


### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))
* **jquery:** remove default headers ([3106d97](https://github.com/odata2ts/http-client/commit/3106d9768765e7cc228097ed1270439d47ff0e0c))
* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.3 to ^0.5.4

## [0.9.3](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.9.2...@odata2ts/http-client-jquery@0.9.3) (2024-08-24)

**Note:** Version bump only for package @odata2ts/http-client-jquery

## [0.9.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.9.1...@odata2ts/http-client-jquery@0.9.2) (2024-08-22)

**Note:** Version bump only for package @odata2ts/http-client-jquery

## [0.9.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.9.0...@odata2ts/http-client-jquery@0.9.1) (2024-08-14)

### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))

# [0.9.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.8.2...@odata2ts/http-client-jquery@0.9.0) (2024-08-13)

### Code Refactoring

* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))

### Features

* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))

### BREAKING CHANGES

* switch to ESM tends to break stuff

## [0.8.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.8.1...@odata2ts/http-client-jquery@0.8.2) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-jquery

## [0.8.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.8.0...@odata2ts/http-client-jquery@0.8.1) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-jquery

# [0.8.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.6.0...@odata2ts/http-client-jquery@0.8.0) (2023-09-13)

### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))

### Features

* **jquery:** allow for query params ([afd13a8](https://github.com/odata2ts/http-client/commit/afd13a862dc07485c0f619a3e39521f7ce6fc65e))

### BREAKING CHANGES

* additional headers are now part of the config parameter

* fix: don't lose configuration when CSRF token is active

* add new option which prevents FetchClient from evaluating response body (not needed for fetching csrf tokens & makes trouble with SAP's mockServer)

* fix: add headers for content-type and accept for main methods

# [0.7.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.6.0...@odata2ts/http-client-jquery@0.7.0) (2023-09-05)

### Features

* **jquery:** allow for query params ([afd13a8](https://github.com/odata2ts/http-client/commit/afd13a862dc07485c0f619a3e39521f7ce6fc65e))

# [0.6.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.5.1...@odata2ts/http-client-jquery@0.6.0) (2023-08-03)

### Code Refactoring

* **jquery:** remove default headers ([3106d97](https://github.com/odata2ts/http-client/commit/3106d9768765e7cc228097ed1270439d47ff0e0c))

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))

### BREAKING CHANGES

* **jquery:** removed default accept & content-type headers as well as `dataType=json`; removed merge & retrieveBigNumbersAsString methods (base-lib); all of these settings can now be configured per operation via the `additionalHeaders` option.

## [0.5.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.5.0...@odata2ts/http-client-jquery@0.5.1) (2023-07-26)

**Note:** Version bump only for package @odata2ts/http-client-jquery

# [0.5.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-jquery@0.4.0...@odata2ts/http-client-jquery@0.5.0) (2023-06-10)

### Features

* conventionalize client errors ([#5](https://github.com/odata2ts/http-client/issues/5)) ([a8e8912](https://github.com/odata2ts/http-client/commit/a8e89125eeda47436d48507d6a71efc90953f878))

# 0.4.0 (2023-06-03)

### Features

* **jquery:** copy over jquery-client and rename ([#3](https://github.com/odata2ts/http-client/issues/3)) ([55deb6c](https://github.com/odata2ts/http-client/commit/55deb6c75159bfc46b0ae87cb3c0ec3afda9508e))

* switch to http-client-api ([52d1b86](https://github.com/odata2ts/http-client/commit/52d1b868ee82dbaf45486da6b22fdcf4c773dfb8))

* switch to http-client-api ([5a6da23](https://github.com/odata2ts/http-client/commit/5a6da23053b3ea5adb866bb7e30b469f1b8ed260))

## [0.3.1](https://github.com/odata2ts/odata2ts/compare/@odata2ts/jquery-odata-client@0.3.0...@odata2ts/jquery-odata-client@0.3.1) (2023-05-02)

### Bug Fixes

* **jquery-client:** stringify request body & parse response headers ([#159](https://github.com/odata2ts/odata2ts/issues/159)) ([4d5217f](https://github.com/odata2ts/odata2ts/commit/4d5217f6f168b8b906cb07cc9be90a13374ed681))

# [0.3.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/jquery-odata-client@0.2.0...@odata2ts/jquery-odata-client@0.3.0) (2023-04-27)

### Features

* **jquery-client:** automatic CSRF token handling ([c86fe0c](https://github.com/odata2ts/odata2ts/commit/c86fe0c96a347afc7a3525de718bf266fd6a4da0))

# [0.2.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/jquery-odata-client@0.1.2...@odata2ts/jquery-odata-client@0.2.0) (2023-04-20)

### Features

* better errors for jquery and axios odata clients ([#139](https://github.com/odata2ts/odata2ts/issues/139)) ([bb74514](https://github.com/odata2ts/odata2ts/commit/bb745144fb37235ad9864ab78eebbecf1d69107c))

## [0.1.2](https://github.com/odata2ts/odata2ts/compare/@odata2ts/jquery-odata-client@0.1.1...@odata2ts/jquery-odata-client@0.1.2) (2023-04-08)

**Note:** Version bump only for package @odata2ts/jquery-odata-client

## [0.1.1](https://github.com/odata2ts/odata2ts/compare/@odata2ts/jquery-odata-client@0.1.0...@odata2ts/jquery-odata-client@0.1.1) (2023-02-24)

### Bug Fixes

* **jquery-odata-client:** better typings and version for jquery ([#136](https://github.com/odata2ts/odata2ts/issues/136)) ([de29772](https://github.com/odata2ts/odata2ts/commit/de297722113c16e0bf48255d4108ee29daf70fa2))

# 0.1.0 (2023-02-24)

### Features

* jquery based OData client ([#135](https://github.com/odata2ts/odata2ts/issues/135)) ([183602f](https://github.com/odata2ts/odata2ts/commit/183602f9686b36e23679091ed8223088b4591192))
