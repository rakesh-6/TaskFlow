import { useState } from "react";

const COLORS = {
  bg: "#070B14",
  card: "#0D1117",
  cardHover: "#111827",
  border: "#1F2937",
  accent: "#4285F4",      // Google blue
  green: "#34A853",
  yellow: "#FBBC04",
  red: "#EA4335",
  purple: "#8B5CF6",
  teal: "#14B8A6",
  text: "#F9FAFB",
  muted: "#6B7280",
  subtle: "#374151",
};

const phases = [
  { id: "kb", icon: "🧠", label: "Knowledge Base", color: COLORS.purple, subtitle: "Add once — agents use forever" },
  { id: "p1", icon: "🏗️", label: "Phase 1 — Setup", color: COLORS.teal, subtitle: "Day 1–2" },
  { id: "p2", icon: "🔐", label: "Phase 2 — Auth", color: COLORS.green, subtitle: "Day 3–5" },
  { id: "p3", icon: "📋", label: "Phase 3 — Features", color: COLORS.yellow, subtitle: "Day 6–9" },
  { id: "p4", icon: "⚛️", label: "Phase 4 — Frontend", color: COLORS.accent, subtitle: "Day 10–14" },
  { id: "p5", icon: "🚀", label: "Phase 5 — Deploy", color: COLORS.red, subtitle: "Day 15–18" },
];

