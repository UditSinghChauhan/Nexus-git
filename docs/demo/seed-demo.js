const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Resolve backend-main directory relative to this script's location
const BACKEND_DIR = path.resolve(__dirname, "../../backend-main");

dotenv.config({ path: path.join(BACKEND_DIR, ".env") });

const { initRepo } = require(path.join(BACKEND_DIR, "controllers/init"));
const { addRepo } = require(path.join(BACKEND_DIR, "controllers/add"));
const { commitRepo } = require(path.join(BACKEND_DIR, "controllers/commit"));
const {
  createBranchRepo,
  checkoutBranchRepo,
  mergeBranchRepo,
} = require(path.join(BACKEND_DIR, "controllers/branch"));


const WORKSPACE = process.env.VCS_WORKSPACE_ROOT;

if (!WORKSPACE) {
  console.error("\n❌  VCS_WORKSPACE_ROOT is not set in .env\n");
  process.exit(1);
}

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", cyan: "\x1b[36m",
  green: "\x1b[32m", yellow: "\x1b[33m", gray: "\x1b[90m", white: "\x1b[97m",
};

function log(msg) {
  console.log(`${c.cyan}▶${c.reset}  ${msg}`);
}

function write(filename, content) {
  const filePath = path.join(WORKSPACE, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  ${c.gray}wrote ${filename}${c.reset}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function seed() {
  console.log(`\n${c.bold}${c.white}  Nexus Demo Workspace Seeder${c.reset}`);
  console.log(`${c.gray}  Workspace: ${WORKSPACE}${c.reset}\n`);

  // Ensure workspace directory exists
  if (!fs.existsSync(WORKSPACE)) {
    fs.mkdirSync(WORKSPACE, { recursive: true });
    log(`Created workspace directory`);
  }

  // ── 1. Init ────────────────────────────────────────────────────────────────
  log("Initialising repository…");
  await initRepo();
  await sleep(300);

  // ── 2. First commit on main ───────────────────────────────────────────────
  log("Creating initial commit…");
  write("app.js", `// Nexus Demo App
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Nexus!');
});

module.exports = app;
`);
  await addRepo("app.js");
  await sleep(200);
  await commitRepo("initial commit: bootstrap express app");
  await sleep(300);

  // ── 3. Second commit on main ──────────────────────────────────────────────
  log("Second commit (docs)…");
  write("README.md", `# NexusDemo

A demo project tracked by the Nexus VCS.

## Setup

\`\`\`bash
npm install
node app.js
\`\`\`

## Features

- Custom file tracking
- SHA-256 snapshot storage
- Branch management
`);
  await addRepo("README.md");
  await sleep(200);
  await commitRepo("docs: add readme with setup instructions");
  await sleep(300);

  // ── 4. Third commit on main ───────────────────────────────────────────────
  log("Third commit (config)…");
  write("config.json", JSON.stringify({
    name: "nexus-demo",
    version: "1.0.0",
    port: 3000,
    environment: "development",
  }, null, 2));
  await addRepo("config.json");
  await sleep(200);
  await commitRepo("chore: add application config file");
  await sleep(300);

  // ── 5. Create feature branch ──────────────────────────────────────────────
  log("Creating feature/auth branch…");
  await createBranchRepo("feature/auth");
  await sleep(200);
  await checkoutBranchRepo("feature/auth");
  await sleep(300);

  // ── 6. Commits on feature/auth ────────────────────────────────────────────
  log("Feature commit 1 (auth handler)…");
  write("auth.js", `const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
`);
  await addRepo("auth.js");
  await sleep(200);
  await commitRepo("feat: add JWT token generation and verification");
  await sleep(300);

  log("Feature commit 2 (middleware)…");
  write("middleware.js", `const { verifyToken } = require('./auth');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authMiddleware };
`);
  await addRepo("middleware.js");
  await sleep(200);
  await commitRepo("feat: add auth middleware with bearer token validation");
  await sleep(300);

  // ── 7. Go back to main and merge ──────────────────────────────────────────
  log("Switching back to main…");
  await checkoutBranchRepo("main");
  await sleep(300);
  log("Merging feature/auth into main…");
  await mergeBranchRepo("feature/auth");
  await sleep(300);

  console.log(`\n${c.green}${c.bold}  ✓ Demo workspace seeded successfully!${c.reset}`);
  console.log(`${c.gray}  Branches : main, feature/auth`);
  console.log(`  Commits  : 6 commits + 1 merge commit`);
  console.log(`  Files    : app.js, README.md, config.json, auth.js, middleware.js${c.reset}`);
  console.log(`\n${c.cyan}  Start your servers and open http://localhost:5173${c.reset}\n`);
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
