# Nexus

Nexus is a custom version control system inspired by Git, built to demonstrate how repository state, commit history, and workspace restoration can be implemented from first principles. It solves the core problem of tracking file changes over time, storing versioned snapshots, and exposing that state through both a CLI workflow and a browser-based dashboard.

## 🚀 Project Overview

Nexus is a simplified version control system that models the core mechanics of Git in an approachable full-stack implementation. It provides repository initialization, file tracking, commit history, version inspection, and branch-aware state management using a custom on-disk metadata structure.

## ✨ Key Features

- Initialize a repository and create internal VCS metadata
- Track file changes through a staging workflow
- Create commits as versioned snapshots of staged files
- View commit history and commit metadata
- Restore previous repository state from stored snapshots
- Manage branches and switch active branch context
- Compare versions through a diff viewer
- Use the system through both a CLI and a web UI

## 🎯 Use Case

Nexus is useful for developers who want to understand version control internals beyond the surface-level Git workflow. It is also a strong systems-learning project for exploring file tracking, repository metadata design, hashing, snapshot persistence, and the backend/frontend coordination needed to visualize VCS state.

## 🏗️ Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** React, Vite
- **Database:** MongoDB for user and application data
- **Realtime:** Socket.io
- **Storage model:** local file system metadata and commit snapshots
- **AI integration:** provider-based OpenAI/Gemini support for commit and diff assistance
- **Testing:** Node test runner, Vitest, ESLint
- **Core libraries:** `mongoose`, `jsonwebtoken`, `bcryptjs`, `socket.io`, `yargs`

## ⚙️ How It Works (High Level)

1. **Initialize repository**  
   Nexus creates an internal metadata directory (`.ourGit`) and bootstraps repository state such as branch metadata and staging storage.

2. **Track files**  
   Files are added into a staging area, which acts as the next candidate state for a commit.

3. **Commit changes**  
   Staged files are stored as a snapshot under a content-addressed commit directory, along with commit metadata such as message, timestamp, parent commit, and hash.

4. **Checkout or restore state**  
   A branch head or commit reference is used to restore the tracked file state from a stored snapshot.

## 🧠 Core Concepts Implemented

- **Snapshot storage:** each commit stores a snapshot of tracked files instead of line-level delta compression
- **Hash-based commit identity:** commit hashes are generated from staged content and metadata
- **Staging area:** files are copied into a staging directory before commit creation
- **Branch metadata:** branch heads are tracked through repository metadata files
- **Repository structure:** Nexus stores internal state inside a dedicated `.ourGit` directory
- **Commit lineage:** commit metadata includes parent references for history traversal and merge-aware graphs

## 🧪 Testing

Testing is a mix of automated validation and manual product-level verification.

- Backend middleware and auth logic are covered with automated Node-based tests
- Frontend empty-state behavior is covered with Vitest
- Linting and production builds are used as part of verification
- Manual checks are used for CLI flows, repository state transitions, commit history, diff views, and authenticated UI behavior

## 🚀 Future Improvements

- Stronger multi-user repository-to-workspace mapping
- More complete merge conflict handling
- Richer branch management workflows
- Remote repository sync and collaboration features
- Installable CLI packaging instead of path-based execution
- More comprehensive automated integration and end-to-end tests
- Cleaner AI provider controls and production quota handling

## 📌 Status

**In progress**  
Core repository initialization, staging, commit history, branch-aware state handling, CLI workflows, and dashboard visualization are implemented. The next major evolution is deeper multi-user workspace isolation and more advanced distributed VCS behavior.
