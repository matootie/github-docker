# Changelog

### v3.0.0

* `contextName` can now be specified for GitHub Docker to find Dockerfiles with custom names.
* Removed `username` input.
* Renamed `repositoryName` to just `repository`.
* Replaced `imageTag` with `tag`. Multiple tags can be specified via newline.
* Tag now defaults to `latest`, as appose to commit SHA.
* Removed `imageTagPrefix` and `imageTagSuffix` inputs.
