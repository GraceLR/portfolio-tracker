# Defect Report

## Identification

| Field | Value |
|---|---|
| Defect ID | BUG-001 |
| Title | Buy accepts a quantity with more than five decimal places |
| Reported by | SES-001 tester |
| Reported date | 2026-10-28 |
| Charter/session | CH-003 / SES-001 |
| Severity | Medium |
| Priority | Medium |
| Status | New |

## Summary

On the Buy tab, a quantity with six decimal places is saved. The confirmed rule is that a quantity cannot have more than five decimal places. Case 1.3, quantity `10.000005`, was accepted.

## Environment

| Field | Value |
|---|---|
| Git commit | bbd3c3e |
| Application URL | http://127.0.0.1:5173/ |
| Browser/version | Cursor browser |
| Operating system | Windows, app served from WSL |
| Viewport/device | Desktop |
| Network/provider state | Not required. Prices are the saved sample prices. |

## Preconditions and test data

- Fresh load of the seed book: VTI 52, AAPL 36, SCHD 165
- Whole portfolio value `$30,262.22`, cost basis `$24,372.30`
- Add transaction, Buy tab
- Symbol `VTI`, date `2026-10-28`, price `10`

## Steps to reproduce

1. Open Add transaction and leave the type on Buy.
2. Enter symbol `VTI`, price `10`, and quantity `10.000005`.
3. Save the transaction.

## Expected result

The save is rejected. The dialog stays open. VTI stays at 52, and the portfolio totals stay at the seed values.

## Actual result

The save is accepted and the dialog closes. VTI quantity becomes `62.000005`. Portfolio value becomes `$33,376.42` and cost basis becomes `$24,472.30`. Recent activity shows Bought VTI on Oct 28, 2026 for `$100.00`.

## Reproducibility

Always

Reproduced 2 out of 2 attempts. First during SES-001 at 09:42. Confirmed again on a fresh load at 09:53.

## Impact

The book stays internally consistent, and the average-cost math uses the quantity it stored. The saved quantity breaks the confirmed five-decimal rule, so the holding can carry more precision than the product allows. This is not a crash and it does not wipe other holdings.

## Evidence

- Screenshot: [bug-001-quantity-entered.png](../evidence/2026-10-28-CH-003/bug-001-quantity-entered.png)
- Screenshot: [bug-001-quantity-accepted.png](../evidence/2026-10-28-CH-003/bug-001-quantity-accepted.png)
- Recording:
- Console/network output:
- Related session note: [CH-003-SES-001-buy-tab.md](../charters/CH-003-transaction-validation/CH-003-SES-001-buy-tab.md), case 1.3 at 09:42

## Additional investigation

- Does it reproduce in another browser? Not tried.
- Does it reproduce after refresh? Yes. The confirmation run started from a fresh load.
- Does it depend on specific data? It depends on a quantity with more than five decimal places. The symbol was VTI and the price was `10`.
- Is there a workaround? Enter at most five decimal places.
- Are related features affected? Price per unit, Sell, and Dividend were not part of this session. The quantity field uses `step="any"`, and the save check only rejects a quantity that is not greater than 0.

## Resolution and retest

| Field | Value |
|---|---|
| Fixed in commit | |
| Retested by | |
| Retest date | |
| Retest result | |
| Regression scope | Buy quantity boundaries, cases 1.1–1.3. Then the same decimal boundary on Sell and Dividend. |

### Retest notes

_Add retest notes._
