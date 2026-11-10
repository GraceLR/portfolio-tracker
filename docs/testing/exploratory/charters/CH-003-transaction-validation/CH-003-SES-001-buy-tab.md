# Exploratory Test Session

## Session details

| Field | Value |
|---|---|
| Session ID | SES-001 |
| Charter ID | CH-003 |
| Tester | |
| Date | 2026-10-28, resumed 2026-11-10 |
| Start time | 09:32, resumed 09:30 |
| End time | 10:12, paused |
| Duration | 91 minutes. 49 minutes on 2026-10-28 and 42 minutes on 2026-11-10. |
| Git commit | 59d2f9b. Notes from 2026-10-28 were on bbd3c3e. |
| Environment | Buy tab of Add transaction. Cursor browser, desktop. Resumed at http://127.0.0.1:5173/ on a fresh seed book. |
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
2. The smallest valid quantity is `0.00001`. `0` and anything below `0` are invalid. A quantity must be strictly greater than 0.
3. The quantity may be an integer, or a decimal that meets rules 1 and 2. Any other kind of input is not allowed.

These limits are confirmed requirements for this session. On 59d2f9b, cases 1.1–1.3 behaved as expected and BUG-001 is closed. Case 2.3 rejects quantity `0` with the wrong message and is BUG-002. Case 2.4 keeps a negative quantity, and the field only requires a value greater than or equal to 0. The confirmed rule is strictly greater than 0, filed as BUG-003. Cases 2.1, 2.2, 2.5, and 3.1 are not recorded.

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
| 2.3 | `0` | On the invalid boundary. | Reject. Message: `Enter a positive quantity.` Dialog stays open. The book stays unchanged. |
| 2.4 | `-0.00001` | Just outside, below zero. | Reject. Quantity must be strictly greater than 0. Dialog stays open. The book stays unchanged. |
| 2.5 | Maximum the field will accept. Record the exact digits shown. | Upper end of the valid side. | Accept only if the stored quantity is greater than 0. Record whether the field changes the digits. |

Values greater than 0 and smaller than `0.00001` are not in this set.

### 3. Input type

A quantity may be an integer, or a decimal with at most 5 decimal places whose value is strictly greater than 0 and at least `0.00001`. Letters, symbols, mixed text, a thousands separator, and more than one decimal point are not allowed.

| Case | Quantity | Where it sits | Expected |
|---|---|---|---|
| 3.1 | Try each of these in turn: `abc`, `10abc`, `1,000`, `10.000.05`. | Not an integer, and not a decimal that meets the quantity rules. | Reject each one. The invalid characters are not kept, or Save is rejected, the dialog stays open, and the book stays unchanged. |

## Timestamped test notes

Record what you tried, what you observed, and what you decided to explore next.

| Time | Action/data | Observation | Result or follow-up |
|---|---|---|---|
| 2026-11-10 09:41 | 1.1 Buy VTI, quantity `10.00005`, price `10`, commit 59d2f9b | Accepted. VTI quantity became 62. | Pass. Matches the expected result. |
| 2026-11-10 09:41 | 1.2 Buy VTI, quantity `10.0005`, price `10`, commit 59d2f9b | Accepted. VTI quantity became 62.0005. | Pass. Matches the expected result. |
| 09:42 | 1.3 Buy VTI, quantity `10.000005`, price `10` | Accepted. The Buy was saved, VTI quantity changed, and the dialog closed. | Defect. Filed as BUG-001 after the five-decimal rule was confirmed. |
| 09:53 | 1.3 retest on a fresh load. Buy VTI, quantity `10.000005`, price `10` | Accepted again. Dialog closed. VTI quantity `62.000005`. Portfolio value `$33,376.42`. Cost basis `$24,472.30`. | Same defect. Screenshots attached to BUG-001. |
| | 2.1 Buy VTI, quantity `0.00001`, price `10` | | |
| | 2.2 Buy VTI, quantity `0.00002`, price `10` | | |
| 2026-11-10 09:53 | 2.3 Buy VTI, quantity `0`, price `10`, commit 59d2f9b | Rejected. The dialog stayed open. The message was `Enter a symbol, date, positive quantity, and valid price.` | Defect. Developer confirmed. Filed as BUG-002. |
| 2026-11-10 10:01 | 2.4 Buy VTI, quantity `-0.00001`, price `10`, commit 59d2f9b | The field kept `-0.00001`. Save did not show an application message. The browser reported `Value must be greater than or equal to 0.` The book stayed at `$30,262.22` and `$24,372.30`. | Defect. Developer confirmed the quantity must be strictly greater than 0. Filed as BUG-003. |
| | 2.5 Buy VTI, quantity = maximum the field accepts, price `10` | | |
| | 3.1 Buy VTI, quantity is not an integer or a valid decimal. Try `abc`, `10abc`, `1,000`, and `10.000.05`. Price `10`. | | |
| 10:21 | Pause | Testing stopped before the remaining cases. | Resume SES-001 at cases 1.1, 1.2, and 2.1–2.5. Reload to the seed book first. |
| 2026-11-10 09:30 | Resume on commit 59d2f9b | Fresh seed book. VTI 52, value `$30,262.22`, cost basis `$24,372.30`. | Continue with cases 1.1, 1.2, a retest of 1.3, and 2.1–2.5. |
| 2026-11-10 09:41 | 1.3 retest. Buy VTI, quantity `10.000005`, price `10`, commit 59d2f9b | Rejected. The dialog stayed open and the seed totals stayed unchanged. | Pass. BUG-001 retest passed. Continue with cases 2.1–2.5. |
| 2026-11-10 10:12 | Pause | Testing stopped. Cases 1.1–1.3 passed. BUG-002 and BUG-003 are open. | Resume SES-001 at cases 2.1, 2.2, 2.5, and 3.1. |

