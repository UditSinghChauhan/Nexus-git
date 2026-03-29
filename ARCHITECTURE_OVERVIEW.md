# 🏗️ Architecture Overview - Technical Deep Dive

**Audience:** Technical Leads, Architects, Senior Developers

---

## System Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (Port 5173)                                          │
│  ├── Auth Context (Token Management)                           │
│  ├── Components (Login, Dashboard, Files, Commits, Diff)       │
│  ├── Socket.io Client (Real-time Updates)                      │
│  └── Axios Client (API Communication)                          │
└─────────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/WSS
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway / Proxy                           │
│  (CORS Enabled, Rate Limiting, Request Validation)             │
└─────────────────────────────────────────────────────────────────┘
                            ↕ 
┌─────────────────────────────────────────────────────────────────┐
│                 Node.js/Express Server (Port 3000)              │
├─────────────────────────────────────────────────────────────────┤
│  Request Pipeline:                                              │
│  1. CORS Middleware                                            │
│  2. Body Parser & JSON                                         │
│  3. Auth Middleware (Token Validation)                         │
│  4. Route Matching                                             │
│  5. Business Logic (Controllers/Services)                      │
│  6. Response Formatting                                        │
│                                                                 │
│  Core Components:                                              │
│  ├── REST API Routes (/user, /repo, /vcs, /issue)             │
│  ├── Controllers (Business Logic)                             │
│  ├── Services (VCS Engine, AI Services)                       │
│  ├── Middleware (Auth, Authorization)                         │
│  ├── Models (Schemas & Validation)                            │
│  └── WebSocket Engine (Socket.io)                             │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│                                                                  │
│  MongoDB Atlas (Cloud Database)                                │
│  ├── Users Collection (Authentication)                        │
│  ├── Repositories Collection (Repo Metadata)                  │
│  ├── Issues Collection (Issue Tracking)                       │
│  └── File System (.ourGit directories)                        │
│                                                                 │
│  External Services:                                            │
│  └── OpenAI API (AI Features)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### 1. **Request Lifecycle**

```
HTTP Request Arrives
         ↓
   CORS Middleware (Allow cross-origin)
         ↓
   Body Parser (JSON extraction)
         ↓
   Authentication Middleware (Verify JWT)
         ↓
   Route Matching (Find endpoint)
         ↓
   Controller Execution (Business logic)
         ↓
   Service Layer (VCS engine, DB queries)
         ↓
   Middleware Chain (Authorization, etc.)
         ↓
   Response Formatting (JSON)
         ↓
   HTTP Response
```

### 2. **Core Services**

#### Authentication Service
```javascript
// Flow: signup/login → password hash/verify → JWT token
signup(username, email, password)
  ├── Validate input (presence, format)
  ├── Hash password (bcryptjs, salt 10)
  ├── Create user in MongoDB
  ├── Generate JWT token
  └── Return token + user data

login(email, password)
  ├── Find user by email
  ├── Verify password (bcryptjs compare)
  ├── Generate new JWT token
  └── Return token + user data
```

#### Authorization Middleware
```javascript
authenticate(req, res, next)
  ├── Extract Authorization header
  ├── Verify JWT signature
  ├── Extract user ID from token
  ├── Attach userId to request
  └── Call next() to proceed

authorizeSelf(req, res, next)
  ├── Verify user can modify their own data
  ├── Prevent unauthorized updates
  └── Call next() or deny access
```

#### VCS Engine
```javascript
VCS Operations:
├── init()              // Create .ourGit structure
├── add(file)          // Stage file for commit
├── commit(message)    // Create commit snapshot
├── branch(name)       // Create branch pointer
├── checkout(branch)   // Switch branch
└── merge(branch)      // 3-way merge algorithm
    ├── Find common ancestor
    ├── Combine divergent changes
    ├── Detect conflicts
    └── Create merge commit
```

#### Real-time Engine
```javascript
Socket.io Server
├── On Connect: Register client
├── On Disconnect: Clean up
├── Event: "vcs:publish"
│   └── Broadcast to all clients
├── Event: "dashboard:update"
│   └── Push repository changes
└── Event: "commit:new"
    └── Notify about new commits
```

### 3. **Data Models**

#### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Repository Model
```javascript
{
  _id: ObjectId,
  name: String,
  owner: ObjectId (ref: User),
  description: String,
  vcsPath: String (.ourGit path),
  createdAt: Date,
  updatedAt: Date
}
```

#### Issue Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  repository: ObjectId (ref: Repository),
  createdBy: ObjectId (ref: User),
  status: String (open/closed),
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **API Endpoints**

