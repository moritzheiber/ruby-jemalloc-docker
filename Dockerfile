ARG RUBY_VERSION="3.0.4"
ARG IMAGE_VERSION="slim"
FROM ruby:${RUBY_VERSION}-${IMAGE_VERSION}

LABEL maintainer="Moritz Heiber <hello@heiber.im>"
LABEL org.opencontainers.image.source=https://github.com/moritzheiber/ruby-jemalloc-docker

ARG RUBY_VERSION
ARG RUBY_CHECKSUM="70b47c207af04bce9acea262308fb42893d3e244f39a4abc586920a1c723722b"

ENV DEBIAN_FRONTEND="noninteractive"
WORKDIR /tmp/build

SHELL ["/bin/bash", "-c"]
RUN apt-get update && \
	apt-get install -y --no-install-recommends wget \
	ca-certificates \
	python3 \
	apt-utils \
	build-essential \
 	bison \
	libyaml-dev \
	libgdbm-dev \
	libreadline-dev \
	libjemalloc-dev \
  	libncurses5-dev \
	libffi-dev \
	zlib1g-dev \
	libssl-dev && \
	wget "https://cache.ruby-lang.org/pub/ruby/${RUBY_VERSION%.*}/ruby-${RUBY_VERSION}.tar.gz" && \
	echo "${RUBY_CHECKSUM}  ruby-${RUBY_VERSION}.tar.gz" | sha256sum --strict -c - && \
	tar xf "ruby-${RUBY_VERSION}.tar.gz" && \
	cd "ruby-${RUBY_VERSION}" && \
	./configure --prefix=/opt/ruby \
	  --with-jemalloc \
	  --with-shared \
	  --disable-install-doc && \
	make -j"$(nproc)" > /dev/null && \
	make install && \
	rm -rf /tmp/build && \
	apt-get clean && \
	rm -rf /var/cache && \
	rm -rf /var/lib/apt/lists/*
