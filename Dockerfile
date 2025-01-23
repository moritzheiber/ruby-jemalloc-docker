ARG RUBY_VERSION="3.4.1"
ARG IMAGE_NAME="ruby:${RUBY_VERSION}-slim"
# hadolint ignore=DL3006
FROM ${IMAGE_NAME}

LABEL maintainer="Moritz Heiber <hello@heiber.im>"
LABEL org.opencontainers.image.source=https://github.com/moritzheiber/ruby-jemalloc-docker

ARG RUBY_VERSION
ARG RUBY_CHECKSUM="3d385e5d22d368b064c817a13ed8e3cc3f71a7705d7ed1bae78013c33aa7c87f"
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
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain=1.84.0 && \
	source "${HOME}/.cargo/env" && \
	curl -L -o "ruby-${RUBY_VERSION}.tar.gz" "https://cache.ruby-lang.org/pub/ruby/${RUBY_VERSION%.*}/ruby-${RUBY_VERSION}.tar.gz" && \
	echo "${RUBY_CHECKSUM}  ruby-${RUBY_VERSION}.tar.gz" | sha256sum --strict -c - && \
	tar xf "ruby-${RUBY_VERSION}.tar.gz" && \
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
