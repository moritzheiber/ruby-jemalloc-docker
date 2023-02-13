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

- `3.0.5`
- `3.1.3`
- `3.2.1`

Images for Ruby 3.2.x are compiled with [YJIT](https://github.com/ruby/ruby/blob/master/doc/yjit/yjit.md) support.

Container images are available but no longer maintained for the following versions:

- `3.0.4`
- `3.1.2`
- `3.2.0`

## Tests

The tests are run using [`goss`](https://github.com/aelsabbahy/goss):

```console
dgoss run -ti ruby-jemalloc
```

You can specify the Ruby version to test for by passing `RUBY_VERSION` as a variable:

```console
dgoss run -ti -e RUBY_VERSION=3.0.5 ruby-jemalloc
```

_Note: `3.0.5` is the default. And don't forget to also pass the correct `RUBY_CHECKSUM`._
