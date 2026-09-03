# Changelog

## [0.2.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-common-v0.1.1...@odata2ts/http-client-common-v0.2.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* batch() is required on ODataHttpClient, not optional. A third-party client that cannot or will not support batching must still implement the method and throw a clear error explaining why.

### Features

* add batch method to HTTP clients ([#86](https://github.com/odata2ts/http-client/issues/86)) ([cb4c11e](https://github.com/odata2ts/http-client/commit/cb4c11eec32edab827b08af0f65c77ab34948f6d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.8 to ^0.7.0

## [0.1.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-common-v0.1.0...@odata2ts/http-client-common-v0.1.1) (2026-08-21)


### Features

* **http-client-common:** bounded in-memory ETag store, with a blind-write mode ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** share what every HTTP client needs regardless of its transport ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.7 to ^0.6.8
