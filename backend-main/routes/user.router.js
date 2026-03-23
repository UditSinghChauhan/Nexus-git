const express = require("express");
const userController = require("../controllers/userController");
const authenticate = require("../middleware/authMiddleware");
const { authorizeSelf } = require("../middleware/authorizeMiddleware");

const userRouter = express.Router();

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
// Protect update and delete operations
userRouter.put(
	"/updateProfile/:id",
	authenticate,
	authorizeSelf,
	userController.updateUserProfile
);
userRouter.delete(
	"/deleteProfile/:id",
	authenticate,
	authorizeSelf,
	userController.deleteUserProfile
);

module.exports = userRouter;
