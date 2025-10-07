# Science Advantage - Implementation Roadmap

This document outlines the development roadmap for building the Science Advantage platform, based on the epics defined in the Product Requirements Document. This plan replaces the previous MVP-only focus and aligns with the full architectural vision.

## 🤖 BMAD Agent Assignments

For detailed agent assignments and responsibilities, see: **[BMAD Agent Assignments](docs/bmad-agent-assignments.md)**

### Quick Reference:

- **dev (James)**: Implementation, coding, debugging
- **architect (Winston)**: System design, architecture decisions
- **qa (Quinn)**: Quality gates, testing strategy, security
- **ux-expert (Sally)**: UI/UX design, user experience
- **po (Sarah)**: Product ownership, backlog management
- **sm (Bob)**: Scrum process, story creation

## 🚨 URGENT: Critical Infrastructure Refactoring (Highest Priority)

**BLOCKER**: Current codebase violates core architectural standards. Must complete before any other development.

### **Phase 0: Infrastructure Compliance (COMPLETED ✅)**

- [x] **CRITICAL: Create Missing Core Infrastructure Files**
  - [x] Create `lib/types.ts` - Centralized shared type definitions
    - Extract User, Class, Lesson, Quiz types from Prisma
    - Define API request/response interfaces
    - Add validation schemas with Zod
  - [x] Create `lib/api.ts` - Centralized API client
    - Implement apiClient with proper error handling
    - Add authentication headers automatically
    - Standardize response formatting
  - [x] Create `lib/errors.ts` - Standardized error handling
    - Define ApiError class hierarchy
    - Implement handleApiError utility
    - Create consistent error response format
  - [x] Refactor `lib/env.ts` - Type-safe environment variables
    - Replace direct process.env access with Zod schema
    - Add validation for all required environment variables
    - Provide type-safe env object

**Why This is Critical:**

- Violates `docs/architecture/coding-standards.md` requirements
- Blocks all future development until compliant
- Enables type sharing between frontend/backend
- Provides foundation for centralized API patterns
- Required for CI/CD pipeline to pass

**Estimated Time**: 2-3 hours
**Dependencies**: None (can start immediately)

## In Progress

- [ ] #33 - Bug: Login is broken (feat/33-bug-login-is-broken) - Started: 2025-10-06 - Tests: ❌ Critical Failures (Lint: 7 warnings, Unit: 0%, Integration: 0%, E2E: 0%)

## Completed

- [x] #26 - Backend: Assignment scheduling APIs - PR: #34 - Completed: 2025-10-06 ✅ (Merge: a85d808)
- [x] #24 - Backend: Class creation API and join code generation - PR: #32 - Completed: 2025-10-06 ✅ (Merge: 5302659)

## Completed

- [x] #17 - Env + Secrets Baseline (feat/17-env-secrets-baseline) - Completed: 2025-01-06 - Tests: ✅ Passed (Unit: 91%, Integration: 97%, E2E: 67%)

## Phase 1: Foundation & Core Curriculum (Epics 1 & 2)

_⚠️ BLOCKED until Phase 0 infrastructure compliance is complete_

The primary goal of this phase is to establish the technical foundation, integrate with the Advantage ecosystem, and build the core content delivery and virtual lab systems.

- [ ] **Epic 1: Foundation & Ecosystem Integration**
  - [ ] Set up the monorepo, CI/CD pipeline, and GCP deployment environment.
  - [ ] Implement Single Sign-On (SSO) with the existing Advantage authentication system.
  - [ ] Establish the core API gateway and microservices architecture.
  - [ ] Implement real-time data synchronization with other Advantage products.

- [ ] **Epic 2: Core Science Curriculum & Content Management**
  - [ ] Build the curriculum framework aligned with Thai Ministry of Education standards.
  - [ ] Develop the interactive lesson player for multimedia content.
  - [ ] Implement the Virtual Laboratory system with initial physics and chemistry simulations.
  - [ ] Create the bilingual (Thai/English) content management system.
  - [ ] Build the core assessment and quizzing engine with automatic grading.

## Phase 2: Intelligence & Engagement (Epics 3 & 4)

_⚠️ BLOCKED until Phase 0 infrastructure compliance is complete_

This phase focuses on developing the AI-powered personalization features and the tools required for high user engagement and effective classroom management.

- [ ] **Epic 3: AI-Powered Personalization & Cross-Subject Learning**
  - [ ] Develop the student learning profile and initial assessment system.
  - [ ] Build the v1 AI recommendation engine for personalized content.
  - [ ] Implement cross-subject links between science and reading content.
  - [ ] Create the predictive analytics model for early student intervention.

- [ ] **Epic 4: User Engagement & Classroom Management**
  - [ ] Build the comprehensive Teacher Dashboard for class and assignment management.
  - [ ] Implement gamified learning elements (achievements, skill trees, leaderboards).
  - [ ] Develop the Parent Portal for monitoring child progress.
  - [ ] Add collaborative features (discussion forums, group projects).

## Phase 3: Mobility, Analytics & Advanced Features (Epics 5, 6, & 7)

_⚠️ BLOCKED until Phase 0 infrastructure compliance is complete_

This phase extends the platform's reach with mobile applications, deep analytics, and premium features that secure its market-leading position.

- [ ] **Epic 5: Mobile Applications & Offline Capabilities**
  - [ ] Develop and launch native iOS and Android applications.
  - [ ] Implement a touch-optimized UI for all core features.
  - [ ] Build the offline content access and progress synchronization system.

- [ ] **Epic 6: Analytics & Reporting**
  - [ ] Create the advanced Learning Analytics Dashboard for teachers and admins.
  - [ ] Develop cross-subject reporting to show ecosystem value.
  - [ ] Implement system performance and usage analytics dashboards.

- [ ] **Epic 7: Advanced Features & Integrations**
  - [ ] Integrate a live tutoring platform.
  - [ ] Develop proof-of-concept AR/VR laboratory experiences.
  - [ ] Implement integrations with key third-party school systems (LMS, SIS).

---

## gh Commands — Issue → Branch → PR

Set your sprint milestone name once per sprint:

- `export SPRINT_MILESTONE="S0 – Skeleton + Auth"`

Create an issue and immediately start a branch for it:

- `TITLE="Lesson Viewer (Static Content, Completion Toggle)"`
- `DESC="Implements read-only lesson page and completion state; teacher list view."`
- `NUM=$(gh issue create --title "$TITLE" --body "$DESC" --label "type:feature" --milestone "$SPRINT_MILESTONE" --assignee @me --json number --jq .number)`
- `BR="feat/${NUM}-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-|-$//g' | cut -c1-40)"`
- `git switch -c "$BR"`

Run tests locally before opening PR:

- `npm run lint && npm run test && npm run test:integration`

Open PR with auto-merge (squash) after checks pass:

- `gh pr create --fill --label "type:feature" --milestone "$SPRINT_MILESTONE" --draft=false`
- `gh pr merge --auto --squash`

After merge, sync local and clean up:

- `git checkout main && git pull --ff-only`
- `git branch -d "$BR" && gh branch delete "$BR" -y`
