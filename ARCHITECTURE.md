# Nexus Architecture

## 🏗️ System Overview

Nexus is a custom version control system that manages file versions by storing repository metadata and commit snapshots on the local file system. At a high level, it lets a user initialize a repository, stage files, create commits, browse history, compare versions, switch branches, and restore previous file state.

The system uses a snapshot-based design. Instead of storing line-by-line deltas as the primary persistence model, Nexus captures the staged state of tracked files at commit time and writes that state into a structured repository directory. This keeps the implementation easier to reason about while still supporting history traversal, diffs, restore, and branch-aware workflows.

## 🧩 Architecture Diagram (Text-based)

```text
User
  |
  | CLI commands / Web UI requests
  v
CLI Layer / HTTP API Layer
  |
  v
Core VCS Services
  |- init service
  |- staging service
  |- commit service
  |- branch service
  |- merge service
  |- query service
  |
  v
Repository Metadata + Snapshot Storage (.ourGit)
  |
  v
Working Tree Files
```

For the web application, authenticated users interact with REST endpoints and the frontend dashboard. For CLI usage, commands call the same core services directly.

## 📁 Repository Structure

Nexus stores repository state inside a dedicated `.ourGit` directory under the configured workspace root.

Example structure:

```text
workspace/
  sample.txt
  notes.txt
  .ourGit/
    HEAD
    branches.json
    config.json
    staging/
      sample.txt
    commits/
      <commit-hash-1>/
        commit.json
        sample.txt
      <commit-hash-2>/
        commit.json
        sample.txt
        notes.txt
```

### Internal storage roles

- `HEAD`
  Stores the current branch name
- `branches.json`
  Maps branch names to commit hashes
- `config.json`
  Stores repository-level config such as S3 bucket reference
- `staging/`
  Holds the next candidate file set for a commit
- `commits/<hash>/`
  Stores one committed snapshot and its metadata
- `commit.json`
  Stores commit message, timestamp, parent links, hash, and tracked file list

## 🔄 Commit Workflow

### 1. Track files

When a file is added, Nexus copies it into `.ourGit/staging/`. The staging area represents the next repository state to commit.

### 2. Build commit identity

At commit time, Nexus:

- reads the current branch
- looks up the current branch head
- collects staged files
- hashes parent commit references, timestamp, file names, and file contents

This produces a SHA-256 commit identifier.

### 3. Persist snapshot

Nexus creates a new directory under `.ourGit/commits/<hash>/` and copies staged files into it. It also writes a `commit.json` metadata file with:

- `hash`
- `message`
- `timestamp`
- `parent1`
- optional `parent2` for merge commits
- tracked file list

### 4. Move branch head

After the snapshot is written, the active branch head in `branches.json` is updated to the new commit hash, and `HEAD` remains pointed at the active branch name.

## 🧠 Versioning Logic

Nexus uses a **snapshot-based** versioning model.

- Each commit directory stores the file set for that committed state
- Version identity is created using SHA-256 hashing
- Parent references connect commits into a history graph

### Snapshot vs delta

- **Chosen approach:** snapshot storage
- **Reason:** simpler restore logic, simpler history inspection, easier debugging
- **Trade-off:** higher storage usage than a delta-compressed design

### Version identity

Each version is identified by a content-derived commit hash built from:

- parent references
- commit timestamp
- sorted staged file names
- staged file contents

This gives each commit a stable identity for history traversal and branch management.

## 📜 History Management

History is stored implicitly through:

- commit directories under `.ourGit/commits/`
- parent references inside each `commit.json`
- branch heads in `branches.json`

To retrieve history, Nexus starts from the active branch head and walks backward through parent links. The query layer performs graph traversal, collects visited commits, and sorts them by timestamp for dashboard and commit-list rendering.

### How logs are generated

The log view is not stored as a separate file. It is derived at query time by:

1. reading the current branch head
2. traversing parent references
3. loading commit metadata
4. sorting commits into display order

This keeps storage simple and avoids maintaining redundant log files.

## 🔁 Checkout / Restore Flow

Checkout and restore both rebuild working-tree state from snapshot data.

### Branch checkout

When a branch is checked out:

1. Nexus verifies the branch exists
2. It resolves the branch head commit
3. It updates `HEAD` to the selected branch name
4. It copies the committed files from `.ourGit/commits/<hash>/` back into the workspace

### Restore / revert

When restoring a commit:

1. Nexus opens the target commit directory
2. It copies tracked files from that snapshot into the working tree
3. It updates the current branch head to the restored commit hash

This approach favors direct file replacement over patch replay, which keeps restore logic straightforward.

## ⚙️ Data Storage Strategy

Nexus uses **file system-based storage** for repository state.

### Why file system storage

- natural fit for a version control system
- easy to inspect manually during debugging
- low operational complexity
- no database dependency for core repository contents

### Organization strategy

- metadata is stored as plain text or JSON
- staged files live separately from committed files
- committed snapshots are isolated by hash directory
- branch state is centralized in a single metadata file

### Efficiency considerations

- snapshots simplify reads and restore operations
- query operations only load the commits they need
- diff generation is computed in memory from two snapshots
- storage cost grows with full-file snapshots, especially for larger repositories

## 🎯 Design Decisions

### 1. Snapshot-first design

Nexus uses snapshots because they make commit creation, restore, and history inspection easier to implement and explain. This is a practical trade-off for a custom VCS focused on learning and system design clarity.

### 2. Metadata in JSON/plain files

Repository state is intentionally human-readable. Files like `branches.json`, `HEAD`, and `commit.json` keep the internal model transparent and easy to debug.

### 3. Branch head model

Branches are stored as name-to-hash mappings instead of embedded linked structures. This keeps branch lookup simple and aligns well with the current scope of the project.

### 4. Shared workspace root

The repository path is resolved from a configured workspace root, allowing the demo repository state to live outside the source code folder. This keeps the source repository clean during demos and testing.

### Trade-offs

- **Pros:** simpler implementation, easier debugging, easier interview explanation
- **Cons:** higher storage overhead, limited optimization for large files, current workspace model is not yet multi-tenant

## 🚀 Scalability & Future Improvements

### Branching and merging

Branch creation and checkout are implemented, and merge support exists with common-ancestor discovery plus basic conflict marker generation. Future work could improve conflict resolution UX and merge strategy sophistication.

### Remote repositories

The project already includes S3-oriented push/pull scaffolding. A fuller remote model could add:

- repository synchronization
- remote branch tracking
- fetch/pull/push workflows
- distributed collaboration semantics

### Large file optimization

For larger repositories, the current snapshot model could be improved through:

- object-level deduplication
- content-addressable blob storage
- delta compression
- chunked storage for large files

### Multi-user workspace mapping

The current web app secures access through authentication but reads VCS state from a configured workspace. A future architecture improvement would map authenticated users or repositories to isolated workspaces for true multi-user behavior.

### CLI and UI improvements

- globally installable CLI command
- richer status and log commands
- better restore/checkout feedback
- stronger end-to-end test coverage
- deployment-friendly demo workspace provisioning
