const express = require("express");
const vcsController = require("../controllers/vcsController");

const vcsRouter = express.Router();

vcsRouter.get("/dashboard", vcsController.fetchDashboard);
vcsRouter.get("/files", vcsController.fetchFiles);
vcsRouter.get("/files/:name", vcsController.fetchFileContent);
vcsRouter.get("/commits", vcsController.fetchCommits);
vcsRouter.get("/commits/:hash", vcsController.fetchCommitDetails);
vcsRouter.get("/diff", vcsController.fetchCommitDiff);

module.exports = vcsRouter;
