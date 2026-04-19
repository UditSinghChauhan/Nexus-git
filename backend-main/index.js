const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const mainRouter = require("./routes/main.router");
const path = require("path");
const fs = require("fs");
const { setSocketServer } = require("./services/socketEvents");

dotenv.config({ path: path.join(__dirname, ".env") });

function getAllowedOrigins() {
  const explicitOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ].filter(Boolean);

  return explicitOrigins.length ? [...new Set(explicitOrigins)] : ["http://localhost:5173"];
}

function isAllowedDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production" || !origin) {
    return false;
  }

  return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
}

function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = ["MONGODB_URI", "JWT_SECRET_KEY"].filter(
    (key) => !process.env[key]
  );

  if (!process.env.FRONTEND_URL && !process.env.FRONTEND_URLS) {
    missing.push("FRONTEND_URL or FRONTEND_URLS");
  }

  if (missing.length) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }
}

function startServer() {
  validateProductionEnv();

  const app = express();
  const port = process.env.PORT || 3000;
  const allowedOrigins = getAllowedOrigins();

  app.use(bodyParser.json());
  app.use(express.json());

  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    mongoose
      .connect(mongoURI)
      .then(() => console.log("MongoDB connected!"))
      .catch((err) => console.error("Unable to connect : ", err));
  } else {
    console.log("MONGODB_URI not set, skipping DB connection (dev mode)");
  }

  // CORS Configuration - Production Ready
  app.use(
    cors({
      origin(origin, callback) {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          isAllowedDevelopmentOrigin(origin)
        ) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Health Check Endpoint - For deployment monitoring
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
  });

  // Rate Limiting - Protect auth endpoints from brute force
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many attempts, please try again later",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  const strictAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Strong rate limiting on auth endpoints
    message: "Too many login/signup attempts, please try again later",
    skipSuccessfulRequests: false, // Count successful requests too
  });

  // Apply rate limiting to auth routes
  app.use("/user/signup", strictAuthLimiter);
  app.use("/user/login", strictAuthLimiter);

  app.use("/", mainRouter);

  // Serve frontend build if present after API routes.
  const clientBuildPath = path.join(__dirname, "..", "frontend-main", "dist");
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get("/", (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")));
    app.get("/*", (req, res, next) => {
      if (
        req.accepts("html") &&
        !req.path.startsWith("/user") &&
        !req.path.startsWith("/repo") &&
        !req.path.startsWith("/issue") &&
        !req.path.startsWith("/vcs") &&
        req.path !== "/health"
      ) {
        return res.sendFile(path.join(clientBuildPath, "index.html"));
      }
      next();
    });
    console.log("Serving frontend from:", clientBuildPath);
  }

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PATCH"],
      credentials: true,
    },
  });
  setSocketServer(io);

  io.on("connection", (socket) => {
    socket.on("vcs:publish", ({ eventName, payload }) => {
      io.emit(eventName, payload);
    });

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });
  });


  httpServer.listen(port, () => {
    const ws = process.env.VCS_WORKSPACE_ROOT || "Not configured";
    const c = { reset: "\x1b[0m", bold: "\x1b[1m", cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", gray: "\x1b[90m", white: "\x1b[97m" };
    console.log(`\n${c.cyan}${c.bold}  ╔══════════════════════════════════════════════╗${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ║           NEXUS VCS — Server Ready           ║${c.reset}`);
    console.log(`${c.cyan}${c.bold}  ╚══════════════════════════════════════════════╝${c.reset}`);
    console.log(`${c.gray}  ┌─────────────────────────────────────────────${c.reset}`);
    console.log(`${c.gray}  │${c.reset}  ${c.white}API:${c.reset}       ${c.green}http://localhost:${port}${c.reset}`);
    console.log(`${c.gray}  │${c.reset}  ${c.white}Workspace:${c.reset} ${c.yellow}${ws}${c.reset}`);
    console.log(`${c.gray}  │${c.reset}  ${c.white}Socket.io:${c.reset} ${c.green}enabled (realtime events)${c.reset}`);
    console.log(`${c.gray}  └─────────────────────────────────────────────${c.reset}\n`);
  });

}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
