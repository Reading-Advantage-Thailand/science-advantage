# Sprint 0: Foundation & Advanced Schema Setup

**Milestone:** Sprint 0: Foundation & Advanced Schema Setup
**Epic Issue:** #40
**Created:** 2025-10-07
**Issues Created:** 5 (plus 1 epic tracker)

**Goal:** Establish the core project structure, development environment, CI/CD, and a basic, deployable "walking skeleton" application. This sprint focuses on creating a robust foundation with a forward-thinking data schema to support multiple standards alignments from day one.

---

## User Stories & Technical Tasks

### Story: Project Initialization

**Issue:** #35 - Created: 2025-10-07
**Labels:** type:chore, area:devex, priority:P1
**Agent Assignment:** dev (James), architect (Winston)

- **As a developer,** I want a new Next.js 15 project initialized with TypeScript, ESLint, Prettier, and Tailwind CSS to ensure code quality and a modern development experience.
- **Acceptance Criteria:**
  - A new Next.js project is created.
  - `npm run dev` starts the development server.
  - `npm run lint` and `npm run format` are configured and working.
  - The project follows the `unified-project-structure.md` conventions.

### Story: Advanced Data Schema ✅ COMPLETED

**Issue:** #36 - Created: 2025-10-07
**Status:** Completed ✅
**PR:** #41 - Merged: 2025-10-07
**Merge Commit:** 28bb6d384e6fb2a4c2b1b36ce421a3d33dd9e878
**Started:** 2025-10-07
**Completed:** 2025-10-07
**Test Results:** Schema: 100%, Integration: ✅ (13/13 tests passed)
**Test Date:** 2025-10-07
**Labels:** type:feature, area:backend, priority:P1
**Agent Assignment:** dev (James), architect (Winston), qa (Quinn)
**Notes:** Implementation went smoothly, no blockers encountered. Schema is production-ready and provides foundation for multi-standards curriculum support.

- **As a developer,** I need a Prisma schema that models users, classes, and a flexible curriculum structure capable of handling multiple standards frameworks.
- **Acceptance Criteria:**
  - ✅ `prisma/schema.prisma` is created.
  - ✅ The schema includes the following models:
    - ✅ `User`: Standard user fields (id, email, name, role, image).
    - ✅ `Class`: Includes a non-optional `standardsAlignment` enum (`THAI`, `NGSS`) and `gradeLevel`.
    - ✅ `Standard`: A new model to store individual standard details (`id`, `framework`, `code`, `description`).
    - ✅ `Lesson`: A core model for lesson content, with a many-to-many relationship to `Standard`.
    - ✅ `CurriculumUnit`: A model to define the curriculum sequence (`id`, `title`, `framework`, `gradeLevel`, `order`), with a many-to-many relationship to `Lesson`.
  - ✅ `npx prisma generate` runs successfully.
  - ✅ `npx prisma db push` successfully syncs the schema to a local PostgreSQL database.

### Story: User Authentication

**Issue:** #37 - Created: 2025-10-07
**Labels:** type:feature, area:backend, area:frontend, priority:P1
**Agent Assignment:** dev (James), architect (Winston), qa (Quinn)

- **As a user,** I want to sign in with my Google account so I can access the platform securely.
- **Acceptance Criteria:**
  - Better Auth is configured for Google OAuth.
  - A user can click a "Sign In" button, complete the Google OAuth flow, and be redirected to a dashboard page.
  - A protected route (e.g., `/dashboard`) is created that redirects unauthenticated users to the sign-in page.
  - User information (name, email, image) is persisted in the `User` table upon first sign-in.

### Story: Foundational CI/CD

**Issue:** #38 - Created: 2025-10-07
**Labels:** type:chore, area:devex, priority:P1
**Agent Assignment:** dev (James), architect (Winston)

- **As a developer,** I want a basic CI/CD pipeline to automatically run checks on every pull request to maintain code quality.
- **Acceptance Criteria:**
  - A GitHub Actions workflow is created in `.github/workflows/ci.yml`.
  - The workflow is triggered on pull requests to the `main` branch.
  - The workflow runs `npm install`, `npm run lint`, and `npm run build`.
  - The pull request is blocked if any of these steps fail.

### Story: Curriculum Seeding

**Issue:** #39 - Created: 2025-10-07
**Labels:** type:feature, area:backend, priority:P2
**Agent Assignment:** dev (James), qa (Quinn)

- **As a developer,** I need a database seed script to populate initial curriculum data so I can develop and test features in subsequent sprints.
- **Acceptance Criteria:**
  - A script `prisma/seed.ts` is created.
  - The script populates the database with:
    - Sample `Standard` entries for both `THAI` and `NGSS` frameworks for Grade 3.
    - Sample `Lesson` entries for the first few lessons of Grade 3.
    - Sample `CurriculumUnit` entries that define the order of lessons for Grade 3, creating distinct sequences for `THAI` and `NGSS` alignments.
  - The seed script can be run via an `npm` command (e.g., `npm run db:seed`).

---

## Definition of Done

- All user stories and technical tasks are complete and meet their acceptance criteria.
- The application is deployable to Vercel.
- A user can sign in, view a protected dashboard page, and sign out.
- The database schema is finalized and seeded with initial data for Sprint 1 development.
- The CI pipeline is green.
