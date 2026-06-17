# Nexus — Android Club Collaboration Platform

> **Android Club Technical Recruitment 2026 · Web Development Task**

Nexus is a full-stack project management and collaboration platform built for the Android Club. It transforms a basic task tracker into a complete team workspace: Kanban boards, sprint planning, activity feeds, analytics, announcements, and role-based access — all in one polished dark-themed app inspired by Android's design language.

**Live Demo:** _[Add your Vercel/Render URL here after deployment]_

---

## Features Implemented

### 1. Kanban Board (Core Requirement)
- Three-column drag-and-drop board: **To Do → In Progress → Done**
- Powered by `@hello-pangea/dnd` with full keyboard accessibility
- Tasks can also be moved with Forward/Back buttons (no drag required)
- Confetti celebration fires when a task reaches "Done"
- Column-level "Add Task" shortcut per stage

### 2. Task Management
- Create tasks with: title, description, priority (High/Medium/Low), assignee, due date, comma-separated tags
- Edit any field after creation
- Delete with confirmation dialog and optimistic UI (auto-rollback on failure)
- Overdue indicator on task cards (red badge when past due date)
- Subtask checklist with per-task completion percentage

### 3. Task Detail Drawer
- Slide-in panel on clicking any task title
- Full metadata: status, priority, assignee, due date, all tags, subtask progress
- **Live comment thread** stored in MongoDB as embedded subdocuments
- Closes on Escape key or backdrop click

### 4. Command Palette (⌘K / Ctrl+K)
- Global spotlight-style search accessible from any page
- Searches tasks by title, members by name/email, and navigation links simultaneously
- Grouped result sections: Navigate, Actions, Tasks, Members
- Full keyboard navigation (↑↓ arrows, Enter to open, Escape to close)

### 5. Team Members Directory
- Member cards with gradient avatar, role badge, task count, and completion bar
- Individual member profile pages with all assigned tasks (status-coloured borders)
- Admin-only "Add Member" button with role selector (Member / Lead / Admin)

### 6. Club Bulletin Board (`/announcements`)
- Post announcements with title, content, author, and an emoji icon (12-emoji picker)
- **Pin/unpin** posts — pinned items float to top with accent border
- Delete with confirmation
- Sorted: pinned first, then newest-first

### 7. Activity Feed (`/activity`)
- Chronological log of every task event (created, status moves, deletions, edits)
- Grouped by day with event-count badges
- Icon-coded event types with colour-coded dots

### 8. Analytics Dashboard (`/analytics`)
- Stat cards: total tasks, completed, completion rate, overdue, done this week, high priority
- Bar charts for tasks by status and tasks by priority (Recharts)
- Member workload leaderboard with per-member completion bars
- One-click CSV export of all tasks

### 9. Sprint Planning (`/sprints`)
- Create sprints with name, goal, start/end date, status (Planned/Active/Completed), and colour
- Animated progress ring per sprint
- Task list inside each sprint card
- Sprint status cycling with toast feedback

### 10. Calendar View (`/dashboard`)
- Toggle between Kanban and Calendar on the dashboard
- Tasks rendered on their due dates in a full-month grid

### 11. Authentication & Role-Based Access
- Email/password authentication via **NextAuth.js** with JWT sessions
- Three roles: **Member**, **Admin**, **Super Admin**
- Super Admin email: `superadmin@androidclub.com` (hardcoded — first user to register with this email gets promoted automatically)
- Admin-only UI: "Add Member" button, Admin Panel link
- Admin Panel: lists all registered users with role management

### 12. Theme Toggle
- Dark (default) / Light mode toggle in the Navbar
- Preference persisted to `localStorage`, applied before first paint (no flash)

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React Server + Client Components) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS Custom Properties (Material You colour system) |
| Database | MongoDB Atlas via Mongoose 9 |
| Auth | NextAuth.js v4 (CredentialsProvider + JWT) |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts 3 |
| Notifications | react-hot-toast |
| Fonts | Inter + JetBrains Mono (Google Fonts via next/font) |
| Deployment | Vercel (recommended) |

---

## Setup Instructions