## Coverage

| Area or condition | Depth | Notes |
|---|---|---|
| Buy quantity, 5-decimal boundary | Deep | Cases 1.1 and 1.2 passed. The 1.3 retest on 59d2f9b passed, and BUG-001 is closed. |
| Buy quantity, minimum `0.00001` and zero | Shallow | Case 2.3 is BUG-002. Case 2.4 is BUG-003: a negative quantity is not required to be strictly greater than 0. Cases 2.1, 2.2, and 2.5 are not recorded. Case 2.5 still needs the exact maximum. |
| Buy quantity, integers and decimals only | None | Case 3.1 is not run. |
| Buy price per unit | None | Later in SES-001 or a follow-up |
| Sell tab | None | SES-002 |
| Dividend tab | None | SES-003 |

## Findings

### Defects

| Defect ID | Summary | Severity | Evidence |
|---|---|---|---|
| BUG-001 | Buy accepts a quantity with more than five decimal places. Closed after the 2026-11-10 retest. | Medium | [BUG-001-buy-quantity-six-decimals.md](../../defects/BUG-001-buy-quantity-six-decimals.md) |
| BUG-002 | A zero Buy quantity shows the wrong error message. Developer confirmed. | Low | [BUG-002-zero-quantity-message.md](../../defects/BUG-002-zero-quantity-message.md) |
| BUG-003 | Buy quantity is not required to be strictly greater than 0. Developer confirmed. | Low | [BUG-003-quantity-not-strictly-positive.md](../../defects/BUG-003-quantity-not-strictly-positive.md) |

### Issues and blockers

Issues include environment problems, missing requirements, unclear expected results, or testability limitations.

- Case 2.5 still needs the exact maximum you were able to enter.

### Questions

- Must a Buy quantity with more than five decimal places be rejected? Answered yes on 2026-10-28. Case 1.3 was filed as BUG-001. Retest on 59d2f9b passed on 2026-11-10, and the defect is closed.

### Opportunities and observations

Record usability improvements, design ideas, and risks that are not defects.

-

## Evidence

| File or link | What it demonstrates |
|---|---|
| [bug-001-quantity-entered.png](../../evidence/2026-10-28-CH-003/bug-001-quantity-entered.png) | Quantity `10.000005` entered on the Buy tab |
| [bug-001-quantity-accepted.png](../../evidence/2026-10-28-CH-003/bug-001-quantity-accepted.png) | After save, VTI quantity is `62.000005` and the dialog is closed |
| [bug-002-quantity-zero-message.png](../../evidence/2026-11-10-CH-003/bug-002-quantity-zero-message.png) | Quantity `0` is rejected with `Enter a symbol, date, positive quantity, and valid price.` |
| [bug-003-negative-quantity.png](../../evidence/2026-11-10-CH-003/bug-003-negative-quantity.png) | Quantity `-0.00001` stays in the Buy field. The book stays at the seed totals. |

## Session metrics

Estimate the percentage of the timebox spent in each activity. The total should equal 100%.

| Activity | Percentage |
|---|---:|
| Test design and execution | __% |
| Defect investigation and reporting | __% |
| Setup, data, and administration | __% |
| **Total** | **100%** |

Also record:

- Defects found: 3. BUG-001 is closed. BUG-002 and BUG-003 are open.
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

Paused at 10:12 on 2026-11-10. Cases 1.1 and 1.2 passed on commit 59d2f9b, and the case 1.3 retest was rejected as expected. BUG-001 is closed. Case 2.3 is BUG-002. Case 2.4 is BUG-003. Cases 2.1, 2.2, 2.5, and 3.1 are not recorded. Price per unit, Sell, and Dividend are still later work.

### Follow-up actions

- [x] Cases 1.1, 1.2, and the 1.3 retest passed on 2026-11-10.
- [ ] Resume SES-001. Run cases 2.1, 2.2, 2.5, and 3.1. BUG-002 and BUG-003 stay open.
- [ ] Record the exact value used for case 2.5
- [ ] Price per unit on the Buy tab
- [ ] SES-002 Sell tab
- [ ] SES-003 Dividend tab

### Tester confidence

Medium

Reason: The five-decimal Buy boundary matches the oracle on 59d2f9b, including the BUG-001 retest. Case 2.3 is BUG-002. Case 2.4 does not enforce a quantity strictly greater than 0 and is BUG-003. Cases 2.1, 2.2, 2.5, and 3.1 are not recorded.
