**Date:** 2026-04-06

# SlashTask — Product Requirements Document

## Overview

SlashTask is a personal web-based task manager built to replace Todoist. Single-user, auth-protected, Todoist-inspired UI. Webapp only.

---

## Tech Stack

| Layer           | Choice                                 |
| --------------- | -------------------------------------- |
| Framework       | ✅ Next.js 16.2.2 (App Router)         |
| Language        | ✅ TypeScript                          |
| Styling         | ✅ Tailwind CSS v4                     |
| Database + Auth | ✅ Supabase (Postgres + Supabase Auth) |
| Markdown        | `react-markdown` + editor toggle       |
| Date parsing    | `chrono-node` (natural language)       |
| Recurrence      | `rrule`                                |
| Deployment      | ✅ Vercel                              |

---

## Auth

- Email + password via Supabase Auth
- Single user — no registration flow needed, account seeded manually via Supabase dashboard
- All routes protected via middleware; unauthenticated users redirected to `/login`
- Rate limiting and lockout on failed login attempts deferred to Supabase Auth defaults; no custom logic needed

---

## Database Schema

### `projects`

| Column     | Type        | Notes         |
| ---------- | ----------- | ------------- |
| id         | uuid PK     |               |
| name       | text        |               |
| color      | text        | hex color     |
| emoji      | text        | single emoji  |
| order      | int         | display order |
| is_deleted | bool        | default false |
| created_at | timestamptz |               |

### `tasks`

| Column           | Type                              | Notes                                           |
| ---------------- | --------------------------------- | ----------------------------------------------- |
| id               | uuid PK                           |                                                 |
| title            | text                              |                                                 |
| description      | text                              | markdown                                        |
| description_text | varchar(500)                      | plain text, stripped of markdown, max 500 chars |
| project_id       | uuid FK → projects                | nullable                                        |
| parent_task_id   | uuid FK → tasks ON DELETE CASCADE | nullable, for sub-tasks (one level deep only)   |
| priority         | int                               | 1=low, 2=medium, 3=high, 4=urgent               |
| effort           | int                               | 1–4                                             |
| due_date         | date                              | nullable                                        |
| is_completed     | bool                              | default false                                   |
| is_deleted       | bool                              | default false                                   |
| completed_at     | timestamptz                       | nullable                                        |
| recurrence_rule  | text                              | e.g. `RRULE:FREQ=WEEKLY;BYDAY=MO`               |
| order            | int                               | display order                                   |
| created_at       | timestamptz                       |                                                 |

### `streaks`

| Column            | Type    | Notes                   |
| ----------------- | ------- | ----------------------- |
| id                | uuid PK |                         |
| date              | date    | one row per day         |
| completed_any     | bool    | at least 1 task done    |
| completed_all_due | bool    | all due tasks completed |

### `achievements`

| Column      | Type        | Notes                         |
| ----------- | ----------- | ----------------------------- |
| id          | uuid PK     |                               |
| key         | text        | e.g. `first_task`, `streak_7` |
| unlocked_at | timestamptz |                               |

### `activity_log`

| Column     | Type                     | Notes                                                                                                  |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| id         | uuid PK                  |                                                                                                        |
| task_id    | uuid FK → tasks SET NULL | nullable — preserved when task is deleted                                                              |
| task_title | text                     | snapshot of title at time of event                                                                     |
| event_type | text                     | `task_completed`, `task_uncompleted`, `task_title_changed`, `task_description_changed`, `task_deleted` |
| old_value  | text                     | nullable — previous title or plain-text description                                                    |
| new_value  | text                     | nullable — updated title or plain-text description                                                     |
| created_at | timestamptz              |                                                                                                        |

### `daily_stats` (powers the heatmap)

| Column          | Type    | Notes                          |
| --------------- | ------- | ------------------------------ |
| date            | date PK |                                |
| tasks_completed | int     | incremented on task completion |

---

## Features

### 1. Auth

- `/login` page with email + password form
- Middleware protects all routes
- No sign-up page

### 2. Task CRUD

**Creating a task:**

- Quick-add input bar (always visible, like Todoist)
- Inline shortcut parsing as you type:
  - `#project-name` → as the user types `#`, a live dropdown of matching project names appears; selecting one assigns the project. If no match is found, no project is assigned (projects are not auto-created)
  - `!` / `!!` / `!!!` / `!!!!` → priority 1–4
  - `$` / `$$` / `$$$` / `$$$$` → effort 1–4
  - `today`, `tomorrow`, `monday`, `next week`, `apr 10` → due date via `chrono-node`
