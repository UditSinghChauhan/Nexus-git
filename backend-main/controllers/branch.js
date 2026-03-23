const {
  createBranchFromCurrent,
  switchBranch,
} = require("../services/vcs/branchService");

async function createBranchRepo(branchName) {
  return createBranchFromCurrent(branchName);
}

async function checkoutBranchRepo(branchName) {
  return switchBranch(branchName);
}

module.exports = {
  checkoutBranchRepo,
  createBranchRepo,
};