const content = {
  kb: {
    title: "Knowledge Base Skills",
    howTo: "In Antigravity → Settings (Cmd+,) → Knowledge Base → Add Skill. Create one skill per entry below. The agent will automatically apply these rules on every task.",
    skills: [
      {
        name: "TaskFlow — Project Specification",
        body: `Project: TaskFlow — Team & Project Management SaaS
Stack: Node.js + Express.js (ES Modules) | MongoDB Atlas + Mongoose | React 18 + Vite | Redux Toolkit

Folder Structure:
  /server  → REST API (JSON only, never serves HTML)
  /client  → React frontend (never touches DB directly)

Backend packages: express, mongoose, dotenv, cors, bcryptjs, jsonwebtoken,
  nodemailer, multer, cloudinary, passport, passport-google-oauth20,
  passport-github2, socket.io, stripe, express-rate-limit, helmet, express-validator

Frontend packages: axios, react-router-dom, @reduxjs/toolkit, react-redux,
  @hello-pangea/dnd, recharts, socket.io-client, tailwindcss

Models: User, Project, Task, Notification, Activity, Invite, Subscription
Deployment: Backend → Render.com | Frontend → Vercel | DB → MongoDB Atlas`
      },
      {
        name: "TaskFlow — Security Rules",
        body: `ALWAYS follow these security rules for every file you touch:

1. Passwords: always hash with bcrypt (12 salt rounds). NEVER store plain text.
2. JWT: accessToken expires in 15 minutes. refreshToken expires in 7 days.
3. Refresh token: ONLY in httpOnly cookie. NEVER in localStorage.
4. Auth middleware: every protected route must call the protect() middleware.
5. Resource authorization: before any project/task operation, verify the user
   is a member of that project using the isMember() middleware.
6. Input validation: use express-validator on ALL mutation endpoints (POST/PUT/PATCH).
7. Secrets: ALL secrets go in .env. NEVER hardcode API keys or passwords.
8. Forgot password: NEVER reveal whether an email exists. Always return the
   same generic message: "If that email exists, we sent a reset link."
9. Rate limiting: apply authLimiter (10 req/15min) to all auth routes.
10. helmet(): add to index.js before all routes.`
      },
      {
        name: "TaskFlow — Coding Standards",
        body: `Always write code that follows these standards:

Syntax:
- Use ES Modules (import/export) throughout — no require()
- Async/await with try-catch blocks. Always call next(err) on errors.
- Use arrow functions for callbacks and utility functions.

Structure:
- Controllers: business logic only (what happens)
- Routes: URL definitions only (what URL maps to what controller)
- Middleware: reusable checks (auth, membership, plan gating)
- Utils: shared helpers (jwt.utils.js, email.utils.js, cloudinary.utils.js)

Error format: always respond with { message: string, code?: string, errors?: array }
Consistent HTTP status codes:
  200 OK | 201 Created | 400 Bad Request | 401 Unauthorized
  403 Forbidden | 404 Not Found | 409 Conflict | 500 Server Error

Never leave placeholder comments like "// TODO" or "// add logic here".
Write complete, working, production-ready code every time.`
      },
      {
        name: "TaskFlow — Test Checkpoints",
        body: `After completing each feature, always provide a test checkpoint:

For backend features:
- Give the exact Postman/Thunder Client request to test it
- Specify the expected response body and status code
- Include edge case tests (missing fields, invalid token, wrong role)

For frontend features:
- Describe what the user should see/click to verify it works
- Mention what to check in Redux DevTools
- Mention what to check in the Network tab

For real-time features (Socket.io):
- Explain how to verify the socket event fires
- Describe what appears in the browser console

Always end with: "✅ This feature is complete when: [specific observable outcome]"`
      },
      {
        name: "TaskFlow — Optimistic Updates Pattern",
        body: `For any drag-and-drop or instant-feedback UI interaction, use this pattern:

1. Capture previous state: const prevState = [...currentState]
2. Update local state immediately (this is the "optimistic" part)
3. Make the API call in the background
4. If API call FAILS: revert state to prevState + show error toast
5. If API call SUCCEEDS: do nothing (state is already correct)

Example for Kanban drag-drop:
  const onDragEnd = async (result) => {
    const prev = [...tasks];
    setTasks(updated);           // immediate UI update
    try {
      await api.patch(...);      // background DB sync
    } catch {
      setTasks(prev);            // revert on failure
      toast.error("Failed to update. Please try again.");
    }
  };

Always use this pattern for: task status changes, task reordering,
mark notification as read, toggle task labels.`
      },
    ]
  },

  p1: {
    title: "Phase 1 — Project Setup & Architecture",
    mode: "Plan Mode",
    agentTip: "Use Plan Mode. Before approving the plan, verify it shows both /server and /client being created with the correct package lists.",
    prompt: `[TASKFLOW — PHASE 1: PROJECT SETUP]

I am building "TaskFlow" — a Team & Project Management SaaS using the MERN stack.
You have full context in the Knowledge Base. Start with Phase 1: Project Setup.

TASKS FOR THIS PHASE:

1. FOLDER STRUCTURE
   Create the following at the root level:
   /taskflow
   ├── /server   (Node.js + Express backend)
   └── /client   (React + Vite frontend)

2. BACKEND SETUP (/server)
   - Initialize package.json with "type": "module" (ES Modules)
   - Install ALL packages: express mongoose dotenv cors bcryptjs jsonwebtoken
     nodemailer multer cloudinary passport passport-google-oauth20
     passport-github2 socket.io stripe express-rate-limit helmet
     express-validator
   - Install dev dependencies: nodemon
   - Create server/index.js with:
       • Express app setup
       • MongoDB Atlas connection (mongoose.connect)
       • CORS middleware (withCredentials: true)
       • express.json() middleware
       • helmet() security headers
       • Route placeholders for: /api/auth, /api/users, /api/projects, /api/tasks,
         /api/notifications, /api/billing
       • Global error handler middleware (err, req, res, next)
       • Server starts only after MongoDB connects
   - Create server/.env template with ALL variables:
       PORT, NODE_ENV, CLIENT_URL, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET,
       EMAIL_USER, EMAIL_PASS, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
       GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, CLOUDINARY_NAME,
       CLOUDINARY_KEY, CLOUDINARY_SECRET, STRIPE_SECRET_KEY,
       STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_TEAM_PRICE_ID
   - Create server/.gitignore (node_modules, .env)

3. FRONTEND SETUP (/client)
   - Create React app: npm create vite@latest client -- --template react
   - Install ALL packages: axios react-router-dom @reduxjs/toolkit react-redux
     @hello-pangea/dnd recharts socket.io-client
   - Install and configure TailwindCSS (tailwind.config.js + index.css)
   - Create client/.env: VITE_API_URL=http://localhost:5000/api
   - Set up the base folder structure inside /client/src:
       /api          → axios instance (create but leave empty for Phase 4)
       /components   → reusable UI components
       /pages        → full page components
       /store        → Redux store and slices
       /hooks        → custom React hooks
       /utils        → helper functions

4. VERIFICATION
   - Run the backend: node server/index.js
   - Expected output: "✅ MongoDB connected" + "🚀 Server running on port 5000"
   - Run the frontend: npm run dev (inside /client)
   - Expected: React app opens at http://localhost:5173

After completing setup, show me the full folder tree and confirm all packages installed.`,
    artifacts: [
      "Task Plan: full folder tree for /server and /client",
      "Implementation Plan: package install commands for both apps",
      "Terminal output showing MongoDB connected + server started",
      "Browser screenshot of React app at localhost:5173",
    ]
  },

  p2: {
    title: "Phase 2 — Authentication System",
    mode: "Plan Mode",
    agentTip: "Use Plan Mode. The plan should show individual files for each auth piece. If the agent tries to put everything in one file, comment on the plan artifact: 'Split into separate controller, model, routes, middleware, and utils files.'",
    prompt: `[TASKFLOW — PHASE 2: AUTHENTICATION SYSTEM]

Phase 1 is complete. Now build the complete authentication system.
Follow the security rules and coding standards from the Knowledge Base.
Build each piece in order. Explain the concept before writing each file.

2.1 — USER MODEL (server/models/User.model.js)
Fields: name, email(unique/lowercase), password(minlength:6), avatar,
avatarPublicId, role(enum: user|admin, default: user),
plan(enum: free|pro|team, default: free), isVerified(default: false),
verifyToken, resetToken, resetTokenExpiry(Date),
refreshTokens([String]), stripeCustomerId, lastLogin, timestamps
Requirements:
  - pre('save') hook: bcrypt hash with 12 salt rounds (skip if !isModified)
  - comparePassword(candidate) instance method using bcrypt.compare
  - toJSON() method: delete password, refreshTokens, verifyToken, resetToken

2.2 — JWT UTILITIES (server/utils/jwt.utils.js)
  - generateAccessToken(userId) → signs with JWT_SECRET, expires: 15m
  - generateRefreshToken(userId) → signs with JWT_REFRESH_SECRET, expires: 7d

2.3 — EMAIL UTILITIES (server/utils/email.utils.js)
Nodemailer transporter using Gmail (EMAIL_USER, EMAIL_PASS env vars)
Functions:
  - sendVerificationEmail(email, token) → link: CLIENT_URL/verify-email?token=
  - sendPasswordResetEmail(email, token) → link: CLIENT_URL/reset-password?token=
  - sendTeamInviteEmail(email, inviterName, projectName, token) → link: CLIENT_URL/invite?token=
Style: clean HTML email, branded "TaskFlow", button with link

2.4 — AUTH CONTROLLER (server/controllers/auth.controller.js)
Functions (all async, try/catch, call next(err)):
  register: validate fields → check email exists (409 if yes) → create user →
    generate verifyToken (crypto.randomBytes(32)) → save hashed token to user →
    sendVerificationEmail → generateAccessToken + generateRefreshToken →
    push refreshToken to user.refreshTokens → save → set httpOnly cookie →
    return { accessToken, user }
  login: find user by email → comparePassword → if wrong: 401 "Invalid credentials" →
    generateAccessToken + generateRefreshToken → push to refreshTokens →
    update lastLogin → save → set httpOnly cookie → return { accessToken, user }
  refresh: read refreshToken from req.cookies → verify with JWT_REFRESH_SECRET →
    find user → check token exists in user.refreshTokens → ROTATE: remove old,
    generate new refresh + new access → save → set new cookie → return { accessToken }
  logout: read cookie → find user → pull refreshToken from array → save →
    clearCookie → return { message: "Logged out" }
  verifyEmail: find user by hashed token → set isVerified=true → clear token → save
  forgotPassword: find user (NEVER reveal existence) → generate token →
    hash and save with expiry (1 hour) → sendPasswordResetEmail →
    return same message regardless of whether email exists
  resetPassword: hash token → find user where resetToken matches AND
    resetTokenExpiry > now → set new password → clear reset fields →
    clear ALL refreshTokens (logout all devices) → save

2.5 — GOOGLE + GITHUB OAUTH (server/config/passport.js)
  - GoogleStrategy: clientID, clientSecret, callbackURL
    callback: findOne by googleId OR email → if exists: link account →
    if new: create user (isVerified: true, no password needed)
  - GithubStrategy: same pattern
  After both strategies: redirect to CLIENT_URL/auth/callback?token=<accessToken>

2.6 — AUTH MIDDLEWARE (server/middleware/auth.middleware.js)
  protect: read Authorization header → verify JWT_SECRET →
    find user by decoded.id → attach to req.user → next()
    On TokenExpiredError: return 401 { message, code: "TOKEN_EXPIRED" }
  requireRole(...roles): check req.user.role in roles array
  requirePlan(...plans): check req.user.plan in plans array

2.7 — AUTH ROUTES (server/routes/auth.routes.js)
POST /register, POST /login, POST /refresh, POST /logout
GET /verify-email/:token, POST /forgot-password, POST /reset-password/:token
GET /google, GET /google/callback, GET /github, GET /github/callback

After completing Phase 2, provide the following test checkpoints:
  Test 1: Register → check email inbox for verification email
  Test 2: Login → confirm httpOnly cookie set in browser DevTools
  Test 3: Call GET /api/users/me without token → expect 401
  Test 4: Call with expired/invalid token → expect 401 + code: TOKEN_EXPIRED
  Test 5: Forgot password → confirm same response for real and fake emails`,
    artifacts: [
      "Implementation Plan listing every file to be created",
      "Each file created: User.model.js, jwt.utils.js, email.utils.js, auth.controller.js, passport.js, auth.middleware.js, auth.routes.js",
      "Terminal: server running with no errors after adding all auth files",
      "Postman collection screenshot showing all 5 test checkpoints passing",
    ]
  },

  p3: {
    title: "Phase 3 — Core Features: Projects, Tasks & Teams",
    mode: "Plan Mode",
    agentTip: "This is the biggest phase. Use Plan Mode. The plan should list every model and controller separately. Tip: after approving the plan, open Manager View to run two agents in parallel — one on models and one on invite system.",
    prompt: `[TASKFLOW — PHASE 3: CORE FEATURES]

Phases 1 and 2 are complete. Now build the core product features.
All code must follow Knowledge Base standards. Use Plan Mode.

3.1 — DATA MODELS

Project model (server/models/Project.model.js):
  name(required,trim), description(default:''), color(default:'#6366f1'),
  status(enum: active|archived, default: active), owner(ref:User,required),
  members: [{ user(ref:User), role(enum: viewer|editor|admin, default:editor),
  joinedAt(default:now) }], dueDate(Date), tags([String]), timestamps

Task model (server/models/Task.model.js):
  title(required), description(default:''), status(enum: todo|in-progress|in-review|done,
  default:todo), priority(enum: low|medium|high|urgent, default:medium),
  project(ref:Project,required), assignee(ref:User), createdBy(ref:User),
  dueDate(Date), order(Number,default:0), labels([String]),
  attachments:[{name,url,uploadedAt}],
  comments:[{author(ref:User), content(required), createdAt(default:now)}], timestamps
  Indexes: { project:1, status:1 } compound + { assignee:1 } + text index on title+description

Notification model (server/models/Notification.model.js):
  user(ref:User), type(enum: task_assigned|comment|member_added|due_soon),
  message(String), link(String), isRead(default:false), timestamps

Activity model (server/models/Activity.model.js):
  user(ref:User), project(ref:Project), task(ref:Task,optional),
  action(enum: created_project|updated_project|created_task|updated_task|
  completed_task|deleted_task|added_member|removed_member|commented),
  meta(Mixed), timestamps

Invite model (server/models/Invite.model.js):
  email, project(ref:Project), token(hashed), invitedBy(ref:User),
  expiresAt(48hr from creation), status(enum: pending|accepted|expired, default:pending)

3.2 — ACTIVITY UTILITY (server/utils/activity.utils.js)
  logActivity(userId, projectId, action, meta={}, taskId=null)
  Creates Activity record. Call this inside controllers after key actions.

3.3 — PROJECT CONTROLLERS (server/controllers/project.controller.js)
  getProjects: find where owner=req.user OR members.user=req.user
    .populate('owner','name avatar') .populate('members.user','name avatar email')
  createProject: create with owner=req.user, auto-add owner to members as admin
    → logActivity(created_project)
  isMember middleware: find project → check members array or owner → attach
    req.project and req.memberRole → 403 if not found
  isAdmin middleware: check req.memberRole === 'admin'
  getProject, updateProject(admin only), deleteProject(owner only), archiveProject
  addMember: find user by email → add to members → sendTeamInviteEmail → logActivity
  updateMemberRole, removeMember

3.4 — TASK CONTROLLERS (server/controllers/task.controller.js)
  getTasks: filter by project + optional: status, priority, assignee, date range
    paginate: skip=(page-1)*limit, limit from query (default 20)
    populate assignee and createdBy → sort by query param (default -createdAt)
  createTask: validate project membership → create → logActivity(created_task)
    if assignee !== creator: create Notification for assignee (type: task_assigned)
  updateTask: update fields → if status changed to 'done': logActivity(completed_task)
  deleteTask: logActivity(deleted_task)
  updateTaskStatus: PATCH /:id/status → update status + order → used by Kanban drag-drop
  addComment: push to task.comments → logActivity(commented)
    create Notification for task.createdBy (type: comment) if they're not the commenter
  deleteComment: pull from task.comments (only comment author or project admin)
  searchTasks: GET /search?q= → use $text: { $search: q } with textScore sort

3.5 — TEAM INVITE SYSTEM
  POST /api/projects/:id/invite:
    generate plainToken (crypto.randomBytes(32).toString('hex'))
    save hashed token (sha256) to Invite doc with 48hr expiry
    sendTeamInviteEmail(email, req.user.name, project.name, plainToken)

  GET /api/invites/:token:
    hash incoming token → find Invite where token matches + status=pending
    + expiresAt > now → return invite with project info

  POST /api/invites/:token/accept:
    validate token → find user (must be logged in) →
    add user to project.members (role: editor) →
    update Invite status to accepted →
    logActivity(added_member)

3.6 — FILE UPLOADS (server/middleware/upload.middleware.js + utils)
  Multer: memoryStorage(), 5MB limit for avatars, 10MB for attachments
  Cloudinary upload utility: stream buffer → cloudinary.uploader.upload_stream
  PUT /api/users/avatar: upload single → resize 200x200 → delete old avatarPublicId → save URL
  POST /api/tasks/:id/attachments: upload file → save {name, url} to task.attachments

3.7 — PROJECT ROUTES (server/routes/project.routes.js)
  All routes: protect middleware first
  GET/POST /   | GET/PUT/DELETE /:id (isMember)
  POST /:id/invite (isMember + isAdmin)
  GET /:id/activity (isMember)
  GET /:id/tasks, POST /:id/tasks (isMember)

3.8 — TASK ROUTES (server/routes/task.routes.js)
  All routes: protect middleware
  PATCH /:id/status | PUT /:id | DELETE /:id
  POST /:id/comments | DELETE /:id/comments/:commentId
  POST /:id/attachments

After completing Phase 3, provide these test checkpoints:
  Test 1: Create project → check MongoDB Atlas that owner is in members as admin
  Test 2: Log in as User B → try to GET a project User B is not a member of → expect 403
  Test 3: Create task with assignee → check Notification created for assignee
  Test 4: Full invite flow: send invite email → click link → accept → check project.members
  Test 5: Upload avatar → verify Cloudinary URL saved in user.avatar field`,
    artifacts: [
      "Implementation Plan: list of all 5 models + all controllers + routes",
      "All model files created with correct schemas and indexes",
      "All controller files with complete CRUD operations",
      "Route files wired up correctly in server/index.js",
      "Postman screenshot: all 5 Phase 3 test checkpoints passing",
    ]
  },

  p4: {
    title: "Phase 4 — React Frontend",
    mode: "Fast Mode for components, Plan Mode for complex state",
    agentTip: "Use Manager View here. Dispatch Agent 1 to build the Axios instance + Redux store, and Agent 2 to scaffold all page components simultaneously. This cuts Day 10–14 roughly in half.",
    prompt: `[TASKFLOW — PHASE 4: REACT FRONTEND]

Phases 1–3 complete. Now build the complete React frontend.
Use the Knowledge Base for stack details and the optimistic updates pattern.

4.1 — AXIOS INSTANCE (client/src/api/axios.js)
  - Create axios instance: baseURL = import.meta.env.VITE_API_URL, withCredentials: true
  - REQUEST interceptor: read accessToken from localStorage →
    add Authorization: Bearer <token> header
  - RESPONSE interceptor: on 401 + data.code === 'TOKEN_EXPIRED':
    • If already refreshing: queue the failed request (use failedQueue array)
    • Set isRefreshing = true
    • Call POST /auth/refresh (withCredentials: true, separate axios instance)
    • On success: store new token in localStorage, process queue, retry original request
    • On failure: clear localStorage, redirect to /login
    • This handles concurrent requests gracefully (no duplicate refresh calls)

4.2 — REDUX TOOLKIT STORE (client/src/store/)
  store/index.js: configureStore with all slices

  store/slices/authSlice.js:
    State: { user: null, isAuthenticated: false, isLoading: true, error: null }
    Thunks (createAsyncThunk):
      loginUser(credentials) → POST /auth/login → store accessToken in localStorage
      registerUser(data) → POST /auth/register
      loadUser() → GET /users/me (called on app mount to restore session)
      logoutUser() → POST /auth/logout → clear localStorage
    Reducers: clearError
    extraReducers: handle fulfilled/rejected for all thunks

  store/slices/projectSlice.js:
    State: { projects:[], currentProject:null, loading:false, error:null }
    Thunks: fetchProjects, createProject, updateProject, deleteProject

  store/slices/taskSlice.js:
    State: { tasks:[], loading:false, filters:{status:null,priority:null,assignee:null} }
    Thunks: fetchTasks, createTask, updateTask, deleteTask, updateTaskStatus
    Note: updateTaskStatus must use the Optimistic Update pattern from Knowledge Base

  store/slices/notificationSlice.js:
    State: { notifications:[], unreadCount:0, loading:false }
    Thunks: fetchNotifications, markAsRead, markAllAsRead
    Reducer: addNotification (called by Socket.io when new notification arrives)

4.3 — REACT ROUTER STRUCTURE (client/src/App.jsx)
  Public routes: /login, /register, /verify-email, /reset-password, /auth/callback
  Protected routes (ProtectedRoute component):
    /dashboard
    /projects/:id  (KanbanBoard)
    /projects/:id/analytics  (PlanRoute: requires pro or team plan)
    /settings/profile
    /settings/billing
  ProtectedRoute: if isLoading → show spinner. if !isAuthenticated → Navigate to /login
  PlanRoute: extends ProtectedRoute, also checks user.plan against allowed plans

  On app mount (App.jsx useEffect): dispatch(loadUser()) to restore auth from cookie

4.4 — PAGES TO BUILD

  pages/LoginPage.jsx:
    Email + password form. Google OAuth button (link to /api/auth/google).
    GitHub OAuth button. Error display. Loading state on submit.
    On success: dispatch(loginUser) → navigate to /dashboard

  pages/RegisterPage.jsx:
    Name, email, password, confirm password. Password strength indicator.
    Google + GitHub OAuth buttons. On success → show "Check email" message.

  pages/AuthCallback.jsx:
    Read ?token= from URL → store in localStorage → dispatch(loadUser) → navigate /dashboard

  pages/DashboardPage.jsx:
    Fetch and display: project grid (ProjectCard components), quick stats bar
    (total projects, tasks due today, completed this week), recent activity feed.

  pages/KanbanBoard.jsx:
    DragDropContext wrapping 4 Droppable columns (todo/in-progress/in-review/done)
    Each column: Draggable TaskCards. Task card shows: title, priority badge,
    due date, assignee avatar, label tags, comment count.
    onDragEnd: use Optimistic Update pattern → dispatch(updateTaskStatus)
    "+ Add Task" button opens TaskModal in create mode.
    Filter bar: search (useDebounce 300ms), priority, assignee dropdowns.

  pages/AnalyticsPage.jsx (Pro+ only):
    Recharts: LineChart (tasks/week), PieChart (by status), BarChart (by priority)
    Member productivity list. Project progress bars.
    If user.plan === 'free': show upgrade CTA overlay instead of charts.

  pages/SettingsProfile.jsx:
    Edit name. Avatar upload (file input → POST /users/avatar → update Redux).

  pages/SettingsBilling.jsx:
    Show current plan + features. Plan comparison table.
    "Upgrade" button → POST /billing/checkout → redirect to Stripe Checkout URL.
    "Manage" button → POST /billing/portal → redirect to Stripe Customer Portal.

4.5 — REUSABLE COMPONENTS
  components/TaskModal.jsx: slide-over panel. Full task detail view.
    Edit title, description, status, priority, assignee, due date, labels.
    File attachments drag-drop zone. Comments section with reply input.
  components/NotificationDropdown.jsx: bell icon + unread badge.
    Dropdown list. Mark as read on click. "Mark all read" button.
  components/Navbar.jsx: logo, nav links, notifications bell, user avatar menu.
  components/ProtectedRoute.jsx + PlanRoute.jsx (see 4.3)
  components/Spinner.jsx, Avatar.jsx, Badge.jsx, EmptyState.jsx

4.6 — REAL-TIME SOCKET.IO (client/src/hooks/useSocket.js)
  Custom hook: useSocket()
  On mount: connect socket with auth: { token: localStorage.accessToken }
  Emit: socket.emit('join', userId) to join personal room
  Listen: socket.on('notification', (data) => dispatch(addNotification(data)))
  Show toast on new notification (use a simple toast state or react-hot-toast)
  On unmount / logout: socket.disconnect()
  Use this hook in App.jsx when isAuthenticated === true

4.7 — CUSTOM HOOKS
  hooks/useDebounce.js: debounce any value with configurable delay (default 300ms)
  hooks/useAuth.js: convenience hook → return useSelector(state => state.auth)
  hooks/useProjects.js: fetch projects on mount, return { projects, loading, error }

After completing Phase 4, provide these test checkpoints:
  Test 1: Refresh page while logged in → user should remain logged in (loadUser works)
  Test 2: Wait for access token to expire (15 min) → make any API call →
    Network tab should show: failed request → /auth/refresh → original request retried
  Test 3: Drag a Kanban task → immediately appears in new column →
    check MongoDB that status field updated within 1 second
  Test 4: Open two browser tabs as same user → get a notification in one tab →
    both tabs should show the unread badge increase`,
    artifacts: [
      "Implementation Plan: complete list of all files to create",
      "All slice files created with correct thunks and reducers",
      "All page components created and wired to Router",
      "Browser screenshot: Dashboard page with project cards visible",
      "Browser screenshot: Kanban board with draggable task cards",
      "Browser screenshot: Analytics page (upgrade gate for free plan)",
      "Network tab screenshot showing silent token refresh working",
    ]
  },

  p5: {
    title: "Phase 5 — Advanced Features & Deploy",
    mode: "Manager View (multi-agent)",
    agentTip: "This phase is perfect for Manager View. Dispatch 3 agents in parallel: Agent 1 → Socket.io server + Stripe, Agent 2 → MongoDB analytics aggregations, Agent 3 → production hardening + deployment config.",
    prompt: `[TASKFLOW — PHASE 5: ADVANCED FEATURES + PRODUCTION DEPLOY]

Phases 1–4 are complete. Final phase: real-time, billing, analytics, hardening, deploy.
Use Manager View to run the Socket.io + Stripe agent and the Analytics agent in parallel.

5.1 — SOCKET.IO SERVER (server/config/socket.js + updates to index.js)
  Initialize: const io = new Server(httpServer, { cors: { origin: CLIENT_URL } })
  Auth middleware for socket connections:
    io.use((socket, next) => { verify socket.handshake.auth.token with JWT_SECRET })
  On connection: socket.join(socket.userId) (personal room)
  
  Notification utility (server/utils/notification.utils.js):
    emitNotification(io, userId, type, message, link):
      Create Notification document in DB
      io.to(userId).emit('notification', notificationDoc)
  
  Call emitNotification in these controllers:
    task.controller createTask: if assignee exists → emit to assignee (type: task_assigned)
    task.controller addComment: emit to task.createdBy (type: comment)
    project.controller addMember: emit to new member (type: member_added)
  
  Due-soon cron job (server/jobs/dueSoon.job.js):
    Use node-cron: run every day at 9am
    Find tasks where dueDate is within next 24 hours AND status != done
    For each: emitNotification to task.assignee (type: due_soon)
    Register cron in index.js after DB connects

5.2 — STRIPE BILLING (server/controllers/billing.controller.js)
  POST /api/billing/checkout:
    If user has no stripeCustomerId: create Stripe customer → save to user
    Create Stripe Checkout Session:
      customer: user.stripeCustomerId
      mode: 'subscription'
      line_items: [{ price: STRIPE_PRO_PRICE_ID or TEAM based on req.body.plan }]
      success_url: CLIENT_URL/settings/billing?success=true
      cancel_url: CLIENT_URL/settings/billing?canceled=true
      trial_period_days: 14 (if user has never had a trial)
    Return: { url: session.url } — frontend redirects to this URL

  POST /api/billing/portal:
    Create Stripe Billing Portal session for user.stripeCustomerId
    Return: { url: session.url }

  POST /api/billing/webhook (raw body middleware — NOT express.json()):
    Verify stripe signature: stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
    Handle events:
      checkout.session.completed:
        Update user.plan based on price ID
        Create/update Subscription record
      customer.subscription.updated:
        Update user.plan + subscription.status
      customer.subscription.deleted:
        Set user.plan = 'free', update subscription.status = 'canceled'
    IMPORTANT: webhook route must be registered BEFORE express.json() middleware

  Gate features with requirePlan middleware (already built in Phase 2):
    Analytics routes: requirePlan('pro', 'team')
    Invite beyond 3 members: requirePlan('team')

5.3 — ANALYTICS AGGREGATION (server/controllers/analytics.controller.js)
  GET /api/projects/:id/analytics (protect + isMember + requirePlan('pro','team'))
  Run all 5 aggregations in PARALLEL using Promise.all:

  tasksPerWeek: Task.aggregate([
    { $match: { project: projectId, createdAt: { $gte: 8 weeks ago } } },
    { $group: { _id: { $isoWeek: '$createdAt' }, count: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status','done'] },1,0] } } } },
    { $sort: { '_id': 1 } }
  ])

  tasksByStatus: Task.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ])

  tasksByPriority: Task.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ])

  memberProductivity: Task.aggregate([
    { $match: { project: projectId, status: 'done', assignee: { $exists: true } } },
    { $group: { _id: '$assignee', completed: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { 'user.name':1, 'user.avatar':1, completed:1 } },
    { $sort: { completed: -1 } }
  ])

  projectProgress: Task.aggregate([
    { $match: { project: projectId } },
    { $group: { _id: null, total: { $sum: 1 },
      completed: { $sum: { $cond: [{ $eq: ['$status','done'] },1,0] } } } },
    { $project: { percentage: { $multiply:
      [{ $divide: ['$completed','$total'] }, 100] } } }
  ])

  Return all 5 results in one response object.

5.4 — SEARCH + PAGINATION
  Confirm all list endpoints support: ?page=1&limit=20&sort=-createdAt
  Task search: GET /api/projects/:id/tasks/search?q=&status=&priority=&assignee=
    Use $text: { $search: q } + textScore sort when q is provided
    Return: { tasks, total, pages, page }
  useDebounce hook already built in Phase 4 — wire to search inputs.

5.5 — SECURITY HARDENING
  Add to server/index.js:
    mongo-sanitize middleware (npm install express-mongo-sanitize) against NoSQL injection
    Rate limiters:
      authLimiter: 10 requests / 15 minutes → apply to all /api/auth/* routes
      apiLimiter: 100 requests / 15 minutes → apply to all /api/* routes
  Add GET /ping → res.json({ status: 'ok' }) — for UptimeRobot keep-alive
  Validate all POST/PUT/PATCH endpoints with express-validator chains.
  Ensure CORS origin is set to CLIENT_URL env var only (not '*').

5.6 — DEPLOYMENT

  Backend → Render.com:
    Create Web Service → connect GitHub repo → set root directory to /server
    Build Command: npm install
    Start Command: node index.js
    Add ALL .env variables in Render Environment tab
    After deploy: update CORS CLIENT_URL to Vercel URL

  Frontend → Vercel:
    Import GitHub repo → set root directory to /client
    Framework: Vite
    Add env variable: VITE_API_URL = https://your-app.onrender.com/api
    After deploy: note your Vercel URL

  Post-deployment checklist (agent must verify each):
    [ ] Update Google OAuth redirect URI in Google Cloud Console
    [ ] Update GitHub OAuth callback URL in GitHub App settings
    [ ] Update Stripe webhook endpoint URL to Render URL in Stripe Dashboard
    [ ] Test full E2E flow on live URL: register → verify email → login →
        create project → invite member → create task → drag on Kanban →
        check analytics (upgrade to Pro first)
    [ ] Set up UptimeRobot free monitor → ping /ping every 10 minutes

After all tasks, generate a FINAL SUMMARY ARTIFACT listing:
  - Live backend URL (Render)
  - Live frontend URL (Vercel)
  - All features implemented with ✅ or ❌
  - Any known limitations or future improvements`,
    artifacts: [
      "Implementation Plan: Socket.io server, Stripe, analytics, hardening, deploy steps",
      "Socket events verified: browser console showing 'notification' event received",
      "Stripe Checkout: browser screenshot of Stripe checkout page loading",
      "Analytics charts: browser screenshot of charts rendering with real data",
      "Render deploy log: showing successful deployment",
      "Vercel deploy log: showing successful build",
      "Final Summary Artifact: live URLs + feature checklist",
    ]
  }
};

