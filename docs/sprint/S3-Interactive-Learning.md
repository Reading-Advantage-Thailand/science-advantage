# Sprint 3: Interactive Learning - Standards-Tagged Assessments

**Goal:** Introduce the first layer of interactivity and progress tracking by implementing formative assessments (quizzes) that follow each instructional lesson. Questions will be linked to specific standards to lay the groundwork for future analytics.

---

## User Stories & Technical Tasks

### Story: Take a Formative Quiz

- **As a student,** after reading a lesson, I want to take a short quiz so I can check my understanding of the material.
- **Acceptance Criteria:**
  - At the end of an "Explicit Instruction" (EI) lesson, a "Start Quiz" button appears.
  - The quiz UI presents a series of multiple-choice questions, one at a time.
  - The student can select an answer for each question and navigate to the next.
  - A final "Submit" button is present on the last question.

### Story: Receive Immediate Feedback

- **As a student,** I want to see my score immediately after submitting a quiz so I can get instant feedback on my performance.
- **Acceptance Criteria:**
  - Upon submitting the quiz, the system auto-grades the answers.
  - A results screen is displayed showing the student's score (e.g., "You scored 4 out of 5").
  - A record of the quiz attempt, including the student's answers and the final score, is saved to the database in an `Attempt` table.

### Story: Track Lesson Progress

- **As a student,** I want the system to track my progress through lessons, marking them as complete once I've engaged with them.
- **Acceptance Criteria:**
  - A `LessonCompletion` model tracks the status of each lesson for each student.
  - When a student successfully completes a quiz for a lesson, the corresponding lesson is marked as "Completed".
  - In the curriculum view, there is a visual indicator (e.g., a checkmark) next to completed lessons.

### Technical Task: Evolve Data Schema for Assessments

- **As a developer,** I need to update the data schema to support standards-tagged questions and track student attempts.
- **Acceptance Criteria:**
  - A `QuizQuestion` model is created, containing the question text, options, correct answer, and a many-to-many relationship to the `Standard` model.
  - An `Attempt` model is created to store a student's submission for a quiz, including their responses and the final score.
  - The `prisma/seed.ts` script is updated to populate quiz questions for the initial lessons, with each question linked to one or more standards.

---

## Technical Notes

- This sprint will require API routes for fetching quiz questions and submitting quiz attempts.
- The frontend will need a new set of components for the quiz-taking interface and results display.
- The logic for calculating the score and saving the attempt must be handled securely on the backend.
- This sprint lays the foundation for the analytics and reporting features that will be built in later sprints.

## Definition of Done

- All user stories and technical tasks are complete and meet their acceptance criteria.
- A student can take a quiz after a lesson, receive a score, and see their progress updated.
- The backend correctly saves quiz attempts and links questions to standards.
- All new code is linted, formatted, and passes CI checks.
- The application remains in a deployable and working state.
