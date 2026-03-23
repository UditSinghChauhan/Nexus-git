const {
  createBranchFromCurrent,
  switchBranch,
} = require("../services/vcs/branchService");
const { mergeBranch: mergeIntoCurrentBranch } = require("../services/vcs/mergeService");

async function createBranchRepo(branchName) {
  return createBranchFromCurrent(branchName);
}

async function checkoutBranchRepo(branchName) {
  return switchBranch(branchName);
}

async function mergeBranchRepo(branchName) {
  return mergeIntoCurrentBranch(branchName);
}

module.exports = {
  checkoutBranchRepo,
  createBranchRepo,
  mergeBranchRepo,
};
