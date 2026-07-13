"use strict";

// Pure helpers for deriving the README image/platform lists from the build
// matrix and the published container tags. Kept dependency-free so they can be
// unit tested with node:test and reused from actions/github-script.

function bullet(text) {
  return "- `" + text + "`";
}

function imageToBase(image) {
  if (image === "slim") {
    return "ruby:${RUBY_VERSION}-slim";
  }
  const match = image.match(/^ubuntu-(.+)$/);
  if (match) {
    return "ubuntu:" + match[1];
  }
  return image;
}

function imagesList(images) {
  return images.map((image) => bullet(imageToBase(image))).join("\n");
}

function platformsList(platforms) {
  return platforms.map((platform) => bullet("linux/" + platform)).join("\n");
}

// Read a single-line flow-sequence matrix value (e.g. `image: [a, b, c]`) for a
// given job from the raw text of a workflow file.
function extractMatrixArray(workflow, job, key) {
  const jobMatch = workflow.match(new RegExp("^  " + job + ":$", "m"));
  if (!jobMatch) {
    throw new Error("job '" + job + "' not found");
  }
  const rest = workflow.slice(jobMatch.index);
  const keyMatch = rest.match(new RegExp("^\\s*" + key + ":\\s*\\[([^\\]]*)\\]", "m"));
  if (!keyMatch) {
    throw new Error("matrix key '" + key + "' not found for job '" + job + "'");
  }
  return keyMatch[1]
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

// Distinct image suffixes present in tags like "3.4.5-ubuntu-24.04".
function suffixesFromTags(tags) {
  const suffixes = new Set();
  for (const tag of tags) {
    const match = tag.match(/^\d+\.\d+\.\d+-(.+)$/);
    if (match) {
      suffixes.add(match[1]);
    }
  }
  return [...suffixes];
}

// Suffixes that still exist in the registry but are no longer in the build matrix.
function deprecatedPlatforms(tags, maintainedImages) {
  const maintained = new Set(maintainedImages);
  return suffixesFromTags(tags)
    .filter((suffix) => !maintained.has(suffix))
    .sort();
}

function deprecatedPlatformsList(tags, maintainedImages) {
  return deprecatedPlatforms(tags, maintainedImages).map(bullet).join("\n");
}

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}

function sortVersions(versions) {
  return [...versions].sort(compareVersions);
}

function versionsList(versions) {
  return sortVersions(versions).map(bullet).join("\n");
}

// Available versions across all lines that are no longer the current build.
function oldVersions(available, current) {
  const currentSet = new Set(current);
  const all = new Set();
  for (const line of Object.values(available)) {
    for (const version of line) {
      all.add(version);
    }
  }
  return sortVersions([...all].filter((version) => !currentSet.has(version)));
}

function checksumFor(metadata, version) {
  const entry = metadata.find((item) => item.version === version);
  return entry ? entry.checksum : "";
}

// Sample `ruby-version-checker` output rendered from the release metadata.
function checkerExample(metadata) {
  const entries = [...metadata]
    .sort((a, b) => compareVersions(a.version, b.version))
    .map((item) => ({ name: item.version, url: item.url, sha256: item.checksum }));
  return JSON.stringify(entries, null, 2);
}

// Replace ${NAME} placeholders that we know about, leaving any others (e.g.
// ${RUBY_VERSION} in the code samples) untouched.
function renderTemplate(template, values) {
  return template.replace(/\$\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match,
  );
}

// Orchestrator invoked from actions/github-script: derives every list from the
// build matrix, the release metadata and the published container tags, then
// renders README.md from the template.
async function run({ github, context, core, current, available, metadata }) {
  const fs = require("fs");

  const sortedCurrent = sortVersions(current);
  const latest = sortedCurrent[sortedCurrent.length - 1];

  const workflow = fs.readFileSync(".github/workflows/build-push.yaml", "utf8");
  const images = extractMatrixArray(workflow, "build-test-push", "image");
  const platforms = extractMatrixArray(workflow, "build-test-push", "platform");

  const versions = await github.paginate(
    github.rest.packages.getAllPackageVersionsForPackageOwnedByUser,
    {
      package_type: "container",
      package_name: "ruby-jemalloc",
      username: context.repo.owner,
      per_page: 100,
    },
  );
  const tags = versions.flatMap(
    (version) =>
      (version.metadata &&
        version.metadata.container &&
        version.metadata.container.tags) ||
      [],
  );

  const values = {
    CURRENT_LIST: versionsList(sortedCurrent),
    OLD_LIST: versionsList(oldVersions(available, sortedCurrent)),
    LATEST_VERSION: latest,
    LATEST_CHECKSUM: checksumFor(metadata, latest),
    CHECKER_EXAMPLE: checkerExample(metadata),
    IMAGES_LIST: imagesList(images),
    PLATFORMS_LIST: platformsList(platforms),
    DEPRECATED_PLATFORMS_LIST: deprecatedPlatformsList(tags, images),
  };

  const template = fs.readFileSync("templates/README.template", "utf8");
  fs.writeFileSync("README.md", renderTemplate(template, values));
  core.info(`Rendered README.md for Ruby ${latest} and ${images.length} image targets`);
}

module.exports = {
  bullet,
  imageToBase,
  imagesList,
  platformsList,
  extractMatrixArray,
  suffixesFromTags,
  deprecatedPlatforms,
  deprecatedPlatformsList,
  compareVersions,
  sortVersions,
  versionsList,
  oldVersions,
  checksumFor,
  checkerExample,
  renderTemplate,
  run,
};
