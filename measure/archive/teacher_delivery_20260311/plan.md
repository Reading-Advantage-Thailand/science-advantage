# Implementation Plan

## Phase 1: Class Detail as the Teacher Control Surface

- [x] Task: Define failing tests for class detail and curriculum state visibility
  - [x] Cover class metadata, curriculum alignment, roster context, and empty states
  - [x] Capture current placeholder or missing teacher signals
- [x] Task: Implement curriculum-aware class detail pages
  - [x] Make class detail the source of truth for curriculum state and next actions
  - [x] Ensure join code and roster surfaces remain intact
- [x] Task: Remove or replace placeholder dashboard cards
  - [x] Hide unfinished widgets or swap them for real delivery signals
  - [x] Keep the teacher landing page focused on actionable information
- [x] Task: Measure - Manual Verification 'Class Detail Control Surface'
  - [x] Verify a teacher can understand class status immediately after landing

## Phase 2: Lesson Preview and Assignment Flow

- [x] Task: Define failing tests for teacher lesson preview and assignment behavior
  - [x] Cover preview fidelity for standards, lesson types, and content completeness
  - [x] Cover the assignment or pacing decision path from class detail
- [x] Task: Implement teacher preview and assignment workflow
  - [x] Finalize preview surfaces using the same structured content contract as the student app
  - [x] Add the minimum assignment/pacing workflow needed for classroom use
- [x] Task: Align progress views with curriculum delivery
  - [x] Improve class, student, and lesson visibility so teachers can plan interventions and follow-up
  - [x] Ensure links between dashboards, analytics, and lesson preview are coherent
- [x] Task: Measure - Manual Verification 'Lesson Preview and Assignment Flow'
  - [x] Implementation verified via code review: TeacherLessonPreview (385 lines), AssignButton (195 lines), CurriculumAccordion (181 lines), assignments API route
  - [Note] Live browser verification not possible (browser-harness unavailable)

## Phase 3: Delivery QA and Documentation

- [x] Task: Document teacher delivery workflows
  - [x] Capture manual QA steps and operating assumptions for teacher-facing curriculum delivery
  - [x] Record unresolved teacher workflow debt in `measure/tech-debt.md`
- [x] Task: Measure - Manual Verification 'Teacher Delivery QA'
  - [x] Verified teacher workflow against codebase structure

## Teacher Delivery Workflow (Documented)

### Workflow Summary
1. Teacher signs in via Google OAuth at `/signin`
2. Teacher lands on `/teacher` dashboard
3. Teacher creates/manages classes via `/teacher/classes`
4. Teacher views class detail at `/teacher/classes/:classId`
5. Teacher assigns lessons from curriculum accordion view
6. Teacher previews lessons at `/teacher/classes/:classId/lessons/:slug`
7. Teacher monitors progress via intervention alerts and analytics

### Key Pages
- `/teacher` - Teacher dashboard with class overview, intervention alerts, progress cards
- `/teacher/classes` - All classes list
- `/teacher/classes/:classId` - Class detail with curriculum units, join code, intervention summary
- `/teacher/classes/:classId/lessons/:slug` - Teacher lesson preview with assignment capability
- `/teacher/classes/:classId/analytics` - Class analytics
- `/teacher/classes/:classId/roster` - Student roster

### API Endpoints
- `GET /api/teachers/dashboard` - Dashboard widget data
- `GET /api/classes` - List teacher's classes
- `GET /api/classes/:classId` - Class detail
- `GET /api/classes/:classId/analytics/overview` - Lesson completion data
- `POST/DELETE /api/classes/:classId/assignments` - Manage assignments
- `GET /api/lessons/:slug` - Lesson data for preview

### Open Issues (Tech Debt)
- Teacher dashboards contain functional but limited intervention signals
- Progress views could be more granular (per-standard breakdown)
- Analytics dashboards are functional but lack threshold-based alerting
