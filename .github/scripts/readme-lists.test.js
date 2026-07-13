"use strict";

// Run from the .github/scripts directory with: node --test

const test = require("node:test");
const assert = require("node:assert/strict");
const lists = require("./readme-lists.js");

test("imageToBase maps slim and ubuntu targets", () => {
  assert.equal(lists.imageToBase("slim"), "ruby:${RUBY_VERSION}-slim");
  assert.equal(lists.imageToBase("ubuntu-22.04"), "ubuntu:22.04");
  assert.equal(lists.imageToBase("ubuntu-26.04"), "ubuntu:26.04");
});

test("imagesList renders bullets and keeps RUBY_VERSION literal", () => {
  assert.equal(
    lists.imagesList(["slim", "ubuntu-24.04"]),
    "- `ruby:${RUBY_VERSION}-slim`\n- `ubuntu:24.04`",
  );
});

test("platformsList prefixes linux/", () => {
  assert.equal(
    lists.platformsList(["amd64", "arm64"]),
    "- `linux/amd64`\n- `linux/arm64`",
  );
});

test("extractMatrixArray reads the build-test-push matrix", () => {
  const workflow = [
    "jobs:",
    "  build-test-push:",
    "    strategy:",
    "      matrix:",
    "        version: x",
    "        image: [slim, ubuntu-22.04, ubuntu-24.04, ubuntu-26.04]",
    "        platform: [amd64, arm64]",
    "  merge-manifests:",
    "    strategy:",
    "      matrix:",
    "        image: [slim, ubuntu-22.04]",
    "",
  ].join("\n");
  assert.deepEqual(lists.extractMatrixArray(workflow, "build-test-push", "image"), [
    "slim",
    "ubuntu-22.04",
    "ubuntu-24.04",
    "ubuntu-26.04",
  ]);
  assert.deepEqual(lists.extractMatrixArray(workflow, "build-test-push", "platform"), [
    "amd64",
    "arm64",
  ]);
});

test("extractMatrixArray throws for unknown job or key", () => {
  assert.throws(() => lists.extractMatrixArray("jobs:\n", "missing", "image"));
});

test("suffixesFromTags extracts distinct suffixes only", () => {
  const tags = [
    "3.4.5-slim",
    "3.4.5-ubuntu-26.04",
    "3.0.4-ubuntu-20.04",
    "3.1.2-ubuntu-20.04",
    "latest",
    "3.2.9",
  ];
  assert.deepEqual(lists.suffixesFromTags(tags).sort(), [
    "slim",
    "ubuntu-20.04",
    "ubuntu-26.04",
  ]);
});

test("deprecatedPlatforms is registry suffixes minus the build matrix", () => {
  const tags = ["3.4.5-slim", "3.4.5-ubuntu-26.04", "3.0.4-ubuntu-20.04"];
  const maintained = ["slim", "ubuntu-22.04", "ubuntu-24.04", "ubuntu-26.04"];
  assert.deepEqual(lists.deprecatedPlatforms(tags, maintained), ["ubuntu-20.04"]);
  assert.equal(
    lists.deprecatedPlatformsList(tags, maintained),
    "- `ubuntu-20.04`",
  );
});

test("sortVersions orders numerically, not lexically", () => {
  assert.deepEqual(
    lists.sortVersions(["3.2.10", "3.2.2", "3.4.5", "3.2.9"]),
    ["3.2.2", "3.2.9", "3.2.10", "3.4.5"],
  );
});

test("versionsList sorts and renders bullets", () => {
  assert.equal(
    lists.versionsList(["3.4.5", "3.2.9"]),
    "- `3.2.9`\n- `3.4.5`",
  );
});

test("oldVersions flattens available minus current, sorted", () => {
  const available = {
    "3.2": ["3.2.8", "3.2.9", "3.2.10"],
    "3.4": ["3.4.4", "3.4.5"],
  };
  const current = ["3.2.10", "3.4.5"];
  assert.deepEqual(lists.oldVersions(available, current), [
    "3.2.8",
    "3.2.9",
    "3.4.4",
  ]);
});

test("checksumFor looks up the checksum for a version", () => {
  const metadata = [
    { version: "3.2.9", url: "u1", checksum: "aaa" },
    { version: "3.4.5", url: "u2", checksum: "bbb" },
  ];
  assert.equal(lists.checksumFor(metadata, "3.4.5"), "bbb");
  assert.equal(lists.checksumFor(metadata, "9.9.9"), "");
});

test("checkerExample renders sorted name/url/sha256 JSON", () => {
  const metadata = [
    { version: "3.4.5", url: "u2", checksum: "bbb" },
    { version: "3.2.9", url: "u1", checksum: "aaa" },
  ];
  assert.equal(
    lists.checkerExample(metadata),
    [
      "[",
      "  {",
      '    "name": "3.2.9",',
      '    "url": "u1",',
      '    "sha256": "aaa"',
      "  },",
      "  {",
      '    "name": "3.4.5",',
      '    "url": "u2",',
      '    "sha256": "bbb"',
      "  }",
      "]",
    ].join("\n"),
  );
});

test("renderTemplate replaces known keys and keeps others literal", () => {
  const template =
    "- `ruby:${RUBY_VERSION}-slim`\nlatest: ${LATEST_VERSION}\n${IMAGES_LIST}";
  const values = {
    LATEST_VERSION: "3.4.5",
    IMAGES_LIST: "- `ruby:${RUBY_VERSION}-slim`\n- `ubuntu:26.04`",
  };
  assert.equal(
    lists.renderTemplate(template, values),
    "- `ruby:${RUBY_VERSION}-slim`\nlatest: 3.4.5\n- `ruby:${RUBY_VERSION}-slim`\n- `ubuntu:26.04`",
  );
});
