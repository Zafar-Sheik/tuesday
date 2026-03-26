# Project Management System - AI Builder Prompts

Use these prompts sequentially to build a complete project management system with NextJS 16, Tailwind v4, TypeScript, MongoDB/Mongoose, and session-based authentication.

---

## PROMPT 1: Project Setup & Configuration

```
Create a NextJS 16 project with the following configuration:

1. Initialize a new NextJS 16 project with TypeScript, App Router, and Tailwind CSS v4
2. Install these dependencies:
   - mongoose (MongoDB ODM)
   - bcryptjs (password hashing)
   - next-session (session-based auth)
   - lucide-react (icons)
   - @hello-pangea/dnd (drag and drop for kanban)
   - react-big-calendar or @fullcalendar/react (calendar)
   - recharts (charts/visuals)
   - react-hook-form (forms)
   - zod (validation)
   - clsx and tailwind-merge (class utilities)

3. Configure Tailwind v4 with custom theme colors for a Monday.com-style dashboard:
   - Primary: #5B41FF (purple)
   - Secondary: #FF6B6B (coral)
   - Success: #00C875
   - Warning: #FDAB4D
   - Error: #FF5A5A
   - Background: #F5F6FA
   - Card: #FFFFFF
   - Text Primary: #1F1F1F
   - Text Secondary: #6B7280

4. Set up the folder structure:
   - app/ (App Router pages)
   - components/ (reusable UI)
   - lib/ (utilities, db connection)
   - models/ (Mongoose models)
   - types/ (TypeScript types)
   - middleware.ts (auth middleware)
```

---

## PROMPT 2: Database Models

```
Create Mongoose models for the project management system:

1. User Model (models/User.ts):
   - name: string (required)
   - email: string (required, unique)
   - password: string (required, hashed)
   - role: enum ['admin', 'developer', 'technician'] (required)
   - createdAt: Date
   - updatedAt: Date

2. ProjectType Model (models/ProjectType.ts):
   - name: string (required, e.g., "Development", "Website", "Call Out")
   - description: string
   - allowedRoles: enum ['admin', 'developer', 'technician'] (required - which roles can access)
   - createdBy: ObjectId (ref: User)
   - createdAt: Date
   - updatedAt: Date

3. Project Model (models/Project.ts):
   - name: string (required)
   - description: string
   - projectType: ObjectId (ref: ProjectType)
   - assignedTo: ObjectId (ref: User)
   - createdBy: ObjectId (ref: User)
   - clientName: string (optional)
   - clientEmail: string (optional)
   - clientPhone: string (optional)
   - clientSignature: string (optional - base64 or URL to signed document)
   - signedAt: Date (optional)
   - status: enum ['not_started', 'in_progress', 'completed', 'on_hold'] (default: 'not_started')
   - progress: number (calculated from tasks, 0-100)
   - startDate: Date
   - endDate: Date
   - createdAt: Date
   - updatedAt: Date

4. Task Model (models/Task.ts):
   - project: ObjectId (ref: Project, required)
   - title: string (required)
   - description: string
   - assignedTo: ObjectId (ref: User)
   - createdBy: ObjectId (ref: User)
   - status: enum ['todo', 'in_progress', 'done'] (default: 'todo')
   - date: Date (required)
   - startTime: string (required, format: "HH:MM")
   - endTime: string (required, format: "HH:MM")
   - completedAt: Date
   - createdAt: Date
   - updatedAt: Date

5. Create a lib/db.ts file that connects to MongoDB using Mongoose with proper connection handling
```

---

## PROMPT 3: Authentication System

```
Build session-based authentication:

1. Create lib/auth.ts:
   - Use next-session with MongoDB store or memory store
   - Implement login(email, password) function
   - Implement logout(session) function
   - Implement getSessionUser(session) function
   - Implement requireAuth middleware function
   - Implement requireRole(roles: string[]) middleware function

2. Create app/api/auth/login/route.ts:
   - POST endpoint
   - Validate email and password
   - Create session with user data
   - Return user object (exclude password)

3. Create app/api/auth/logout/route.ts:
   - POST endpoint
   - Destroy session

4. Create app/api/auth/me/route.ts:
   - GET endpoint
   - Return current user from session

5. Create middleware.ts:
   - Protect routes based on authentication
   - Redirect to /login if not authenticated
   - Handle role-based access

6. Create app/login/page.tsx:
   - Login form with email and password
   - Error handling
   - Redirect to dashboard on success
```

---

## PROMPT 4: User Management (Admin)

```
Create user management for admin:

1. Create app/api/users/route.ts:
   - GET: List all users (admin only)
   - POST: Create new user (admin only)

2. Create app/api/users/[id]/route.ts:
   - GET: Get user by ID
   - PUT: Update user
   - DELETE: Delete user (admin only)

3. Create app/dashboard/users/page.tsx:
   - Table showing all users
   - Columns: Name, Email, Role, Created At, Actions
   - Add user button (opens modal)
   - Edit/Delete actions
   - Use Lucide icons for actions
```

---

## PROMPT 5: Project Type Management (Admin)

```
Create project type management:

1. Create app/api/project-types/route.ts:
   - GET: List all project types
   - POST: Create project type (admin only)

2. Create app/api/project-types/[id]/route.ts:
   - GET: Get project type by ID
   - PUT: Update project type
   - DELETE: Delete project type

3. Create app/dashboard/project-types/page.tsx:
   - Card grid layout showing project types
   - Each card shows: Name, Description, Allowed Roles
   - Add project type button
   - Edit/Delete options
   - Modal form with fields: name, description, allowedRoles (multi-select)
```

---

## PROMPT 6: Project Management

