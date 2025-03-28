# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.0](https://github.com/odata2ts/http-client/compare/@odata2ts/axios-v0.11.3...@odata2ts/axios-v0.12.0) (2025-03-26)


### ⚠ BREAKING CHANGES

* switch to ESM tends to break stuff
* additional headers are now part of the config parameter
* **axios:** removed default accept & content-type headers; removed merge & retrieveBigNumbersAsString methods (base-lib); all of these settings can now be configured per operation via the `additionalHeaders` option.
* **axios:** new name and axios becomes peer dependency

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))
* **axios:** take over axios-odata-client as http-client-axios ([#1](https://github.com/odata2ts/http-client/issues/1)) ([d679f60](https://github.com/odata2ts/http-client/commit/d679f60087adfdefa00f2a4860bed77ca9b15654))
* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))
* conventionalize client errors ([#5](https://github.com/odata2ts/http-client/issues/5)) ([a8e8912](https://github.com/odata2ts/http-client/commit/a8e89125eeda47436d48507d6a71efc90953f878))
* switch to http-client-api ([52d1b86](https://github.com/odata2ts/http-client/commit/52d1b868ee82dbaf45486da6b22fdcf4c773dfb8))
* switch to http-client-api ([5a6da23](https://github.com/odata2ts/http-client/commit/5a6da23053b3ea5adb866bb7e30b469f1b8ed260))


### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))
* always build all packages before release ([#26](https://github.com/odata2ts/http-client/issues/26)) ([a316f6c](https://github.com/odata2ts/http-client/commit/a316f6ce54c4360c8d6f87799ba6fd9c53bff52c))
* delete requests with Accept json header ([ea1b06d](https://github.com/odata2ts/http-client/commit/ea1b06d509b490e1e899e96a62a10eac3f65da8e))
* deploy with code ([#25](https://github.com/odata2ts/http-client/issues/25)) ([3e0e78c](https://github.com/odata2ts/http-client/commit/3e0e78cd2e0b0c3215bc0ed97dd62c75d8b6c5ea))


### Code Refactoring

* **axios:** remove default headers ([7fcff0c](https://github.com/odata2ts/http-client/commit/7fcff0c8f1a0962abc60da84cde57e0469cc0bc2))
* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))
* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-base bumped from ^0.5.3 to ^0.5.4

## [0.11.3](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.11.2...@odata2ts/http-client-axios@0.11.3) (2024-08-24)

**Note:** Version bump only for package @odata2ts/http-client-axios

## [0.11.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.11.1...@odata2ts/http-client-axios@0.11.2) (2024-08-22)

**Note:** Version bump only for package @odata2ts/http-client-axios

## [0.11.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.11.0...@odata2ts/http-client-axios@0.11.1) (2024-08-14)

### Bug Fixes

* add ".js" suffix for all relative imports ([#20](https://github.com/odata2ts/http-client/issues/20)) ([961c910](https://github.com/odata2ts/http-client/commit/961c91002c8b1e9a7a6256cccd6b6d0ec9c142cd))

# [0.11.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.10.2...@odata2ts/http-client-axios@0.11.0) (2024-08-13)

### Code Refactoring

* switch to vitest & ESM ([#18](https://github.com/odata2ts/http-client/issues/18)) ([748558f](https://github.com/odata2ts/http-client/commit/748558f1e3f699085ade1058b1459c843f60994f))

### Features

* blob and stream support ([#12](https://github.com/odata2ts/http-client/issues/12)) ([ae6f062](https://github.com/odata2ts/http-client/commit/ae6f062371a0ad11707fa3f9edff9571998edb5b))

### BREAKING CHANGES

* switch to ESM tends to break stuff

## [0.10.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.10.1...@odata2ts/http-client-axios@0.10.2) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-axios

## [0.10.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.10.0...@odata2ts/http-client-axios@0.10.1) (2023-09-13)

**Note:** Version bump only for package @odata2ts/http-client-axios

# [0.10.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.9.0...@odata2ts/http-client-axios@0.10.0) (2023-09-13)

### Code Refactoring

* expand additionalHeaders param to internalConfig ([#15](https://github.com/odata2ts/http-client/issues/15)) ([7fe1d73](https://github.com/odata2ts/http-client/commit/7fe1d73a7436f64b84a060bd1dbf9e121ef901ce))

### BREAKING CHANGES

* additional headers are now part of the config parameter

* fix: don't lose configuration when CSRF token is active

* add new option which prevents FetchClient from evaluating response body (not needed for fetching csrf tokens & makes trouble with SAP's mockServer)

* fix: add headers for content-type and accept for main methods

# [0.9.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.8.1...@odata2ts/http-client-axios@0.9.0) (2023-08-03)

### Code Refactoring

* **axios:** remove default headers ([7fcff0c](https://github.com/odata2ts/http-client/commit/7fcff0c8f1a0962abc60da84cde57e0469cc0bc2))

### Features

* allow for additional headers for all operations ([#10](https://github.com/odata2ts/http-client/issues/10)) ([75eedd3](https://github.com/odata2ts/http-client/commit/75eedd3ebb8534188a5a644aee9e69e17f1f0c80))

### BREAKING CHANGES

* **axios:** removed default accept & content-type headers; removed merge & retrieveBigNumbersAsString methods (base-lib); all of these settings can now be configured per operation via the `additionalHeaders` option.

## [0.8.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.8.0...@odata2ts/http-client-axios@0.8.1) (2023-07-26)

**Note:** Version bump only for package @odata2ts/http-client-axios

# [0.8.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-axios@0.7.0...@odata2ts/http-client-axios@0.8.0) (2023-06-10)

### Features

* conventionalize client errors ([#5](https://github.com/odata2ts/http-client/issues/5)) ([a8e8912](https://github.com/odata2ts/http-client/commit/a8e89125eeda47436d48507d6a71efc90953f878))

# 0.7.0 (2023-06-03)

### Features

* **axios:** take over axios-odata-client as http-client-axios ([#1](https://github.com/odata2ts/http-client/issues/1)) ([d679f60](https://github.com/odata2ts/http-client/commit/d679f60087adfdefa00f2a4860bed77ca9b15654))

* switch to http-client-api ([52d1b86](https://github.com/odata2ts/http-client/commit/52d1b868ee82dbaf45486da6b22fdcf4c773dfb8))

* switch to http-client-api ([5a6da23](https://github.com/odata2ts/http-client/commit/5a6da23053b3ea5adb866bb7e30b469f1b8ed260))

### BREAKING CHANGES

* **axios:** new name and axios becomes peer dependency

# [0.6.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.5.3...@odata2ts/axios-odata-client@0.6.0) (2023-04-20)

### Features

* better errors for jquery and axios odata clients ([#139](https://github.com/odata2ts/odata2ts/issues/139)) ([bb74514](https://github.com/odata2ts/odata2ts/commit/bb745144fb37235ad9864ab78eebbecf1d69107c))

## [0.5.3](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.5.2...@odata2ts/axios-odata-client@0.5.3) (2023-04-08)

**Note:** Version bump only for package @odata2ts/axios-odata-client

## [0.5.2](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.5.1...@odata2ts/axios-odata-client@0.5.2) (2023-02-03)

**Note:** Version bump only for package @odata2ts/axios-odata-client

## [0.5.1](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.5.0...@odata2ts/axios-odata-client@0.5.1) (2023-01-07)

**Note:** Version bump only for package @odata2ts/axios-odata-client

# [0.5.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.4.0...@odata2ts/axios-odata-client@0.5.0) (2023-01-05)

### Features

* **axios-odata-client:** default error message retriever ([#82](https://github.com/odata2ts/odata2ts/issues/82)) ([11b7b61](https://github.com/odata2ts/odata2ts/commit/11b7b6171291ba78c2e2b4c7ab39a6c425d02cf1))

* **axios-odata-client:** MERGE implementation for V2 ([#83](https://github.com/odata2ts/odata2ts/issues/83)) ([097005f](https://github.com/odata2ts/odata2ts/commit/097005fda1f4008c1fe3ea71f177697867e761fe))

### BREAKING CHANGES

* **axios-odata-client:** errorMessageRetriever is not part of the constructor signature anymore; use the setter if you want to apply a custom error message retriever

# [0.4.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.2.3...@odata2ts/axios-odata-client@0.4.0) (2022-12-18)

### Features

* **odata-client-api:** dynamic response data model for put and patch ([b6d9a7d](https://github.com/odata2ts/odata2ts/commit/b6d9a7de45b39106693515c6e2b5490112547ae4))

### BREAKING CHANGES

* **odata-client-api:** put and patch allow for response values now => OData v4 specifies that either void or the model representation might be returned (void is more usual though)

# [0.3.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.2.3...@odata2ts/axios-odata-client@0.3.0) (2022-12-18)

### Features

* **odata-client-api:** dynamic response data model for put and patch ([b6d9a7d](https://github.com/odata2ts/odata2ts/commit/b6d9a7de45b39106693515c6e2b5490112547ae4))

### BREAKING CHANGES

* **odata-client-api:** put and patch allow for response values now => OData v4 specifies that either void or the model representation might be returned (void is more usual though)

## [0.2.3](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.2.2...@odata2ts/axios-odata-client@0.2.3) (2022-09-08)

**Note:** Version bump only for package @odata2ts/axios-odata-client

## [0.2.2](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.2.1...@odata2ts/axios-odata-client@0.2.2) (2022-08-25)

### Bug Fixes

* **axios-odata-client:** export everything from AxiosODataClient ([#55](https://github.com/odata2ts/odata2ts/issues/55)) ([b43e8f8](https://github.com/odata2ts/odata2ts/commit/b43e8f88b54605edd75ced95fd09b84267c52716))

## [0.2.1](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.2.0...@odata2ts/axios-odata-client@0.2.1) (2022-07-11)

**Note:** Version bump only for package @odata2ts/axios-odata-client

# [0.2.0](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.1.1...@odata2ts/axios-odata-client@0.2.0) (2022-07-06)

### Features

* add option to enable automatic csrf token handling ([#32](https://github.com/odata2ts/odata2ts/issues/32)) ([cf4b8c6](https://github.com/odata2ts/odata2ts/commit/cf4b8c60f02ef1fdf7af267e61791e4b7d94fb3e))

## [0.1.1](https://github.com/odata2ts/odata2ts/compare/@odata2ts/axios-odata-client@0.1.0...@odata2ts/axios-odata-client@0.1.1) (2022-06-30)

### Bug Fixes

* add prebulish script to guarantee building before publishing ([b6986db](https://github.com/odata2ts/odata2ts/commit/b6986dbdb258b7b3cb8f36ab52ae1ff7b093f7dc))

# 0.1.0 (2022-06-02)

### Features

* **axios-odata-client:** introduce new module ([ea5684f](https://github.com/odata2ts/odata2ts/commit/ea5684f1f07a7b753e7ef587f41fbc450578497a))
