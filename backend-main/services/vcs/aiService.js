const fs = require("fs").promises;
const path = require("path");
const OpenAI = require("openai");
const { getLatestCommitMetadata } = require("../../utils/commitMetadata");
const { getRepoPath, getStagingPath } = require("./paths");
const { getCommitDiff } = require("./queryService");

function inferProviderFromKey() {
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY?.startsWith("AIza")) {
    return "gemini";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }

  return null;
}

function getAIProvider() {
  return (process.env.AI_PROVIDER || inferProviderFromKey() || "openai")
    .trim()
    .toLowerCase();
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
}

function normalizeGeminiModel(modelName) {
  return (modelName || "gemini-2.0-flash").replace(/^models\//, "");
}

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function createGeminiResponse({ systemPrompt, userPrompt }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = normalizeGeminiModel(
    process.env.GEMINI_MODEL || "gemini-2.0-flash"
  );
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.error?.message ||
      `Gemini request failed with status ${response.status}.`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  const text =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}

async function createTextResponse({ systemPrompt, userPrompt }) {
  const provider = getAIProvider();

  if (provider === "gemini") {
    return createGeminiResponse({ systemPrompt, userPrompt });
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  return response.output_text.trim();
}

function normalizeAIError(err) {
  const status = err?.status || err?.code || err?.cause?.status;
  const rawMessage = err?.message || "AI request failed.";

  if (status === 429 || /quota|billing|rate limit|insufficient|resource exhausted/i.test(rawMessage)) {
    return "AI features are temporarily unavailable because the configured AI provider quota has been reached. Add credits or use a different key to continue.";
  }

  if (/api key|authentication|permission denied|api_key_invalid|invalid argument/i.test(rawMessage)) {
    return "AI features are unavailable because the configured AI API key is invalid or not authorized.";
  }

  return rawMessage;
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
  try {
    const stagedChanges = await buildStagedChangeSummary();
    if (stagedChanges.length === 0) {
      throw new Error("No staged changes found.");
    }

    return {
      message: await createTextResponse({
        systemPrompt:
          "You generate short, clear git-style commit messages. Respond with only the commit message.",
        userPrompt: `Suggest a concise commit message for these staged changes:\n${JSON.stringify(
          stagedChanges,
          null,
          2
        )}`,
      }),
    };
  } catch (err) {
    throw new Error(normalizeAIError(err));
  }
}

async function explainCommitDiff(fromHash, toHash) {
  try {
    const diff = await getCommitDiff(fromHash, toHash);

    return {
      explanation: await createTextResponse({
        systemPrompt:
          "You explain code diffs in simple language for developers. Keep the answer brief and practical.",
        userPrompt: `Explain what changed in this diff in plain English:\n${JSON.stringify(
          diff,
          null,
          2
        )}`,
      }),
    };
  } catch (err) {
    throw new Error(normalizeAIError(err));
  }
}

module.exports = {
  explainCommitDiff,
  generateCommitMessageSuggestion,
};