```
Create project management system:

1. Create app/api/projects/route.ts:
   - GET: List projects (filtered by user role)
   - POST: Create project (admin only)

2. Create app/api/projects/[id]/route.ts:
   - GET: Get project with tasks
   - PUT: Update project
   - DELETE: Delete project

3. Create app/dashboard/projects/page.tsx:
   - Kanban board view with columns: Not Started, In Progress, Completed, On Hold
   - Drag and drop between columns
   - Project cards showing: Name, Project Type, Assigned To, Progress bar
   - Filter by project type
   - Create project button (admin only)

4. Create app/dashboard/projects/[id]/page.tsx:
   - Project details header
   - Progress visualization
   - Task list/board
   - Client sign-off section (if technician project type)
   - Add task button
```

---

## PROMPT 7: Task Management

```
Create task management:

1. Create app/api/tasks/route.ts:
   - GET: List tasks (filtered by project)
   - POST: Create task

2. Create app/api/tasks/[id]/route.ts:
   - GET: Get task
   - PUT: Update task (including status change)
   - DELETE: Delete task

3. Create app/dashboard/projects/[id]/tasks/page.tsx:
   - Kanban board: To Do, In Progress, Done
   - Task cards with: Title, Date, Time range, Assigned To
   - Drag and drop to change status
   - Click to open task details modal

4. Task Modal:
   - Title input
   - Description textarea
   - Date picker
   - Start time picker
   - End time picker
   - Status dropdown
   - Save/Cancel buttons
```

---

## PROMPT 8: Client Sign-off Feature

```
Implement client sign-off for technician projects:

1. Add signature pad component using react-signature-canvas or similar
2. Create app/api/projects/[id]/signoff/route.ts:
   - POST: Save client signature
   - Validates that project is assigned to technician role

3. Update project detail page:
   - Show "Client Sign-off" section for technician-assigned projects
   - Display signature capture canvas
   - Show signed status with timestamp
   - Lock sign-off once completed

4. Create client-signoff/page.tsx (public route):
   - Token-based access for clients
   - Project details display
   - Signature capture
   - Confirmation message
```

---

## PROMPT 9: Dashboard & Analytics (Admin)

```
Create admin dashboard with analytics:

1. Create app/dashboard/page.tsx:
   - Stats cards: Total Projects, Active Projects, Completed, Tasks Done
   - Progress chart (recharts): Projects by status
   - Recent activity list
   - Quick actions

2. Create app/dashboard/calendar/page.tsx:
   - Full calendar view (react-big-calendar)
   - Show tasks by date
   - Click to view task details
   - Filter by project

3. Create analytics components:
   - Project progress pie chart
   - Tasks completion bar chart
   - User workload chart
   - Timeline view for projects
```

---

## PROMPT 10: UI Components & Mobile Responsiveness

```
Build reusable UI components:

1. Create components/ui folder:
   - Button.tsx (variants: primary, secondary, ghost, danger)
   - Input.tsx
   - Select.tsx
   - Modal.tsx
   - Card.tsx
   - Badge.tsx
   - Avatar.tsx
   - Progress.tsx
   - Dropdown.tsx
   - Toast.tsx

2. Create layout components:
   - Sidebar.tsx (collapsible on mobile)
   - Header.tsx (mobile-friendly)
   - MobileNav.tsx (bottom navigation for mobile)

3. Ensure mobile-first design:
   - Use Tailwind responsive classes (mobile: default, md:, lg:)
   - Touch-friendly buttons (min 44px)
   - Swipe gestures for kanban
   - Bottom navigation on mobile
   - Sidebar becomes drawer on mobile

4. Apply Monday.com styling:
   - Rounded corners (rounded-lg)
   - Subtle shadows
   - Clean typography
   - Vibrant accent colors
   - Smooth animations
```

---

## PROMPT 11: API Utilities & Error Handling

```
Add API utilities and error handling:

1. Create lib/api.ts:
   - Fetch wrapper with error handling
   - Request/response interceptors

2. Create app/api/error.ts:
   - Custom error classes
   - Error handling middleware

3. Add to all API routes:
   - Proper error try/catch
   - Validation with Zod
   - Return appropriate status codes

4. Create error boundaries:
   - app/error.tsx
   - app/global-error.tsx
```

---

## PROMPT 12: Final Polish & Testing

```
Final polish and testing:

1. Add loading states:
   - Skeleton loaders for all data fetching
   - Button loading states

2. Add empty states:
   - No projects message
   - No tasks message

3. Add notifications:
   - Toast notifications for actions
   - Success/error feedback

4. Add search and filter:
   - Search projects by name
   - Filter by project type
   - Filter by status

5. Add pagination:
   - Paginate project list
   - Paginate task list

6. Test all user flows:
   - Admin: Create project types, users, projects, tasks
   - Developer: View development projects, manage tasks
   - Technician: View job cards, manage tasks, client sign-off

7. Verify mobile responsiveness:
   - Test on mobile viewport
   - Test touch interactions
   - Verify bottom navigation works
```

---

## Quick Reference: Role Permissions

| Feature | Admin | Developer | Technician |
|---------|-------|-----------|------------|
| View All Projects | ✓ | Own Projects | Own Projects |
| Create Project Types | ✓ | ✗ | ✗ |
| Create Projects | ✓ | ✗ | ✗ |
| Create Tasks | ✓ | ✓ | ✓ |
| Update Tasks | ✓ | ✓ | ✓ |
| Delete Tasks | ✓ | ✓ | ✓ |
| Manage Users | ✓ | ✗ | ✗ |
| Client Sign-off | ✗ | ✗ | ✓ |
| View Analytics | ✓ | Limited | Limited |
| Calendar View | ✓ | ✓ | ✓ |

---

## Environment Variables Required

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/project-management
SESSION_SECRET=your-super-secret-session-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Build & Run

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.
