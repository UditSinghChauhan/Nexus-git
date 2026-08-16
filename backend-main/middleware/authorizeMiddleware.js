const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");

function authorizeSelf(req, res, next) {
  const authenticatedId = req.userId;

  if (!authenticatedId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const paramId =
    req.params.id || req.params.userID || req.body.userId || req.body.owner;

  if (paramId && paramId.toString() !== authenticatedId.toString()) {
    return res
      .status(403)
      .json({ message: "Forbidden: not allowed to access this resource" });
  }

  next();
}

async function authorizeRepoOwner(req, res, next) {
  const authenticatedId = req.userId;
  const repoId = req.params.id;

  if (!authenticatedId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const repository = await Repository.findById(repoId).select("owner");

    if (!repository) {
      return res.status(404).json({ message: "Repository not found!" });
    }

    if (repository.owner.toString() !== authenticatedId.toString()) {
      return res.status(403).json({
        message: "Forbidden: not allowed to access this repository",
      });
    }

    req.repository = repository;
    next();
  } catch (err) {
    console.error("Authorization error:", err && err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

async function authorizeIssueOwner(req, res, next) {
  const authenticatedId = req.userId;
  const issueId = req.params.id;

  if (!authenticatedId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const issue = await Issue.findById(issueId).select("repository");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found!" });
    }

    const repository = await Repository.findById(issue.repository).select("owner");

    if (!repository) {
      return res.status(404).json({ message: "Repository not found!" });
    }

    if (repository.owner.toString() !== authenticatedId.toString()) {
      return res.status(403).json({
        message: "Forbidden: not allowed to access this issue",
      });
    }

    req.issue = issue;
    req.repository = repository;
    next();
  } catch (err) {
    console.error("Authorization error:", err && err.message);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  authorizeSelf,
  authorizeRepoOwner,
  authorizeIssueOwner,
};
