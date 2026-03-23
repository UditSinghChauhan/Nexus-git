const fs = require("fs").promises;
const path = require("path");
const {
  COMMIT_FILE_NAME,
  createBranch,
  getBranchHead,
  getCurrentBranch,
  hasBranch,
  updateBranchHead,
  writeHead,
} = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath } = require("./paths");

async function createBranchFromCurrent(branchName) {
  const repoPath = getRepoPath();

  try {
    const currentBranch = await getCurrentBranch(repoPath);
    const currentHead = await getBranchHead(repoPath, currentBranch);

    await createBranch(repoPath, branchName, currentHead);

    console.log(
      `Branch ${branchName} created from ${currentBranch} at ${currentHead || "root"}.`
    );
  } catch (err) {
    console.error("Unable to create branch : ", err.message || err);
  }
}

async function switchBranch(branchName) {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();

  try {
    if (!(await hasBranch(repoPath, branchName))) {
      throw new Error(`Branch ${branchName} does not exist.`);
    }

    const targetHead = await getBranchHead(repoPath, branchName);

    await writeHead(repoPath, branchName);

    if (targetHead) {
      const commitDir = path.join(commitsPath, targetHead);
      const files = await fs.readdir(commitDir);
      const parentDir = path.resolve(repoPath, "..");

      for (const file of files) {
        if (file === COMMIT_FILE_NAME) {
          continue;
        }

        await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
      }
    }

    await updateBranchHead(repoPath, branchName, targetHead);

    console.log(`Switched to branch ${branchName}.`);
  } catch (err) {
    console.error("Unable to switch branch : ", err.message || err);
  }
}

module.exports = {
  createBranchFromCurrent,
  switchBranch,
};
