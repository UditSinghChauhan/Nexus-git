const fs = require("fs").promises;
const path = require("path");
const {
  getBranchHead,
  getCommitMetadataByHash,
  getCurrentBranch,
  getLatestCommitMetadata,
} = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath } = require("./paths");

async function readCommitSnapshot(commitHash) {
  const snapshot = new Map();
  if (!commitHash) {
    return snapshot;
  }

  const commitDir = path.join(getCommitsPath(), commitHash);
  const files = await fs.readdir(commitDir);

  for (const file of files) {
    if (file === "commit.json") {
      continue;
    }

    snapshot.set(file, await fs.readFile(path.join(commitDir, file), "utf-8"));
  }

  return snapshot;
}

function getParentHashes(commitMetadata) {
  if (!commitMetadata) {
    return [];
  }

  return [commitMetadata.parent1 || commitMetadata.parent, commitMetadata.parent2].filter(
    Boolean
  );
}

async function getDashboardData() {
  const repoPath = getRepoPath();
  const currentBranch = await getCurrentBranch(repoPath);
  const lastCommit = await getLatestCommitMetadata(repoPath);

  return {
    repoName: path.basename(path.resolve(repoPath, "..")),
    currentBranch,
    lastCommit,
  };
}

async function listFiles() {
  const repoPath = getRepoPath();
  const currentBranch = await getCurrentBranch(repoPath);
  const headHash = await getBranchHead(repoPath, currentBranch);
  const snapshot = await readCommitSnapshot(headHash);

  return Array.from(snapshot.entries()).map(([name, content]) => ({
    name,
    size: Buffer.byteLength(content, "utf-8"),
  }));
}

async function getFileContent(fileName) {
  const repoPath = getRepoPath();
  const currentBranch = await getCurrentBranch(repoPath);
  const headHash = await getBranchHead(repoPath, currentBranch);
  const snapshot = await readCommitSnapshot(headHash);

  if (!snapshot.has(fileName)) {
    throw new Error(`File ${fileName} not found in the current branch.`);
  }

  return {
    name: fileName,
    content: snapshot.get(fileName),
  };
}

async function listCommits() {
  const repoPath = getRepoPath();
  const currentBranch = await getCurrentBranch(repoPath);
  const headHash = await getBranchHead(repoPath, currentBranch);
  const queue = [headHash];
  const visited = new Set();
  const commits = [];

  while (queue.length > 0) {
    const currentHash = queue.shift();
    if (!currentHash || visited.has(currentHash)) {
      continue;
    }

    visited.add(currentHash);
    const metadata = await getCommitMetadataByHash(repoPath, currentHash);
    if (!metadata) {
      continue;
    }

    commits.push(metadata);
    queue.push(...getParentHashes(metadata));
  }

  commits.sort(
    (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
  );

  return commits;
}

async function getCommitDetails(commitHash) {
  const repoPath = getRepoPath();
  const commit = await getCommitMetadataByHash(repoPath, commitHash);

  if (!commit) {
    throw new Error(`Commit ${commitHash} not found.`);
  }

  return commit;
}

function buildDiffLines(previousContent, nextContent) {
  const previousLines = previousContent.split(/\r?\n/);
  const nextLines = nextContent.split(/\r?\n/);
  const rowCount = previousLines.length;
  const columnCount = nextLines.length;
  const dp = Array.from({ length: rowCount + 1 }, () =>
    Array(columnCount + 1).fill(0)
  );

  for (let row = rowCount - 1; row >= 0; row -= 1) {
    for (let col = columnCount - 1; col >= 0; col -= 1) {
      if (previousLines[row] === nextLines[col]) {
        dp[row][col] = dp[row + 1][col + 1] + 1;
      } else {
        dp[row][col] = Math.max(dp[row + 1][col], dp[row][col + 1]);
      }
    }
  }

  const diffLines = [];
  let row = 0;
  let col = 0;

  while (row < rowCount && col < columnCount) {
    if (previousLines[row] === nextLines[col]) {
      diffLines.push({ type: "context", content: previousLines[row] });
      row += 1;
      col += 1;
      continue;
    }

    if (dp[row + 1][col] >= dp[row][col + 1]) {
      diffLines.push({ type: "removed", content: previousLines[row] });
      row += 1;
    } else {
      diffLines.push({ type: "added", content: nextLines[col] });
      col += 1;
    }
  }

  while (row < rowCount) {
    diffLines.push({ type: "removed", content: previousLines[row] });
    row += 1;
  }

  while (col < columnCount) {
    diffLines.push({ type: "added", content: nextLines[col] });
    col += 1;
  }

  return diffLines;
}

async function getCommitDiff(fromHash, toHash) {
  const fromSnapshot = await readCommitSnapshot(fromHash);
  const toSnapshot = await readCommitSnapshot(toHash);
  const allFiles = new Set([...fromSnapshot.keys(), ...toSnapshot.keys()]);
  const files = [];

  for (const fileName of allFiles) {
    const previousContent = fromSnapshot.get(fileName) || "";
    const nextContent = toSnapshot.get(fileName) || "";

    if (previousContent === nextContent) {
      continue;
    }

    files.push({
      name: fileName,
      lines: buildDiffLines(previousContent, nextContent),
    });
  }

  return {
    fromHash,
    toHash,
    files,
  };
}

module.exports = {
  getCommitDetails,
  getCommitDiff,
  getDashboardData,
  getFileContent,
  listCommits,
  listFiles,
};
