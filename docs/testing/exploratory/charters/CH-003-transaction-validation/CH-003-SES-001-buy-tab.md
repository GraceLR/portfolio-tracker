# Exploratory Test Session

## Session details

| Field | Value |
|---|---|
| Session ID | SES-001 |
| Charter ID | CH-003 |
| Tester | |
| Date | 2026-10-28 |
| Start time | 09:32 |
| End time | 10:21, paused |
| Duration | 49 minutes |
| Git commit | bbd3c3e |
| Environment | Buy tab of Add transaction. Cursor browser, desktop. |
| Session status | Paused |

## Charter

[CH-003 transaction validation](CH-003-transaction-validation.md). This session covers the **Buy** tab only, and only the **Quantity** field. Price per unit, Sell, and Dividend are later sessions.

## Setup and test data

- Accounts/portfolios: Whole Portfolio, fresh load
- Holdings: VTI 52, AAPL 36, SCHD 165
- Transactions: one Buy of VTI per case, unless a rejected case leaves the book unchanged
- Browser and viewport:
- Network or provider conditions: not required for these cases
- Other setup: open Add transaction, choose Buy, symbol VTI, today's date, price `10`. Change only Quantity between cases. After each save, reload before the next case so the book returns to the seed.

Oracle for this session:

1. Quantity may have at most 5 decimal places. 5 is valid. More than 5 is invalid.
2. The smallest valid quantity is `0.00001`. `0` and anything below `0` are invalid.

These limits are confirmed requirements for this session. The form currently rejects a quantity that is not greater than 0, and the number field allows any decimal step. A quantity with more than five decimal places is BUG-001.

## Quantity cases

Technique: boundary value analysis.

### 1. Decimal places

Valid side is 5 decimals or fewer. Invalid side is more than 5 decimals. The boundary value is exactly 5 decimals.

| Case | Quantity | Where it sits | Expected |
|---|---|---|---|
| 1.1 | `10.00005` | On the boundary. 5 decimal places. | Accept. VTI quantity becomes 62. |
| 1.2 | `10.0005` | Just inside. 4 decimal places. | Accept. VTI quantity becomes 62.0005. |
| 1.3 | `10.000005` | Just outside. 6 decimal places. | Reject. Dialog stays open. Seed totals stay unchanged. |

### 2. Minimum and zero

Valid side is `0.00001` or greater. Invalid side is `0` or below. `0.00001` is the valid boundary. `0` is the invalid boundary.

| Case | Quantity | Where it sits | Expected |
|---|---|---|---|
| 2.1 | `0.00001` | On the valid boundary. | Accept. VTI quantity becomes 52.00001. |
| 2.2 | `0.00002` | Just inside the valid side. | Accept. VTI quantity becomes 52.00002. |
| 2.3 | `0` | On the invalid boundary. | Reject. Alert: enter a positive quantity. Seed totals stay unchanged. |
| 2.4 | `-0.00001` | Just outside, below zero. | Reject. Seed totals stay unchanged. |
| 2.5 | Maximum the field will accept. Record the exact digits shown. | Upper end of the valid side. | Accept only if the stored quantity is greater than 0. Record whether the field changes the digits. |

Values greater than 0 and smaller than `0.00001` are not in this set.

## Timestamped test notes

Record what you tried, what you observed, and what you decided to explore next.

