ARG RUBY_VERSION="3.0.5"
ARG IMAGE_NAME="ruby:${RUBY_VERSION}-slim"
# hadolint ignore=DL3006
FROM ${IMAGE_NAME}

LABEL maintainer="Moritz Heiber <hello@heiber.im>"
LABEL org.opencontainers.image.source=https://github.com/moritzheiber/ruby-jemalloc-docker

ARG RUBY_VERSION
ARG RUBY_CHECKSUM="9afc6380a027a4fe1ae1a3e2eccb6b497b9c5ac0631c12ca56f9b7beb4848776"

ENV DEBIAN_FRONTEND="noninteractive" \
	RUBY_VERSION="${RUBY_VERSION}"
WORKDIR /tmp/build

SHELL ["/bin/bash", "-o","pipefail", "-c"]
# hadolint ignore=DL3008,DL3003
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
	wget -q "https://cache.ruby-lang.org/pub/ruby/${RUBY_VERSION%.*}/ruby-${RUBY_VERSION}.tar.gz" && \
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
	apt-get clean

WORKDIR /
