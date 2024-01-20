ARG RUBY_VERSION="3.3.0"
ARG IMAGE_NAME="ruby:${RUBY_VERSION}-slim"
# hadolint ignore=DL3006
FROM ${IMAGE_NAME}

LABEL maintainer="Moritz Heiber <hello@heiber.im>"
LABEL org.opencontainers.image.source=https://github.com/moritzheiber/ruby-jemalloc-docker

ARG RUBY_VERSION
ARG ADDITIONAL_FLAGS

ARG RUBY_DOWNLOAD_URL https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.0.tar.xz
ARG RUBY_CHECKSUM 676b65a36e637e90f982b57b059189b3276b9045034dcd186a7e9078847b975b

ENV DEBIAN_FRONTEND="noninteractive" \
	RUBY_VERSION="${RUBY_VERSION}"
WORKDIR /tmp/build

SHELL ["/bin/bash", "-o","pipefail", "-c"]
# hadolint ignore=DL3008,DL3003,SC1091
RUN apt-get update && \
	apt-get install -y --no-install-recommends curl \
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
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain stable && \
	source "${HOME}/.cargo/env" && \
	curl -L -o ruby.tar.xz "$RUBY_DOWNLOAD_URL"; \
	echo "$RUBY_CHECKSUM *ruby.tar.xz" | sha256sum --check --strict; \
	tar xf "ruby.tar.xz" && \
	cd "ruby-${RUBY_VERSION}" && \
	./configure --prefix=/opt/ruby \
	--with-jemalloc \
	--enable-shared \
	--disable-install-doc \
	"${ADDITIONAL_FLAGS}" && \
	make -j"$(nproc)" > /dev/null && \
	make install && \
	rustup self uninstall -y && \
	rm -rf /tmp/build && \
	apt-get clean

WORKDIR /
