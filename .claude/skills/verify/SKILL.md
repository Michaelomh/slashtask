---
name: verify
description: Run verification checks (format, lint, types, relevant tests) on the slashtask project after editing code, before declaring work complete. Use this whenever code has been changed and is about to be reported as done — including after multi-file edits, refactors, bug fixes, or new features. Also use when the user invokes /verify or asks to "verify", "check", "validate", or "lint and typecheck" the changes.
---

# Verify

Run verification checks on changed code in the slashtask project. Use this skill after editing/writing code and before telling the user the work is complete.

## Hard rules

- **Always invoke via pnpm.** Use `pnpm lint`, `pnpm format`, `pnpm format:check`, `pnpm check-types`, `pnpm lint:fix`. Never run raw `eslint`, `prettier`, `tsc`, or `vitest`.
- **Tests use `pnpm exec vitest run`**, not `pnpm test`. The `test` script defaults to watch mode and will not exit.
- **Run all checks even if earlier ones fail.** Do NOT fail-fast. Collect results and present a combined report at the end.

## Step 1 — Identify changed files

Use `git status --porcelain` to list modified, added, and untracked files in the working tree. This is the change set the verification targets.

## Step 2 — Decide whether to run tests

Run tests only if either condition is true:

1. A `*.test.*` or `*.spec.*` file is in the change set, OR
2. A changed source file `foo.ts` (or `.tsx`) has a co-located test at `foo.test.ts(x)`, `foo.spec.ts(x)`, or `__tests__/foo.test.ts(x)`.

Collect the matching test paths. If none match, skip tests entirely.

## Step 3 — Run the checks (sequential, run-all)

Run in this order. Do not stop on failure — capture each result and continue.

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm check-types`
4. If tests are relevant: `pnpm exec vitest run <test-paths>` (pass the specific test files only, not the whole suite)

## Step 4 — Handle failures

**Auto-fix lint/format failures:**

- If `pnpm format:check` failed → run `pnpm format`, then re-run `pnpm format:check` to confirm clean.
- If `pnpm lint` failed → run `pnpm lint:fix`, then re-run `pnpm lint`. If issues remain after autofix, report the remaining errors. Do not attempt manual fixes here.

**Do NOT auto-fix type errors or test failures.** Stop, report the failure with the relevant output, and let the user decide.

## Step 5 — Report

Present a combined report covering every check that ran:

- Pass / fail status per check (format, lint, types, tests)
- For any check that was auto-fixed: note what was fixed (e.g. "format: auto-fixed 3 files")
- For any check still failing: include the relevant error output, trimmed to the meaningful lines (full TS error blocks, failing test names + assertion messages)
- If everything passes: a one-line "All checks passed."

The original task is only complete after this report. If types or tests failed, the task is not complete — surface that clearly.
