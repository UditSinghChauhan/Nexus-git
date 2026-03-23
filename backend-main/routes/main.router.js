const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const vcsRouter = require("./vcs.router");

const mainRouter = express.Router();

mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issue", issueRouter);
mainRouter.use("/vcs", vcsRouter);

mainRouter.get("/", (req, res) => {
  res.json({ message: "Welcome!" });
});

module.exports = mainRouter;
