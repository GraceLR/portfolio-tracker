# Exploratory Testing Coverage Dashboard

Update this dashboard after each debrief. Coverage describes what was explored; it does not prove the absence of defects.

## Current test target

| Field | Value |
|---|---|
| Release/build | Ledge frontend, main |
| Git commit | bbd3c3e |
| Testing period | 2026-10-28. SES-001 paused after 49 minutes. |
| Test lead | Assign when the session starts |
| Overall confidence | Low |
| Release recommendation | Not assessed |

## Feature coverage

| Feature or risk | Last charter | Last session | Depth | Confidence | Open defects | Follow-up |
|---|---|---|---|---|---:|---|
| Portfolio valuation | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Average-cost basis | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Trailing-year dividends | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Buy transactions | CH-003 | SES-001 | Shallow | Low | 1 | Resume cases 1.1, 1.2, and 2.1–2.5. BUG-001 is open. |
| Sell transactions | CH-003 | — | None | Low | 0 | SES-002 after SES-001 |
| Dividend transactions | CH-003 | — | None | Low | 0 | SES-003 after SES-001 |
| Portfolio filtering | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Symbol lookup | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Live and fallback prices | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Responsive UI | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Accessibility | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Persistence and recovery | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |

## Environment coverage

| Environment | Version/viewport | Status | Last session | Notes |
|---|---|---|---|---|
| Chrome on Windows | | Not tested | | |
| Edge on Windows | | Not tested | | |
| Firefox on Windows | | Not tested | | |
| Mobile viewport | 400 px | Not tested | | |
| Offline/degraded network | | Not tested | | |

## Session totals

| Metric | Count |
|---|---:|
| Sessions completed | 0 |
| Total session time | 49 minutes, one paused session |
| Defects found | 1 |
| Critical defects open | 0 |
| High defects open | 0 |
| Blocked sessions | 0 |
| Follow-up charters | 0 |

## Current risks and unanswered questions

1. BUG-001: a Buy quantity with six decimal places is saved. The confirmed rule allows at most five.
2. CH-003: a blank or zero price is accepted, and a zero-cost buy can show a 0.0% return.
3. CH-003: a sale above the open quantity must be refused, and a dividend is not capped at shares owned.

## Recommended next sessions

1. Resume SES-001. Cases 1.1, 1.2, and 2.1–2.5 are still open on the Buy quantity field.
2. CH-001, after its calculation oracle is prepared. It is still the first critical money check.
