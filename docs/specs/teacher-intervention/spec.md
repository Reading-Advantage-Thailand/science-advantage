# Teacher Intervention Alerts

## Overview

Enable teachers to proactively support struggling students by surfacing high-signal alerts derived from standards-based mastery data. Alerts must prioritize severity, respect class-level authorization, and refresh fast enough for live classroom coaching.

## Objectives

- Identify students with significant mastery gaps or assessment inactivity.
- Prioritize alerts so teachers can action the top five within seconds.
- Provide a consistent contract for backend service and dashboard widget.

## Inputs & Dependencies

- `standardMastery` table (see Student Mastery Profile spec) as the source of truth.
- Class roster data from `Class` and `user` models.
- Optional events from the Mastery Pipeline to invalidate caches.
- Shared thresholds from Progress Tracking spec (color tokens, mastery bands).

## Alert Scoring Model

Severity score computed per student per class:

```
score =
  (weakStandardCount * 0.5) +
  ((1 - avgWeakMastery) * 0.3) +
  (daysSinceLastAssessment / 7 * 0.2)
```

Severity buckets:

- **Critical**: `weakStandardCount >= 3` AND `avgWeakMastery < 0.40`, OR `daysSinceLastAssessment > 14` with any standard < 0.50.
- **Warning**: `weakStandardCount >= 2` AND `avgWeakMastery < 0.50`.
- **Moderate**: `weakStandardCount >= 1` AND `avgWeakMastery < 0.60`.

Thresholds configurable via `lib/interventions/config.ts`.

## API Contract (`GET /api/teachers/classes/[classId]/intervention-alerts`)

| Aspect         | Detail                                                                                       |
|----------------|----------------------------------------------------------------------------------------------|
| Auth           | Teacher owning class or admin; others receive 403.                                          |
| Query Params   | `limit` (default 20, max 50), `severity`, `since` (ISO), `cursor`.                           |
| Response       | `{ classId, generatedAt, alerts: Alert[], nextCursor? }`                                     |
| Caching        | Cached per `(classId, severity)` for 5 minutes; cache bust on mastery update event or manual refresh. |

`Alert` payload:

```json
{
  "studentId": "stu_cuid",
  "studentName": "Anan Prasert",
  "avatarInitials": "AP",
  "alertSeverity": "critical",
  "weakStandards": [
    {
      "code": "Sc1.1-G3",
      "title": "Plan investigations",
      "masteryLevel": 0.38,
      "lastAssessedAt": "2025-10-27T09:00:00Z"
    }
  ],
  "weakStandardCount": 3,
  "avgWeakMastery": 0.42,
  "lastAssessmentAgeDays": 11,
  "score": 2.4,
  "traceId": "alert_abc123"
}
```

## Backend Processing Steps

1. Validate class ownership and fetch roster (teacher + active students).
2. Query `standardMastery` rows for roster with `masteryLevel < MASTERY_THRESHOLD_MODERATE`.
3. Group by student, compute metrics (weak counts, averages, recency).
4. Score and assign severity; drop alerts below minimum thresholds.
5. Sort by score descending; limit results; attach trace ID for observability.
6. Cache serialized response; store metadata for analytics.

## Non-Functional Requirements

| Category     | Requirement                                                                                  |
|--------------|----------------------------------------------------------------------------------------------|
| Latency      | p95 API latency < 600 ms for classes up to 200 students.                                      |
| Freshness    | Alerts reflect new mastery data within 5 minutes (cache TTL) or immediately on manual refresh.|
| Availability | Endpoint SLO 99.5%; fallback to empty alerts on persistent failure.                           |
| Security     | Audit log each access (teacherId, classId, alertCount, traceId).                              |

## Observability

- Metrics: `intervention_alerts_generated_total`, `intervention_alerts_latency_ms`, `intervention_alerts_cache_hit_ratio`, severity count distribution.
- Structured logs include `traceId`, `classId`, `studentIds (hashed)`, cache status.
- Dashboard tracks freshness (time since last generated) and percent critical alerts per class.

## UI Contract (Widget Expectations)

- Widget displays up to 5 alerts by default with ability to view more.
- Each row shows severity badge, list of up to two weak standard codes + "+N more", last assessment relative time.
- Clicking an alert deep links to `/teacher/classes/{classId}/students/{studentId}/analytics?from=intervention-widget`.
- Empty state messaging: "Great news! All students are on track."
- Error state instructs teacher to retry or open class analytics.

## Accessibility & Localization

- Severity badges expose text + icon; color usage mirrors progress tracking spec tokens.
- Alert list keyboard navigable; rows use `role="button"` with `aria-describedby` referencing severity and standards.
- Copy localized for English/Thai via shared i18n files.

## Failure Modes

| Failure Case                            | Handling                                                                 |
|-----------------------------------------|--------------------------------------------------------------------------|
| Cache store unavailable                 | Bypass cache, log warning, continue with live query.                     |
| No mastery data for student             | Exclude student, log info; optionally show "insufficient data" note.     |
| Teacher not assigned to class           | 403 error with audit log entry.                                          |
| Large data spike (hundreds of standards)| Query uses batched pagination; degrade gracefully with partial results.  |

## Implementation Checklist

- [ ] Implement detection service with scoring + configuration.
- [ ] Add Redis (or equivalent) cache integration.
- [ ] Build API route with auth guard, caching, and telemetry.
- [ ] Create QA seed script populating sample mastery rows for testing.
- [ ] Update teacher dashboard widget (#125) to consume payload.
- [ ] Add metrics dashboards + alerting thresholds.

## Open Questions

1. Should alerts include recommended interventions (links to resources) beyond analytics?
2. How should we handle classes with co-teachers (multiple teacher IDs)?
3. Do we need per-standard historical trends to signal improvement vs regression?
