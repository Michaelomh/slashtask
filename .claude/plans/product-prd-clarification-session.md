# PRD Clarification Session

**Source PRD**: product-prd.md
**Session Started**: 2026-04-06
**Depth Selected**: Medium
**Total Questions**: 10
**Progress**: 10/10

---

## Session Log

## Question 1
**Category**: Auth / Security
**Ambiguity Identified**: No rate limiting or lockout behavior defined for failed login attempts
**Question Asked**: What should happen if someone navigates to /login with incorrect credentials — is there a max attempt limit, lockout, or any rate limiting needed?
**User Response**: Defer to Supabase defaults
**Requirement Clarified**: Auth rate limiting handled entirely by Supabase Auth out of the box; no custom lockout logic needed

---

## Question 2
**Category**: Recurring Tasks / Data Model
**Ambiguity Identified**: "Spawns the next occurrence" is vague — could mean a new row or an in-place update
**Question Asked**: When a recurring task is completed, should the original task be marked complete and a NEW task row inserted, or should the existing task's due_date be updated in place?
**User Response**: Insert new task row
**Requirement Clarified**: On completion of a recurring task — mark original as complete, insert a new task row with the next due_date calculated from the rrule; preserves full per-occurrence history

---

## Question 3
**Category**: Gamification / Streaks
**Ambiguity Identified**: No timing/trigger defined for streak table updates
**Question Asked**: How should the streak data in the `streaks` table be updated?
**User Response**: On task completion (real-time)
**Requirement Clarified**: Streak rows are written/updated immediately on task completion or uncompletion; no cron job needed

---

## Question 4
**Category**: Task Data Model / UI
**Ambiguity Identified**: `parent_task_id` FK allows infinite nesting, but UI implications are undefined
**Question Asked**: Can sub-tasks themselves have sub-tasks (unlimited depth), or is only one level of nesting allowed?
**User Response**: One level only
**Requirement Clarified**: Sub-tasks are limited to one level deep; the UI and data access layer should enforce this (sub-tasks cannot be assigned a parent_task_id that is itself a sub-task)

---

## Question 5
**Category**: Views / UX
**Ambiguity Identified**: No time horizon or pagination strategy defined for the Upcoming view
**Question Asked**: How far ahead should Upcoming show tasks?
**User Response**: All future tasks with infinite scroll — more tasks load as the user scrolls down
**Requirement Clarified**: Upcoming view shows all tasks with a future due_date, paginated via infinite scroll (load more groups as user scrolls); tasks are grouped by date

---

## Question 6
**Category**: Task CRUD / Quick-Add UX
**Ambiguity Identified**: No fallback defined for unrecognized #project tokens in the quick-add bar
**Question Asked**: What should happen if the typed project name doesn't match any existing project?
**User Response**: Show a suggestion dropdown
**Requirement Clarified**: When the user types `#`, the quick-add bar shows a live dropdown of matching project names; if no match, no project is assigned (no silent creation)

---

## Question 7
**Category**: Task Ordering / UX
**Ambiguity Identified**: Drag-to-reorder is defined for projects but omitted for tasks
**Question Asked**: Should tasks within a view also be manually reorderable by dragging?
**User Response**: Drag within a view
**Requirement Clarified**: Tasks can be manually dragged to reorder within any view (Today, Upcoming, Project); the `order` column on tasks is persisted after a drag

---

## Question 8
**Category**: Gamification / Achievements
**Ambiguity Identified**: Time-of-day achievements (early_bird, night_owl) have no timezone specification
**Question Asked**: Which timezone should early_bird/night_owl times be evaluated in?
**User Response**: User's local browser timezone
**Requirement Clarified**: Completion time for early_bird/night_owl is determined client-side using the browser's local timezone; the local hour is passed to the server (or evaluated client-side) when checking achievement conditions

---

## Question 9
**Category**: Error Handling / UX
**Ambiguity Identified**: Optimistic UI is mentioned but failure handling is unspecified
**Question Asked**: How should the app handle a network/server error when the user completes, edits, or deletes a task?
**User Response**: Revert optimistic change + show a toast notification + show a persisting inline error with a "click here" link to the task that failed to save
**Requirement Clarified**: On save failure: (1) roll back the optimistic UI change, (2) show a brief toast, (3) show a persistent inline error banner/indicator near the task with a link to navigate directly to it

---

## Question 10
**Category**: Task Deletion / Data Integrity
**Ambiguity Identified**: No cascading behavior defined for sub-tasks when parent is deleted
**Question Asked**: What should the deletion behavior be when a parent task is deleted?
**User Response**: Cascade delete sub-tasks
**Requirement Clarified**: Deleting a parent task permanently deletes all its sub-tasks; this should be enforced at both the DB level (ON DELETE CASCADE on parent_task_id FK) and confirmed in the UI before deletion