- Full task detail modal/panel for description (markdown with toggle preview), sub-tasks, recurrence

**Views:**

- **Today** — tasks due today
- **Upcoming** — all tasks with a future due date, grouped by date, loaded via infinite scroll as the user scrolls down
- **Project** — tasks filtered by selected project
- **Completed** — historical completed tasks, filterable by date range

**Editing/Deleting:**

- Click task to open detail panel
- Inline checkbox to mark complete
- Completing a recurring task: the original task is marked complete and a **new task row** is inserted with the next due date calculated from the `recurrence_rule` via `rrule`; this preserves full per-occurrence history
- Deleting a task **cascades** to delete all its sub-tasks; the UI should show a confirmation step before deletion when sub-tasks exist
- Sub-tasks are limited to **one level deep** — sub-tasks cannot have their own children; enforced in UI and data layer
- Tasks can be **drag-to-reordered** within any view (Today, Upcoming, Project); the updated `order` is persisted

### 3. Projects

- Sidebar lists all projects (flat list)
- Create/edit/delete project with name, emoji picker, color picker
- Drag to reorder projects in sidebar

### 4. Search

- Global search (`Cmd+K`) across task titles and descriptions
- Results grouped by project

### 6. Keyboard Shortcuts

Linear-style keyboard shortcuts. Shortcuts are disabled when focus is inside a text input or textarea.

| Shortcut | Action                    |
| -------- | ------------------------- |
| `Q`      | Open quick-add task input |
| `Cmd+K`  | Open global search        |

> More shortcuts can be added here as the app grows (e.g. navigating between views, marking tasks complete).

### 5. Gamification

**Streaks:**

- "At least 1 task" — current streak + longest streak
- "All due tasks completed" — current streak + longest streak (tracked separately)

**Heatmap:**

- 12-month GitHub-style grid
- Colored by tasks completed per day

**Streaks** are updated in real-time on task completion or uncompletion — no scheduled job needed.

