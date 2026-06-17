# Nexus — Android Club Collaboration Platform

## Project Overview

Nexus is a collaborative project management platform built for student clubs and teams. It transforms a basic task management system into a complete Kanban-style collaboration workspace with task tracking, member management, announcements, sprint planning, analytics, and role-based administration.

The platform was developed as part of the Android Club Technical Recruitment Task 2026.

---

## Evaluator Access

### Super Admin Credentials

Email:
[superadmin@androidclub.com](mailto:superadmin@androidclub.com)

Password:
123456

The Super Admin account has access to all platform features, including user management, role management, announcements, sprint management, analytics, and administrative controls.

---

## Features Implemented

### Core Kanban System

* To Do, In Progress, and Done stages
* Drag-and-drop task movement
* Task status management
* Task editing and deletion
* Task assignment to members
* Due dates and priority levels

### Member Management

* Member directory
* Individual member profiles
* Task ownership tracking
* Completion statistics
* Progress indicators

### Activity Tracking

* Activity timeline
* Task creation logs
* Task update logs
* Task movement history
* Task deletion records

### Analytics Dashboard

* Task status distribution
* Priority distribution
* Completion metrics
* Member productivity statistics
* Team performance insights

### Sprint Management

* Sprint creation and management
* Sprint tracking
* Sprint-based organization

### Announcements System

* Club-wide announcements
* Announcement management
* Team communication support

### Authentication & Authorization

* User registration
* User login
* Secure password hashing
* Role-based access control

Supported Roles:

* Member
* Admin
* Super Admin

### Additional Enhancements

* Responsive interface
* Modern dark-themed UI
* Toast notifications
* Search and filtering
* Task tags
* Real-time UI updates

---

## Technology Stack

### Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS 4

### Backend

* Next.js Route Handlers
* MongoDB Atlas
* Mongoose

### Authentication

* NextAuth.js
* bcryptjs

### Libraries

* @hello-pangea/dnd
* react-hot-toast
* recharts

### Deployment

* Vercel

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd nexus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Deployment Instructions

### Vercel Deployment

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Configure environment variables:

   * MONGODB_URI
   * NEXTAUTH_SECRET
   * NEXTAUTH_URL
4. Deploy the project
5. Update NEXTAUTH_URL with the deployed domain if required

The application is deployed using Vercel and connected to MongoDB Atlas.

---

## Screenshots

### Landing Page

![Landing Page](screenshots/landing-page.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Members

![Members](screenshots/members.png)

### Activity

![Activity](screenshots/activity.png)

### Analytics

![Analytics](screenshots/analytics.png)

### Announcements

![Announcements](screenshots/announcements.png)

### Sprints

![Sprints](screenshots/sprints.png)

### Admin Panel

![Admin Panel](screenshots/admin-panel.png)

---

## Known Limitations

* Real-time multi-user synchronization is not implemented.
* Notifications are session-based and not delivered through email or push services.

---

## Developed For

Android Club Technical Recruitment 2026

Project: Nexus — Club Collaboration Platform
