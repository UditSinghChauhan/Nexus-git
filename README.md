# GitNexus

GitNexus is a full-stack Git-like version control platform built with the MERN stack. It combines a custom VCS engine, a CLI workflow, a browser-based dashboard, JWT authentication, real-time updates with Socket.io, and AI-assisted commit/diff features to showcase end-to-end system design and product engineering.

## Recruiter Snapshot

- Full-stack MERN application with a custom Git-inspired VCS core
- Secure JWT-authenticated routes for repository, profile, VCS, and AI actions
- Real-time repository updates through Socket.io
- AI-assisted commit messaging and diff explanations
- Production build, lint checks, and automated tests included

## What It Does

GitNexus lets users:
- sign up and log in securely with JWT authentication
- create and manage repositories with user-based access control
- use Git-inspired VCS operations such as init, add, commit, branch, checkout, and merge
- inspect repository state in a web dashboard
- browse files, commits, and diffs in the frontend
- view commit history as a graph
- receive real-time UI updates through Socket.io
- generate AI-assisted commit messages and diff explanations

## Key Features

### Custom VCS Core
- repository initialization
- staging area support
- commit creation with hashed metadata
- branch creation and checkout
- merge support with commit history preservation

### Authentication and Authorization
- signup and login
- bcrypt password hashing
- JWT token generation
- protected backend routes
- user-based repository access
- protected VCS and AI endpoints

### Frontend Interface
- login and signup pages
- repository dashboard
- file explorer
- commit list
- diff viewer
- commit graph visualization

### Real-Time and AI Features
- Socket.io-powered live refresh flow
- AI commit message suggestions
- AI diff explanation support

## Tech Stack

### Frontend
- React
- React Router
- Vite
- Axios
- Tailwind CSS
- Primer React
- Socket.io Client
- React Flow

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.io
- yargs

### AI and Infra
- OpenAI API
- MongoDB Atlas
- AWS SDK support in backend config

## Architecture Overview

The project is split into three major parts:

- `backend-main/`
  Express backend, auth, database models, routes, VCS services, real-time server, CLI entrypoint
- `frontend-main/`
  React frontend for auth, dashboard, files, commits, diffs, and graph views
- `backend-main/cli.js`
  Git-like CLI interface for running VCS operations directly

For the full technical breakdown, see [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md).

## Project Structure

```text
Github/
  backend-main/
    .env.example
    cli.js
    index.js
    package.json
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/

  frontend-main/
    .env.example
    index.html
    package.json
    src/
      api/
      assets/
      components/
      hooks/
      pages/
      realtime/
      App.jsx
      authContext.jsx
      config.js
      index.css
      main.jsx

  docs/
    screenshots/
      login.png
      signup.png
      dashboard.png
      files.png
      commits.png
      diff.png

  README.md
  ARCHITECTURE_OVERVIEW.md
  SHOWCASE_FLOW.md
  FINAL_QA_CHECKLIST.md
  DEPLOYMENT.md
  .gitignore
```

## Screenshots

![Login](docs/screenshots/login.png)
![Signup](docs/screenshots/signup.png)
![Dashboard](docs/screenshots/dashboard.png)
![Files](docs/screenshots/files.png)
![Commits](docs/screenshots/commits.png)
![Diff](docs/screenshots/diff.png)

## Recruiter Quick Access

If you are reviewing this project from a resume or portfolio, use the links and flow below:

- source code: this repository
- guided walkthrough: [SHOWCASE_FLOW.md](./SHOWCASE_FLOW.md)
- UI preview: see the screenshots above

Important:

- the deployed app may open on the signup/login screen first
- the main VCS dashboard, file explorer, commit history, and diff views are available after authentication
- for the clearest evaluation, pair the repository with a short recorded walkthrough that shows the authenticated flow end-to-end

Recommended portfolio link order:

- primary link: GitHub repository
- secondary link: short demo video showing login, dashboard, files, commits, diff, and one CLI commit
- optional third link: deployed app