**Predefined Achievements:**
| Key | Name | Condition |
|---|---|---|
| `first_task` | First Step | Complete your first task |
| `tasks_10` | Getting Going | Complete 10 tasks |
| `tasks_100` | Century | Complete 100 tasks |
| `tasks_500` | Machine | Complete 500 tasks |
| `streak_3` | Hat Trick | 3-day streak |
| `streak_7` | Week Warrior | 7-day streak |
| `streak_30` | Monthly Grind | 30-day streak |
| `streak_100` | Centurion | 100-day streak |
| `all_due_7` | Clean Sweep | All due tasks completed 7 days in a row |
| `projects_5` | Organizer | Create 5 projects |
| `early_bird` | Early Bird | Complete a task before 9am (evaluated in the **user's local browser timezone**) |
| `night_owl` | Night Owl | Complete a task after 10pm (evaluated in the **user's local browser timezone**) |

---

## UI Layout

### App Shell

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px)     │  Main Content                │
│                      │                              │
│  [+ Add Task]        │  [View Title]                │
│                      │  ─────────────────────────   │
│  ─ Views ─           │  [Quick-add input bar]       │
│  Today               │                              │
│  Upcoming            │  Task list...                │
│  Search              │                              │
│  Completed           │                              │
│                      │                              │
│  ─ Projects ─        │                              │
│  > Work              │                              │
│  > Personal          │                              │
│                      │                              │
│  ─ Stats ─           │                              │
│  Streak widget       │                              │
│  Heatmap             │                              │
│  Achievements        │                              │
└─────────────────────────────────────────────────────┘
```

### Task Item

```
☐  Buy groceries  #Personal  Apr 10  !!!  $$
```

- Checkbox → marks complete (with animation)
- Click title → opens task detail panel (slides in from right)
- Priority indicated by colored left border
- Overdue tasks shown in red

### Task Detail Panel

```
┌─────────────────────────────────┐
│  [Title — editable inline]      │
│                                 │
│  Project: #Personal             │
│  Due: Apr 10  |  Recurs: Weekly │
│  Priority: !!!  Effort: $$      │
│                                 │
│  Description  [Edit | Preview]  │
│  ─────────────────────────────  │
│  markdown content here...       │
│                                 │
│  Sub-tasks                      │
│  ☐ Sub-task 1                   │
│  ☐ Sub-task 2                   │
│  [+ Add sub-task]               │
│                                 │
│  [Delete task]                  │
└─────────────────────────────────┘
```

### Gamification Page

```
┌──────────────────────────────────────────────┐
│  Streaks                                     │
│  🔥 At least 1 task:  12 days  (best: 34)   │
│  ⚡ All due tasks:    4 days   (best: 12)    │
│                                              │
│  Heatmap  (12 months)                        │
│  [ GitHub-style grid ]                       │
│                                              │
│  Achievements                                │
│  ✅ First Step   🔒 Century   🔒 Week Warrior │
└──────────────────────────────────────────────┘
```

---

## Implementation Phases

### Milestone 1 - MVP

### Phase 1 — Foundation

- [x] Set up Supabase project, configure env vars
- [x] Create all DB tables (schema above)
- [x] Enable Row Level Security (RLS) on all tables
- [x] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `chrono-node`, `react-markdown`, `rrule`
- [x] Set up Supabase middleware for auth protection
- [x] Build `/login` page (email + password form)
- [x] Verify all routes redirect to `/login` when unauthenticated

### Phase 2 — Core Layout

- [x] Build app shell: sidebar + main content layout
- [x] Sidebar: navigation links (Today, Upcoming, Completed)
- [x] Sidebar: projects list
- [x] Task list renders for current view (Today, Upcoming, Project)
- [x] Upcoming view: infinite scroll — load more date-grouped tasks as user scrolls
- [x] Responsive layout (sidebar collapses on smaller screens)

### Phase 3 — Projects

- [ ] Create project (id, name, emoji, color)
- [ ] Update project (name, emoji, color)
- [ ] Delete project.
- [x] Projects appear in sidebar
- [x] Project view: clicking a project shows its tasks in main content

### Phase 4 — Task CRUD

- [ ] Quick-add input bar (always visible at top of main content)
- [ ] Shortcut parser: `#project` shows live dropdown of matching projects (no auto-create), `!` priority, `$` effort, natural language dates via `chrono-node`
- [ ] Drag-to-reorder tasks within any view; persist updated `order` to DB
- [ ] Checkbox to mark task complete (with animation)
- [ ] Task detail panel (slides in from right)
- [ ] Edit title, description (markdown with toggle preview), project, due date, priority, effort
- [ ] Delete task: cascade-delete sub-tasks; show confirmation dialog if sub-tasks exist`
- [ ] Sub-tasks: add, complete, delete within detail panel (one level deep only — no nested sub-tasks)
- [ ] Recurring tasks: on completion, mark original complete and insert new task row with next due date from `rrule`
- [ ] Completed view: list of completed tasks, filterable by date range

### Phase X - Clean up.

- [ ] Make sure that when things move, there is a loading screen or something. Or load first and then show data later, or show loading screen.
- [ ]

### Milestone 2 - REFINEMENT

### Phase 5 — Search

- [ ] `Cmd+K` opens global search modal
- [ ] Search queries tasks by title and description
- [ ] Results grouped by project
- [ ] Clicking a result opens the task detail panel

### Phase 6 — Gamification

- [ ] On task completion: increment `daily_stats.tasks_completed` for today
- [ ] Streak calculation logic: update `streaks` table in real-time on task completion/uncompletion (no cron job)
- [ ] Streak widget in sidebar shows live values
- [ ] Heatmap page: fetch 12 months of `daily_stats`, render GitHub-style grid
- [ ] Achievements: check conditions on relevant events (task complete, project create, etc.); `early_bird`/`night_owl` evaluated using browser's local timezone
- [ ] Achievements panel: grid showing locked/unlocked badges

### Phase 7 — Keyboard Shortcuts

- [ ] Global keyboard shortcut handler (disabled when focus is in an input/textarea)
- [ ] `Q` → focuses/opens quick-add task input
- [ ] `Cmd+K` → opens global search modal (consolidate with Phase 5)

### Phase 8 — Polish & Deploy

- [ ] Loading states and optimistic UI updates for task actions
- [ ] Error handling on save failure: (1) roll back optimistic change, (2) show brief toast notification, (3) show persistent inline error near the task with a "click here" link navigating directly to it
- [ ] Overdue tasks highlighted in red
- [ ] Deploy to Vercel, connect Supabase production environment
- [ ] Seed your user account in Supabase Auth dashboard
