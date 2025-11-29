
### #137 - feat/122-be--ai-recommendation-api

Stub LLM summary based on provided inputs.

<details>
<summary>Original inputs</summary>

- **Went well:** LLM flow now spec-compliant and cached endpoint wired to observability
- **Lesson:** Always route AI calls through Vercel AI SDK generateObject to get schema validation and multi-model failover
</details>


### #138 - feat/123-fe--display-ai-powered-recommendation

```markdown
## Retrospective Summary

### What Went Well

The successful implementation and smooth deployment of the feature flag and localized card were key achievements. This was primarily attributed to the effective use of reusable `shadcn/ui` primitives and a well-integrated server-side context, demonstrating the benefits of our component strategy and architectural design.

### Lessons Learned

A critical lesson learned involves the need to explicitly stub `Next.js Link` interactions within unit tests. Failing to do so led to `jsdom` navigation issues, highlighting a gap in our testing practices for components interacting with Next.js routing. Future unit tests should incorporate appropriate stubbing for `Next.js Link` components to prevent similar testing discrepancies.
```

<details>
<summary>Original inputs</summary>

- **Went well:** Feature flag + localized card shipped smoothly thanks to reusable shadcn primitives and server-side context
- **Lesson:** Remember to stub Next.js Link interactions in unit tests to avoid jsdom navigation issues
</details>


### #139 - feat/124-be--teacher-intervention-alert-service

## Retrospective Summary

### What Went Well
The project achieved comprehensive test coverage with all 10 tests passing (4 unit and 6 integration tests), ensuring robust functionality. A clear and effective separation of concerns was maintained across the detection logic, caching, and API layers, contributing to a well-structured and maintainable codebase.

### Lessons Learned
The implementation of an in-memory TTL cache with Redis-parity semantics proved to be a significant learning. This approach provided a clean abstraction that facilitated rapid development, while simultaneously laying a strong architectural foundation for a seamless migration to a production-grade Redis solution in the future. This strategy effectively balanced development velocity with long-term architectural scalability.

<details>
<summary>Original inputs</summary>

- **Went well:** Comprehensive test coverage with 10 passing tests (4 unit + 6 integration), clean separation of concerns between detection logic, caching, and API layers
- **Lesson:** In-memory TTL cache with Redis-parity semantics provides a clean abstraction that enables rapid development while maintaining production-ready architecture for future Redis migration
</details>


### #140 - feat/125-fe-teacher-dashboard-intervention-widget

## Retrospective Summary

### What Went Well

- **Smooth Feature Implementation:** The intervention alerts widget was implemented successfully, meeting all acceptance criteria and supported by comprehensive testing.
- **Effective Feature Flag Usage:** The feature flag pattern proved effective for enabling a gradual and controlled rollout of the new functionality.

### Lessons Learned

- **Prisma Decimal Type Handling:** Explicit conversion of Prisma's Decimal types to numbers is crucial within TypeScript to avoid unexpected type errors. This highlights the importance of thorough type consideration when integrating ORM-generated types.
- **Pre-Push Build Verification:** Running the full build pipeline locally before pushing changes is essential to proactively catch type errors and ensure code quality, preventing potential CI failures.
- **Codebase Health Impact on CI:** Pre-existing lint and test errors within the codebase can unexpectedly block CI for unrelated pull requests, emphasizing the need for continuous codebase maintenance and addressing technical debt.

<details>
<summary>Original inputs</summary>

- **Went well:** Implementation of intervention alerts widget went smoothly with comprehensive testing. All acceptance criteria met. Feature flag pattern worked well for gradual rollout.
- **Lesson:** TypeScript Decimal types from Prisma require explicit conversion to numbers. Always run full build pipeline before pushing to catch type errors. Pre-existing lint/test errors in codebase can block CI even for unrelated PRs.
</details>


### #142 - feat/77-eliminate-pre-existing-lint-errors

```markdown
## Retrospective Summary

This iteration saw success in improving code quality and team efficiency.

**What Went Well:**
*   **Scoped Linting and Type Tightening:** Focused efforts on linting and type tightening were successfully merged without issues, leading to cleaner code and improved maintainability.
*   **Smooth Auto-Merge:** The auto-merge workflow proved effective, ensuring continuous integration without conflicts.

**Lesson Learned:**
*   **Centralizing Quiz Question Types:** To prevent future type errors in shared components, it is crucial to centralize quiz question types and restrict the values passed per render. This approach will enhance type safety and reduce potential bugs across the application.
```

<details>
<summary>Original inputs</summary>

- **Went well:** Scoped lint fixes and type tightening landed cleanly; auto-merge flowed without conflicts.
- **Lesson:** Centralizing quiz question types and narrowing values per render avoids future type errors from shared components.
</details>


### #158 - fix/g3-structured-content-data

## Retrospective Summary

### What Went Well

- **Source Data Fix Over Migration Heuristics:** Rather than relying on runtime migration heuristics to detect content types, we fixed the Grade 3 source data directly by adding `structuredContent` fields to the seed JSON. This ensures consistent, typed content blocks from the database level.
- **Reusable Conversion Script:** Created `scripts/convert-md-to-structured.ts` to parse markdown sections into typed JSON blocks (text, vocabulary, reading_passage, procedure, materials), which can be reused for future lesson migrations.

### Lessons Learned

- **Fix Data at the Source:** When structured content isn't displaying correctly, the issue is often in the source data rather than the rendering logic. Investing time to properly structure seed data prevents complex runtime heuristics and ensures reliable content rendering.
- **Grade-Specific Data Formats:** Different grade levels may have different data formats (Grade 4 had structured JSON while Grade 3 had raw markdown). Always verify the actual data format in seed files before assuming the rendering pipeline is at fault.

<details>
<summary>Original inputs</summary>

- **Went well:** Fixed Grade 3 lessons at the source by adding structuredContent to seed JSON. Created reusable conversion script for markdown-to-structured-JSON transformation.
- **Lesson:** When structured content doesn't render correctly, fix the source data rather than adding migration heuristics. Always check seed data format across different grades.
</details>


### #160 - feat/159-bug-some-docs-lacking-frontmatter

## Retrospective Summary

### What Went Well
The team demonstrated strong efficiency in addressing documentation inconsistencies by scripting the identification and update of multiple files with missing frontmatter. This proactive approach ensured data integrity and saved significant manual effort.

### Lesson Learned
The project highlighted the need for a consolidated and streamlined documentation organization. The presence of legacy, monolithic documentation complicated maintenance and clarity. Moving forward, prioritizing structured, modular documentation and archiving outdated, unmanageable formats will enhance accessibility and reduce technical debt, preventing similar issues in the future.

<details>
<summary>Original inputs</summary>

- **Went well:** Efficiently identified and updated multiple documentation files with missing frontmatter using a scripted approach.
- **Lesson:** Legacy documentation organization required consolidation; archiving monolithic docs improves clarity.
</details>

