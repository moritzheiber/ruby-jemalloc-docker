ARG RUBY_VERSION="3.2.2"
ARG IMAGE_NAME="ruby:${RUBY_VERSION}-slim"
# hadolint ignore=DL3006
FROM ${IMAGE_NAME}

LABEL maintainer="Moritz Heiber <hello@heiber.im>"
LABEL org.opencontainers.image.source=https://github.com/moritzheiber/ruby-jemalloc-docker

ARG RUBY_VERSION
ARG RUBY_CHECKSUM="96c57558871a6748de5bc9f274e93f4b5aad06cd8f37befa0e8d94e7b8a423bc"
ARG ADDITIONAL_FLAGS

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
	curl -L -o "ruby-${RUBY_VERSION}.tar.gz" "https://cache.ruby-lang.org/pub/ruby/${RUBY_VERSION%.*}/ruby-${RUBY_VERSION}.tar.gz" && \
	echo "${RUBY_CHECKSUM}  ruby-${RUBY_VERSION}.tar.gz" | sha256sum --strict -c - && \
	tar xf "ruby-${RUBY_VERSION}.tar.gz" && \
	cd "ruby-${RUBY_VERSION}" && \
	./configure --prefix=/opt/ruby \
	--with-jemalloc \
	--with-shared \
	--disable-install-doc \
	"${ADDITIONAL_FLAGS}" && \
	make -j"$(nproc)" > /dev/null && \
	make install && \
	rustup self uninstall -y && \
	rm -rf /tmp/build && \
	apt-get clean

WORKDIR /
