# Repository Guidelines

## Project Structure & Module Organization
Core application logic lives in `app/`, which follows the Next.js App Router layout with feature groups such as `(auth)` and `(dashboard)` plus API handlers under `app/api/`. Shared UI lives in `components/`, with `components/ui/` mirroring shadcn/ui primitives and `components/features/` collecting higher-level widgets. Cross-cutting utilities reside in `lib/` (auth, database client, helpers). Database schema, migrations, and seed scripts are maintained in `prisma/`, while static assets live in `public/` and extended documentation belongs in `docs/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`. Use `npm run dev` for the local Next.js server. Database tasks rely on Prisma: `npx prisma generate` to refresh the client, `npx prisma db push` to sync schema, and `npx prisma db seed` for baseline content. For production artifacts run `npm run build`; staging and production deploys use `npm run deploy:staging` and `npm run deploy:production`.

## Coding Style & Naming Conventions
Write all components and modules in TypeScript with 2-space indentation. ESLint and Prettier configurations ship with the repo—run `npm run lint` before opening a PR. Prefer PascalCase for components (`LessonOverviewCard`) and camelCase for functions, variables, and Prisma fields. Keep files focused; collocate component-specific hooks or styles alongside the component.

## Testing Guidelines
Tests are organized by scope. Execute `npm run test` for unit coverage, `npm run test:integration` when touching API routes or Prisma logic, and `npm run test:e2e` before deploys. Name test files with the `.test.ts` or `.spec.ts` suffix adjacent to the code under test. Seed deterministic fixtures before integration runs, and update snapshots whenever intentional UI changes are introduced.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`) to keep history machine-readable. Keep commits scoped to a single concern and include context about affected modules. Pull requests should link to Jira or GitHub issues, describe functional changes, list test commands executed, and attach screenshots or screen recordings for UI updates. Flag any schema or environment changes in the PR summary so reviewers can coordinate migrations.

## Environment & Security Tips
Duplicate `.env.example` into `.env.local` before development and populate credentials for PostgreSQL, NextAuth, Google OAuth, OpenAI, Google Cloud Storage, and Redis. Never commit `.env*` files or production secrets. Rotate keys whenever rotating cloud resources, and confirm that Prisma migrations run cleanly in staging before tagging a release.

### Local Auth Configuration Reminder
- Only Google OAuth is enabled.
- Localhost sign-in is restricted to the single Google account `bodangren@gmail.com`.
- There are no seeded email/password accounts; tests requiring other roles must mock the session layer.
- A dev-only impersonation toggle is available when `NEXT_PUBLIC_DEV_AUTH=true`. Use the panel on `/signin` to assume teacher or student roles; the override stores an HTTP-only cookie and is automatically cleared on sign out.
- Any new feature must remain production-secure (no dev overrides leaking to prod) while still supporting the dev impersonation flow so manual QA can run locally.

## GitHub-Centric Workflow (gh CLI)

- Default branch: `main` (trunk-based). Create one short-lived branch per issue. Do not create sprint branches.
- Sprints: Use GitHub Milestones (recommended) and/or Projects for tracking. Assign every issue to the current milestone.
- Labels: `type:feature`, `type:fix`, `type:chore`, `area:frontend`, `area:backend`, `area:prisma`, `area:auth`, `priority:P1|P2|P3`.
- Commit style: Conventional Commits. Prefer squash merge to keep history clean.

### Prerequisites

- Install GitHub CLI: `gh auth login` and ensure you have repo scope.
- Ensure branch protection on `main` requires PR, 1+ approval, and passing checks.

### Issue → Branch → PR

1) Create issue in current sprint and start a branch
   - `export SPRINT_MILESTONE="S0 – Skeleton + Auth"`
   - `TITLE="<short issue title>"`
   - `DESC="<what/why + acceptance criteria summary>"`
   - `NUM=$(gh issue create --title "$TITLE" --body "$DESC" --label "type:feature" --milestone "$SPRINT_MILESTONE" --assignee @me --json number --jq .number)`
   - `BR="feat/${NUM}-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-|-$//g' | cut -c1-40)"`
   - `git switch -c "$BR"`

2) Work the todo
   - Commit with Conventional Commits (`feat:`, `fix:`, `chore:`). Keep changes scoped to the issue.
   - Run `npm run lint` and relevant tests before pushing.

3) Publish branch and open PR
   - `git push -u origin "$BR"`
   - `gh pr create --fill --label "type:feature" --milestone "$SPRINT_MILESTONE" --draft=false`
   - Request review (can target a “review agent” account): `gh pr edit --add-reviewer <github-user>`
   - Enable auto-merge (squash): `gh pr merge --auto --squash`

4) After merge
   - `git checkout main && git pull --ff-only`
   - `git branch -d "$BR" && gh branch delete "$BR" -y`

### Branch Naming

- Format: `<type>/<issue-number>-<kebab-title>` where `<type>` ∈ `feat|fix|chore|docs|refactor|test`.
- Examples: `feat/123-lesson-viewer`, `fix/207-auth-callback`, `chore/319-ci-cache`.

### Sprint Organization

- Milestones: One per sprint (e.g., `S0 – Skeleton + Auth`). Issues must have a milestone.
- Projects (optional): If using Projects, add issues after creation: `gh project item-add --owner <org-or-user> --number <project-number> --url $(gh issue view $NUM --json url --jq .url)`.
- No sprint branches: use the milestone to group issues; branches stay per-issue off `main`.

### Sprint Kickoff Automation

- Author stories with user stories + acceptance criteria in `docs/sprint/SX.md` using `##` headers per story.
- Seed issues (dry-run first): `scripts/seed-issues.sh docs/sprint/S0.md "S0 – Skeleton + Auth"`
- Apply for real: `ASSIGNEE=@me EXTRA_LABELS="priority:P1" scripts/seed-issues.sh docs/sprint/S0.md "S0 – Skeleton + Auth" --apply`
- Then work each issue using the Issue → Branch → PR flow above.

