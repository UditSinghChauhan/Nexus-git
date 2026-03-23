const { pushRepository } = require("../services/vcs/storageService");

async function pushRepo() {
  return pushRepository();
}

module.exports = { pushRepo };
