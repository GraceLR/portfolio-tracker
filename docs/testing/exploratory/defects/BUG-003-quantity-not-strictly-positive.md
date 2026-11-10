# Defect Report

## Identification

| Field | Value |
|---|---|
| Defect ID | BUG-003 |
| Title | Buy quantity is not required to be strictly greater than 0 |
| Reported by | SES-001 tester |
| Reported date | 2026-11-10 |
| Charter/session | CH-003 / SES-001 |
| Severity | Low |
| Priority | Medium |
| Status | Confirmed |

## Summary

On the Buy tab, quantity `-0.00001` can be entered. The field minimum is 0, so Save is stopped by the browser message `Value must be greater than or equal to 0.` The confirmed rule is that the quantity must be strictly greater than 0. The developer confirmed this is a defect.

## Environment

| Field | Value |
|---|---|
| Git commit | 59d2f9b |
| Application URL | http://127.0.0.1:5173/ |
| Browser/version | Cursor browser |
| Operating system | Windows, app served from WSL |
| Viewport/device | Desktop |
| Network/provider state | Not required. Prices are the saved sample prices. |

## Preconditions and test data

- Fresh seed book: value `$30,262.22`, cost basis `$24,372.30`
- Add transaction, Buy tab
- Symbol `VTI`, date `2026-11-10`, price `10`
- Quantity `-0.00001`

## Steps to reproduce

1. Open Add transaction and leave the type on Buy.
2. Enter symbol `VTI`, price `10`, and quantity `-0.00001`.
3. Save the transaction.

## Expected result

The application rejects the quantity because it is not strictly greater than 0. The dialog stays open. The book stays unchanged.

## Actual result

The quantity field keeps `-0.00001`. Save does not show an application message. The browser reports `Value must be greater than or equal to 0.` That rule allows 0. The book stayed at `$30,262.22` and `$24,372.30`.

## Reproducibility

Always

Reproduced on the case 2.4 run on 2026-11-10. The developer confirmed the quantity must be strictly greater than 0.

## Impact

The negative quantity was not saved on this run, so the book did not gain a negative holding. The check that stops it is the browser minimum of 0, which is not the confirmed rule. A value of 0 still passes that field check. The application does not tell the tester that the quantity must be strictly greater than 0.

## Evidence

- Screenshot: [bug-003-negative-quantity.png](../evidence/2026-11-10-CH-003/bug-003-negative-quantity.png)
- Recording:
- Console/network output: the quantity field reports `Value must be greater than or equal to 0.`
- Related session note: [CH-003-SES-001-buy-tab.md](../charters/CH-003-transaction-validation/CH-003-SES-001-buy-tab.md), case 2.4 at 10:01

## Additional investigation

- Does it reproduce in another browser? Not tried.
- Does it reproduce after refresh? The check was on a fresh seed book.
- Does it depend on specific data? The quantity was `-0.00001` with symbol `VTI` and price `10`.
- Is there a workaround? Enter a quantity greater than 0.
- Are related features affected? Case 2.3 is the separate message defect BUG-002. Cases 2.1, 2.2, and 2.5 are not recorded. Sell and Dividend were not part of this check.

## Resolution and retest

| Field | Value |
|---|---|
| Fixed in commit | |
| Retested by | |
| Retest date | |
| Retest result | |
| Regression scope | Buy case 2.4. Then the same strictly-greater-than-0 check on Sell and Dividend. |

### Retest notes

_Add retest notes._
