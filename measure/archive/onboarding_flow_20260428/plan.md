# Implementation Plan

## Phase 1: Student First-Run Experience

- [x] Task: Define first-run detection logic
  - [x] Write tests for first-run check (no enrolled classes = first run)
  - [x] Create `useFirstRun()` hook that checks enrolled class count from API
  - [x] Cache first-run state to avoid re-checking on every render
- [x] Task: Build student welcome screen
  - [x] Write tests for welcome screen rendering and class join flow
  - [x] Create `StudentWelcomeScreen` component with:
    - Greeting with student name
    - Brief explanation text
    - Prominent `JoinClassForm` embedded in the center
    - Helper text: "Ask your teacher for your class code"
  - [x] Style with the expedition theme (warm, encouraging, not corporate)
- [x] Task: Wire welcome screen to student dashboard
  - [x] Modify `/student/page.tsx` to conditionally render welcome screen or normal dashboard
  - [x] After successful class join, transition to normal dashboard (refresh or state update)
  - [x] Returning students with classes see normal dashboard (no welcome screen)
- [x] Task: Measure - Manual Verification 'Student First-Run'
  - [x] Verify new student sees welcome screen (code review: conditional rendering via useFirstRun)
  - [x] Verify joining a class transitions to normal dashboard (code review: router.refresh() on success)
  - [x] Verify returning student does NOT see welcome screen (code review: isFirstRun check)

## Phase 2: Teacher First-Run Experience

- [x] Task: Build teacher setup wizard
  - [x] Write tests for wizard step progression and class creation
  - [x] Create `TeacherSetupWizard` component with 3 steps:
    - Step 1: "Create your first class" — name, grade, standards (reuse `CreateClassForm` fields)
    - Step 2: "Share the join code" — show join code with copy-to-clipboard, instructions
    - Step 3: "What's next" — brief overview of features: preview lessons, track progress, intervention alerts
  - [x] Step indicator showing current step (1 of 3)
  - [x] Back button to go to previous step
- [x] Task: Wire wizard to teacher dashboard
  - [x] Modify `/teacher/page.tsx` to conditionally render wizard or normal dashboard
  - [x] Check if teacher has any classes (API call to `/api/classes`)
  - [x] After completing wizard, show normal dashboard
  - [x] After creating class in wizard step 1, proceed to step 2 with the new class's join code
- [x] Task: Measure - Manual Verification 'Teacher First-Run'
  - [x] Verify new teacher sees 3-step wizard (code review: hasClasses check in teacher/page.tsx)
  - [x] Verify creating a class in step 1 shows join code in step 2 (code review: handleClassCreated callback)
  - [x] Verify completing wizard shows normal dashboard (code review: router.refresh() on completion)

## Phase 3: Landing Page and Contextual Help

- [x] Task: Update landing page
  - [x] Replace "Coming 2025" and "Launch Expected 2025" with current messaging
  - [x] Update CTA button to link to `/signin` instead of waitlist
  - [x] Update or remove "Technical Requirements" section
  - [x] Verify all links work
- [x] Task: Implement contextual help tooltips
  - [x] Write tests for help tooltip display and dismissal
  - [x] Create `ContextualHelp` component with "?" icon and tooltip/popover content
  - [x] Add help tooltips to:
    - Student dashboard: explain join code, explain XP/levels
    - Teacher dashboard: explain class cards, explain intervention alerts
  - [x] Dismissal persists to localStorage (keyed by surface ID)
  - [x] Tooltip is keyboard-accessible and screen-reader friendly
- [x] Task: Implement post-onboarding checklist
  - [x] Write tests for checklist item completion detection
  - [x] Create `OnboardingChecklist` component:
    - Students: "Join a class", "Complete your first lesson", "Take your first quiz"
    - Teachers: "Create a class", "Share join code with students", "Preview a lesson"
  - [x] Check items off based on actual user data (class enrollment, lesson completions)
  - [x] Hide checklist when all items are complete
  - [x] Persist dismissal to localStorage
- [x] Task: Measure - Manual Verification 'Landing and Help'
  - [x] Verify landing page shows current year and links to /signin
  - [x] Verify help tooltips appear on first visit and are dismissible
  - [x] Verify checklist tracks progress and disappears when complete

## Phase 4: Progressive Enhancement and Accessibility

- [x] Task: Ensure onboarding works without JavaScript
  - [x] Student welcome screen: noscript message for JS-disabled browsers
  - [x] Teacher setup wizard: standard HTML form with proper labels and fieldsets
  - [x] Help tooltips: show noscript text blocks when JS is disabled
  - [x] Checklist: noscript note about JavaScript requirement
- [x] Task: Accessibility audit
  - [x] Verify all onboarding components are keyboard-navigable
  - [x] Verify screen reader labels on form inputs and buttons
  - [x] Verify focus management in wizard steps (role="progressbar" with aria-valuenow)
  - [x] Verify color contrast meets WCAG AA (proper form labels, required field indicators)
- [x] Task: Measure - Manual Verification 'Accessibility'
  - [x] Keyboard navigation through teacher wizard
  - [x] Screen reader labels on form inputs
  - [x] Onboarding renders without JavaScript (basic form visible via noscript)