#### User Routes
```
POST   /user/signup              Create new account
POST   /user/login               Authenticate user
GET    /user/allUsers            Get all users
GET    /user/userProfile/:id     Get user profile
PUT    /user/updateProfile/:id   Update profile (auth required)
DELETE /user/deleteProfile/:id   Delete profile (auth required)
```

#### Repository Routes
```
GET    /repo/all                 List all repositories
POST   /repo/create              Create new repository
GET    /repo/:id                 Get repository details
```

#### VCS Routes
```
GET    /vcs/commits              Get commit history
GET    /vcs/branches             Get branch list
POST   /vcs/merge                Merge branches
```

#### Issue Routes
```
POST   /issue/create             Create new issue
GET    /issue/all                Get all issues
GET    /issue/:id                Get issue details
PUT    /issue/update/:id         Update issue
DELETE /issue/delete/:id         Delete issue
```

#### Health Check
```
GET    /health                   Server health status
```

---

## Frontend Architecture

### 1. **Component Hierarchy**

```
App
├── AuthProvider (Context)
├── Router
│   ├── /login
│   │   └── Login Component
│   ├── /signup
│   │   └── Signup Component
│   ├── / (Protected)
│   │   ├── Dashboard
│   │   ├── Files
│   │   ├── Commits
│   │   └── Diff
│   └── Fallback (404)
└── Global Error Boundary
```

### 2. **State Management**

#### Auth Context
```javascript
AuthProvider provides:
├── token: JWT token string
├── user: User object
├── loading: Boolean
├── setAuth()    // Update auth state
├── logout()     // Clear auth
└── useAuth()    // Consumer hook
```

#### Component Local State
```javascript
Examples:
├── Dashboard: selectedBranch, commitCount
├── Files: stagedFiles, workingDirectory
├── Commits: commitHistory, selectedCommit
└── Diff: fromHash, toHash, differences
```

### 3. **API Communication**

#### Axios Client Setup
```javascript
apiClient.interceptors.request.use((config) => {
  // Automatically attach bearer token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

#### Common Requests
```javascript
// Signup
POST /user/signup
Body: {username, email, password}
Returns: {token, user}

// Login
POST /user/login
Body: {email, password}
Returns: {token, user}

// Get commits
GET /vcs/commits
Headers: {Authorization: Bearer <token>}
Returns: [{hash, message, author, timestamp}]

// Get branches
GET /vcs/branches
Returns: [{name, lastCommit, pointer}]
```

### 4. **Real-time Integration**

#### Socket.io Client
```javascript
const socket = io('http://localhost:3000', {
  autoConnect: true,
  transports: ['websocket', 'polling']
})

// Listen for events
socket.on('commit:new', (commit) => {
  // Update UI with new commit
})

socket.on('branch:updated', (branch) => {
  // Update branch display
})

socket.on('vcs:publish', (data) => {
  // Generic VCS event
})
```

---

## VCS Implementation Detail

### Commit Structure
```
Commit = {
  hash: SHA-256(content)       // Unique identifier
  message: String                // Commit message
  author: String                 // User who committed
  timestamp: Date                // When committed
  parent: String or [String]     // Parent commit(s)
  tree: Object                   // File snapshots
}
```

### Branch Structure
```
Branch = {
  name: String                   // e.g., "main", "feature-x"
  pointer: String                // Commit hash it points to
  createdAt: Date                // When branch created
  lastModified: Date             // Last commit timestamp
}

branches.json = {
  "main": "abc123...",
  "feature-x": "def456...",
  "dev": "ghi789..."
}
```

### Merge Algorithm (3-Way Merge)
```
merge(targetBranch, sourceBranch):
  1. Find common ancestor commit
  2. Get three versions:
     ├── Base (common ancestor)
     ├── Target (current branch)
     └── Source (branch being merged)
  3. For each file:
     ├── If no changes in target/source: use it
     ├── If changed in only one: use changed version
     ├── If changed in both (same way): use it
     ├── If changed differently: CONFLICT
     └── Combine non-conflicting changes
  4. Create merge commit with both parents
  5. Update branch pointer
  6. Preserve full history
```

### Staging Area Flow
```
Working Directory     Staging Area     Repository
(Untracked)          (Indexed)        (Committed)
     ↓                   ↓                 ↓
[file.js] ─add──→ [staged] ─commit→ [Commit Hash]
                                      └─ Tree snapshot
```

---

## Security Architecture

### Authentication Flow
```
User Input: {email, password}
         ↓
Verify email exists
         ↓
