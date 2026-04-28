# Testing Rules

## Stack
- **Runner**: Vitest with `globals: true`
- **Environment**: jsdom
- **Libraries**: `@testing-library/react`, `@testing-library/jest-dom`, `fishery`
- **Setup file**: `vitest.setup.ts` (imports `@testing-library/jest-dom`)

## File Location
All test files go under `__tests__/`, mirroring the source structure.

```
lib/date.ts              → __tests__/lib/date.test.ts
components/task-item.tsx → __tests__/components/task-item.test.tsx
```

## Structure
Always use `describe` + `test` blocks. Group related cases under `describe`.

```ts
describe('formatDueDate', () => {
  test('returns null for falsy input', () => { ... })
  test('returns a Date at midnight local time', () => { ... })
})
```

## Test Naming
Use behaviour-focused descriptions that describe what the code does, not the input/output mapping.

- Good: `'returns null for falsy input'`
- Avoid: `'null input → null output'`

## Matchers
Use the matcher that best fits the assertion:
- **DOM assertions**: prefer jest-dom (`toBeInTheDocument()`, `toHaveValue()`)
- **Logic assertions**: prefer Vitest native (`toBe()`, `toEqual()`, `toBeNull()`)

## Mocking
Mock only at system boundaries. Do not mock internal modules or functions.

- Mock Supabase client when testing server actions
- Mock `fetch` when testing code that calls external APIs
- Keep everything else real

## When to Write Tests
Write tests only when explicitly asked. Do not automatically add tests when creating or modifying logic files.

## What to Test

### lib/ utilities
Cover all logic functions with the following scenarios:
- **Happy path** — the expected successful case
- **Falsy inputs** — group null, undefined, and empty string into a single test case rather than separate tests
- **Edge cases** — boundary values and unexpected inputs
- **Error cases** — invalid inputs that should produce errors or fallbacks

### UI Components
Only test logic-related behaviour, not implementation details or styling:
- **Conditional rendering** — elements that show/hide based on props or state
- **Props behaviour** — different prop values produce different rendered output

Do not test user interactions (clicks, inputs) or visual appearance.

### Context Providers
Test the logic within React context in isolation, covering state transitions and derived values.

### Server Actions
Do not unit test server actions (`app/actions/`). These are covered by E2E tests (Playwright).

## Mock Data (Fishery Factories)

Use **fishery** to create reusable factory objects for `Task` and `Project` types.

### Factory Location
All factories live in `__tests__/factories/`.

```
__tests__/factories/task.factory.ts
__tests__/factories/project.factory.ts
```

### Factory Pattern
Define a base factory with sensible defaults. Override only the fields relevant to each test.

```ts
// __tests__/factories/task.factory.ts
import { Factory } from 'fishery'
import type { Task } from '@/lib/task'

export const taskFactory = Factory.define<Task>(() => ({
  id: 'task-1',
  title: 'Test task',
  description: null,
  description_text: null,
  project_id: null,
  priority: 2,
  effort: 2,
  due_date: null,
  is_completed: false,
  completed_at: null,
  order: 0,
  is_deleted: false,
  parent_task_id: null,
  recurrence_rule: null,
  user_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}))
```

```ts
// __tests__/factories/project.factory.ts
import { Factory } from 'fishery'
import type { Project } from '@/lib/project'

export const projectFactory = Factory.define<Project>(() => ({
  id: 'project-1',
  name: 'Test Project',
  slug: 'test-project',
  color: '#000000',
  emoji: '📁',
  order: 0,
  is_deleted: false,
  user_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}))
```

### Usage in Tests
Use `.build()` for a single object and `.buildList(n)` for an array. Override fields with `.build({ field: value })`.

```ts
import { taskFactory } from '../factories/task.factory'

const task = taskFactory.build({ title: 'Buy groceries', is_completed: true })
const tasks = taskFactory.buildList(3)
```

Always use factories instead of defining raw mock objects inline in test files.

### Validating a New Factory
After creating a new factory, run the tests for the file that uses it to confirm it works before continuing.

## Running Tests
Always run only the tests for the file that was changed, not the full suite.

```bash
pnpm test --run __tests__/lib/task.test.ts
```

Only run `pnpm test --run` (all tests) when explicitly asked.
