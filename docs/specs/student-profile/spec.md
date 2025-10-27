# Student Mastery Profile

## Overview

Deliver a personalized mastery profile for each student that surfaces strand-aligned strengths, gaps, and recent progress within one minute of quiz submission. The profile pulls from the `standardMastery` persistence model, powers AI recommendations, and must remain accessible, localized, and performant for students with large standard sets.

## Scope

- **In scope**: persistence schema (with precision, cascade rules), mastery-profile API, student profile UI contract, accessibility requirements, observability, and failure/empty state handling.
- **Out of scope**: mastery calculation logic (covered in the Mastery Pipeline service), teacher-specific analytics UI, or curriculum authoring tools.

## Dependencies

- Assessment System for Attempt and QuestionResponse data (`docs/specs/assessment-system/spec.md`).
- Progress Tracking analytics (`docs/specs/progress-tracking/spec.md`) for shared mastery thresholds and color tokens.
- AI Recommendations spec (this sprint) for interoperability between mastery surfaces and next-lesson guidance.

## Data Model

### `standardMastery`

| Field            | Type              | Notes                                                                 |
|------------------|-------------------|-----------------------------------------------------------------------|
| `id`             | `String @id`      | `cuid()` primary key                                                 |
| `studentId`      | `String`          | FK -> `user.id`, relation name `StudentMastery`, `onDelete: Cascade` |
| `standardId`     | `String`          | FK -> `Standard.id`, `onDelete: Cascade`                             |
| `masteryLevel`   | `Decimal(3,2)`    | Inclusive range [0.00, 1.00]; values outside range must be clamped   |
| `evidenceCount`  | `Int`             | Count of graded responses rolled into the row                        |
| `lastAssessedAt` | `DateTime`        | ISO timestamp of most recent evidence                                |
| `createdAt`      | `DateTime`        | Default `now()`                                                       |
| `updatedAt`      | `DateTime`        | `@updatedAt`                                                         |

**Indexes & Constraints**

- `@@unique([studentId, standardId])`
- `@@index([studentId, masteryLevel])`
- `@@index([standardId])`
- Service-layer validation enforces `0 <= masteryLevel <= 1`.

### Backfill Strategy

- Dry-run backfill script replays historical attempts ordered by `submittedAt`.
- Batch size defaults to 200 attempts; exposes CLI flags for `--from` and `--to` timestamps.
- Progress logged every 1,000 updates; failures retried with exponential backoff.

## API Contracts

### `GET /api/students/[studentId]/mastery-profile`

| Aspect          | Detail                                                                                           |
|-----------------|--------------------------------------------------------------------------------------------------|
| Auth            | Requires session; student can only access self. Teachers/Admins allowed when impersonation flag. |
| Query Params    | `strand`, `grade`, `limit` (default 100), `cursor`, `includeRecommendations` (boolean).          |
| Response        | `{ status: 'READY' | 'CALCULATING', generatedAt, student: { id, name, grade }, strands: Strand[] }` |

`Strand` payload:

```json
{
  "code": "Sc1",
  "title": "Scientific Inquiry",
  "masteryAverage": 0.78,
  "standards": [
    {
      "standardId": "std_123",
      "code": "Sc1.1-G3",
      "titleEn": "Plan and conduct investigations",
      "titleTh": "วางแผนและดำเนินการทดลอง",
      "masteryLevel": 0.62,
      "masteryLabel": "Developing",
      "evidenceCount": 5,
      "lastAssessedAt": "2025-10-28T08:00:00Z",
      "aiAnnotation": {
        "recommended": true,
        "traceId": "rec_abc"
      }
    }
  ]
}
```

### Pagination

- Cursor is the last `standardMastery.id` returned; API returns `nextCursor` when additional records exist.
- Server enforces `limit <= 200`.

### Status Reporting

- When mastery pipeline has not yet processed the latest attempt, API returns `status: 'CALCULATING'` with `retryAfterSeconds`.
- UI consumes this to show polling indicator (default 10-second interval, max retries 6).

## UX Contract

- **Layout**: hero section with profile summary, strand accordions sorted by weakness (lowest average first).
- **Color thresholds** (aligned with progress tracking):
  - `mastery < 0.60` => red (`--chart-critical`)
  - `0.60 <= mastery < 0.80` => amber (`--chart-caution`)
  - `mastery >= 0.80` => green (`--chart-strong`)
- **Text labels** accompany colors (e.g., "Needs Support", "On Track") to satisfy WCAG.
- **Virtualization**: lists >75 standards must use `@tanstack/react-virtual` with overscan 8.
- **Empty state**: friendly illustration, CTA to curriculum.
- **Calculating state**: info banner referencing quiz in progress; auto-refresh until READY.

## Accessibility & Localization

- Progress bars expose `aria-valuenow`, `aria-valuetext` (e.g., "Mastery 72% - solid grasp") and maintain contrast ratio >= 4.5:1.
- All copy maintained in `en` / `th` locale files; fallback to English when Thai unavailable.
- Keyboard focus order matches visual order; no horizontal scroll traps.

## Non-Functional Requirements

| Category     | Requirement                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------|
| Performance  | API p95 latency < 400 ms for 150 standards; bundle per page < 150 KB gzip via code splitting.|
| Freshness    | Mastery data updates visible within 60 seconds of attempt completion.                         |
| Availability | API SLO 99.5%; degrade with friendly error message + fallback link.                           |
| Security     | Prevent studentId tampering; enforce impersonation flag for teacher access.                  |

## Observability

- Emit metrics: `mastery_profile_requests_total`, `mastery_profile_latency_ms`, `mastery_profile_status_calculating_total`.
- Log trace IDs that connect mastery API calls to AI recommendations when `includeRecommendations=true`.
- Dashboard tracks: number of standards per student, API errors, average latency.

## Failure Modes

- **Pipeline lag**: API returns CALCULATING; UI polls with backoff.
- **Missing mastery data**: treat as empty state; log warning for investigation.
- **Authorization mismatch**: respond 403 with audit log entry.

## Open Questions

1. Should we expose confidence intervals once we have mastery variance data?
2. Do we need offline export (PDF) for students/parents? (Currently out of scope.)
3. Should students be able to filter by recommended vs mastered standards directly?

## Implementation Checklist

- [ ] Merge schema + migration (#119).
- [ ] Deploy mastery pipeline (#120) with idempotency.
- [ ] Build mastery-profile API + UI (#121).
- [ ] Instrument metrics/logging.
- [ ] Update Epic #118 with links to this spec.
