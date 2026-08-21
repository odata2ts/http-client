# Changelog

## [0.1.1](https://github.com/odata2ts/http-client/compare/@odata2ts/http-client-common-v0.1.0...@odata2ts/http-client-common-v0.1.1) (2026-08-21)


### Features

* **http-client-angular:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** declare the ETag store used for optimistic concurrency ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-api:** ETag store for optimistic concurrency control ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-base:** hold the ETags seen by this client ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** bounded in-memory ETag store, with a blind-write mode ([b95c5c8](https://github.com/odata2ts/http-client/commit/b95c5c8a5f3721071e54fddb4bbdc4bb45053573))
* **http-client-common:** share what every HTTP client needs regardless of its transport ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))


### Bug Fixes

* **http-client-base:** compare a custom CSRF token key case-insensitively ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))
* **http-client-base:** declare a content type only on a request that carries a body ([4cf1ac7](https://github.com/odata2ts/http-client/commit/4cf1ac725716e0ac2722e8ce0272166d12bd32fb))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @odata2ts/http-client-api bumped from ^0.6.7 to ^0.6.8
