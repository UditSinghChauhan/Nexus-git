const express = require("express");
const aiController = require("../controllers/aiController");
const vcsController = require("../controllers/vcsController");
const authenticate = require("../middleware/authMiddleware");

const vcsRouter = express.Router();

vcsRouter.use(authenticate);

vcsRouter.get("/dashboard", vcsController.fetchDashboard);
vcsRouter.get("/files", vcsController.fetchFiles);
vcsRouter.get("/files/:name", vcsController.fetchFileContent);
vcsRouter.get("/commits", vcsController.fetchCommits);
vcsRouter.get("/commits/:hash", vcsController.fetchCommitDetails);
vcsRouter.get("/diff", vcsController.fetchCommitDiff);
vcsRouter.post("/ai/commit-message", aiController.suggestCommitMessage);
vcsRouter.post("/ai/explain-diff", aiController.explainDiff);

module.exports = vcsRouter;