### Prerequisites
- **Node.js 18+** and npm
- A **MongoDB Atlas** cluster (free tier is fine) — [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/devChart.git
cd devChart
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root (never commit this file):

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# NextAuth — generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_here

# Change to your domain in production
NEXTAUTH_URL=http://localhost:3000
```

> **MongoDB Atlas setup:**
> 1. Create a free cluster at atlas.mongodb.com
> 2. Add a database user (Database Access → Add New Database User)
> 3. Whitelist your IP (Network Access → Add IP Address → Allow Access from Anywhere for Vercel)
> 4. Get the connection string (Connect → Drivers → Node.js) and paste it as `MONGODB_URI`

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Create your first account

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Register with any name and email — you become a **Member** by default
3. To get **Super Admin** access, register with exactly: `superadmin@androidclub.com`
4. Admins can promote other users from the Admin Panel (`/admin`)

### 5. Build for production

```bash
npm run build
npm start
```

---

## Deployment (Vercel — recommended)

1. Push your fork to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. In **Environment Variables**, add:
   - `MONGODB_URI` — your Atlas connection string
   - `NEXTAUTH_SECRET` — your generated secret
   - `NEXTAUTH_URL` — your Vercel domain (e.g. `https://nexus-androidclub.vercel.app`)
4. Click **Deploy**
5. After deploy, go to your Atlas cluster → Network Access → Add your Vercel IP (or allow all `0.0.0.0/0`)

---

## How to Test Everything

### Quick Test Checklist

Run `npm run dev`, then follow this sequence:

#### Auth
- [ ] Register a new account at `/register` → should auto-login and redirect to `/dashboard`
- [ ] Sign out → should redirect to `/login`
- [ ] Login again with correct credentials → should succeed
- [ ] Login with wrong password → should show "Invalid email or password"
- [ ] Register with `superadmin@androidclub.com` → check `/admin` shows "Super Admin" badge

#### Kanban Board (`/dashboard`)
- [ ] Dashboard loads with empty columns (or tasks if seeded)
- [ ] Click "Add Task" or "New Task" → fill form → submit → task appears in "To Do"
- [ ] Drag a task card to "In Progress" → card moves, toast appears
- [ ] Drag a task to "Done" → confetti fires, toast appears
- [ ] Click Forward/Back buttons on a card → task moves without dragging
- [ ] Search bar filters tasks in real time across all columns
- [ ] Priority filter (High/Medium/Low) shows only matching tasks
- [ ] Click the Calendar icon → switches to calendar view showing tasks by due date
- [ ] Click a task title → Task Drawer slides in from right
- [ ] In drawer: add a comment → comment appears below
- [ ] Press Escape → drawer closes

#### Task CRUD
- [ ] Create task with all fields filled (title, desc, priority, assignee, due date, tags, subtasks)
- [ ] Edit the task → changes persist after save
- [ ] Delete a task → confirm dialog → task disappears
- [ ] Create a task with a past due date → overdue badge (red) appears on the card

#### Command Palette
- [ ] Press ⌘K (Mac) or Ctrl+K (Windows/Linux) → palette opens
- [ ] Type a task name → tasks section shows matching results
- [ ] Type a member name → members section shows matching results
- [ ] Use ↑↓ arrow keys to navigate → Enter to open
- [ ] Press Escape → closes
- [ ] Click the "Search…" button in Navbar → same behaviour

#### Members (`/members`)
- [ ] Member directory loads (empty state if none added)
- [ ] As Admin: "Add Member" button visible → `/create-member` form works
- [ ] As Member: "Add Member" button not visible
- [ ] Click a member card → profile page shows all assigned tasks
- [ ] Member cards show task count and completion percentage bar

#### Announcements (`/announcements`)
- [ ] Create announcement → appears at bottom of list
- [ ] Click the pin icon → post jumps to top with green left border
- [ ] Click unpin → post moves back down
- [ ] Delete announcement → confirms, then removes

#### Activity Feed (`/activity`)
- [ ] After creating/moving/deleting tasks, activity page shows corresponding entries
- [ ] Entries are grouped by "Today", "Yesterday", or date
- [ ] Icons and colours match event type

#### Analytics (`/analytics`)
- [ ] Stat cards show correct counts matching dashboard
- [ ] Bar charts render for status and priority
- [ ] Member workload section lists all assigned members with bars
- [ ] "Export CSV" downloads a file named `nexus-tasks.csv`

#### Sprints (`/sprints`)
- [ ] Create a sprint → appears in the list
- [ ] Sprint card shows progress ring
- [ ] Delete a sprint → removes from list

#### Theme
- [ ] Click the sun/moon icon in Navbar → page switches theme instantly
- [ ] Refresh → theme is remembered (no flash on load)

#### Mobile
- [ ] Resize browser below 768px → hamburger menu appears
- [ ] Hamburger opens full-screen nav with all links
- [ ] All pages scroll and display correctly on narrow widths

---

## API Reference

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task (with comments) |
| PATCH | `/api/tasks/:id` | Update task fields or add a comment |
| DELETE | `/api/tasks/:id` | Delete a task |

### Members
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/members` | List all members |
| POST | `/api/members` | Create a member |
| GET | `/api/members/:id` | Member profile with task list |
| PATCH | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |

### Announcements
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/announcements` | List all (pinned first) |
| POST | `/api/announcements` | Create announcement |
| PATCH | `/api/announcements/:id` | Update (pin/unpin, edit) |
| DELETE | `/api/announcements/:id` | Delete |

### Sprints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sprints` | List all sprints |
| POST | `/api/sprints` | Create a sprint |
| PATCH | `/api/sprints/:id` | Update sprint |
| DELETE | `/api/sprints/:id` | Delete sprint |

### Users (Admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all registered users |
| PATCH | `/api/users/:id` | Update user role |
| DELETE | `/api/users/:id` | Delete user account |

### Analytics & Activity
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics` | Aggregated task statistics |
| GET | `/api/activity` | Activity log (last 100 events) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (particle animation, typewriter)
│   ├── layout.tsx                  # Root layout (fonts, CommandPalette, Toaster)
│   ├── globals.css                 # Design system (CSS variables, animations)
│   ├── dashboard/page.tsx          # Kanban board + calendar view
│   ├── create-task/page.tsx        # Task creation form
│   ├── edit-task/[id]/page.tsx     # Task edit form
│   ├── members/
│   │   ├── page.tsx                # Member directory
│   │   └── [id]/page.tsx           # Member profile
│   ├── create-member/page.tsx      # Add member (admin-only)
│   ├── announcements/page.tsx      # Club bulletin board
│   ├── activity/page.tsx           # Activity feed
│   ├── analytics/page.tsx          # Charts & stats
│   ├── sprints/page.tsx            # Sprint planning
│   ├── admin/page.tsx              # Admin panel (user management)
│   ├── login/page.tsx              # Sign in
│   ├── register/page.tsx           # Sign up
│   └── api/                        # Route handlers
│       ├── tasks/[route.ts, [id]/route.ts]
│       ├── members/[route.ts, [id]/route.ts]
│       ├── announcements/[route.ts, [id]/route.ts]
│       ├── sprints/[route.ts, [id]/route.ts]
│       ├── users/[route.ts, [id]/route.ts]
│       ├── auth/[[...nextauth]/route.ts, register/route.ts]
│       ├── activity/route.ts
│       └── analytics/route.ts
├── components/
│   ├── Navbar.tsx                  # Sticky nav, theme toggle, mobile menu
│   ├── KanbanColumn.tsx            # Droppable column
│   ├── TaskCard.tsx                # Draggable task card
│   ├── TaskDrawer.tsx              # Slide-in detail + comments
│   ├── CommandPalette.tsx          # Global ⌘K search
│   ├── CalendarView.tsx            # Monthly calendar
│   ├── TaskNotifier.tsx            # Background due-date notifications
│   └── SessionWrapper.tsx          # NextAuth session provider
├── models/
│   ├── Tasks.ts                    # Task + Comment schema
│   ├── Member.ts                   # Member schema
│   ├── User.ts                     # Auth user schema
│   ├── Activity.ts                 # Activity log schema
│   ├── Announcement.ts             # Announcement schema
│   └── Sprint.ts                   # Sprint schema
└── lib/
    ├── auth.ts                     # NextAuth config (CredentialsProvider)
    ├── mongodb.ts                  # Mongoose singleton
    └── constants.ts                # Shared constants
```

---

## Design System

Nexus uses a custom CSS variable–based design system inspired by **Material You** and **Android Studio's** dark theme:

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#3ddc84` | Android Green — primary actions, active states |
| `--accent2` | `#4285f4` | Google Blue — secondary accents |
| `--accent3` | `#fbbc04` | Google Yellow — warnings, sprint "planned" |
| `--priority-high` | `#ea4335` | Google Red — high priority, errors |
| `--bg-base` | `#0d1117` | Page background (GitHub dark nav) |
| `--bg-surface` | `#161b22` | Card surfaces |
| `--bg-elevated` | `#1c2128` | Input fields, tooltips |

---

## Known Limitations / Future Work

- `/api/members POST` and `/api/tasks POST` do not enforce server-side auth guards (client-side role checks exist)
- Announcements "Posted By" is a manual text field rather than auto-filled from session
- No real-time updates (would need WebSockets or polling) — refresh to see others' changes
- No file/image attachment support on tasks

---

Built by [Your Name] for Android Club Technical Recruitment 2026.
