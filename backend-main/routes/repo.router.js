const express = require("express");
const repoController = require("../controllers/repoController");
const authenticate = require("../middleware/authMiddleware");
const {
  authorizeSelf,
  authorizeRepoOwner,
} = require("../middleware/authorizeMiddleware");

const repoRouter = express.Router();

repoRouter.use(authenticate);

repoRouter.post("/create", repoController.createRepository);
repoRouter.get("/all", repoController.getAllRepositories);
repoRouter.get("/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/user/:userID", authorizeSelf, repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/:id", repoController.fetchRepositoryById);
repoRouter.put(
	"/update/:id",
	authorizeRepoOwner,
	repoController.updateRepositoryById
);
repoRouter.delete(
	"/delete/:id",
	authorizeRepoOwner,
	repoController.deleteRepositoryById
);
repoRouter.patch(
	"/toggle/:id",
	authorizeRepoOwner,
	repoController.toggleVisibilityById
);

module.exports = repoRouter;