| Time | Action/data | Observation | Result or follow-up |
|---|---|---|---|
| | 1.1 Buy VTI, quantity `10.00005`, price `10` | | |
| | 1.2 Buy VTI, quantity `10.0005`, price `10` | | |
| 09:42 | 1.3 Buy VTI, quantity `10.000005`, price `10` | Accepted. The Buy was saved, VTI quantity changed, and the dialog closed. | Defect. Filed as BUG-001 after the five-decimal rule was confirmed. |
| 09:53 | 1.3 retest on a fresh load. Buy VTI, quantity `10.000005`, price `10` | Accepted again. Dialog closed. VTI quantity `62.000005`. Portfolio value `$33,376.42`. Cost basis `$24,472.30`. | Same defect. Screenshots attached to BUG-001. |
| | 2.1 Buy VTI, quantity `0.00001`, price `10` | | |
| | 2.2 Buy VTI, quantity `0.00002`, price `10` | | |
| | 2.3 Buy VTI, quantity `0`, price `10` | | |
| | 2.4 Buy VTI, quantity `-0.00001`, price `10` | | |
| | 2.5 Buy VTI, quantity = maximum the field accepts, price `10` | | |
| 10:21 | Pause | Testing stopped before the remaining cases. | Resume SES-001 at cases 1.1, 1.2, and 2.1–2.5. Reload to the seed book first. |

## Coverage

| Area or condition | Depth | Notes |
|---|---|---|
| Buy quantity, 5-decimal boundary | Shallow | Case 1.3 executed and filed as BUG-001. Cases 1.1 and 1.2 not run. |
| Buy quantity, minimum `0.00001` and zero | None | Cases 2.1–2.5 not run. Case 2.5 still needs the exact maximum. |
| Buy price per unit | None | Later in SES-001 or a follow-up |
| Sell tab | None | SES-002 |
| Dividend tab | None | SES-003 |

## Findings

### Defects

| Defect ID | Summary | Severity | Evidence |
|---|---|---|---|
| BUG-001 | Buy accepts a quantity with more than five decimal places | Medium | [BUG-001-buy-quantity-six-decimals.md](../../defects/BUG-001-buy-quantity-six-decimals.md) |

### Issues and blockers

Issues include environment problems, missing requirements, unclear expected results, or testability limitations.

- Case 2.5 still needs the exact maximum you were able to enter.

### Questions

- Must a Buy quantity with more than five decimal places be rejected? Answered yes on 2026-10-28. Case 1.3 is filed as BUG-001.

### Opportunities and observations

Record usability improvements, design ideas, and risks that are not defects.

-

## Evidence

| File or link | What it demonstrates |
|---|---|
| [bug-001-quantity-entered.png](../../evidence/2026-10-28-CH-003/bug-001-quantity-entered.png) | Quantity `10.000005` entered on the Buy tab |
| [bug-001-quantity-accepted.png](../../evidence/2026-10-28-CH-003/bug-001-quantity-accepted.png) | After save, VTI quantity is `62.000005` and the dialog is closed |

## Session metrics

Estimate the percentage of the timebox spent in each activity. The total should equal 100%.

| Activity | Percentage |
|---|---:|
| Test design and execution | __% |
| Defect investigation and reporting | __% |
| Setup, data, and administration | __% |
| **Total** | **100%** |

Also record:

- Defects found: 1
- Questions raised: 1, answered yes and filed as BUG-001
- Areas covered: Buy quantity boundaries
- Follow-up charters proposed:

## Debrief

Use **PROOF** as a conversation guide:

- **Past:** What happened during the session?
- **Results:** What did the session reveal?
- **Obstacles:** What slowed or blocked testing?
- **Outlook:** What should be tested next?
- **Feelings:** How confident is the tester, and where is uncertainty highest?

### Summary

Paused at 10:21. Case 1.3 was accepted twice and is filed as BUG-001. Cases 1.1, 1.2, and 2.1–2.5 are not run. Price per unit, Sell, and Dividend are still later work.

### Follow-up actions

- [ ] Resume SES-001 on a fresh seed book. Run cases 1.1, 1.2, and 2.1–2.5.
- [ ] Record the exact value used for case 2.5
- [ ] Price per unit on the Buy tab
- [ ] SES-002 Sell tab
- [ ] SES-003 Dividend tab

### Tester confidence

Low

Reason: Only the six-decimal Buy quantity has a result. The on-boundary and inside decimal cases, and the minimum and zero cases, are still open.
