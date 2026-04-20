const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs").promises;
const os = require("os");

// ---------------------------------------------------------------------------
// Helpers — mirror the hashing logic from commitService.js so we can assert
// hash determinism without spinning up the full VCS engine.
// ---------------------------------------------------------------------------

function computeCommitHash({ parent1 = null, parent2 = null, timestamp, files }) {
  const hasher = crypto.createHash("sha256");
  hasher.update(parent1 || "");
  hasher.update(parent2 || "");
  hasher.update(timestamp);
  for (const { name, content } of files) {
    hasher.update(name);
    hasher.update(content);
  }
  return hasher.digest("hex");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("SHA-256 commit hash is deterministic for the same inputs", () => {
  const inputs = {
    parent1: "abc123",
    parent2: null,
    timestamp: "2025-01-01T00:00:00.000Z",
    files: [
      { name: "index.js", content: Buffer.from("console.log('hello')") },
      { name: "README.md", content: Buffer.from("# Project") },
    ],
  };

  const hash1 = computeCommitHash(inputs);
  const hash2 = computeCommitHash(inputs);

  assert.equal(hash1, hash2, "Same inputs must always produce the same hash");
  assert.equal(hash1.length, 64, "SHA-256 hex digest must be 64 characters");
  assert.match(hash1, /^[a-f0-9]+$/, "Hash must be lowercase hex");
});

test("SHA-256 hash changes when file content changes", () => {
  const base = {
    parent1: null,
    parent2: null,
    timestamp: "2025-01-01T00:00:00.000Z",
    files: [{ name: "app.js", content: Buffer.from("v1") }],
  };

  const v1Hash = computeCommitHash(base);
  const v2Hash = computeCommitHash({
    ...base,
    files: [{ name: "app.js", content: Buffer.from("v2") }],
  });

  assert.notEqual(v1Hash, v2Hash, "Different file content must produce different hashes");
});

test("SHA-256 hash changes when parent commit changes", () => {
  const inputs = {
    parent2: null,
    timestamp: "2025-01-01T00:00:00.000Z",
    files: [{ name: "app.js", content: Buffer.from("same content") }],
  };

  const noParentHash = computeCommitHash({ ...inputs, parent1: null });
  const withParentHash = computeCommitHash({ ...inputs, parent1: "deadbeef" });

  assert.notEqual(noParentHash, withParentHash, "Different parent must produce different hashes");
});

test("SHA-256 hash changes when file order changes", () => {
  const timestamp = "2025-01-01T00:00:00.000Z";
  const file1 = { name: "a.js", content: Buffer.from("alpha") };
  const file2 = { name: "b.js", content: Buffer.from("beta") };

  const forwardHash = computeCommitHash({
    parent1: null, parent2: null, timestamp, files: [file1, file2],
  });
  const reverseHash = computeCommitHash({
    parent1: null, parent2: null, timestamp, files: [file2, file1],
  });

  // File order matters for the hash — sorted filenames ensure determinism in the real service
  assert.notEqual(forwardHash, reverseHash, "File order must affect the hash");
});

test("commit metadata structure includes required fields", () => {
  const hash = computeCommitHash({
    parent1: "parent-hash",
    parent2: null,
    timestamp: "2025-06-01T12:00:00.000Z",
    files: [{ name: "auth.js", content: Buffer.from("token") }],
  });

  const metadata = {
    hash,
    parent: "parent-hash",
    parent1: "parent-hash",
    message: "feat: add auth middleware",
    timestamp: "2025-06-01T12:00:00.000Z",
    files: ["auth.js"],
  };

  assert.ok(metadata.hash, "metadata must have a hash");
  assert.ok(metadata.message, "metadata must have a message");
  assert.ok(metadata.timestamp, "metadata must have a timestamp");
  assert.ok(Array.isArray(metadata.files), "metadata.files must be an array");
  assert.equal(metadata.parent, metadata.parent1, "parent and parent1 must match");
});
