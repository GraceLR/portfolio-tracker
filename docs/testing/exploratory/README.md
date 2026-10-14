# Session-Based Exploratory Testing

This folder contains reusable Session-Based Test Management (SBTM) templates for the portfolio tracker.

SBTM gives exploratory testing enough structure to make the work repeatable and reviewable without turning it into a scripted test. Each session has a focused charter, a fixed timebox, contemporaneous notes, evidence, and a debrief.

## Suggested workflow

1. Add a proposed mission to `charter-backlog.md`.
2. Copy `charter-template.md` and define the session's mission, risks, and boundaries.
3. Copy `session-template.md` when the session begins.
4. Explore for 60–120 minutes and record timestamped notes while testing.
5. Create a defect report from `defect-template.md` for every actionable problem.
6. Complete the session metrics and debrief.
7. Update `coverage-dashboard.md` with coverage, findings, and follow-up work.

## File naming

Use sortable names that connect related artifacts:

```text
charters/CH-001-average-cost.md
sessions/2026-10-14-CH-001-alex.md
defects/BUG-001-incorrect-average-cost.md
evidence/2026-10-14-CH-001/
```

Create the `charters`, `sessions`, `defects`, and `evidence` folders as they become necessary.

## Session statuses

- **Proposed** — waiting to be scheduled
- **Ready** — scope and environment are prepared
- **In progress** — currently being explored
- **Completed** — session and debrief are finished
- **Blocked** — testing cannot continue
- **Follow-up required** — another charter or investigation is needed

## Evidence and traceability

Every completed session should identify:

- Git commit tested
- Browser, operating system, and viewport
- Test data used
- Charter ID
- Defects and questions discovered
- Screenshot or recording paths

Do not include passwords, API keys, account numbers, or other sensitive data in test notes or evidence.
