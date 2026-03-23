const fs = require("fs").promises;
const path = require("path");
const { HEAD_FILE_NAME } = require("../../utils/commitMetadata");
const { getCommitsPath, getRepoPath, getStagingPath } = require("./paths");

async function initRepository() {
  const repoPath = getRepoPath();
  const commitsPath = getCommitsPath();
  const stagingPath = getStagingPath();
  const headPath = path.join(repoPath, HEAD_FILE_NAME);

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });
    await fs.mkdir(stagingPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify({ bucket: process.env.S3_BUCKET })
    );

    try {
      await fs.access(headPath);
    } catch (err) {
      await fs.writeFile(headPath, "", "utf-8");
    }

    console.log("Repository initialised!");
  } catch (err) {
    console.error("Error initialising repository", err);
  }
}

module.exports = { initRepository };
