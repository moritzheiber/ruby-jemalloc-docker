# Ruby Docker image, built with `jemalloc`

A Docker image for Ruby, built with [`jemalloc`](https://scalingo.com/blog/improve-ruby-application-memory-jemalloc).

The images are based on [the offical Ruby "slim"](https://hub.docker.com/_/ruby) and [official Ubuntu "20.04"/"22.04" (LTS) images](https://hub.docker.com/_/ubuntu) on Docker Hub.

The following images are used:

- `ruby:${RUBY_VERSION}-slim`
- `ubuntu:20.04`
- `ubuntu:22.04`

The following platforms are built:

- `linux/amd64`
- `linux/arm64`


The following Ruby versions are built:

- `3.0.6`
- `3.1.4`
- `3.2.2`

Images for Ruby 3.2.x are compiled with [YJIT](https://github.com/ruby/ruby/blob/master/doc/yjit/yjit.md) support.

Container images are available but no longer maintained for the following versions:

- `3.0.4`
- `3.0.5`
- `3.1.2`
- `3.1.3`
- `3.2.0`
- `3.2.1`

## Support for newer Ruby versions

GitHub Actions is set up to gather the latest available Ruby versions with the [ruby-versions-action](https://github.com/moritzheiber/ruby-versions-action) and feed it to the build process. The plan is to run the build pipeline and update the REAMDE from a template regularly (e.g. weekly) in the future. For now this has to be done manually, so feel free to open a new issue once a new release needs to be supported (it usually takes a few minutes to trigger the pipeline and update the README).

## Compiling your own image

The `Dockerfile` is set up in a way which makes it possible to compile pretty much any recent Ruby release [from the index on the ruby-lang.org website](https://cache.ruby-lang.org/pub/ruby/index.txt). The only two build arguments you need to provide are `RUBY_VERSION` (e.g. `3.1.2`) and the associated `sha256` checksum as `RUBY_CHECKSUM` (e.g. `ca10d017f8a1b6d247556622c841fc56b90c03b1803f87198da1e4fd3ec3bf2a`) of the `tar.gz` package associated with the relevant version.

You can always use the [ruby-version-checker](https://github.com/moritzheiber/ruby-version-checker-rs) container to fetch the latest available Ruby releases and their corresponding checksums:

```console
$ docker run ghcr.io/moritzheiber/ruby-version-checker
# [...]
[
  {
    "name": "3.0.6",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.0/ruby-3.0.6.tar.gz",
    "sha256": "6e6cbd490030d7910c0ff20edefab4294dfcd1046f0f8f47f78b597987ac683e"
  },
  {
    "name": "3.1.4",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.4.tar.gz",
    "sha256": "a3d55879a0dfab1d7141fdf10d22a07dbf8e5cdc4415da1bde06127d5cc3c7b6"
  },
  {
    "name": "3.2.2",
    "url": "https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.2.tar.gz",
    "sha256": "96c57558871a6748de5bc9f274e93f4b5aad06cd8f37befa0e8d94e7b8a423bc"
  }
]
```


If you wish to pass additional compile-time options you can use the build argument `ADDITIONAL_FLAGS` (e.g. to enable YJIT support for Ruby `3.2.x`):

```console
$ docker build \
  --build-arg RUBY_VERSION="3.1.4" \
  --build-arg RUBY_CHECKSUM="a3d55879a0dfab1d7141fdf10d22a07dbf8e5cdc4415da1bde06127d5cc3c7b6" \
  --build-arg ADDITIONAL_FLAGS="--enable-yjit" \
  -t ruby-jemalloc:3.1.4-slim .
```
The `Dockerfile` uses [the official Ruby `slim` image](https://hub.docker.com/_/ruby) by default, but you can also use your own base image by passing the build argument `IMAGE_NAME`:

```console
$ docker build \
  --build-arg RUBY_VERSION=3.1.4 \
  --build-arg RUBY_CHECKSUM=a3d55879a0dfab1d7141fdf10d22a07dbf8e5cdc4415da1bde06127d5cc3c7b6 \
  --build-arg IMAGE_NAME=ubuntu:22.04 \
  -t ruby-jemalloc:3.1.4-ubuntu-22.04 .
```
_Note: Ruby `3.2.2-slim` is the default when building the Docker image without any build arguments._

## Tests

The tests are run using [`goss`](https://github.com/aelsabbahy/goss):

```console
dgoss run -ti ruby-jemalloc
```

You can specify the Ruby version to test for by passing `RUBY_VERSION` as a variable:

```console
dgoss run -ti -e RUBY_VERSION=3.2.2 ruby-jemalloc
```

_Note: `3.2.2` is the default. And don't forget to also pass the correct `RUBY_CHECKSUM`._
