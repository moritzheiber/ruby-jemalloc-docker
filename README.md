# Ruby Docker image, built with `jemalloc`

A Docker image for Ruby, built with [`jemalloc`](https://scalingo.com/blog/improve-ruby-application-memory-jemalloc).

The image is based on [the offical Ruby "slim" image](https://hub.docker.com/_/ruby) on Docker Hub.

The following images are used:

- `slim`

The following platforms are built:

- `linux/amd64`
- `linux/arm64`


The following Ruby versions are built:

- `3.0.5`
- `3.1.3`
- `3.2.0`

Container images are available but no longer maintained for the following versions:

- `3.0.4`
- `3.1.2`

## Tests

The tests are run using [`goss`](https://github.com/aelsabbahy/goss):

```console
dgoss run -ti ruby-jemalloc
```

You can specify the Ruby version to test for by passing `RUBY_VERSION` as a variable:

```console
dgoss run -ti -e RUBY_VERSION=3.0.5 ruby-jemalloc
```

_Note: `3.0.5` is the default._
