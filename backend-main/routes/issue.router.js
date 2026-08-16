const express = require("express");
const issueController = require("../controllers/issueController");
const authenticate = require("../middleware/authMiddleware");
const {
  authorizeRepoOwner,
  authorizeIssueOwner,
} = require("../middleware/authorizeMiddleware");

const issueRouter = express.Router();

issueRouter.use(authenticate);

// Repository-scoped: ":id" is the repository id, authorized against its owner.
issueRouter.post("/create/:id", authorizeRepoOwner, issueController.createIssue);
issueRouter.get("/all/:id", authorizeRepoOwner, issueController.getAllIssues);

// Issue-scoped: ":id" is the issue id, authorized against the owning repository.
issueRouter.put("/update/:id", authorizeIssueOwner, issueController.updateIssueById);
issueRouter.delete("/delete/:id", authorizeIssueOwner, issueController.deleteIssueById);
issueRouter.get("/:id", authorizeIssueOwner, issueController.getIssueById);

module.exports = issueRouter;
