const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const {
  COMMIT_FILE_NAME,
  getLatestCommitMetadata,
  writeHead,
} = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath, getStagingPath } = require("./paths");

async function commitChanges(message) {
  const repoPath = getRepoPath();
  const stagedPath = getStagingPath();
  const commitPath = getCommitsPath();

  try {
    const stagedFiles = await fs.readdir(stagedPath);
    if (stagedFiles.length === 0) {
      console.log("No files in staging area to commit.");
      return;
    }

    const parentCommit = await getLatestCommitMetadata(repoPath);
    const parentHash = parentCommit ? parentCommit.hash : null;
    const timestamp = new Date().toISOString();
    const sortedFiles = [...stagedFiles].sort();
    const commitHasher = crypto.createHash("sha256");

    commitHasher.update(parentHash || "");
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
      parent: parentHash,
      message,
      timestamp,
      files: sortedFiles,
    };

    await fs.writeFile(
      path.join(commitDir, COMMIT_FILE_NAME),
      JSON.stringify(commitMetadata, null, 2),
      "utf-8"
    );

    await writeHead(repoPath, hash);

    console.log(`Commit ${hash} created with message: ${message}`);
  } catch (err) {
    console.error("Error committing files : ", err);
  }
}

async function revertToCommit(commitID) {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();

  try {
    const commitDir = path.join(commitsPath, commitID);
    const files = await fs.readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      if (file === COMMIT_FILE_NAME) {
        continue;
      }

      await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }

    await writeHead(repoPath, commitID);

    console.log(`Commit ${commitID} reverted successfully!`);
  } catch (err) {
    console.error("Unable to revert : ", err);
  }
}

module.exports = {
  commitChanges,
  revertToCommit,
};
