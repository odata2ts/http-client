# Changelog

## [0.2.0](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-angular-v0.1.2...@odata2ts/http-client-angular-v0.2.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* batch() is required on ODataHttpClient, not optional. A third-party client that cannot or will not support batching must still implement the method and throw a clear error explaining why.

### Features

* add batch method to HTTP clients ([#86](https://github.com/odata2ts/http-client/issues/86)) ([cb4c11e](https://github.com/odata2ts/http-client/commit/cb4c11eec32edab827b08af0f65c77ab34948f6d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.8 to ^0.7.0
    * @odata2ts/http-client-common bumped from ^0.1.1 to ^0.2.0

## [0.1.2](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-angular-v0.1.1...@odata2ts/http-client-angular-v0.1.2) (2026-08-21)


### Features

* **http-client-angular:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.5 to ^0.6.8
    * @odata2ts/http-client-common bumped from ^0.1.0 to ^0.1.1

## [0.1.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-angular-v0.1.0...@odata2ts/http-client-angular-v0.1.1) (2026-08-08)


### Features

* **http-client-angular:** add Angular HTTP client ([#63](https://github.com/odata2ts/http-client/issues/63)) ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))
* test & support angular 22 ([f96ee07](https://github.com/odata2ts/http-client/commit/f96ee0738cc1651ee6cbb9dd329d2a0d9240ce6d))


### Bug Fixes

* **http-client-base:** type delete()'s response body as undefined instead of void ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))
