const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/userModel");

function signToken(user) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
}

function buildAuthResponse(user) {
  return {
    token: signToken(user),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
}

async function signup(req, res) {
  const { username, password, email } = req.body;

  try {
    // Input validation
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required!" });
    }

    // Username validation
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters!" });
    }

    // Email validation (basic format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address!" });
    }

    // Password validation
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters!" });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already in use!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    });

    res.status(201).json(buildAuthResponse(newUser));
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).json({ message: "Server error during signup" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    // Email validation (basic format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address!" });
    }

    // Password validation
    if (typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Invalid email or password!" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    res.json(buildAuthResponse(user));
  } catch (err) {
    console.error("Error during login : ", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({}, "username");
    res.json(users);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function getUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(currentID)) {
      return res.status(400).json({ message: "Invalid user id!" });
    }

    const user = await User.findById(currentID, "-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(currentID)) {
      return res.status(400).json({ message: "Invalid user id!" });
    }

    const updateFields = {};
    if (email) {
      updateFields.email = email.trim().toLowerCase();
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentID,
      { $set: updateFields },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(currentID)) {
      return res.status(400).json({ message: "Invalid user id!" });
    }

    const result = await User.deleteOne({ _id: currentID });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).json({ message: "Server error!" });
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
