const { addToStage } = require("../services/vcs/stagingService");

async function addRepo(filePath) {
  return addToStage(filePath);
}

module.exports = { addRepo };
