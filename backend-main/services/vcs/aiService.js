const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
const { getLatestCommitMetadata } = require("../../utils/commitMetadata");
const { getRepoPath, getStagingPath } = require("./paths");
const { getCommitDiff } = require("./queryService");

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async function readCommitSnapshot(commitHash) {
  const snapshot = new Map();
  if (!commitHash) {
    return snapshot;
  }

  const commitDir = path.join(getRepoPath(), "commits", commitHash);
  const files = await fs.readdir(commitDir);

  for (const file of files) {
    if (file === "commit.json") {
      continue;
    }

    snapshot.set(file, await fs.readFile(path.join(commitDir, file), "utf-8"));
  }

  return snapshot;
}

async function buildStagedChangeSummary() {
  const repoPath = getRepoPath();
  const stagingPath = getStagingPath();
  const latestCommit = await getLatestCommitMetadata(repoPath);
  const previousSnapshot = await readCommitSnapshot(latestCommit?.hash || null);
  const stagedFiles = await fs.readdir(stagingPath).catch(() => []);

  if (stagedFiles.length === 0) {
    return [];
  }

  const summaries = [];

  for (const fileName of stagedFiles.sort()) {
    const nextContent = await fs.readFile(path.join(stagingPath, fileName), "utf-8");
    const previousContent = previousSnapshot.get(fileName) || "";

    summaries.push({
      fileName,
      previousContent: previousContent.slice(0, 4000),
      nextContent: nextContent.slice(0, 4000),
    });
  }

  return summaries;
}

async function generateCommitMessageSuggestion() {
  const stagedChanges = await buildStagedChangeSummary();
  if (stagedChanges.length === 0) {
    throw new Error("No staged changes found.");
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "You generate short, clear git-style commit messages. Respond with only the commit message.",
      },
      {
        role: "user",
        content: `Suggest a concise commit message for these staged changes:\n${JSON.stringify(
          stagedChanges,
          null,
          2
        )}`,
      },
    ],
  });

  return {
    message: response.output_text.trim(),
  };
}

async function explainCommitDiff(fromHash, toHash) {
  const diff = await getCommitDiff(fromHash, toHash);
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content:
          "You explain code diffs in simple language for developers. Keep the answer brief and practical.",
      },
      {
        role: "user",
        content: `Explain what changed in this diff in plain English:\n${JSON.stringify(
          diff,
          null,
          2
        )}`,
      },
    ],
  });

  return {
    explanation: response.output_text.trim(),
  };
}

module.exports = {
  explainCommitDiff,
  generateCommitMessageSuggestion,
};
