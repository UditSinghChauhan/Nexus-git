const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes/main.router");
const path = require("path");
const fs = require("fs");

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const {
  checkoutBranchRepo,
  createBranchRepo,
  mergeBranchRepo,
} = require("./controllers/branch");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config();

yargs(hideBin(process.argv))//read the console data and hidebin is extracting the parameters of that 
  .command("start", "Starts a new server", {}, startServer)//custom command to start the server
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <file>",
    "Add a file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.file);
    }
  )
  .command(
    "branch <name>",
    "Create a new branch from the current HEAD",
    (yargs) => {
      yargs.positional("name", {
        describe: "Branch name",
        type: "string",
      });
    },
    (argv) => {
      createBranchRepo(argv.name);
    }
  )
  .command(
    "checkout <name>",
    "Switch to a branch",
    (yargs) => {
      yargs.positional("name", {
        describe: "Branch name",
        type: "string",
      });
    },
    (argv) => {
      checkoutBranchRepo(argv.name);
    }
  )
  .command(
    "merge <name>",
    "Merge a branch into the current branch",
    (yargs) => {
      yargs.positional("name", {
        describe: "Source branch name",
        type: "string",
      });
    },
    (argv) => {
      mergeBranchRepo(argv.name);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )
  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Comit ID to revert to",
        type: "string",
      });
    },
    (argv) => { 
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json());
  app.use(express.json());

  // Serve frontend build if present (static files served before API routes)
  const clientBuildPath = path.join(__dirname, "..", "frontend-main", "dist");
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    // serve index.html for unknown routes (SPA)
    app.get("/", (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")));
    app.get("/*", (req, res, next) => {
      // If request accepts html, send index.html, otherwise continue to API
      if (req.accepts("html") && !req.path.startsWith("/user") && !req.path.startsWith("/repo") && !req.path.startsWith("/issue")) {
        return res.sendFile(path.join(clientBuildPath, "index.html"));
      }
      next();
    });
    console.log("Serving frontend from:", clientBuildPath);
  }

  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    mongoose
      .connect(mongoURI)
      .then(() => console.log("MongoDB connected!"))
      .catch((err) => console.error("Unable to connect : ", err));
  } else {
    console.log("MONGODB_URI not set, skipping DB connection (dev mode)");
  }

  app.use(cors({ origin: "*" }));

  app.use("/", mainRouter);
  

  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("=====");
      console.log(user);
      console.log("=====");
      socket.join(userID);
    });
  });

  const db = mongoose.connection;

  db.once("open", async () => {
    console.log("CRUD operations called");
    // CRUD operations
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}
