# Core Science Curriculum & Content Management Spec

## Capability Summary

Deliver standards-aligned science curriculum content to students and teachers while
enabling rapid authoring, review, and publishing of new or updated lessons.

## Key References

- PRD Epic 2: Core Science Curriculum & Content Management  
  (`docs/prd/epic-2-core-science-curriculum-content-management.md`)
- Project Brief: Curriculum strategy (`docs/project-brief/market-analysis.md`)

## Functional Requirements

- **CSCM-FR1 (PRD FR1)**  
  Provide complete Thai Ministry of Education aligned curriculum for Prathom 1-6
  and Matthayom 1-6, organized by grade, term, and unit. Teachers and students must
  be able to browse, filter, and launch lessons appropriate to their cohort.

- **CSCM-FR2 (PRD FR2)**  
  Offer at least 50 interactive virtual lab experiences mapped to curriculum units.
  Each lab must expose learning objectives, safety notes, and track completion
  status per student.

- **CSCM-FR3 (PRD FR15)**  
  Support curriculum operations staff in drafting, reviewing, and publishing lesson
  content with version history, scheduled release windows, and rollback capability.

- **CSCM-FR4 (PRD FR5, FR11)**  
  Surface cross-subject reading recommendations and gamified progression cues that
  connect content modules to the ecosystem skill tree.

## Non-Functional Requirements

- **CSCM-NFR1 (PRD NFR2)**  
  Lesson detail pages must render in under 2 seconds for 95% of requests on target
  devices.

- **CSCM-NFR2 (PRD NFR10)**  
  Content presentation must comply with WCAG AA accessibility guidelines, including
  support for screen readers and high-contrast themes.

## Scenarios

### Teacher Launches Assigned Lesson
1. Teacher opens the class dashboard and selects a class.
2. The system lists lessons filtered to the class grade and term.
3. Teacher launches a lesson; the lesson loads with objectives, readings, and
   optional lab activities.
4. Completion and engagement metrics stream back to the teacher dashboard.

### Content Editor Publishes Updated Lab
1. Content editor drafts revisions to a lab, attaching updated instructions and
   assets.
2. Editor submits the draft for review; reviewer approves the changes.
3. Editor schedules the publish date and confirms rollout.
4. The platform records version metadata and deploys the update at the scheduled
   time with rollback available.

## Open Questions

- Define the minimum viable toolset for authoring (in-app editor vs. external CMS).
- Confirm localization requirements for bilingual content in early releases.
