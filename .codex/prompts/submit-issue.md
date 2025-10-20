# submit-issue

Complete work on the current issue and create a pull request with proper formatting and auto-merge.

## Steps to Execute:

1. **Verify Current Branch and Issue**
   ```bash
   # Get current branch
   CURRENT_BRANCH=$(git branch --show-current)
   
   # Extract issue number from branch name
   ISSUE_NUMBER=$(echo "$CURRENT_BRANCH" | sed -E 's/feat\/([0-9]+).*/\1/')
   
   # Verify issue exists
   gh issue view "$ISSUE_NUMBER" --json title,labels,milestone
   ```

2. **Check for Staged Changes**
   ```bash
   # Check git status
   git status
   
   # If no staged changes, ask user what to commit
   if [ -z "$(git diff --cached --name-only)" ]; then
     echo "No staged changes found. Please stage your changes first."
   fi
   ```

3. **Commit Changes with Conventional Format**
   ```bash
   # Get issue title for commit message
   ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title --jq .title)
   
   # Create conventional commit message
   COMMIT_MSG="feat: $ISSUE_TITLE
   
   Closes #$ISSUE_NUMBER"
   
   git commit -m "$COMMIT_MSG"
   ```

4. **Push Branch to Remote**
   ```bash
   git push -u origin "$CURRENT_BRANCH"
   ```

5. **Create Pull Request**
   ```bash
   # Get issue details for PR
   ISSUE_DETAILS=$(gh issue view "$ISSUE_NUMBER" --json title,body,labels,milestone)
   TITLE=$(echo "$ISSUE_DETAILS" | jq -r .title)
   BODY=$(echo "$ISSUE_DETAILS" | jq -r .body)
   MILESTONE=$(echo "$ISSUE_DETAILS" | jq -r .milestone.title)
   
   # Create PR with proper formatting
   gh pr create \
     --title "feat: $TITLE" \
     --body "$BODY
   
   Closes #$ISSUE_NUMBER" \
     --label "type:feature" \
     --milestone "$MILESTONE" \
     --draft=false
   ```

6. **Enable Auto-Merge**
   ```bash
   # Get PR number
   PR_NUMBER=$(gh pr view --json number --jq .number)
   
   # Enable auto-merge (squash)
   gh pr merge --auto --squash
   ```

7. **Request Appropriate Reviewers**
   ```bash
   # Analyze changed files to determine reviewers
   CHANGED_FILES=$(git diff --name-only main...)
   
   # Add reviewers based on file patterns
   if echo "$CHANGED_FILES" | grep -q "prisma\|lib/.*\.ts"; then
     gh pr edit --add-reviewer "backend-reviewer"  # Replace with actual reviewer
   fi
   
   if echo "$CHANGED_FILES" | grep -q "components/\|app/"; then
     gh pr edit --add-reviewer "frontend-reviewer"  # Replace with actual reviewer
   fi
   ```

8. **Open PR in Browser**
   ```bash
   gh pr view --web
   ```

9. **Update TODO.md**
   - Move issue from "In Progress" to "In Review"
   - Add PR number and link
   - Update completion percentage

10. **Update Sprint File**
    - Mark story as "PR Created"
    - Add PR number and link
    - Include submission date

## File Update Patterns:

**TODO.md Example:**
```markdown
## In Review
- [ ] #123 - Issue Title - PR: #456 (In Review) - Submitted: YYYY-MM-DD
```

**Sprint File Example:**
```markdown
## Issue Title
**Status**: PR Created
**PR**: #456 - https://github.com/repo/pull/456
**Submitted**: YYYY-MM-DD
**Reviewers**: @reviewer1, @reviewer2
```

## Error Handling:
- If commit fails due to linting errors, run `npm run lint -- --fix`
- If push fails, check for merge conflicts and resolve them
- If PR creation fails, verify milestone exists and labels are valid
- If auto-merge fails, check branch protection rules

## Notes:
- Always use conventional commit format
- Include issue number in commit message and PR body
- Enable auto-merge to streamline the workflow
- Update files immediately after PR creation
- Open PR in browser for easy review access
