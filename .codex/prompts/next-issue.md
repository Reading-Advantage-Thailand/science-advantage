# Next Issue Command

Select and start work on the next available issue from your assigned GitHub issues.

## Steps to Execute:

1. **Get Current User's Assigned Issues**
   ```bash
   gh issue list --assignee @me --state open --json number,title,labels,milestone
   ```

2. **Get Milestone Details for Context**
   ```bash
   gh api repos/:owner/:repo/milestones --json number,title,state
   ```

3. **Analyze and Recommend Issues**
   - Sort issues by priority: P0 > P1 > P2 > P3
   - Consider current sprint milestone first
   - Present top 3 recommendations with numbers for user selection
   - Format: "1. #123 - Issue Title (P1, S1)"

4. **After User Selection**
   - Read the full issue details: `gh issue view {number}`
   - **CRITICAL**: Check the "Related Issues" section for context and dependencies
   - Read any linked issues for additional context

5. **Create Feature Branch**
   ```bash
   # Extract title and create kebab version
   TITLE=$(gh issue view {number} --json title --jq .title)
   BRANCH_NAME="feat/${number}-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-|-$//g' | cut -c1-40)"
   
   # Create and switch to branch
   git switch -c "$BRANCH_NAME"
   ```

6. **Update TODO.md**
   - Add issue to "In Progress" section
   - Include issue number, title, and branch name
   - Update completion percentages if applicable

7. **Update Current Sprint File**
   - Find current sprint file (e.g., `docs/sprint/S1.md`)
   - Mark the selected story as "In Progress"
   - Add current date and branch name

8. **Initial Setup**
   - Run `npm install` if package.json changed
   - Run `npx prisma generate` if schema changed
   - Report any setup requirements

## File Update Patterns:

**TODO.md Example:**
```markdown
## In Progress
- [ ] #123 - Issue Title (feat/123-issue-title) - Started: YYYY-MM-DD
```

**Sprint File Example:**
```markdown
## Issue Title
**Status**: In Progress (Branch: feat/123-issue-title)
**Started**: YYYY-MM-DD
**Related Issues**: #124, #125
```

## Priority Order:
1. P0 - Critical bugs (always first)
2. P1 - Highest priority features
3. P2 - High priority features
4. P3 - Normal priority

## Notes:
- Always check for issue dependencies in Related Issues
- If an issue depends on another incomplete issue, notify user
- Consider current sprint milestone over future sprints
- Update files immediately after branch creation