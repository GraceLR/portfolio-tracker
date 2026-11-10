# Exploratory Testing Coverage Dashboard

Update this dashboard after each debrief. Coverage describes what was explored; it does not prove the absence of defects.

## Current test target

| Field | Value |
|---|---|
| Release/build | Ledge frontend, main |
| Git commit | 59d2f9b |
| Testing period | SES-001 resumed 2026-11-10 09:30. 49 minutes spent before the pause. |
| Test lead | Assign when the session starts |
| Overall confidence | Low |
| Release recommendation | Not assessed |

## Feature coverage

| Feature or risk | Last charter | Last session | Depth | Confidence | Open defects | Follow-up |
|---|---|---|---|---|---:|---|
| Portfolio valuation | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Average-cost basis | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Trailing-year dividends | | | None / Smoke / Shallow / Deep | Low / Medium / High | 0 | |
| Buy transactions | CH-003 | SES-001 | Shallow | Medium | 0 | Five-decimal boundary passed and BUG-001 is closed. Cases 2.1–2.5 are still open. |
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
| Total session time | 49 minutes so far. SES-001 is in progress. |
| Defects found | 1 |
| Critical defects open | 0 |
| High defects open | 0 |
| Blocked sessions | 0 |
| Follow-up charters | 0 |

## Current risks and unanswered questions

1. BUG-001 is closed. Buy cases 1.1–1.3 passed on 59d2f9b. The same five-decimal boundary on Sell and Dividend is still untested.
2. CH-003: a blank or zero price is accepted, and a zero-cost buy can show a 0.0% return.
3. CH-003: a sale above the open quantity must be refused, and a dividend is not capped at shares owned.

## Recommended next sessions

1. Continue SES-001. Cases 2.1–2.5 are still open on the Buy quantity field.
2. CH-001, after its calculation oracle is prepared. It is still the first critical money check.