If you share a deployed version publicly, include a short note in the portfolio or resume telling reviewers that the full experience begins after login.

## Local Setup

### Prerequisites

- Node.js
- npm
- MongoDB connection string
- OpenAI API key for AI features

### Backend Setup

```bash
cd backend-main
npm install
```

Create `.env` using `backend-main/.env.example`:

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:5173
VCS_WORKSPACE_ROOT=C:\path\to\gitnexus-demo
```

Start backend:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend-main
npm install
```

Create `.env` using `frontend-main/.env.example`:

```
VITE_API_URL=http://localhost:3000
```

Start frontend:

```bash
npm run dev
```

## How To Test The Project

### Automated Checks

Run these commands before demoing or sharing the project:

```bash
cd backend-main
npm test

cd ../frontend-main
npm run lint
npm run test -- --run
npm run build
```

### Authentication Flow

- Open the frontend in the browser
- Sign up with a new account
- Log out
- Log back in
- Refresh the page and confirm the session persists
- Confirm protected pages redirect to login when logged out

### CLI / VCS Flow

Use the CLI in a test directory:

```bash
node "C:\path\to\backend-main\cli.js" init
node "C:\path\to\backend-main\cli.js" add sample.txt
node "C:\path\to\backend-main\cli.js" commit "first commit"
node "C:\path\to\backend-main\cli.js" branch feature-a
node "C:\path\to\backend-main\cli.js" checkout feature-a
node "C:\path\to\backend-main\cli.js" merge main
```

### Frontend Flow

Test these routes after login:

- `/` - Dashboard
- `/files` - File Explorer
- `/commits` - Commit List
- `/diff` - Diff Viewer

### Professional Demo Setup

For the cleanest project presentation, keep the source repo and the demo workspace separate:

- project source: `Github/`
- live VCS demo workspace: a separate folder such as `C:\path\to\gitnexus-demo`

Point the backend to that external workspace with `VCS_WORKSPACE_ROOT` so `.ourGit` data and sample files do not live inside the source repository.

This lets you demo real commits and branch state without polluting the source repository used for code review.

## API Overview

### User Routes
- `POST /user/signup`
- `POST /user/login`
- `GET /user/allUsers` (authenticated)
- `GET /user/userProfile/:id` (authenticated, self only)
- `PUT /user/updateProfile/:id` (authenticated, self only)
- `DELETE /user/deleteProfile/:id` (authenticated, self only)

### Repo Routes
- `POST /repo/create`
- `GET /repo/all`
- `GET /repo/name/:name`
- `GET /repo/user/:userID`
- `GET /repo/:id`
- `PUT /repo/update/:id`
- `DELETE /repo/delete/:id`
- `PATCH /repo/toggle/:id`

### VCS Routes
- `GET /vcs/dashboard` (authenticated)
- `GET /vcs/files` (authenticated)
- `GET /vcs/files/:name` (authenticated)
- `GET /vcs/commits` (authenticated)
- `GET /vcs/commits/:hash` (authenticated)
- `GET /vcs/diff` (authenticated)
- `POST /vcs/ai/commit-message` (authenticated)
- `POST /vcs/ai/explain-diff` (authenticated)

### Health Route
- `GET /health`

## Demo Flow

For a recruiter/demo walkthrough, see [SHOWCASE_FLOW.md](./SHOWCASE_FLOW.md).

## QA Status

Testing and validation notes are in [FINAL_QA_CHECKLIST.md](./FINAL_QA_CHECKLIST.md).

## Deployment Notes

Before deployment:

- set production environment variables
- restrict CORS to the production frontend domain
- enable HTTPS
- deploy backend and frontend separately
- verify signup/login, protected routes, VCS pages, AI features, and real-time updates

For detailed hosting instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## What This Project Demonstrates

- custom version control concepts implemented in application code
- full-stack product engineering
- secure authentication and route protection
- API design and frontend integration
- real-time application architecture
- AI integration into developer workflows

## Author

Udit Singh

## License

ISC
