# Implementation Plan

## Phase 1: XP, Levels, and Progression Foundation

- [x] Task: Define database schema for gamification state
  - [x] Write tests for XP calculation, level thresholds, and badge unlock rules
  - [x] Add `GamificationProfile` model to Prisma schema (userId, xp, level, streak, lastActiveAt)
  - [x] Add `Achievement` model (userId, badgeType, unlockedAt)
  - [x] Run migration and verify schema
- [x] Task: Implement XP and level calculation service
  - [x] Write tests for XP award logic (lesson completion XP, quiz score bonus, first-attempt bonus)
  - [x] Write tests for level calculation (XP thresholds, level names)
  - [x] Implement `awardXp()` and `getLevel()` functions
  - [x] Wire XP award into quiz submission endpoint
- [x] Task: Implement streak tracking
  - [x] Write tests for streak calculation (consecutive days, reset logic)
  - [x] Implement streak update on lesson completion
  - [x] Implement streak milestone detection (7-day, 30-day)
- [ ] Task: Measure - Manual Verification 'XP and Streaks'
  - [ ] Verify XP is awarded after quiz submission
  - [ ] Verify streak increments on consecutive days

## Phase 2: Achievement Badges

- [ ] Task: Define badge rules and unlock conditions
  - [ ] Write tests for each badge type unlock logic
  - [ ] Implement badge evaluation service (check conditions against user's completion data)
  - [ ] Define 8-12 badge types with thematic names and descriptions
- [ ] Task: Wire badge unlocks to lesson/quiz completion
  - [ ] Write tests for badge check triggered on completion events
  - [ ] Add badge evaluation call to quiz submission endpoint
  - [ ] Return newly unlocked badges in quiz response
- [ ] Task: Measure - Manual Verification 'Badge Unlocks'
  - [ ] Verify "First Steps" badge unlocks on first lesson completion
  - [ ] Verify "Perfect Score" badge unlocks on 100% quiz score

## Phase 3: Celebration Animations

- [ ] Task: Implement confetti celebration component
  - [ ] Write tests for confetti trigger and reduced-motion fallback
  - [ ] Implement lightweight canvas confetti (no heavy library — use CSS animations or minimal canvas)
  - [ ] Scale confetti intensity based on quiz score
  - [ ] Respect `prefers-reduced-motion` — show static "Congratulations!" badge instead
- [ ] Task: Implement progress animations
  - [ ] Add fill animation to XP progress bar (CSS transition)
  - [ ] Add scale-in animation for badge unlock (badge scales up with glow, settles)
  - [ ] Add level-up particle effect (CSS keyframes)
  - [ ] All animations respect reduced-motion preference
- [ ] Task: Measure - Manual Verification 'Celebrations'
  - [ ] Verify confetti fires on quiz completion
  - [ ] Verify animations respect prefers-reduced-motion

## Phase 4: Dashboard and Profile Integration

- [ ] Task: Replace student dashboard Progress card
  - [ ] Write tests for gamification data display
  - [ ] Build XP counter + level badge component
  - [ ] Build streak display with flame icon
  - [ ] Build recent achievements row (last 3 badges)
  - [ ] Replace the current "Progress" card with the new gamification dashboard card
- [ ] Task: Update student profile with badges
  - [ ] Add badges section to `StudentMasteryProfile`
  - [ ] Show earned badges with unlock dates in a grid
  - [ ] Show locked badges as grayed-out with unlock requirements
- [ ] Task: Remove dead code
  - [ ] Remove `hover-bounce` and `hover-wiggle` CSS class references from student dashboard
  - [ ] Verify no other references to undefined CSS classes
- [ ] Task: Measure - Manual Verification 'Dashboard and Profile'
  - [ ] Verify student dashboard shows XP, level, streak, and badges
  - [ ] Verify student profile shows badge grid with unlock dates
  - [ ] Verify dead CSS class references are removed
