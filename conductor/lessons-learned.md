# Lessons Learned

- [Planning] Use `docs/changes/`, `docs/sprint/`, curriculum seed assets, and
  the Grade 3 scope/sequence as the planning source of truth before using the
  older umbrella PRD.
- [Product] The credible wedge is a teacher/student web app for Thai-aligned
  science learning, not a broad ecosystem moonshot.
- [Curriculum] Grade 3 scope-and-sequence defines the instructional rhythm:
  explicit instruction, labs, fun review, and summative assessment.
- [Curriculum] Grade 4 structured JSON lessons are the best proof point for the
  future content model.
- [Content] Structured lesson content must stay schema-validated and bilingual
  requirements must be explicit at the block level.
- [Delivery] The strongest implemented loops today are lesson -> quiz ->
  completion -> mastery -> recommendation/intervention.
- [Teacher UX] Teachers need high-signal class visibility faster than they need
  expansive admin tooling.
- [Auth] Repository guidance and implementation have drifted; auth must be
  treated as a platform-alignment problem, not a side task.
- [Infra] Do not document Redis, Playwright, Google OAuth, or GCS as fully
  delivered if the repo only contains placeholders or drift.
- [Roadmapping] Prefer a few dependency-ordered tracks over long epic catalogs.
- [Testing] vitest.setup.ts runs `prisma db push --force-reset` before ALL tests, requiring a running database even for unit tests. Tests needing DB-free execution require separate config or mocking at a deeper level.
- [Testing] Auth env behavior (NODE_ENV, DEV_AUTH_ENABLED) must be explicitly mocked per test file since module-level mocks are isolated per file.
