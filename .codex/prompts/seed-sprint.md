# seed-sprint

Create GitHub issues for the next sprint based on sprint markdown files (Scrum Master command).

## Steps to Execute:

1. **Get All Milestones for Context**
   ```bash
   # Get all milestones to understand current and future sprints
   gh api repos/:owner/:repo/milestones --json number,title,state,description
   ```

2. **Analyze Existing Sprint Files**
   ```bash
   # List existing sprint files
   ls -la docs/sprint/
   
   # Read the most recent completed sprint for pattern reference
   # (e.g., docs/sprint/S0.md, docs/sprint/S1.md)
   ```

3. **Suggest Next Sprint**
   - Analyze existing milestones to find the next sprint number
   - Recommend sprint file to process (e.g., "Next sprint should be S2")
   - Ask user to confirm or specify different sprint file

4. **Read and Parse Sprint File**
   ```bash
   # Read the selected sprint file
   SPRINT_FILE="docs/sprint/S2.md"  # Example
   
   # Extract stories (sections starting with "## ")
   # Parse each story for:
   #   - Title
   #   - User Story
   #   - Acceptance Criteria
   #   - Test Plan
   #   - Labels
   #   - Agent Assignments
   ```

5. **Create or Verify Milestone**
   ```bash
   # Check if milestone exists
   MILESTONE_TITLE="S2 – Core Curriculum & Content Management"
   
   # Create milestone if it doesn't exist
   gh api repos/:owner/:repo/milestones \
     --method POST \
     --field title="$MILESTONE_TITLE" \
     --field description="Epic 2: Build curriculum framework, lesson player, virtual labs, bilingual CMS, and assessment engine" \
     --jq .number
   ```

6. **Process Each Story**
   For each story in the sprint file:
   
   ```bash
   # Extract story details
   TITLE="Story Title from ## header"
   BODY="User Story + Acceptance Criteria + Test Plan"
   LABELS="type:feature,area:frontend,priority:P2"  # From Labels: line
   ASSIGNEE="@me"  # From Agent Assignment or default
   
   # Create the issue
   ISSUE_NUMBER=$(gh issue create \
     --title "$TITLE" \
     --body "$BODY" \
     --label $LABELS \
     --milestone "$MILESTONE_TITLE" \
     --assignee "$ASSIGNEE" \
     --json number --jq .number)
   
   echo "Created issue #$ISSUE_NUMBER: $TITLE"
   ```

7. **Update TODO.md**
   - Add new sprint section
   - List all created issues with numbers
   - Update overall project roadmap
   - Add sprint start date

8. **Create/Update Sprint File**
   - If new sprint file, create it with proper structure
   - Add issue numbers to each story
   - Include creation date and milestone information
   - Add agent assignments from the sprint file

## File Update Patterns:

**TODO.md Example:**
```markdown
## Phase 2: Core Curriculum & Content Management (S2)

### Sprint S2 – Core Curriculum & Content Management
**Started**: YYYY-MM-DD
**Milestone**: S2 – Core Curriculum & Content Management

**Issues Created**:
- [ ] #201 - Curriculum Framework (P1)
- [ ] #202 - Lesson Player (P1)
- [ ] #203 - Virtual Laboratory System (P2)
- [ ] #204 - Bilingual CMS (P2)
- [ ] #205 - Assessment Engine (P1)
```

**Sprint File Example:**
```markdown
# Sprint S2 – Core Curriculum & Content Management

Milestone: S2 – Core Curriculum & Content Management
Created: YYYY-MM-DD
Issues Created: 5

## Curriculum Framework

User Story: [story content]
Acceptance Criteria: [criteria]
Test Plan: [plan]
Labels: type:feature,area:backend,priority:P1
**Issue**: #201 - Created: YYYY-MM-DD
**Agent Assignment**: dev (James), architect (Winston)
```

## Label Patterns:
- `type:feature` for new features
- `type:chore` for maintenance tasks
- `area:frontend`, `area:backend`, `area:devex`
- `priority:P1`, `priority:P2`, `priority:P3`

## Agent Assignment Mapping:
- **dev (James)**: All implementation
- **architect (Winston)**: System design
- **qa (Quinn)**: Quality assurance
- **ux-expert (Sally)**: UI/UX design
- **po (Sarah)**: Product ownership
- **sm (Bob)**: Process management

## Error Handling:
- If milestone creation fails, check permissions
- If issue creation fails, verify labels and assignee exist
- If file parsing fails, check markdown format
- Always provide dry-run option before actual creation

## Notes:
- Always ask for confirmation before creating issues
- Provide dry-run mode to show what will be created
- Update all tracking files after issue creation
- Include proper agent assignments from sprint file
- Follow established label and priority conventions
