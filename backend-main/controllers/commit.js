const { commitChanges } = require("../services/vcs/commitService");

async function commitRepo(message) {
  return commitChanges(message);
}

module.exports = { commitRepo };
