const fs = require("fs").promises;
const path = require("path");

const COMMIT_FILE_NAME = "commit.json";
const HEAD_FILE_NAME = "HEAD";

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (err) {
    return false;
  }
}

function normalizeCommitMetadata(rawCommit, commitFolderName, filesChanged = []) {
  const normalizedFiles = Array.isArray(rawCommit.files)
    ? rawCommit.files
    : Array.isArray(rawCommit.filesChanged)
      ? rawCommit.filesChanged
      : filesChanged.filter((file) => file !== COMMIT_FILE_NAME);
  const normalizedParent = rawCommit.parent || rawCommit.parentHash || null;

  return {
    hash: rawCommit.hash || commitFolderName || null,
    parent: normalizedParent,
    parentHash: normalizedParent,
    timestamp: rawCommit.timestamp || rawCommit.date || null,
    message: rawCommit.message || "",
    files: normalizedFiles,
    filesChanged: normalizedFiles,
  };
}

async function readCommitMetadata(commitDirPath) {
  const metadataPath = path.join(commitDirPath, COMMIT_FILE_NAME);
  const rawMetadata = await fs.readFile(metadataPath, "utf-8");
  const parsedMetadata = JSON.parse(rawMetadata);
  const files = await fs.readdir(commitDirPath);

  return normalizeCommitMetadata(
    parsedMetadata,
    path.basename(commitDirPath),
    files
  );
}

async function listCommitDirectories(commitsPath) {
  if (!(await pathExists(commitsPath))) {
    return [];
  }

  const entries = await fs.readdir(commitsPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function readHead(repoPath) {
  const headPath = path.join(repoPath, HEAD_FILE_NAME);
  if (!(await pathExists(headPath))) {
    return null;
  }

  const headHash = await fs.readFile(headPath, "utf-8");
  return headHash.trim() || null;
}

async function writeHead(repoPath, hash) {
  const headPath = path.join(repoPath, HEAD_FILE_NAME);
  await fs.writeFile(headPath, hash || "", "utf-8");
}

async function getLatestCommitMetadata(repoPath) {
  const commitsPath = path.join(repoPath, "commits");
  const headHash = await readHead(repoPath);

  if (headHash) {
    const headCommitPath = path.join(commitsPath, headHash);
    if (await pathExists(headCommitPath)) {
      return readCommitMetadata(headCommitPath);
    }
  }

  const commitDirectories = await listCommitDirectories(commitsPath);
  if (commitDirectories.length === 0) {
    return null;
  }

  const commits = await Promise.all(
    commitDirectories.map(async (directoryName) => {
      const commitPath = path.join(commitsPath, directoryName);
      const commitMetadata = await readCommitMetadata(commitPath);
      const stats = await fs.stat(commitPath);

      return {
        ...commitMetadata,
        fallbackTime: stats.mtimeMs,
      };
    })
  );

  commits.sort((left, right) => {
    const leftTime = left.timestamp
      ? new Date(left.timestamp).getTime()
      : left.fallbackTime;
    const rightTime = right.timestamp
      ? new Date(right.timestamp).getTime()
      : right.fallbackTime;

    return rightTime - leftTime;
  });

  return commits[0];
}

module.exports = {
  COMMIT_FILE_NAME,
  HEAD_FILE_NAME,
  getLatestCommitMetadata,
  normalizeCommitMetadata,
  readCommitMetadata,
  writeHead,
};
