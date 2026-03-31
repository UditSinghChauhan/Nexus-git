const path = require("path");

const REPO_DIR_NAME = ".ourGit";

function getWorkspaceRoot() {
  return process.env.VCS_WORKSPACE_ROOT
    ? path.resolve(process.env.VCS_WORKSPACE_ROOT)
    : process.cwd();
}

function getRepoPath() {
  return path.join(getWorkspaceRoot(), REPO_DIR_NAME);
}

function getStagingPath() {
  return path.join(getRepoPath(), "staging");
}

function getCommitsPath() {
  return path.join(getRepoPath(), "commits");
}

function getBranchesPath() {
  return path.join(getRepoPath(), "branches.json");
}

module.exports = {
  REPO_DIR_NAME,
  getBranchesPath,
  getRepoPath,
  getWorkspaceRoot,
  getStagingPath,
  getCommitsPath,
};
