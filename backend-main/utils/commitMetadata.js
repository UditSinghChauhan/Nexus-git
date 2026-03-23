const fs = require("fs").promises;
const path = require("path");

const COMMIT_FILE_NAME = "commit.json";
const HEAD_FILE_NAME = "HEAD";
const BRANCHES_FILE_NAME = "branches.json";
const DEFAULT_BRANCH_NAME = "main";

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch (err) {
    return false;
  }
}

async function readJsonFile(filePath, fallbackValue) {
  if (!(await pathExists(filePath))) {
    return fallbackValue;
  }

  const rawContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(rawContent);
}

async function writeJsonFile(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
}

function normalizeCommitMetadata(rawCommit, commitFolderName, filesChanged = []) {
  const normalizedFiles = Array.isArray(rawCommit.files)
    ? rawCommit.files
    : Array.isArray(rawCommit.filesChanged)
      ? rawCommit.filesChanged
      : filesChanged.filter((file) => file !== COMMIT_FILE_NAME);
  const normalizedParent1 =
    rawCommit.parent1 || rawCommit.parent || rawCommit.parentHash || null;
  const normalizedParent2 = rawCommit.parent2 || null;

  return {
    hash: rawCommit.hash || commitFolderName || null,
    parent: normalizedParent1,
    parent1: normalizedParent1,
    parent2: normalizedParent2,
    parentHash: normalizedParent1,
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

async function ensureBranchState(repoPath) {
  const headPath = path.join(repoPath, HEAD_FILE_NAME);
  const branchesPath = path.join(repoPath, BRANCHES_FILE_NAME);
  const commitsPath = path.join(repoPath, "commits");

  let rawHead = null;
  if (await pathExists(headPath)) {
    rawHead = (await fs.readFile(headPath, "utf-8")).trim() || null;
  }

  if (!(await pathExists(branchesPath))) {
    const legacyHeadPath = rawHead
      ? path.join(commitsPath, rawHead)
      : null;
    const isLegacyCommitHead = legacyHeadPath
      ? await pathExists(legacyHeadPath)
      : false;
    const initialBranchName = isLegacyCommitHead
      ? DEFAULT_BRANCH_NAME
      : rawHead || DEFAULT_BRANCH_NAME;
    const initialBranches = {
      [initialBranchName]: isLegacyCommitHead ? rawHead : null,
    };
    await writeJsonFile(branchesPath, initialBranches);
    await fs.writeFile(headPath, initialBranchName, "utf-8");

    return {
      currentBranch: initialBranchName,
      branches: initialBranches,
    };
  }

  const branches = await readJsonFile(branchesPath, {
    [DEFAULT_BRANCH_NAME]: null,
  });
  const currentBranch = rawHead || DEFAULT_BRANCH_NAME;

  if (!Object.prototype.hasOwnProperty.call(branches, currentBranch)) {
    branches[currentBranch] = null;
    await writeJsonFile(branchesPath, branches);
  }

  if (rawHead !== currentBranch) {
    await fs.writeFile(headPath, currentBranch, "utf-8");
  }

  return {
    currentBranch,
    branches,
  };
}

async function readHead(repoPath) {
  const { currentBranch } = await ensureBranchState(repoPath);
  return currentBranch;
}

async function writeHead(repoPath, branchName) {
  const headPath = path.join(repoPath, HEAD_FILE_NAME);
  await fs.writeFile(headPath, branchName || DEFAULT_BRANCH_NAME, "utf-8");
}

async function readBranches(repoPath) {
  const { branches } = await ensureBranchState(repoPath);
  return branches;
}

async function writeBranches(repoPath, branches) {
  const branchesPath = path.join(repoPath, BRANCHES_FILE_NAME);
  await writeJsonFile(branchesPath, branches);
}

async function getCurrentBranch(repoPath) {
  return readHead(repoPath);
}

async function getBranchHead(repoPath, branchName) {
  const branches = await readBranches(repoPath);
  return branches[branchName] || null;
}

async function updateBranchHead(repoPath, branchName, hash) {
  const branches = await readBranches(repoPath);
  branches[branchName] = hash || null;
  await writeBranches(repoPath, branches);
  await writeHead(repoPath, branchName);
}

async function hasBranch(repoPath, branchName) {
  const branches = await readBranches(repoPath);
  return Object.prototype.hasOwnProperty.call(branches, branchName);
}

async function createBranch(repoPath, branchName, hash) {
  const branches = await readBranches(repoPath);
  if (Object.prototype.hasOwnProperty.call(branches, branchName)) {
    throw new Error(`Branch ${branchName} already exists.`);
  }

  branches[branchName] = hash || null;
  await writeBranches(repoPath, branches);
}

async function getLatestCommitMetadata(repoPath, branchName) {
  const commitsPath = path.join(repoPath, "commits");
  const activeBranch = branchName || (await getCurrentBranch(repoPath));
  const headHash = await getBranchHead(repoPath, activeBranch);

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

async function getCommitMetadataByHash(repoPath, commitHash) {
  if (!commitHash) {
    return null;
  }

  const commitPath = path.join(repoPath, "commits", commitHash);
  if (!(await pathExists(commitPath))) {
    return null;
  }

  return readCommitMetadata(commitPath);
}

module.exports = {
  BRANCHES_FILE_NAME,
  COMMIT_FILE_NAME,
  DEFAULT_BRANCH_NAME,
  HEAD_FILE_NAME,
  createBranch,
  ensureBranchState,
  getBranchHead,
  getCommitMetadataByHash,
  getCurrentBranch,
  getLatestCommitMetadata,
  hasBranch,
  normalizeCommitMetadata,
  readCommitMetadata,
  readBranches,
  updateBranchHead,
  writeHead,
  writeBranches,
};
