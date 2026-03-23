const path = require("path");

const REPO_DIR_NAME = ".ourGit";

function getRepoPath() {
  return path.resolve(process.cwd(), REPO_DIR_NAME);
}

function getStagingPath() {
  return path.join(getRepoPath(), "staging");
}

function getCommitsPath() {
  return path.join(getRepoPath(), "commits");
}

module.exports = {
  REPO_DIR_NAME,
  getRepoPath,
  getStagingPath,
  getCommitsPath,
};
