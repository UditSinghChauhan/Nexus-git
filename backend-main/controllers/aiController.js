const {
  explainCommitDiff,
  generateCommitMessageSuggestion,
} = require("../services/vcs/aiService");

async function suggestCommitMessage(req, res) {
  try {
    const result = await generateCommitMessageSuggestion();
    res.json(result);
  } catch (err) {
    console.error("Error during commit message suggestion : ", err.message);
    res.status(400).json({ error: err.message || "Unable to suggest commit message" });
  }
}

async function explainDiff(req, res) {
  const { fromHash, toHash } = req.body;

  try {
    const result = await explainCommitDiff(fromHash, toHash);
    res.json(result);
  } catch (err) {
    console.error("Error during diff explanation : ", err.message);
    res.status(400).json({ error: err.message || "Unable to explain diff" });
  }
}

module.exports = {
  explainDiff,
  suggestCommitMessage,
};
