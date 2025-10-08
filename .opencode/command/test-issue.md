# Test Issue Command

Run comprehensive testing for the current issue including linting, unit tests, integration tests, and e2e tests.
AGENT=qa

## Steps to Execute:

1. **Check Current Branch and PR Status**

   ```bash
   # Get current branch
   CURRENT_BRANCH=$(git branch --show-current)

   # Check if PR exists and its status
   gh pr view --json state,reviewDecision,statusCheckRollup 2>/dev/null || echo "No PR yet"
   ```

2. **Run Linting**

   ```bash
   npm run lint
   ```

   - Capture and report any linting errors
   - If errors exist, suggest fixes and halt for user intervention

3. **Run Unit Tests**

   ```bash
   npm run test
   ```

   - Report test results and coverage
   - If failures occur, provide specific error details

4. **Run Integration Tests**

   ```bash
   npm run test:integration
   ```

   - Test API routes and database interactions
   - Report any integration failures

5. **Run E2E Tests**

   ```bash
   npm run test:e2e
   ```

   - If Chrome DevTools MCP is available, use it for debugging
   - Report any UI/flow failures

6. **Run Build**

   Kill all dev server istances

   ```bash
   npm run build
   ```

   - Build may take several minutes once the codebase grows
   - Warnings won't block deployment. Errors will.

7. **Analyze Results**
   - If ALL tests pass: Continue to file updates
   - If ANY tests fail:
     - Provide detailed error report
     - Suggest specific fixes
     - Halt for user intervention

7. **Update TODO.md**
   - Add testing status to the current issue
   - Example: "Tests: ✅ Passed (Unit: 95%, Integration: ✅, E2E: ✅)"

8. **Update Sprint File**
   - Add testing notes to the current story
   - Include test coverage percentages
   - Note any test failures and fixes applied

## File Update Patterns:

**TODO.md Example:**

```markdown
- [ ] #123 - Issue Title (feat/123-issue-title) - Tests: ✅ Passed (Unit: 95%, Integration: ✅, E2E: ✅)
```

**Sprint File Example:**

```markdown
## Issue Title

**Status**: In Progress - Testing Complete
**Test Results**: Unit: 95%, Integration: ✅, E2E: ✅
**Test Date**: YYYY-MM-DD
```

## Chrome DevTools Integration (if available):

- Use MCP tools to capture screenshots on test failures
- Analyze network requests for API testing
- Check console errors during E2E tests
- Provide detailed debugging information

## Error Handling:

- Always provide specific error messages
- Suggest concrete fixes for common issues
- Never proceed with PR creation if tests are failing
- Document any test-related issues in the sprint file

## Notes:

- Run tests in the correct order (lint → unit → integration → e2e)
- Update files immediately after test completion
- If tests fail, provide actionable feedback before halting
