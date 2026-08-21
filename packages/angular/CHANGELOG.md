# Changelog

## [0.1.3](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-angular-v0.1.2...@odata2ts/http-client-angular-v0.1.3) (2026-08-21)


### Features

* **http-client-angular:** add Angular HTTP client ([#63](https://github.com/odata2ts/http-client/issues/63)) ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))
* **http-client-angular:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** declare the ETag store used for optimistic concurrency ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** ETag store for optimistic concurrency control ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-base:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** bounded in-memory ETag store, with a blind-write mode ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** share what every HTTP client needs regardless of its transport ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))
* test & support angular 22 ([f96ee07](https://github.com/odata2ts/http-client/commit/f96ee0738cc1651ee6cbb9dd329d2a0d9240ce6d))


### Bug Fixes

* **http-client-base:** compare a custom CSRF token key case-insensitively ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))
* **http-client-base:** declare a content type only on a request that carries a body ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))
* **http-client-base:** type delete()'s response body as undefined instead of void ([b0adb27](https://github.com/odata2ts/http-client/commit/b0adb278916c91eb1bd2d569eda29082eeed8837))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.8 to ^0.7.0
    * @odata2ts/http-client-common bumped from ^0.1.1 to ^0.1.2

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
