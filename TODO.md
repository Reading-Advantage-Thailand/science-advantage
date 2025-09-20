# Science Advantage — MVP-First Roadmap

This plan prioritizes thin, end-to-end slices that are demoable early. It replaces phase buckets with small stories tied to a GitHub-first workflow using `gh` for issues, branches, and PRs.

## Goals & Constraints

- Scope: NGSS only, Grade 6 pilot; 1 unit, 5 lessons, 1 experiment, 20 MCQs.
- Roles: teacher and student; Google OAuth only for MVP.
- Non-goals (Post-MVP): adaptive difficulty, cross-standards mapping, AI feedback, advanced analytics, inventory/printing.

## Current Sprint (S0) — Skeleton + Auth

Create these issues (titles are exact; each item includes acceptance criteria). Use the cheat sheet below to open issues and branches with `gh`.

1) App Skeleton (Next.js + TS + Tailwind + shadcn)
- Acceptance: `npm run dev` serves a placeholder dashboard route; Tailwind and shadcn/ui button renders; ESLint/Prettier run clean.

2) Env + Secrets Baseline
- Acceptance: `.env.example` contains required keys from README; `npm run dev` fails fast if missing critical vars.

3) Database + Prisma Init
- Acceptance: `npx prisma generate` works; `npx prisma db push` creates base tables for users, classes, lessons, quiz questions, attempts; seed inserts demo Unit 1.

4) ✅ Auth (Google OAuth) + Protected Routes
- Acceptance: Shipped via PR #12 — Google sign-in works, `/dashboard` requires auth, session shows user name, and sign-out returns to `/signin`.

5) Lesson Viewer (Static Content, Completion Toggle)
- Acceptance: Student can open Lesson 1 and click “Mark complete”; teacher can view completion list per class.

6) MCQ Quiz (Auto-score)
- Acceptance: Student completes a 10-question quiz; auto-score saved; teacher sees per-student scores.

7) Experiment Guide + Data Entry (Basic)
- Acceptance: Student views steps and submits a small data form; teacher can export CSV.

8) Class Admin Lite (Class + Join Code + Assignment)
- Acceptance: Teacher creates a class and join code; assigns a lesson/quiz; students see items in “My Work”.

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

## Next Sprints Overview

- S1 — Lesson + Completion + Scores
  - Harden lesson viewer; add class-level completion view; basic scores table.
- S2 — MCQ Engine Basics
  - Question/attempt models; timed quiz; item-level stats (basic).
- S3 — Experiment v1
  - Guide viewer; safety; single data form; CSV export.
- S4 — Class Admin Lite
  - Create class; join codes; assign content; due dates; status.
- S5 — Pilot Readiness
  - A11y critical fixes; error states; participation/completion dashboards; docs for pilot.

## Definition of Done (Per Slice)

- TDD followed (Red → Green → Refactor) with tests written first.
- End-to-end demoable flow behind a route/flag.
- Seed data supports a 5-minute demo path.
- Tests: unit + integration for core logic; one e2e happy path per slice.
- Updated docs in `docs/` and README references.
- CI green on lint, unit, integration (and e2e if configured); preview deployment link; owner sign-off.

## Demo/Seed Playbook

- Seed: `npx prisma db seed` creates NGSS Grade 6 Unit 1 (5 lessons, 20 MCQs, 1 experiment).
- Demo path:
  - Teacher: create class → copy join code → assign Lesson 1 → view completion.
  - Student: sign in → open Lesson 1 → mark complete → take quiz → submit experiment data.
  - Teacher: view scores and export experiment CSV.

## Post-MVP Backlog (Themed)

- Multi-Standards: UK, Thai integrations; cross-mapping; equivalency; pacing guides.
- Adaptive Learning: difficulty tracking; gap detection; reteach triggers; practice generation.
- Assessment: short-answer eval; rubric tools; writing prompts; plagiarism detection; AI feedback.
- Experiments: collaborative data; visualization; lab report generator; scheduling tools.
- Teacher Tools: parent comms; inventory; printing; resource library; customization.

## Risks & Mitigations

- Content readiness: start with minimal seed and iterate; define content freeze dates.
- Auth friction: start with Google only; add more IdPs post-MVP.
- Performance: keep schema simple; add Redis/CDN only if profiling requires.
- School networks: provide offline-friendly print/export for backup; minimal asset sizes.

## Metrics

- DAU by role; lesson completion rate; quiz submission rate; experiment submissions; assignment on-time rate.
 
