const { initRepository } = require("../services/vcs/initService");

async function initRepo() {
  return initRepository();
}

module.exports = { initRepo };
