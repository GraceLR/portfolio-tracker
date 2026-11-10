# Defect Report

## Identification

| Field | Value |
|---|---|
| Defect ID | BUG-002 |
| Title | A zero Buy quantity shows the wrong error message |
| Reported by | SES-001 tester |
| Reported date | 2026-11-10 |
| Charter/session | CH-003 / SES-001 |
| Severity | Low |
| Priority | Medium |
| Status | Confirmed |

## Summary

On the Buy tab, quantity `0` is rejected, but the message is `Enter a symbol, date, positive quantity, and valid price.` The confirmed message for this case is `Enter a positive quantity.` The developer confirmed this is a defect.

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

- Add transaction, Buy tab
- Symbol `VTI`, date `2026-11-10`, price `10`
- Quantity `0`

## Steps to reproduce

1. Open Add transaction and leave the type on Buy.
2. Enter symbol `VTI`, price `10`, and quantity `0`.
3. Save the transaction.

## Expected result

The save is rejected. The dialog stays open. The message is `Enter a positive quantity.`

## Actual result

The save is rejected and the dialog stays open. The message is `Enter a symbol, date, positive quantity, and valid price.` Symbol, date, and price were already valid.

## Reproducibility

Always

Reproduced on the case 2.3 run on 2026-11-10. The developer confirmed the message is wrong.

## Impact

The zero quantity is not saved, so the book does not gain a zero holding from this case. The message tells the tester that the symbol, date, and price are also invalid. That makes a valid form look broken and hides the quantity rule.

## Evidence

- Screenshot: [bug-002-quantity-zero-message.png](../evidence/2026-11-10-CH-003/bug-002-quantity-zero-message.png)
- Recording:
- Console/network output:
- Related session note: [CH-003-SES-001-buy-tab.md](../charters/CH-003-transaction-validation/CH-003-SES-001-buy-tab.md), case 2.3 at 09:53

## Additional investigation

- Does it reproduce in another browser? Not tried.
- Does it reproduce after refresh? Not tried as a separate run. The check was on the open session.
- Does it depend on specific data? The message is shown when quantity is not greater than 0. This report is for quantity `0` with a valid symbol, date, and price.
- Is there a workaround? Enter a quantity greater than 0.
- Are related features affected? Case 2.4 is not recorded yet. Sell, Dividend, and price per unit were not part of this check.

## Resolution and retest

| Field | Value |
|---|---|
| Fixed in commit | |
| Retested by | |
| Retest date | |
| Retest result | |
| Regression scope | Buy case 2.3. Then the same zero-quantity message on Sell and Dividend. |

### Retest notes

_Add retest notes._
