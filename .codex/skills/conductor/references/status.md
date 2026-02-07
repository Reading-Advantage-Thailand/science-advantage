# Status Workflow

Display project progress overview including completed, in-progress, and pending tasks.

## Prerequisites

Validate every tool call. If any fails, halt immediately and inform the user.

## 1.0 Setup Check

1. Verify `conductor/tracks.md` exists
   - If not: "The project has not been set up. Please run setup first."

2. Verify `conductor/tracks.md` is not empty
   - If empty: "The tracks file is empty or corrupted."

3. Verify these files exist in `conductor/`:
   - `tech-stack.md`
   - `workflow.md`
   - `product.md`

   If ANY missing: "Conductor is not set up. Please run setup first."

## 2.0 Read Project Data

1. Read `conductor/tracks.md`
   - Parse tracks using both formats:
     - New: `- [ ] **Track: <Description>**`
     - Legacy: `## [ ] Track: <Description>`

2. List track directories: `ls conductor/tracks`

3. For each track, read `conductor/tracks/<track_id>/plan.md`

## 3.0 Parse and Analyze

1. **Identify Phases**: Top-level markdown headings in each plan

2. **Identify Tasks**: Bullet points under headings with status markers:
   - `[ ]` - Pending
   - `[~]` - In Progress
   - `[x]` - Completed

3. **Calculate Totals**:
   - Total phases across all tracks
   - Total tasks
   - Completed tasks
   - In-progress tasks
   - Pending tasks

## 4.0 Generate Status Report

Present a clear, formatted report:

```
═══════════════════════════════════════════════════════════
                    CONDUCTOR STATUS REPORT
═══════════════════════════════════════════════════════════

📅 Date/Time: <current timestamp>

📊 Project Status: <On Track | Behind Schedule | Blocked>

───────────────────────────────────────────────────────────
                      CURRENT WORK
───────────────────────────────────────────────────────────

🔄 Current Track: <track description>
   Phase: <current phase>
   Task:  <current in-progress task>

⏭️  Next Action: <next pending task>

🚧 Blockers: <any blocked items, or "None">

───────────────────────────────────────────────────────────
                       PROGRESS
───────────────────────────────────────────────────────────

Tracks:
  Total:      <n>
  Completed:  <n>
  In Progress: <n>
  Pending:    <n>

Phases:
  Total: <n>

Tasks:
  Total:      <n>
  Completed:  <n> (<percentage>%)
  In Progress: <n>
  Pending:    <n>

Progress: [████████░░░░░░░░░░░░] <completed>/<total> (<percentage>%)

───────────────────────────────────────────────────────────
                    TRACK BREAKDOWN
───────────────────────────────────────────────────────────

<For each track>:
[<status>] <track description>
    Phases: <n> | Tasks: <completed>/<total> (<percentage>%)

═══════════════════════════════════════════════════════════
```

## Status Determination Logic

- **On Track**: Has in-progress tasks, no blockers
- **Blocked**: Has items explicitly marked as blocked
- **Behind Schedule**: No in-progress tasks but pending tasks exist
- **Complete**: All tasks marked as `[x]`
