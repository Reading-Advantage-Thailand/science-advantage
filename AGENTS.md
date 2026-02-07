# Repository Guidelines

## Project Structure & Module Organization

Core application logic lives in `app/`, which follows the Next.js App Router layout with feature groups such as `(auth)` and `(dashboard)` plus API handlers under `app/api/`. Shared UI lives in `components/`, with `components/ui/` mirroring shadcn/ui primitives and `components/features/` collecting higher-level widgets. Cross-cutting utilities reside in `lib/` (auth, database client, helpers). Database schema, migrations, and seed scripts are maintained in `prisma/`, while static assets live in `public/` and extended documentation belongs in `docs/`.

The first thing the agent should do in any session is to run the .claude/skills/doc-indexer/scripts/scan-docs.sh script to get document context.

## Build, Test, and Development Commands

Install dependencies with `npm install`. Use `npm run dev` for the local Next.js server. Database tasks rely on Prisma: `npx prisma generate` to refresh the client, `npx prisma db push` to sync schema, and `npx prisma db seed` for baseline content. For production artifacts run `npm run build`; staging and production deploys use `npm run deploy:staging` and `npm run deploy:production`.

## Coding Style & Naming Conventions

Write all components and modules in TypeScript with 2-space indentation. ESLint and Prettier configurations ship with the repo—run `npm run lint` before opening a PR. Prefer PascalCase for components (`LessonOverviewCard`) and camelCase for functions, variables, and Prisma fields. Keep files focused; collocate component-specific hooks or styles alongside the component.

## Testing Guidelines

Tests are organized by scope. Execute `npm run test` for unit coverage, `npm run test:integration` when touching API routes or Prisma logic, and `npm run test:e2e` before deploys. Name test files with the `.test.ts` or `.spec.ts` suffix adjacent to the code under test. Seed deterministic fixtures before integration runs, and update snapshots whenever intentional UI changes are introduced.

## Commit & Pull Request Guidelines

Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`) to keep history machine-readable. Keep commits scoped to a single concern and include context about affected modules. The Conductor skill manages commit workflow during implementation (including git notes for auditability), so follow its conventions when working within a track. Pull requests should describe functional changes, list test commands executed, and attach screenshots or screen recordings for UI updates. Flag any schema or environment changes in the PR summary so reviewers can coordinate migrations.

## Environment & Security Tips

Duplicate `.env.example` into `.env.local` before development and populate credentials for PostgreSQL, NextAuth, Google OAuth, OpenAI, Google Cloud Storage, and Redis. Never commit `.env*` files or production secrets. Rotate keys whenever rotating cloud resources, and confirm that Prisma migrations run cleanly in staging before tagging a release.

### Local Auth Configuration Reminder

- Only Google OAuth is enabled.
- Localhost sign-in is restricted to the single Google account `bodangren@gmail.com`.
- There are no seeded email/password accounts; tests requiring other roles must mock the session layer.
- A dev-only impersonation toggle is available when `DEV_AUTH_ENABLED=true`. Use the panel on `/signin` to assume teacher or student roles; the override stores an HTTP-only cookie and is automatically cleared on sign out.
- Any new feature must remain production-secure (no dev overrides leaking to prod) while still supporting the dev impersonation flow so manual QA can run locally.

## Development Workflow (Conductor)

All feature development, bug fixes, and chores follow the **Conductor** spec-driven workflow. Invoke it with the `/conductor` skill command. Conductor manages:

- **Tracks**: Units of work (feature, bug, chore) with a spec (`spec.md`) and phased implementation plan (`plan.md`) stored under `conductor/tracks/`.
- **TDD enforcement**: Red → Green → Refactor for every task, with >80% coverage targets.
- **Task lifecycle**: Pending `[ ]` → In Progress `[~]` → Completed `[x]`, with atomic commits and git notes for auditability.
- **Phase checkpoints**: Automated test runs, manual verification gates, and checkpoint commits between phases.
- **Status and revert**: Built-in status reporting and safe git-based revert of completed work.

Conductor configuration and product-level docs live in `conductor/` (product.md, tech-stack.md, workflow.md, tracks.md). Refer to `.claude/skills/conductor/` for full skill documentation.

### Git Conventions

- Default branch: `main` (trunk-based). Each track gets its own branch; merge back into `main` once the track is fully complete.
- Branch naming: `<type>/<issue-number>-<kebab-title>` where `<type>` is `feat|fix|chore|docs|refactor|test`.
- Commit style: Conventional Commits. Conductor prefixes its own housekeeping commits with `conductor()`.
- Prefer squash merge when closing PRs to keep history clean.
- Use `gh` CLI for PR creation and management. Ensure `gh auth login` is configured with repo scope.

### Track Completion

When all tasks and phases in a track are complete:

1. Open a PR from the track branch into `main`.
2. After merge, archive the track documentation by moving its directory from `conductor/tracks/` to `conductor/archive/`.
3. Mark the track as `[x]` in `conductor/tracks.md`.
4. Delete the remote and local track branch.

## AI Collaboration Guidelines

- Default to the Conductor spec-driven workflow. Use `/conductor` to create tracks, implement tasks, check status, or revert work.
- Reference track specs in `conductor/tracks/` before starting implementation and document requirement updates directly in those specs.
- Use GitHub issues and pull requests for coordination; Conductor tracks complement issues rather than replacing them.
- When delegating to AI tooling, include the relevant spec excerpt, acceptance criteria, and test expectations so work stays aligned with the track's plan.

