# Nexus

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**A custom Git-style Version Control System built from first principles — with a CLI, real-time browser dashboard, and AI-powered tooling.**

[Demo Video](#-demo-video) · [Architecture](./ARCHITECTURE.md) · [Deployment](./DEPLOYMENT.md)

</div>

---

## Problem Statement

Most developers use Git daily but rarely understand the underlying mechanics. Nexus was built to understand how version tracking, snapshot storage, commit history, and workspace restoration can be implemented from scratch — while exposing the full workflow through a practical full-stack interface.

## Solution Overview

Nexus stores repository metadata in a `.ourGit` directory, stages files before commit creation, generates SHA-256 commit identifiers, and persists each commit as a file snapshot. A Node.js backend exposes this state to both a CLI and a React dashboard, giving users a real-time view of repository history, branches, diffs, and file contents — with Socket.io pushing live updates to the browser as CLI operations happen.

## Key Features

| Feature | Description |
|---------|-------------|
| 🗂️ **Repository Init** | Bootstrap `.ourGit` metadata, staging area, and branch state |
| ➕ **File Staging** | Stage specific files into the next candidate commit |
| 🔏 **SHA-256 Commits** | Content-addressed commits with parent chain, files list, and timestamp |
| 🌿 **Branch Management** | Create, switch, and inspect branches — each with an independent HEAD |
| 🔀 **Merge** | Three-way merge with parent-2 metadata preserved |
| 📜 **History Traversal** | Full commit graph visualization with branch lane coloring |
| 🔍 **Diff Engine** | LCS-based line diff between any two commits with +/- output |
| 🤖 **AI Integration** | OpenAI-powered diff explanation and commit message suggestion |
| ⚡ **Realtime Sync** | Socket.io events push commit and branch updates to the browser instantly |
| 🖥️ **CLI** | `init • add • commit • branch • checkout • merge • log` |

## Why This Project Matters

Nexus demonstrates more than CRUD work. It shows:

- **Systems design**: file-system-based storage, hashing, snapshot deduplication trade-offs
- **Backend design**: modular Node.js service architecture, Socket.io event broadcasting
- **Full-stack integration**: authenticated React SPA with real-time API and protected routes
- **Algorithm implementation**: LCS diff engine, BFS commit history traversal
- **CLI engineering**: `yargs`-based command parsing with colored terminal output

## Tech Stack

### Backend
- Node.js · Express · MongoDB/Mongoose · Socket.io
- JWT authentication · `yargs` CLI · `crypto` SHA-256

### Frontend
- React 19 · Vite · React Router · Axios
- Tailwind CSS · React Flow (commit graph) · Inter + JetBrains Mono fonts

### Storage
- Local file-system snapshot storage (`.ourGit/` directory)

### AI
- OpenAI API (diff explanation, commit message generation)
- Provider-based abstraction (swap OpenAI ↔ Gemini via env)

### Tooling
- Node test runner · Vitest · ESLint

## Repository Layout

```text
backend-main/
  controllers/      # Route handlers (VCS, repo, user, AI, issue)
  middleware/       # Auth middleware
  models/           # Mongoose schemas
  routes/           # Express router
  services/
    vcs/            # Core VCS engine (commit, branch, merge, diff, query)
  tests/            # Backend unit tests
  utils/            # commitMetadata helpers
  cli.js            # CLI entry point
  index.js          # Express + Socket.io server

frontend-main/
  src/
    api/            # Axios API client
    components/
      auth/         # Login, Signup (dark premium forms)
      commits/      # CommitGraph (ReactFlow), CommitTable
      dashboard/    # StatCard
      diff/         # DiffFileCard (line numbers, expand/collapse)
      files/        # FileList (file-type icons)
      layout/       # AppShell (dark sidebar, Live indicator)
      shared/       # LoadingState, ErrorState
    hooks/          # useVcsRealtime (Socket.io events + connect/disconnect)
    pages/          # RepoDashboardPage, CommitListPage, DiffViewerPage, FileExplorerPage
    realtime/       # Socket.io client instance

docs/
  demo/             # seed-demo.js
  screenshots/      # UI screenshots
```

## How Nexus Works

1. **Initialize** — `node cli.js init` creates `.ourGit`, bootstraps branch metadata and staging directory.
2. **Stage** — `node cli.js add file.js` copies the file into `.ourGit/staging/`.
3. **Commit** — `node cli.js commit "message"` hashes parent + files + timestamp → SHA-256, stores snapshot under `.ourGit/commits/<hash>/`, updates branch HEAD, emits Socket.io event.
4. **Branch** — `node cli.js branch feature-x` creates a new branch file pointing to current HEAD.
5. **Checkout** — `node cli.js checkout feature-x` restores snapshot files to working directory and updates HEAD.
6. **Merge** — `node cli.js merge feature-x` creates a merge commit recording both parent hashes.
7. **Log** — `node cli.js log` prints a colored, formatted commit history with branch labels.
8. **Dashboard** — React app polls the API and receives Socket.io pushes to display real-time repository state.

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection string (free tier works)
- OpenAI API key (for AI features; optional — app works without it)

### Backend

```bash
cd backend-main
npm install
```

Copy `.env.example` to `.env` and fill in values:

```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET_KEY=your_secret
PORT=3000
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
VCS_WORKSPACE_ROOT=C:\path\to\your\demo-workspace
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend-main
npm install
```

Create `frontend-main/.env`:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

### Seed Demo Workspace (Optional)

To pre-populate your workspace with a realistic multi-branch commit history:

```bash
node docs/demo/seed-demo.js
```

This creates 6 commits across `main` and `feature/auth` branches with real files, a merge commit, and a full diff-able history.

## CLI Reference

```bash
node cli.js init                      # Initialize repository
node cli.js add <file>                # Stage a file
node cli.js commit "message"          # Create a commit
node cli.js branch <name>             # Create a branch
node cli.js checkout <name>           # Switch branches
node cli.js merge <name>              # Merge a branch into current
node cli.js log                       # View formatted commit history
```

## Web Dashboard Routes

| Route | Description |
|-------|-------------|
| `/` | Repository overview — branches, last commit, live activity |
| `/files` | File explorer with content viewer and AI commit message |
| `/commits` | Commit graph (ReactFlow) + history table + detail panel |
| `/commits/:hash` | Specific commit detail |
| `/diff` | Line-by-line diff viewer + AI explanation |

## 🎥 Demo Video

[![▶ Watch 90-second Demo](https://img.shields.io/badge/▶%20Watch%20Demo-Google%20Drive-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/file/d/1MPwIQ4BtIAWw0lkWHoRc8_yqg19z7gob/view?usp=sharing)

> A 90-second end-to-end walkthrough: CLI commits → real-time Socket.io dashboard sync → multi-branch commit graph → LCS diff viewer → AI-powered diff explanation.

## Screenshots

### Login Page
![Login](docs/screenshots/login.png)

### Repository Dashboard — Live realtime updates via Socket.io
![Dashboard](docs/screenshots/dashboard.png)

### Commit Graph — Multi-branch lane visualization
![Commits](docs/screenshots/commits.png)

### Diff Viewer — Line-by-line LCS diff with AI explanation
![Diff Viewer](docs/screenshots/diff.png)

### File Explorer — Snapshot content viewer
![File Explorer](docs/screenshots/files.png)

## What This Demonstrates to Recruiters

- Custom file-system VCS design (not just wrapping git)
- SHA-256 content-addressed storage with parent-chain commit metadata
- LCS diff algorithm implemented from scratch
- Real-time full-stack architecture (Socket.io, React, Express)
- JWT-authenticated protected routes
- AI integration with provider abstraction (OpenAI / Gemini)
- Professional CLI with colored output and `log` history view
- Recruiter-ready code organization, documentation, and testing

## Testing

```bash
# Backend
cd backend-main
npm test

# Frontend
cd frontend-main
npm run lint
npm run test -- --run
npm run build
```

## Future Improvements

- Map authenticated users to isolated repository workspaces
- Delta compression for storage efficiency (store diffs instead of full snapshots)
- Improve merge conflict detection and resolution UX
- Package CLI as an installable npm global command (`npx nexus`)
- Add richer end-to-end integration tests (Playwright)
- Remote repository synchronization (push/pull to a hosted server)

## Additional Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and data flow
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment guide

## License

MIT License — see [LICENSE](./LICENSE).
