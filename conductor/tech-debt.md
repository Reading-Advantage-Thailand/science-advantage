# Tech Debt Registry

| Status | Severity | Item | Target Track |
| --- | --- | --- | --- |
| Open | Critical | Auth implementation drifted from the repo contract of Google OAuth plus dev impersonation. | `platform_alignment_20260311` |
| Open | High | Redis is documented in env and planning but not wired into caching or rate limiting. | `platform_alignment_20260311` |
| Open | High | `npm run test:e2e` is a placeholder, so critical flows lack browser-level regression coverage. | `platform_alignment_20260311` |
| Open | High | Lesson and curriculum slugs are inconsistent; some routes reuse IDs as slugs. | `curriculum_foundation_20260311` |
| Open | High | Curriculum source of truth is split across docs, seeds, and archived curriculum notes. | `curriculum_foundation_20260311` |
| Open | Medium | Thai localization is partial and some APIs duplicate English text into Thai placeholders. | `student_learning_loop_20260311` |
| Open | Medium | Teacher dashboards still contain placeholder activity and assignment surfaces. | `teacher_delivery_20260311` |
| Open | Medium | Content operations rely on seeds and scripts rather than a governed release workflow. | `curriculum_foundation_20260311` |
| Open | Medium | Observability exists as scaffolding but lacks clear dashboards and operational thresholds. | `mastery_assistance_20260311` |
| Open | Low | Root README and some legacy docs still describe stale auth and platform behavior. | follow-up docs chore |
