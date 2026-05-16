# Team Task Manager

A full-stack collaborative project management application with role-based access control, task tracking, calendar scheduling, and real-time progress monitoring.

Built with **React + Vite** on the frontend and **Node.js + Express + PostgreSQL** on the backend.

---

## Features

### Core
- **Authentication & Authorization** — JWT-based signup/login with role-based access (Admin / Member)
- **Project Management** — Create, update, and delete projects with descriptions and metadata
- **Team Management** — Add/remove members to projects with role assignment
- **Task Management** — Full CRUD with title, description, priority (Low/Medium/High), status (Pending/In Progress/Completed), due dates, and assignment

### Dashboard
- **Statistics overview** — Total tasks, completed, in progress, and overdue counts
- **Visual charts** — Task status pie chart and project count ring
- **Recent tasks** — Filterable, searchable table of the latest 10 tasks

### Calendar
- **Monthly calendar view** — Navigate between months, see days with task due dates marked
- **Date drill-down** — Click any date to view all tasks due that day with full details

### Overdue Tracking
- **Overdue Students page** — Groups all users with overdue tasks, showing task count, project links, and priority/status badges

### Progress Monitoring
- **Project progress bars** — Each project card displays a visual completion percentage bar

### Search
- **Multi-field search** — Search tasks by title, project name, or assigned user across Dashboard, Tasks, and Project Detail pages

### Theming
- **Dark/Light mode toggle** — Persistent theme preference with a sidebar toggle button

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Axios |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL (raw SQL via `pg`) |
| **Authentication** | JWT (`jsonwebtoken`), bcryptjs |
| **Validation** | express-validator |
| **Styling** | Plain CSS with CSS custom properties (dark/light theme) |
| **Icons** | Font Awesome 6.5.1 |
| **Typography** | Poppins (Google Fonts) |

---

## Project Structure

```
team-task-manager/
├── client/                      # React frontend
│   ├── src/
│   │   ├── main.jsx             # Entry point
│   │   ├── App.jsx              # Root component + routing
│   │   ├── index.css            # Global styles (themed)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   └── ThemeContext.jsx  # Dark/light theme toggle
│   │   ├── services/
│   │   │   └── api.js            # Axios HTTP client
│   │   ├── components/
│   │   │   └── Sidebar.jsx      # Navigation sidebar
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Signup.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Projects.jsx
│   │       ├── ProjectDetail.jsx
│   │       ├── Tasks.jsx
│   │       ├── Calendar.jsx
│   │       ├── OverdueStudents.jsx
│   │       └── Admin.jsx
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
│
├── server/                      # Express backend
│   ├── index.js                 # Server entry point
│   ├── config/
│   │   └── db.js                # PostgreSQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT authentication + role authorization
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   ├── memberController.js
│   │   └── taskController.js
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   ├── run.js
│   │   └── seed.js
│   └── package.json
│
├── README.md
└── checks.json
```

---

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) running locally
- npm (comes with Node.js)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd team-task-manager

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb team_task_manager
```

### 3. Environment Configuration

Create `server/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/team_task_manager
JWT_SECRET=your_jwt_secret_key_change_in_production
ADMIN_SECRET_CODE=optional_admin_signup_code
FRONTEND_URL=http://localhost:3000
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: 5000) | Server port |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens |
| `ADMIN_SECRET_CODE` | No | Code required to register as admin |
| `FRONTEND_URL` | No | CORS origin (defaults to `*`) |

### 4. Run Migrations and Seed

```bash
cd server
npm run migrate   # Creates all database tables
npm run seed      # Seeds default admin user
```

Default admin credentials: `admin@example.com` / `admin123`

### 5. Start the Application

```bash
# Terminal 1 - Backend (with auto-reload)
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Scripts

### Client (`client/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

### Server (`server/package.json`)

| Script | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed default admin user |

---

## API Reference

All API endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| GET | `/api/auth/me` | Yes | Get current authenticated user |

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Yes | User-specific task/project statistics |
| GET | `/api/dashboard/users` | Yes | List all users with project/task counts |
| GET | `/api/dashboard/overdue-students` | Yes | Users with overdue tasks and their details |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/admin/stats` | Admin | Global platform statistics |
| PUT | `/api/dashboard/admin/users/:id/role` | Admin | Change a user's role |
| DELETE | `/api/dashboard/admin/users/:id` | Admin | Delete a user |

### Projects

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | Yes | List user's projects (with member/task/completed counts) |
| POST | `/api/projects` | Yes | Create a new project |
| GET | `/api/projects/:id` | Yes | Get project details |
| PUT | `/api/projects/:id` | Yes | Update project |
| DELETE | `/api/projects/:id` | Yes | Delete project and all associated data |

### Project Members

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:id/members` | Yes | List project members |
| POST | `/api/projects/:id/members` | Yes | Add member to project |
| DELETE | `/api/projects/:id/members/:memberId` | Yes | Remove member from project |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks/project/:projectId` | Yes | List tasks for a project |
| POST | `/api/tasks/project/:projectId` | Yes | Create a task |
| GET | `/api/tasks/with-due-dates` | Yes | All tasks with due dates (for calendar) |
| PUT | `/api/tasks/:id` | Yes | Update a task (partial updates supported) |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |

---

## Database Schema

### Tables

**users** — Platform users with role-based access
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL |
| `role` | VARCHAR(10) | DEFAULT 'member', CHECK (admin/member) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**projects** — Project entities
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `name` | VARCHAR(200) | NOT NULL |
| `description` | TEXT | |
| `created_by` | INTEGER | FK → users.id (SET NULL) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**project_members** — Many-to-many relationship between users and projects
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `project_id` | INTEGER | FK → projects.id (CASCADE) |
| `user_id` | INTEGER | FK → users.id (CASCADE) |
| `role` | VARCHAR(10) | DEFAULT 'member', CHECK (admin/member) |
| | | UNIQUE(project_id, user_id) |

**tasks** — Individual tasks within projects
| Column | Type | Constraints |
|---|---|---|
| `id` | SERIAL | PRIMARY KEY |
| `title` | VARCHAR(300) | NOT NULL |
| `description` | TEXT | |
| `status` | VARCHAR(20) | DEFAULT 'pending', CHECK (pending/in_progress/completed) |
| `priority` | VARCHAR(10) | DEFAULT 'medium', CHECK (low/medium/high) |
| `due_date` | DATE | |
| `project_id` | INTEGER | FK → projects.id (CASCADE) |
| `assigned_to` | INTEGER | FK → users.id (SET NULL) |
| `created_by` | INTEGER | FK → users.id (SET NULL) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## Deployment (Railway)

1. Push the repository to GitHub
2. Create a new project on [Railway](https://railway.app/)
3. Add a **PostgreSQL** database service — Railway provides the `DATABASE_URL`
4. Add a **backend** service:
   - Root directory: `server`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_SECRET_CODE`
5. Add a **frontend** service:
   - Root directory: `client`
   - Build command: `npm run build`
   - Start command: `npx serve dist`
   - Environment variable: `VITE_API_URL` (set to your backend's Railway URL)
6. Run migrations on Railway: `npm run migrate`
7. Run seed (optional): `npm run seed`

---

## License

MIT
