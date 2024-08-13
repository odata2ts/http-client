# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
