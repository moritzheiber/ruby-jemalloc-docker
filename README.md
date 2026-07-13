# Ruby Docker image, built with `jemalloc`

A Docker image for Ruby, built with [`jemalloc`](https://scalingo.com/blog/improve-ruby-application-memory-jemalloc).

The images are based on [the official Ruby "slim"](https://hub.docker.com/_/ruby) and [official Ubuntu "22.04"/"24.04"/"26.04" (LTS) images](https://hub.docker.com/_/ubuntu) on Docker Hub.

The following images are used:

- `ruby:${RUBY_VERSION}-slim`
- `ubuntu:22.04`
- `ubuntu:24.04`
- `ubuntu:26.04`

The following platforms are built:

- `linux/amd64`
- `linux/arm64`


The following Ruby versions are built:

- `3.2.11`
- `3.3.11`
- `3.4.10`
- `4.0.5`

Images for Ruby >= 3.2.x are compiled with [YJIT](https://github.com/ruby/ruby/blob/master/doc/yjit/yjit.md) support.

Container images are available but no longer maintained for the following versions:

- `3.2.4`
- `3.2.5`
- `3.2.6`
- `3.2.7`
- `3.2.8`
- `3.3.4`
- `3.3.5`
- `3.3.6`
- `3.3.7`
- `3.3.8`
- `3.4.1`
- `3.4.2`
- `3.4.3`
- `3.4.4`

and the following platforms:

- `ubuntu-20.04`

## Support for newer Ruby versions

GitHub Actions is set up to gather the latest available Ruby versions with the [ruby-versions-action](https://github.com/moritzheiber/ruby-versions-action) and feed it to the build process. The plan is to run the build pipeline and update the REAMDE from a template regularly (e.g. weekly) in the future. For now this has to be done manually, so feel free to open a new issue once a new release needs to be supported (it usually takes a few minutes to trigger the pipeline and update the README).

## Compiling your own image

The `Dockerfile` is set up in a way which makes it possible to compile pretty much any recent Ruby release [from the index on the ruby-lang.org website](https://cache.ruby-lang.org/pub/ruby/index.txt). The only two build arguments you need to provide are `RUBY_VERSION` (e.g. `4.0.5`) and the associated `sha256` checksum as `RUBY_CHECKSUM` (e.g. `7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e`) of the `tar.gz` package associated with the relevant version.

You can always use the [ruby-version-checker](https://github.com/moritzheiber/ruby-version-checker-rs) container to fetch the latest available Ruby releases and their corresponding checksums:

```console
$ docker run ghcr.io/moritzheiber/ruby-version-checker
# [...]
[
  {
    "name": "3.2.11",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.11.tar.gz",
    "sha256": "b3eeabd6636f334531db3ffdc3229eb05e524740e6c84fdc043720573cf2f8b2"
  },
  {
    "name": "3.3.11",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.11.tar.gz",
    "sha256": "59f0fafb1a59a05dc3765117af3fa68e153eb48254708549f321c1e9e078d7a0"
  },
  {
    "name": "3.4.10",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.10.tar.gz",
    "sha256": "ecee2d072a14f2d14347dd56dfd8fe5c3130abf5117bfaacbda0f4ef9cc429ec"
  },
  {
    "name": "4.0.5",
    "url": "https://cache.ruby-lang.org/pub/ruby/4.0/ruby-4.0.5.tar.gz",
    "sha256": "7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e"
  }
]
```


If you wish to pass additional compile-time options you can use the build argument `ADDITIONAL_FLAGS` (e.g. to enable YJIT support for Ruby >= `3.2.x`):

```console
$ docker build \
  --build-arg RUBY_VERSION="4.0.5" \
  --build-arg RUBY_CHECKSUM="7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e" \
  --build-arg ADDITIONAL_FLAGS="--enable-yjit" \
  -t ruby-jemalloc:4.0.5-slim .
```
The `Dockerfile` uses [the official Ruby `slim` image](https://hub.docker.com/_/ruby) by default, but you can also use your own base image by passing the build argument `IMAGE_NAME`:

```console
$ docker build \
  --build-arg RUBY_VERSION=4.0.5 \
  --build-arg RUBY_CHECKSUM=7d6149079a63f8ae1d326c9fa65c6019ba2dc3155eae7b39159817911c88958e \
  --build-arg IMAGE_NAME=ubuntu:22.04 \
  -t ruby-jemalloc:4.0.5-ubuntu-22.04 .
```
_Note: Ruby `4.0.5-slim` is the default when building the Docker image without any build arguments._

## Tests

The tests are run using [`goss`](https://github.com/aelsabbahy/goss):

```console
dgoss run -ti ruby-jemalloc
```

You can specify the Ruby version to test for by passing `RUBY_VERSION` as a variable:

```console
dgoss run -ti -e RUBY_VERSION=4.0.5 ruby-jemalloc
```

_Note: `4.0.5` is the default. And don't forget to also pass the correct `RUBY_CHECKSUM`._