### Safety & Automation

- Required checks: CI must run lint, unit tests, and integration tests on PRs.
- CODEOWNERS: add reviewers by path to enforce relevant approvals.
- Templates: use Issue/PR templates to capture acceptance criteria and test notes.
- Auto-labeling (optional): set up a GitHub Action to apply `area:*` labels by path.

### TDD Protocol

- Red → Green → Refactor for every story.
- Start with tests:
  - Unit tests for pure functions, hooks, and utilities.
  - Integration tests for API routes and Prisma flows (`npm run test:integration`).
  - E2E for the main happy path of the slice (`npm run test:e2e`).
- Keep tests adjacent to code using `.test.ts`/`.spec.ts`. Seed deterministic fixtures for integration.
- Mocks: only at boundaries (OpenAI, Google, Auth) using in-repo stubs.
- PRs must include a Test Plan section and evidence (logs/screenshots) that tests pass.
- Coverage goal for core modules: ≥80% lines (do not block MVP if it risks delivery; raise post-MVP).

### Quick Aliases (optional)

- Create issue + branch in one command:
  - `gh alias set start '!f(){ NUM=$(gh issue create --title "$1" --body "${2:-No body}" --label "type:feature" --milestone "$SPRINT_MILESTONE" --assignee @me --json number --jq .number); BR=feat/$NUM-$(echo "$1"|tr A-Z a-z|sed -E "s/[^a-z0-9]+/-/g;s/^-|-$//g"|cut -c1-40); git switch -c "$BR"; echo "$BR"; }; f'`
- Open PR with auto-merge:
  - `gh alias set publish 'pr create --fill && pr merge --auto --squash'`

### Review Protocol

- Reviewer checks: scope, tests, security for auth/db changes, migrations reviewed.
- If changes requested: push fixes to the same branch; auto-merge continues after approval.
- If the PR is merged: always sync back to `main`; never continue work on a merged branch.


