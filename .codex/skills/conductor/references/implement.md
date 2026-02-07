# Implement Workflow

Execute tasks from a track's plan following the TDD workflow.

## Prerequisites

Validate every tool call. If any fails, halt immediately and inform the user.

## 1.0 Setup Check

Verify these files exist in `conductor/`:
- `tech-stack.md`
- `workflow.md`
- `product.md`

If ANY missing, halt and announce: "Conductor is not set up. Please run setup first."

## 2.0 Track Selection

1. Read and parse `conductor/tracks.md`:
   - Split by `---` separator
   - Extract status (`[ ]`, `[~]`, `[x]`), description, and folder link
   - Support both formats:
     - New: `- [ ] **Track: <Description>**`
     - Legacy: `## [ ] Track: <Description>`

2. If tracks file empty/malformed, halt: "The tracks file is empty or malformed."

3. Select track:
   - **If user provided track name**: Match case-insensitively, confirm selection
   - **If no name provided**: Select first incomplete track (not `[x]`)
   - If no incomplete tracks: "All tasks are completed!"

## 3.0 Track Implementation

### 3.1 Initialize

1. Announce which track you're implementing
2. Update status to In Progress in `conductor/tracks.md`:
   - Change `[ ]` to `[~]` in the track heading

### 3.2 Load Context

Read into context:
- `conductor/tracks/<track_id>/plan.md`
- `conductor/tracks/<track_id>/spec.md`
- `conductor/workflow.md`

### 3.3 Execute Tasks

For each task in `plan.md`:

#### Standard Task Workflow

1. **Select Task**: Next available `[ ]` task in sequential order

2. **Mark In Progress**: Change `[ ]` to `[~]` in plan.md

3. **Write Failing Tests (Red Phase)**:
   - Create test file for the feature/fix
   - Write tests defining expected behavior
   - Run tests, confirm they FAIL
   - Do not proceed until you have failing tests

4. **Implement to Pass (Green Phase)**:
   - Write minimum code to pass tests
   - Run tests, confirm they PASS

5. **Refactor** (Optional):
   - Improve clarity, remove duplication
   - Ensure tests still pass

6. **Verify Coverage**:
   - Run coverage reports (e.g., `pytest --cov=app`)
   - Target: >80% for new code

7. **Document Deviations**:
   - If implementation differs from tech stack, STOP
   - Update `tech-stack.md` with dated note
   - Resume implementation

8. **Commit Code**:
   - Stage changes
   - Commit with message: `feat(<scope>): <description>`

9. **Attach Git Note**:
   ```bash
   git notes add -m "<task summary>" <commit_hash>
   ```

10. **Update Plan**:
    - Change `[~]` to `[x]` in plan.md
    - Append first 7 chars of commit SHA

11. **Commit Plan Update**:
    - Stage plan.md
    - Commit: `conductor(plan): Mark task '<task>' as complete`

#### Phase Completion Protocol

Triggered when a task completes a phase:

1. Announce protocol start

2. **Ensure Test Coverage**:
   - Find previous phase checkpoint SHA from plan.md
   - Run `git diff --name-only <prev_sha> HEAD`
   - For each code file (exclude .json, .md, .yaml):
     - Verify test file exists
     - If missing, create tests following existing patterns

3. **Run Automated Tests**:
   - Announce exact command (e.g., `CI=true npm test`)
   - Execute tests
   - If failures: attempt fix max 2 times, then ask user

4. **Manual Verification Plan**:
   - Analyze product.md, product-guidelines.md, plan.md
   - Generate step-by-step verification for user:

   For Frontend:
   ```
   1. Start dev server: `npm run dev`
   2. Open browser to: http://localhost:3000
   3. Confirm you see: [expected UI]
   ```

   For Backend:
   ```
   1. Ensure server is running
   2. Execute: `curl -X POST http://localhost:8080/api/...`
   3. Confirm response: [expected response]
   ```

5. **Await User Confirmation**:
   > "Does this meet your expectations? Please confirm with yes or provide feedback."

   PAUSE until explicit confirmation

6. **Create Checkpoint Commit**:
   - Stage all changes
   - Commit: `conductor(checkpoint): Checkpoint end of Phase X`

7. **Attach Verification Report**:
   ```bash
   git notes add -m "<verification report>" <checkpoint_sha>
   ```

8. **Update Plan with Checkpoint**:
   - Append `[checkpoint: <sha>]` to phase heading

9. **Commit Plan Update**:
   - Commit: `conductor(plan): Mark phase '<phase>' as complete`

10. Announce completion

### 3.4 Finalize Track

1. Update track status in `conductor/tracks.md`:
   - Change `[~]` to `[x]`

2. Commit: `chore(conductor): Mark track '<description>' as complete`

## 4.0 Synchronize Documentation

Only after track reaches `[x]` status:

1. Read completed track's `spec.md`
2. Read project docs: `product.md`, `product-guidelines.md`, `tech-stack.md`
3. Analyze for updates needed:

   **product.md**: If feature impacts product description
   - Propose changes in diff format
   - Ask for confirmation before editing

   **tech-stack.md**: If technology stack changed
   - Propose changes in diff format
   - Ask for confirmation before editing

   **product-guidelines.md**: ONLY for significant strategic shifts
   - Warn user about critical nature
   - Propose with WARNING prefix
   - Require explicit confirmation

4. Commit any approved changes:
   `docs(conductor): Synchronize docs for track '<description>'`

5. Report summary of changes made

## 5.0 Track Cleanup

After documentation sync:

1. Prompt user:
   > "Track '<description>' is complete. What would you like to do?"
   > A. **Archive**: Move to `conductor/archive/` and remove from tracks file
   > B. **Delete**: Permanently delete track folder and remove from tracks file
   > C. **Skip**: Leave in tracks file

2. Handle response:

   **Archive (A)**:
   - Create `conductor/archive/` if needed
   - Move track folder to archive
   - Remove entry from tracks.md
   - Commit: `chore(conductor): Archive track '<description>'`

   **Delete (B)**:
   - Warn: "This will permanently delete. Are you sure? (yes/no)"
   - If confirmed:
     - Delete track folder
     - Remove entry from tracks.md
     - Commit: `chore(conductor): Delete track '<description>'`

   **Skip (C)**:
   - Announce: "Track will remain in tracks file."
