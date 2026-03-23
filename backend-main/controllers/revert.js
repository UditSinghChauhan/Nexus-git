const { revertToCommit } = require("../services/vcs/commitService");

async function revertRepo(commitID) {
  return revertToCommit(commitID);
}

module.exports = { revertRepo };
