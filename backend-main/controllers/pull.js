const { pullRepository } = require("../services/vcs/storageService");

async function pullRepo() {
  return pullRepository();
}

module.exports = { pullRepo };