bcryptjs.compare(input_pw, stored_hash)
         ↓
Generate JWT:
  - Payload: {id: user._id}
  - Sign: HS256(secret_key)
  - Exp: 1 hour
         ↓
Return: {token, user}
```

### Authorization Flow
```
Incoming Request
         ↓
Extract Authorization header
         ↓
Parse "Bearer <token>"
         ↓
jwt.verify(token, secret_key)
         ↓
Extract user ID from payload
         ↓
Attach userId to request
         ↓
Proceed to route handler
         ↓
If POST/PUT/DELETE: Check authorizeSelf
```

### Password Security
```
User Password: "Pass123!"
         ↓
bcryptjs.genSalt(10)  // Generate salt
         ↓
bcryptjs.hash(password, salt)
         ↓
Stored: "$2a$10$...[hash]..."
         ↓
On login:
  bcryptjs.compare(input, stored) → true/false
```

---

## Scalability Considerations

### Current Architecture Supports
- ✅ Multiple concurrent users (Socket.io handled)
- ✅ Large repositories (File system based)
- ✅ Extended commit history (MongoDB indexed)
- ✅ Real-time collaboration (Event-driven)

### Performance Optimizations
```
Backend:
├── Connection pooling (Mongoose)
├── Query indexing (MongoDB)
├── Caching layer (could add Redis)
├── Compression middleware (gzip)
└── Rate limiting (express-rate-limit)

Frontend:
├── Code splitting (Vite)
├── Lazy loading (React.lazy)
├── Memoization (React.memo)
├── Virtual scrolling (large lists)
└── Service workers (PWA ready)
```

### For Production Scale
```
Add:
├── Load balancer (Nginx/HAProxy)
├── Database replication (MongoDB Atlas)
├── CDN for static files
├── Cache layer (Redis)
├── Message queue (RabbitMQ/Bull)
├── Microservices (if needed)
└── Kubernetes orchestration
```

---

## Error Handling

### Backend Error Responses
```javascript
// 400 Bad Request
{
  status: 400,
  message: "Username, email and password are required!"
}

// 401 Unauthorized
{
  status: 401,
  message: "Invalid or expired token"
}

// 404 Not Found
{
  status: 404,
  message: "User not found"
}

// 500 Server Error
{
  status: 500,
  message: "Internal server error"
}
```

### Frontend Error Handling
```javascript
try {
  const response = await apiClient.get('/repo/all')
  setData(response.data)
} catch (error) {
  if (error.response?.status === 401) {
    logout()  // Token expired
    navigate('/login')
  } else {
    setError('Failed to load repositories')
  }
}
```

---

## Testing Strategy

### Unit Tests
```
Controllers → Services → Database
  ├── Test auth flow (signup, login)
  ├── Test VCS operations (commit, branch, merge)
  ├── Test authorization middleware
  └── Test error handling
```

### Integration Tests
```
Full API Flow:
  ├── Authentication end-to-end
  ├── Repository operations
  ├── VCS operations
  └── Real-time socket events
```

### E2E Tests
```
User Workflows:
  ├── Signup → Login → Dashboard
  ├── Init repo → Add file → Commit
  ├── Create branch → Checkout → Merge
  └── Multi-user real-time updates
```

---

## Deployment Architecture

### Development
```
npm run dev (both)
  ├── Hot reload
  ├── Source maps
  └── Verbose logging
```

### Production
```
Build:
  ├── npm run build (frontend)
  └── NODE_ENV=production (backend)

Deploy:
  ├── Docker containers
  ├── Environment variables
  ├── SSL/TLS certificates
  └── Database backups

Monitor:
  ├── Error tracking (Sentry)
  ├── Performance monitoring
  ├── Uptime monitoring
  └── Log aggregation (ELK)
```

---

## Code Quality

### Best Practices Implemented
- ✅ MVC architecture (separation of concerns)
- ✅ RESTful API design
- ✅ Middleware pattern
- ✅ Service layer abstraction
- ✅ Error boundaries (frontend)
- ✅ Input validation
- ✅ Security headers
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ Clean code principles

### Conventions
```
Naming:
  - camelCase for variables/functions
  - PascalCase for components/classes
  - UPPER_CASE for constants

Structure:
  - Organized by feature
  - Related logic grouped
  - Clear file naming

Documentation:
  - JSDoc comments
  - README files
  - Inline explanations
  - Architecture docs (this file)
```

---

**This architecture demonstrates:**
- Production-grade system design
- Scalability thinking
- Security best practices
- Clean code principles
- Professional development practices
