# GitNexus — Full-Stack Git Repository Management Platform

A production-ready **MERN stack** application that replicates core GitHub functionality with a **custom-built version control system** implemented from scratch. This project demonstrates full-stack development expertise, system design, and deep understanding of distributed version control concepts.

---

## � Project Overview

GitNexus is a full-featured Git repository management platform built to showcase proficiency in:
- **Full-stack web development** with React, Node.js, Express, and MongoDB
- **Custom VCS implementation** — replicated Git's core version control mechanisms (staging, commits, branching)
- **Modern authentication & authorization** using JWT and role-based access control
- **Scalable architecture** with microservice-oriented controllers and cloud integration
- **Real-time collaboration features** using Socket.io for live updates
- **AWS integration** for cloud-based file storage and scalability

This project demonstrates the ability to build complex, scalable applications from the ground up while handling authentication, data persistence, version control logic, and user management.

---

## � Key Features

### Core Git Operations
- **Repository Management** — Create, clone, and manage repositories with public/private visibility
- **Custom Commit System** — Implement staging, committing with versioning using UUID-based commit tracking
- **File Versioning** — Track file changes across commits with snapshot-based storage
- **Push/Pull Operations** — Synchronize code between local and remote repositories
- **Revert Functionality** — Roll back to previous commits and restore file states

### User & Collaboration Features
- **User Authentication** — Secure JWT-based authentication with bcrypt password hashing
- **Authorization Middleware** — Role-based access control for repositories
- **Issue Tracking** — Create, manage, and track issues with MongoDB persistence
- **User Profiles** — Track contributions with activity heat maps and statistics
- **Repository Ownership** — Multi-user repository management with proper access control

### Technical Highlights
- **Real-time Updates** — Socket.io integration for live collaboration notifications
- **AWS S3 Integration** — Cloud-based file storage for scalability
- **Database Modeling** — Well-structured MongoDB schemas for users, repositories, and issues
- **RESTful API** — Clean, organized route structure with separation of concerns

---

## �️ Tech Stack

### Backend
- **Node.js & Express.js** — RESTful API server with middleware architecture
- **MongoDB & Mongoose** — Document-based data persistence with schema validation
- **JWT & bcryptjs** — Secure authentication and password encryption
- **Socket.io** — Real-time bidirectional communication
- **AWS SDK** — Cloud storage integration for file management
- **yargs** — CLI command parsing for Git-like operations

### Frontend
- **React 18** — Component-based UI with hooks
- **React Router v6** — Client-side routing and navigation
- **Axios** — HTTP client for API communication
- **Vite** — Lightning-fast build tool and dev server
- **Primer React & CSS** — GitHub-inspired UI components
- **React Heat Map** — User activity visualization

### Architecture
- **MVC Pattern** — Controllers, models, and routes separation
- **Middleware Stack** — Authentication, authorization, and error handling
- **RESTful Design** — Standardized API endpoints for each resource
- **File-System Based VCS** — Custom version control with .ourGit directory structure

---

## � Project Structure

```
├── backend-main/
│   ├── controllers/       # Business logic for repos, commits, users, issues
│   ├── models/            # MongoDB schemas (User, Repository, Issue)
│   ├── routes/            # API endpoints organization
│   ├── middleware/        # Auth & authorization logic
│   ├── config/            # AWS & database configuration
│   └── index.js          # Express server entry point
│
├── frontend-main/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── assets/        # Images and static files
│   │   ├── authContext.jsx # Global auth state management
│   │   ├── Routes.jsx     # Application routing
│   │   └── main.jsx       # React entry point
│   └── package.json
│
└── README.md
```

---

## � Quick Start

### Prerequisites
- Node.js (v14+) and npm
- MongoDB (local or MongoDB Atlas connection string)
- AWS credentials (for S3 integration)

### Backend Setup

1. Navigate to backend directory and configure environment:
```bash
cd backend-main
cp .env.example .env
```

2. Update `.env` with your values:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/db
PORT=5000
JWT_SECRET_KEY=your_secret_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

3. Start the server:
```bash
npm install
npm run dev  # Development with nodemon
# or
npm run start  # Production
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend-main
cp .env.example .env
```

2. Configure API endpoint in `.env`:
```
VITE_API_URL=http://localhost:5000
```

3. Install dependencies and run:
```bash
npm install
npm run dev   # Start development server
npm run build # Production build
```

---

## � API Endpoints

### User Routes
- `POST /api/users/register` — Create new user account
- `POST /api/users/login` — User authentication
- `GET /api/users/:id` — Get user profile

### Repository Routes
- `POST /api/repos` — Create new repository
- `GET /api/repos` — Get all repositories
- `GET /api/repos/:id` — Get repository details
- `PUT /api/repos/:id` — Update repository
- `DELETE /api/repos/:id` — Delete repository

### Git Operations
- `POST /api/repos/:id/commit` — Create commit
- `POST /api/repos/:id/push` — Push commits
- `POST /api/repos/:id/pull` — Pull commits
- `POST /api/repos/:id/revert` — Revert to previous commit

### Issue Routes
- `POST /api/issues` — Create issue
- `GET /api/issues` — Get all issues
- `GET /api/issues/:id` — Get issue details
- `PUT /api/issues/:id` — Update issue status

---

## � What I Learned

This project deepened my understanding of:
- **Version Control Systems** — How Git manages file versioning, commits, and branches internally
- **Full-Stack Integration** — Seamlessly connecting frontend, backend, and database layers
- **Authentication & Security** — JWT tokens, password hashing, and authorization middleware
- **Scalable Architecture** — Organizing code with proper separation of concerns
- **Real-time Communication** — Using WebSockets for live collaboration features
- **Cloud Integration** — AWS S3 for scalable file storage
- **Database Design** — Proper schema modeling for complex relationships

---

## � Resume Highlights

This project demonstrates:
✅ Full-stack MERN development proficiency
✅ Custom system design and implementation from scratch
✅ Security best practices (JWT, bcrypt, authorization)
✅ Scalable architecture with cloud integration
✅ Real-time collaborative features
✅ API design and RESTful principles
✅ Database modeling and optimization
✅ Version control and Git concepts

---

## � Deployment Notes

### Environment Variables (Production)
Set these on your hosting platform:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET_KEY` — Secure JWT secret
- `PORT` — Server port
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` — AWS credentials

### Frontend Deployment
Deploy to Netlify, Vercel, or AWS S3 + CloudFront:
```bash
npm run build
# Upload build/ folder to static hosting
```

### Backend Deployment
Deploy to Heroku, Railway, AWS EC2, or DigitalOcean:
```bash
npm run start
```

Configure CORS in `backend-main/index.js` for production domains.

---

## � About

**Author:** Udit Singh
**Stack:** MERN (MongoDB, Express, React, Node.js)
**Custom VCS:** Git-inspired version control from scratch
**Status:** Production-ready with scalable architecture

---

## � License

ISC License © Udit Singh