<!-- BEGIN: BMAD-AGENTS -->
# BMAD-METHOD Agents and Tasks

Note
- Orchestrators run as mode: primary; other agents as all.
- All agents have tools enabled: write, edit, bash.

## Agents

### Directory

| Title | ID | When To Use |
|---|---|---|
| UX Expert | ux-expert | Use for UI/UX design, wireframes, prototypes, front-end specifications, and user experience optimization |
| Scrum Master | sm | Use for story creation, epic management, retrospectives in party-mode, and agile process guidance |
| Test Architect & Quality Advisor | qa | Use for comprehensive test architecture review, quality gate decisions, and code improvement. Provides thorough analysis including requirements traceability, risk assessment, and test strategy. Advisory only - teams choose their quality bar. |
| Product Owner | po | Use for backlog management, story refinement, acceptance criteria, sprint planning, and prioritization decisions |
| Product Manager | pm | Use for creating PRDs, product strategy, feature prioritization, roadmap planning, and stakeholder communication |
| Full Stack Developer | dev | Use for code implementation, debugging, refactoring, and development best practices |
| BMad Master Orchestrator | bmad-orchestrator | Use for workflow coordination, multi-agent tasks, role switching guidance, and when unsure which specialist to consult |
| BMad Master Task Executor | bmad-master | Use when you need comprehensive expertise across all domains, running 1 off tasks that do not require a persona, or just wanting to use the same agent for many things. |
| Architect | architect | Use for system design, architecture documents, technology selection, API design, and infrastructure planning |
| Business Analyst | analyst | Use for market research, brainstorming, competitive analysis, creating project briefs, initial project discovery, and documenting existing projects (brownfield) |

### UX Expert (id: ux-expert)
Source: [.bmad-core/agents/ux-expert.md](.bmad-core/agents/ux-expert.md)

- When to use: Use for UI/UX design, wireframes, prototypes, front-end specifications, and user experience optimization
- How to activate: Mention "As ux-expert, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Scrum Master (id: sm)
Source: [.bmad-core/agents/sm.md](.bmad-core/agents/sm.md)

- When to use: Use for story creation, epic management, retrospectives in party-mode, and agile process guidance
- How to activate: Mention "As sm, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Test Architect & Quality Advisor (id: qa)
Source: [.bmad-core/agents/qa.md](.bmad-core/agents/qa.md)

- When to use: Use for comprehensive test architecture review, quality gate decisions, and code improvement. Provides thorough analysis including requirements traceability, risk assessment, and test strategy. Advisory only - teams choose their quality bar.
- How to activate: Mention "As qa, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Product Owner (id: po)
Source: [.bmad-core/agents/po.md](.bmad-core/agents/po.md)

- When to use: Use for backlog management, story refinement, acceptance criteria, sprint planning, and prioritization decisions
- How to activate: Mention "As po, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Product Manager (id: pm)
Source: [.bmad-core/agents/pm.md](.bmad-core/agents/pm.md)

- When to use: Use for creating PRDs, product strategy, feature prioritization, roadmap planning, and stakeholder communication
- How to activate: Mention "As pm, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Full Stack Developer (id: dev)
Source: [.bmad-core/agents/dev.md](.bmad-core/agents/dev.md)

- When to use: Use for code implementation, debugging, refactoring, and development best practices
- How to activate: Mention "As dev, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### BMad Master Orchestrator (id: bmad-orchestrator)
Source: [.bmad-core/agents/bmad-orchestrator.md](.bmad-core/agents/bmad-orchestrator.md)

- When to use: Use for workflow coordination, multi-agent tasks, role switching guidance, and when unsure which specialist to consult
- How to activate: Mention "As bmad-orchestrator, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### BMad Master Task Executor (id: bmad-master)
Source: [.bmad-core/agents/bmad-master.md](.bmad-core/agents/bmad-master.md)

- When to use: Use when you need comprehensive expertise across all domains, running 1 off tasks that do not require a persona, or just wanting to use the same agent for many things.
- How to activate: Mention "As bmad-master, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Architect (id: architect)
Source: [.bmad-core/agents/architect.md](.bmad-core/agents/architect.md)

