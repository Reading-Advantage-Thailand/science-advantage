# Sprint 1: Core Teacher Experience - Standards-Driven Class Setup

**Goal:** Enable teachers to create classes where the curriculum is dynamically configured based on the selected standards alignment. This sprint builds on the foundational schema to deliver the first core piece of teacher-facing functionality.

---

## User Stories

### Story: Create a Standards-Aligned Class

- **As a teacher,** I want to create a new class by specifying a name, a grade level, and a standards alignment so that the system can provide the correct curriculum for my students.
- **Acceptance Criteria:**
  - A "Create Class" form is available on the teacher dashboard.
  - The form includes fields for `Class Name` (text input), `Grade Level` (dropdown), and `Standards Alignment` (dropdown with 'Thai National Standards' and 'NGSS' as options).
  - All fields are mandatory.
  - Upon submission, a new `Class` record is created in the database with the specified details.
  - The teacher is redirected to their dashboard, where the new class appears.

### Story: View Classes on Dashboard

- **As a teacher,** I want to see a list of all the classes I have created on my dashboard so I can get a quick overview of my teaching responsibilities.
- **Acceptance Criteria:**
  - The teacher dashboard (`/dashboard`) displays a card for each class created by the logged-in teacher.
  - Each class card displays the `Class Name`, `Grade Level`, `Standards Alignment`, and the number of enrolled students.
  - Clicking on a class card navigates the teacher to the class detail page.

### Story: View Dynamic Curriculum Structure

- **As a teacher,** when I view a specific class, I want to see the curriculum presented as an ordered list of units so I can understand the scope and sequence of the course.
- **Acceptance Criteria:**
  - The class detail page (e.g., `/classes/[classId]`) is a protected route.
  - The page fetches the `Class` details, including its `standardsAlignment` and `gradeLevel`.
  - The application logic uses these two properties to query for the corresponding `CurriculumUnit`s.
  - The page displays a list of `CurriculumUnit` titles, sorted by their `order` field.
  - Each unit in the list can be expanded to show the titles of the `Lessons` it contains, also correctly ordered.

### Story: Access Class Join Code

- **As a teacher,** I need to easily find and share a unique join code for each class so that my students can enroll themselves.
- **Acceptance Criteria:**
  - The class detail page prominently displays the unique `joinCode` for the class.
  - There is a button to easily copy the join code to the clipboard.

---

## Technical Notes

- This sprint requires building the first set of API routes under `app/api/classes/`.
- Frontend components will be built in `components/features/dashboard/` and `components/features/classes/`.
- Significant focus will be on the backend logic that correctly queries and assembles the curriculum structure based on the class's alignment.

## Definition of Done

- All user stories are complete and meet their acceptance criteria.
- A teacher can successfully create a class, view it on their dashboard, and see the correctly structured curriculum for the chosen standard.
- All new code is linted, formatted, and passes CI checks.
- The application remains in a deployable and working state.
