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
const { setSocketServer } = require("./services/socketEvents");

dotenv.config();

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
      if (
        req.accepts("html") &&
        !req.path.startsWith("/user") &&
        !req.path.startsWith("/repo") &&
        !req.path.startsWith("/issue") &&
        !req.path.startsWith("/vcs")
      ) {
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
  setSocketServer(io);

  io.on("connection", (socket) => {
    socket.on("vcs:publish", ({ eventName, payload }) => {
      io.emit(eventName, payload);
    });

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

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