// ── Components ────────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} style={{
      padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
      background: copied ? COLORS.green + "22" : "#1F2937",
      color: copied ? COLORS.green : COLORS.muted,
      fontSize: "12px", fontWeight: "700", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ text }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        background: "#070B14", borderRadius: "10px", padding: "20px",
        border: `1px solid ${COLORS.border}`, overflowX: "auto",
        maxHeight: "420px", overflowY: "auto",
      }}>
        <pre style={{
          margin: 0, color: "#E2E8F0", fontSize: "12px",
          lineHeight: "1.75", fontFamily: "'Fira Code', 'Cascadia Code', monospace",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>{text}</pre>
      </div>
      <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        <CopyButton text={text} />
      </div>
    </div>
  );
}

function KBView({ data }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <p style={{ color: COLORS.muted, fontSize: "13px", lineHeight: "1.7", marginBottom: "24px" }}>
        {data.howTo}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {data.skills.map((skill, i) => (
          <div key={i} style={{
            background: COLORS.card, border: `1px solid ${open === i ? COLORS.purple : COLORS.border}`,
            borderRadius: "12px", overflow: "hidden",
            boxShadow: open === i ? `0 0 20px ${COLORS.purple}22` : "none",
            transition: "all 0.2s",
          }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{
              width: "100%", display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "16px 20px", background: "none",
              border: "none", cursor: "pointer", color: COLORS.text,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: COLORS.purple + "22", color: COLORS.purple,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "800",
                }}>{i + 1}</div>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>{skill.name}</span>
              </div>
              <span style={{ color: COLORS.muted, fontSize: "16px", transition: "transform 0.2s", transform: open === i ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 20px" }}>
                <CodeBlock text={skill.body} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PhaseView({ data, color }) {
  const [tab, setTab] = useState("prompt");
  const tabs = [
    { key: "prompt", label: "🤖 Agent Prompt" },
    { key: "artifacts", label: "📦 Expected Artifacts" },
    { key: "tip", label: "💡 Antigravity Tips" },
  ];
  return (
    <div>
      {/* Mode badge */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{
          background: color + "18", color, border: `1px solid ${color}44`,
          borderRadius: "999px", padding: "4px 14px", fontSize: "12px", fontWeight: "700",
        }}>⚙️ Use: {data.mode}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: COLORS.card, padding: "4px", borderRadius: "10px", border: `1px solid ${COLORS.border}` }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "8px 12px", borderRadius: "8px", border: "none",
            cursor: "pointer", fontSize: "12px", fontWeight: "700",
            background: tab === t.key ? color + "22" : "transparent",
            color: tab === t.key ? color : COLORS.muted,
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "prompt" && (
        <div>
          <div style={{ color: COLORS.muted, fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "10px" }}>
            PASTE THIS INTO ANTIGRAVITY AGENT PANEL
          </div>
          <CodeBlock text={data.prompt} />
        </div>
      )}

      {tab === "artifacts" && (
        <div>
          <div style={{ color: COLORS.muted, fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", marginBottom: "14px" }}>
            VERIFY THESE ARTIFACTS BEFORE MOVING TO NEXT PHASE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.artifacts.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "12px",
                background: COLORS.card, border: `1px solid ${COLORS.border}`,
                borderRadius: "10px", padding: "12px 16px",
              }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: color + "22", color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "800",
                }}>{i + 1}</div>
                <span style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: "1.6" }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tip" && (
        <div style={{
          background: color + "0f", border: `1px solid ${color}33`,
          borderRadius: "12px", padding: "20px 24px",
        }}>
          <div style={{ color, fontWeight: "800", fontSize: "14px", marginBottom: "12px" }}>
            🚀 Antigravity-Specific Tips for This Phase
          </div>
          <p style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: "1.8", margin: 0 }}>
            {data.agentTip}
          </p>
          <div style={{ marginTop: "16px", padding: "14px", background: "#070B14", borderRadius: "8px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.muted, fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>ANTIGRAVITY WORKFLOW FOR THIS PHASE</div>
            {[
              "1. Paste the prompt → switch to Plan Mode",
              "2. Read the Implementation Plan artifact carefully",
              "3. If plan looks wrong → leave a comment on the artifact",
              "4. Approve the plan → watch the agent execute",
              "5. Check each artifact as it appears in the Artifacts panel",
              "6. After all files are created → run the test checkpoints",
              "7. If a test fails → paste the error and say 'fix this'",
            ].map((step, i) => (
              <div key={i} style={{ color: "#9CA3AF", fontSize: "12px", padding: "3px 0", lineHeight: "1.6" }}>{step}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("kb");
  const activePhase = phases.find(p => p.id === active);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: COLORS.text, display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px", height: "54px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "800", fontSize: "16px" }}>
            <span style={{ color: COLORS.accent }}>Task</span>Flow
          </span>
          <span style={{ background: "#1F2937", color: COLORS.muted, fontSize: "10px", fontWeight: "700", padding: "2px 10px", borderRadius: "999px", letterSpacing: "0.08em" }}>
            ANTIGRAVITY PROMPTS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS.green }} />
          <span style={{ color: COLORS.muted, fontSize: "12px" }}>Gemini 3 Pro · Optimized</span>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: "230px", background: COLORS.card, borderRight: `1px solid ${COLORS.border}`, padding: "20px 10px", flexShrink: 0, overflowY: "auto" }}>
          <div style={{ color: COLORS.muted, fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", padding: "0 10px", marginBottom: "10px" }}>SETUP</div>
          {phases.slice(0, 1).map(p => (
            <button key={p.id} onClick={() => setActive(p.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active === p.id ? p.color + "18" : "transparent",
              borderLeft: active === p.id ? `3px solid ${p.color}` : "3px solid transparent",
              marginBottom: "2px", textAlign: "left", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "16px" }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: active === p.id ? p.color : COLORS.text }}>{p.label}</div>
                <div style={{ fontSize: "10px", color: COLORS.muted }}>{p.subtitle}</div>
              </div>
            </button>
          ))}

          <div style={{ color: COLORS.muted, fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", padding: "0 10px", marginBottom: "10px", marginTop: "18px" }}>BUILD PHASES</div>
          {phases.slice(1).map(p => (
            <button key={p.id} onClick={() => setActive(p.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: active === p.id ? p.color + "18" : "transparent",
              borderLeft: active === p.id ? `3px solid ${p.color}` : "3px solid transparent",
              marginBottom: "2px", textAlign: "left", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "16px" }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: "700", color: active === p.id ? p.color : COLORS.text }}>{p.label}</div>
                <div style={{ fontSize: "10px", color: COLORS.muted }}>{p.subtitle}</div>
              </div>
            </button>
          ))}

          {/* Quick ref */}
          <div style={{ marginTop: "24px", padding: "14px", background: "#070B14", borderRadius: "10px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ color: COLORS.muted, fontSize: "10px", fontWeight: "700", letterSpacing: "0.08em", marginBottom: "10px" }}>QUICK TIPS</div>
            {[
              ["Plan Mode", "Complex features"],
              ["Fast Mode", "Quick fixes/edits"],
              ["Manager View", "Parallel agents"],
              ["Artifacts", "Review before approving"],
              ["Knowledge Base", "Add skills once"],
            ].map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: COLORS.accent, fontSize: "11px", fontWeight: "700" }}>{key}</span>
                <span style={{ color: COLORS.muted, fontSize: "11px" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: activePhase.color + "18", fontSize: "20px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{activePhase.icon}</div>
              <div>
                <div style={{ fontSize: "11px", color: activePhase.color, fontWeight: "700", letterSpacing: "0.1em" }}>
                  {activePhase.subtitle?.toUpperCase()}
                </div>
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: COLORS.text }}>
                  {content[active]?.title || activePhase.label}
                </h2>
              </div>
            </div>

            {active === "kb"
              ? <KBView data={content.kb} />
              : <PhaseView data={content[active]} color={activePhase.color} />
            }
          </div>
        </div>
      </div>
    </div>
  );
}
