# Implementation Plan

## Phase 1: Responsive Navigation Shell

- [x] Task: Build MobileNav component
  - [x] Write tests for mobile nav open/close, keyboard accessibility, focus trapping
  - [x] Create `MobileNav` component with hamburger button and slide-out sheet
  - [x] Use shadcn Sheet component (or build minimal drawer) for the slide-out panel
  - [x] Include logo, role-appropriate nav links, and user menu items in the sheet
  - [x] Implement focus trap when menu is open (Tab cycles within the sheet)
  - [x] Close menu on route change
- [x] Task: Update role-group layouts for responsive nav
  - [x] Modify `(student)/layout.tsx` to use `MobileNav` on tablet/mobile
  - [x] Modify `(teacher)/layout.tsx` to use `MobileNav`
  - [x] Modify `(admin)/layout.tsx` to use `MobileNav`
  - [x] Modify `(system)/layout.tsx` to use `MobileNav`
  - [x] Keep horizontal nav on desktop (>= 1024px), switch to hamburger on tablet/mobile
- [x] Task: Measure - Manual Verification 'Responsive Nav'
  - [x] Verify hamburger menu appears at 768px and below
  - [x] Verify sheet opens/closes with animation
  - [x] Verify keyboard navigation works (Escape to close, Tab to cycle)

## Phase 2: Layout and Content Responsiveness

- [x] Task: Update main content areas for responsive padding
  - [x] Change `container mx-auto px-4 py-8` to responsive padding: `px-4 sm:px-6 lg:px-8`
  - [x] Apply across all role-group layouts
- [x] Task: Make dashboard cards responsive
  - [x] Update student dashboard card grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-4`
  - [x] Update teacher dashboard card grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
  - [x] Ensure cards have proper spacing on mobile (gap-4 or gap-6)
- [x] Task: Make tables responsive (foundation only)
  - [x] Write tests for card-based table layout on mobile
  - [x] Create `ResponsiveTable` wrapper component that switches to card layout at < 768px
  - [x] Apply to teacher analytics tables (class overview, lesson detail, student detail)
  - [x] Sort controls become a dropdown on mobile instead of column headers
- [x] Task: Fix horizontal overflow on mobile
  - [x] Audit all pages at 375px width for horizontal scroll
  - [x] Fix any overflow: code blocks get `overflow-x-auto`, images get `max-w-full`, tables get responsive treatment
  - [x] Ensure lesson content blocks don't overflow (text wrapping, image scaling)
- [x] Task: Measure - Manual Verification 'Layout'
  - [x] Verify no horizontal scroll at 375px on all major pages
  - [x] Verify dashboard cards stack on mobile
  - [x] Verify analytics tables convert to cards on mobile

## Phase 3: Touch and Interaction Optimization

- [x] Task: Increase touch targets
   - [x] Audit all interactive elements for 44x44px minimum
   - [x] Update buttons, nav links, and form inputs that are too small
   - [x] Add min-h-[44px] and min-w-[44px] where needed
 - [x] Task: Optimize lesson viewer for touch
   - [x] Add touch swipe support to vocabulary flashcard carousel (using touch event handlers)
   - [x] Fix quiz navigation to be thumb-friendly on mobile (larger buttons, bottom-anchored)
   - [x] Ensure quiz options are large enough to tap (min 44px height)
- [x] Task: Add tablet landscape support
   - [x] Verify layouts work in landscape orientation (1024x768) - existing responsive grid handles this
   - [x] Adjust grid breakpoints if needed for landscape tablets
- [ ] Task: Measure - Manual Verification 'Touch'
  - [ ] Verify touch swipe works on vocabulary flashcards
  - [ ] Verify quiz navigation is comfortable on mobile
  - [ ] Verify all buttons are tappable at 44x44px minimum
- [ ] Task: Run Lighthouse audit
  - [ ] Run Lighthouse mobile accessibility audit
  - [ ] Fix any issues to achieve score >= 90
  - [ ] Document final score