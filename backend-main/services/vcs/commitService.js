const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { emitSocketEvent } = require("../socketEvents");
const {
  COMMIT_FILE_NAME,
  getCurrentBranch,
  getLatestCommitMetadata,
  updateBranchHead,
} = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath, getStagingPath } = require("./paths");

async function createCommitFromStage({
  currentBranch,
  message,
  parent1 = null,
  parent2 = null,
  repoPath = getRepoPath(),
}) {
  const stagedPath = getStagingPath();
  const commitPath = getCommitsPath();
  const stagedFiles = await fs.readdir(stagedPath);

  if (stagedFiles.length === 0) {
    console.log("No files in staging area to commit.");
    return null;
  }

  const timestamp = new Date().toISOString();
  const sortedFiles = [...stagedFiles].sort();
  const commitHasher = crypto.createHash("sha256");

  commitHasher.update(parent1 || "");
  commitHasher.update(parent2 || "");
  commitHasher.update(timestamp);

  for (const fileName of sortedFiles) {
    const fileBuffer = await fs.readFile(path.join(stagedPath, fileName));
    commitHasher.update(fileName);
    commitHasher.update(fileBuffer);
  }

  const hash = commitHasher.digest("hex");
  const commitDir = path.join(commitPath, hash);
  await fs.mkdir(commitDir, { recursive: true });

  for (const file of sortedFiles) {
    await fs.copyFile(path.join(stagedPath, file), path.join(commitDir, file));
  }

  const commitMetadata = {
    hash,
    parent: parent1,
    parent1,
    message,
    timestamp,
    files: sortedFiles,
  };

  if (parent2) {
    commitMetadata.parent2 = parent2;
  }

  await fs.writeFile(
    path.join(commitDir, COMMIT_FILE_NAME),
    JSON.stringify(commitMetadata, null, 2),
    "utf-8"
  );

  await updateBranchHead(repoPath, currentBranch, hash);
  emitSocketEvent("vcs:commit-created", {
    branch: currentBranch,
    hash,
    message,
    timestamp,
    parent1,
    parent2,
  });
  emitSocketEvent("vcs:branch-updated", {
    branch: currentBranch,
    head: hash,
  });

  console.log(`Commit ${hash} created with message: ${message}`);
  return hash;
}

async function commitChanges(message) {
  const repoPath = getRepoPath();

  try {
    const currentBranch = await getCurrentBranch(repoPath);
    const parentCommit = await getLatestCommitMetadata(repoPath);
    const parentHash = parentCommit ? parentCommit.hash : null;
    await createCommitFromStage({
      currentBranch,
      message,
      parent1: parentHash,
      repoPath,
    });
  } catch (err) {
    console.error("Error committing files : ", err);
  }
}

async function revertToCommit(commitID) {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();

  try {
    const currentBranch = await getCurrentBranch(repoPath);
    const commitDir = path.join(commitsPath, commitID);
    const files = await fs.readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      if (file === COMMIT_FILE_NAME) {
        continue;
      }

      await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    await updateBranchHead(repoPath, currentBranch, commitID);
    emitSocketEvent("vcs:branch-updated", {
      branch: currentBranch,
      head: commitID,
    });

    console.log(`Commit ${commitID} reverted successfully!`);
  } catch (err) {
    console.error("Unable to revert : ", err);
  }
}

module.exports = {
  createCommitFromStage,
  commitChanges,
  revertToCommit,
};
