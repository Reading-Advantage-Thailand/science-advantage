# Student Engagement Loop — Phase 3 Plan

## Phase 3: Celebration Animations

### Task 1: Confetti celebration component
- [x] Create `components/features/gamification/confetti-celebration.tsx`
- [x] Canvas-based confetti with requestAnimationFrame
- [x] Props: trigger, intensity, onComplete
- [x] Intensity maps to particle count: low=20, medium=50, high=80
- [x] Design-system colors for particles
- [x] 3-second duration with fade-out
- [x] Respects prefers-reduced-motion
- [x] Cleanup animation frame on unmount

### Task 2: Progress bar fill animation
- [x] CSS class `.xp-progress-fill` with `transition: width 1s ease-out`
- [x] Added to `app/globals.css`

### Task 3: Badge unlock animation component
- [x] Create `components/features/gamification/badge-unlock-animation.tsx`
- [x] Bounce-in scale animation (CSS keyframes)
- [x] Glow pulse effect behind badge
- [x] Shows badge name and description
- [x] Auto-dismiss after 4 seconds or click to dismiss
- [x] Respects prefers-reduced-motion

### Task 4: Level-up animation component
- [x] Create `components/features/gamification/level-up-animation.tsx`
- [x] Full-screen overlay with backdrop
- [x] Old level → arrow → new level display
- [x] CSS particle-burst circles
- [x] Auto-dismiss after 5 seconds or click to dismiss
- [x] Respects prefers-reduced-motion

### Task 5: Wire celebrations into quiz results
- [x] QuizPlayer imports all three celebration components
- [x] Confetti triggered based on score percentage
- [x] Level-up shown when levelUp is true
- [x] Badge queue shown for each unlocked badge
- [x] Streak milestone toast via sonner

### Task 6: Tests
- [x] ConfettiCelebration tests (5 tests)
- [x] BadgeUnlockAnimation tests (7 tests)
- [x] LevelUpAnimation tests (10 tests)
