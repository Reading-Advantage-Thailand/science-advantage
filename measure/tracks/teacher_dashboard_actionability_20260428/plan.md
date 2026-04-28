# Implementation Plan

## Phase 1: Dashboard Data Surfaces

- [ ] Task: Define failing tests for dashboard data endpoints
  - [ ] Write tests for class progress aggregation (completion rate, average score, active students)
  - [ ] Write tests for students-needing-attention count (mastery < 0.6 across classes)
  - [ ] Write tests for recent completions feed (5 most recent LessonCompletion records)
- [ ] Task: Implement dashboard data API
  - [ ] Create `/api/teachers/dashboard` endpoint aggregating class progress, attention count, and recent completions
  - [ ] Implement efficient queries (avoid N+1 — aggregate in Prisma, not in application code)
  - [ ] Add loading states and error handling
- [ ] Task: Replace placeholder dashboard cards
  - [ ] Build `ClassProgressCard` component with color-coded completion rates
  - [ ] Build `StudentsNeedAttentionCard` with count and link to intervention details
  - [ ] Build `RecentCompletionsFeed` with student name, lesson title, score, timestamp
  - [ ] Remove the three placeholder cards ("No recent activity", "No upcoming deadlines" x2)
- [ ] Task: Measure - Manual Verification 'Dashboard Data'
  - [ ] Verify class progress shows real completion percentages
  - [ ] Verify students-needing-attention shows accurate count

## Phase 2: Curriculum Accordion and Class Management

- [ ] Task: Make curriculum accordion interactive
  - [ ] Write tests for lesson click navigation and completion badge display
  - [ ] Add click handler to lesson entries in `CurriculumAccordion` → navigate to teacher lesson preview
  - [ ] Add completion count badge next to each lesson (X/Y students completed)
  - [ ] Add loading state for completion data
- [ ] Task: Implement class editing
  - [ ] Write tests for class update API (rename, description change)
  - [ ] Add PATCH endpoint to `/api/classes/[classId]` for name/description updates
  - [ ] Add edit button on class detail header with inline edit form
- [ ] Task: Implement class deletion
  - [ ] Write tests for class delete (with and without student progress data)
  - [ ] Add DELETE endpoint to `/api/classes/[classId]`
  - [ ] Add delete button with confirmation dialog on class detail page
  - [ ] Soft-delete if students have progress; hard-delete if no progress
- [ ] Task: Implement class roster view
  - [ ] Write tests for roster API (student list with name, email, join date, last active)
  - [ ] Create `/api/classes/[classId]/roster` endpoint
  - [ ] Add roster tab/panel to class detail page
  - [ ] Add remove-student action with confirmation
- [ ] Task: Measure - Manual Verification 'Curriculum and Class Management'
  - [ ] Verify clicking a lesson in the accordion navigates to teacher preview
  - [ ] Verify class edit saves new name/description
  - [ ] Verify class delete works with confirmation

## Phase 3: Assignment System

- [ ] Task: Define assignment data model
  - [ ] Write tests for assignment creation, listing, and due date logic
  - [ ] Add `Assignment` model to Prisma schema (classId, lessonId, assignedAt, dueAt, assignedBy)
  - [ ] Run migration
- [ ] Task: Implement assignment API and UI
  - [ ] Write tests for assignment CRUD endpoints
  - [ ] Create `/api/classes/[classId]/assignments` endpoints (POST create, GET list, DELETE remove)
  - [ ] Add "Assign" button on teacher lesson preview and curriculum accordion
  - [ ] Add assignment due date picker (optional)
- [ ] Task: Surface assignments in student view
  - [ ] Write tests for student assignment visibility
  - [ ] Add assignment badges to student curriculum view (due date, assigned indicator)
  - [ ] Replace "No assignments yet" placeholder on student dashboard with real assignment list
- [ ] Task: Integrate intervention alerts
  - [ ] Remove `NEXT_PUBLIC_FEATURE_INTERVENTION_ALERTS` feature flag
  - [ ] Move intervention alerts widget to top of teacher dashboard
  - [ ] Add class-level intervention summary on class detail page
- [ ] Task: Measure - Manual Verification 'Assignments'
  - [ ] Verify teacher can assign a lesson from the preview page
  - [ ] Verify assigned lesson shows due date badge in student curriculum view
  - [ ] Verify intervention alerts appear without feature flag