- When to use: Use for system design, architecture documents, technology selection, API design, and infrastructure planning
- How to activate: Mention "As architect, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

### Business Analyst (id: analyst)
Source: [.bmad-core/agents/analyst.md](.bmad-core/agents/analyst.md)

- When to use: Use for market research, brainstorming, competitive analysis, creating project briefs, initial project discovery, and documenting existing projects (brownfield)
- How to activate: Mention "As analyst, ..." to get role-aligned behavior
- Full definition: open the source file above (content not embedded)

## Tasks

These are reusable task briefs; use the paths to open them as needed.

### Task: validate-next-story
Source: [.bmad-core/tasks/validate-next-story.md](.bmad-core/tasks/validate-next-story.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: trace-requirements
Source: [.bmad-core/tasks/trace-requirements.md](.bmad-core/tasks/trace-requirements.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: test-design
Source: [.bmad-core/tasks/test-design.md](.bmad-core/tasks/test-design.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: shard-doc
Source: [.bmad-core/tasks/shard-doc.md](.bmad-core/tasks/shard-doc.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: risk-profile
Source: [.bmad-core/tasks/risk-profile.md](.bmad-core/tasks/risk-profile.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: review-story
Source: [.bmad-core/tasks/review-story.md](.bmad-core/tasks/review-story.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: qa-gate
Source: [.bmad-core/tasks/qa-gate.md](.bmad-core/tasks/qa-gate.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: nfr-assess
Source: [.bmad-core/tasks/nfr-assess.md](.bmad-core/tasks/nfr-assess.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: kb-mode-interaction
Source: [.bmad-core/tasks/kb-mode-interaction.md](.bmad-core/tasks/kb-mode-interaction.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: index-docs
Source: [.bmad-core/tasks/index-docs.md](.bmad-core/tasks/index-docs.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: generate-ai-frontend-prompt
Source: [.bmad-core/tasks/generate-ai-frontend-prompt.md](.bmad-core/tasks/generate-ai-frontend-prompt.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: facilitate-brainstorming-session
Source: [.bmad-core/tasks/facilitate-brainstorming-session.md](.bmad-core/tasks/facilitate-brainstorming-session.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: execute-checklist
Source: [.bmad-core/tasks/execute-checklist.md](.bmad-core/tasks/execute-checklist.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: document-project
Source: [.bmad-core/tasks/document-project.md](.bmad-core/tasks/document-project.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: create-next-story
Source: [.bmad-core/tasks/create-next-story.md](.bmad-core/tasks/create-next-story.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: create-doc
Source: [.bmad-core/tasks/create-doc.md](.bmad-core/tasks/create-doc.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: create-deep-research-prompt
Source: [.bmad-core/tasks/create-deep-research-prompt.md](.bmad-core/tasks/create-deep-research-prompt.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: create-brownfield-story
Source: [.bmad-core/tasks/create-brownfield-story.md](.bmad-core/tasks/create-brownfield-story.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: correct-course
Source: [.bmad-core/tasks/correct-course.md](.bmad-core/tasks/correct-course.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: brownfield-create-story
Source: [.bmad-core/tasks/brownfield-create-story.md](.bmad-core/tasks/brownfield-create-story.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: brownfield-create-epic
Source: [.bmad-core/tasks/brownfield-create-epic.md](.bmad-core/tasks/brownfield-create-epic.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: apply-qa-fixes
Source: [.bmad-core/tasks/apply-qa-fixes.md](.bmad-core/tasks/apply-qa-fixes.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

### Task: advanced-elicitation
Source: [.bmad-core/tasks/advanced-elicitation.md](.bmad-core/tasks/advanced-elicitation.md)
- How to use: Reference the task in your prompt or execute via your configured commands.
- Full brief: open the source file above (content not embedded)

<!-- END: BMAD-AGENTS-OPENCODE -->
