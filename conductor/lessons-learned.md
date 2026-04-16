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
- [Prisma] User model uses `account` (singular) as the relation field name, not `accounts`. When creating users with nested accounts, use `account: { create: {...} }`.
- [Auth] Google OAuth requires `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, and optionally `GOOGLE_OAUTH_REDIRECT_URI` env vars. Without them, the OAuth flow returns an error message on the signin page.
- [Platform] Route consistency matters: auth redirects must target actual pages. The proxy and server.ts used `/login` but only `/signin` page existed, causing silent redirect failures.
- [Testing] vitest.unit.config.ts runs without DB reset, suitable for pure unit tests. Integration tests require full vitest.setup.ts with running database.
- [Redis] Redis-backed adapters should throw on connection failure and fall back gracefully to in-memory stores. Mock Redis must persist data correctly between hGet/hSet calls.
- [Redis] Eager env parsing at module load (env.ts) breaks tree-shaking and causes issues in unit tests when required fields like DATABASE_URL aren't set. Make critical env fields optional with safe defaults.
- [Playwright] @playwright/test must be installed separately; `npx playwright install chromium` needed for browsers. Place tests in `e2e/` directory with `playwright.config.ts` at project root.
