# Exploratory Test Charter

## Identification

| Field | Value |
|---|---|
| Charter ID | CH-003 |
| Title | Transaction validation and recovery from invalid input |
| Author | Assign when the session starts |
| Created | 2026-10-14 |
| Priority | High |
| Status | In progress |
| Suggested timebox | 90 minutes |

## Mission

Explore **transaction validation and recovery** using **equivalence partitions, boundaries, and interrupted entry** to discover **whether invalid input can create an impossible holding, and whether a rejected form can be corrected without corrupting the book**.

> Explore the add-transaction dialog with empty fields, zero and extreme numbers, oversells, and sells or dividends for unknown symbols to discover a saved holding that should have been refused, or a recovery path that loses a valid correction.

## Why this matters

A saved transaction is applied immediately to holdings, cost basis, and dividend income. The product has no edit and no delete, so a bad row stays in the book for the rest of the session. The only protection is the checks in `submitTransaction` before that write.

The primary risk is a corrupt or impossible holding: negative quantity, a sale larger than the position, a sale or dividend that creates a symbol from nothing, or a zero-cost buy that reports a 0% return on a positive market value.

## In scope

- Buy, sell, and dividend submissions from the add-transaction dialog
- Empty, zero, negative, fractional, and extreme quantity and price
- Oversells against the open quantity
- Sell or dividend for a symbol that is not already an asset
- Symbol case and surrounding whitespace
- Recovery: the alert, an unchanged book after rejection, correcting the field, changing transaction type, and canceling
- One successful save after a rejection, to confirm the dialog does not keep a second copy

## Out of scope

- Average-cost math beyond "the book did not change" or "one accepted row matches what was typed". Deeper calculation checks belong to CH-001
- Trailing-year date boundaries (CH-002)
- Symbol-provider identity beyond a manual unknown symbol (CH-005)
- Double-click and repeated Save (CH-008)
- Reload persistence (CH-009)
- Keyboard-only completion and the 400px layout (CH-007)

## Invalid data groups

Use these partitions. One strong representative from each group is enough unless the boundary looks unstable.

| Group | Reject | Accept, then judge |
|---|---|---|
| Symbol | Empty, spaces only | `vti`, ` vti `, an existing symbol, a new symbol on a buy |
| Date | Cleared date | Today, a past date, a future date |
| Quantity | Empty, 0, negative if the field allows it | Smallest positive the field will take, a normal lot, a fraction |
| Price | Negative, if the field allows it | Empty (treated as 0), 0, a normal price, many decimal places |
| Sell quantity | Greater than the open quantity, including a holding that is already closed | Equal to the open quantity, one unit under it |
| New symbol | Sell or dividend before any buy | Buy, including after lookup says there is no public match |
| Type change | — | An illegal sell corrected by switching to buy or by lowering the quantity |

Seed open quantities, before any new transaction: VTI 52, AAPL 36, SCHD 165.

## Risk areas

| Risk | Impact | Test ideas |
|---|---|---|
| Oversell | High | Sell AAPL by 0.000001 more than the quantity on screen. Sell exactly the VTI quantity, then try to sell VTI again. |
| Zero or blank price stored as a real buy | High | Buy 1 share of a new symbol at 0, and submit with the price left blank. Read the new row's return. |
| Sale or dividend creates a symbol that was never bought | High | Sell `ZZZNOTREAL`. Record a dividend for `ZZZNOTREAL`. Then buy it and confirm that path works. |
| Extreme values pass the numeric checks | High | Try a quantity or price the field accepts as enormous (paste, spinner, or scientific notation such as `1e309`). |
| Recovery leaves the book dirty or the error stuck | Medium | Reject a form, confirm totals are unchanged, fix only the bad field, and save once. |
| Closed position still accepts a dividend | Medium | Sell all of a small new holding, then record a dividend for that same symbol. |
| Whitespace or case bypasses the "already owned" check | Medium | Sell `vti` and ` VTI `. |

## Starting points and test ideas

These are prompts, not mandatory scripted steps.

- On a fresh load, write down whole-portfolio value, cost basis, and dividend total. After every rejected save, those three numbers should match.
- Clear quantity, clear price, and clear the date, each on its own, then all three together.
- Enter quantity 0, then the smallest positive quantity the field will accept, including something at or under 0.0000001.
- Try a negative price and a negative quantity with the keyboard, the spinner, and paste. The inputs declare `min="0"`, so find out whether that block is real.
- Oversell AAPL. Then sell exactly 52 VTI and attempt a second VTI sale.
- With type set to sell, then dividend, submit `ZZZNOTREAL` before any buy of that symbol.
- Buy `ZZZNOTREAL` after the lookup reports no public match. Use a typed name and a positive price. Confirm one new holding.
- Enter `vti` and ` VTI ` and confirm they resolve to the existing VTI position rather than a second asset.
- Trigger the alert, change quantity or price, and see whether the alert clears before the next submit. Changing the symbol does clear it.
- After "You do not own enough AAPL", switch the type to buy and save that same quantity. Expect one buy, not a sale plus a buy.
- Cancel, press Escape, and use the close control on a filled invalid form. The book stays on the seed figures.
- Save one valid 1-share VTI buy after a rejection. Quantity should become 53, not 54.

Consider techniques such as:

- Boundary-value analysis
- Equivalence partitioning
- State transitions
- Error guessing
- Interruption and recovery
- Rapid or unexpected user actions

## Data and environment

| Field | Value |
|---|---|
| Application URL | Vite URL from `npm run dev`. Record the exact URL at session start. |
| Git commit | bbd3c3e on main (2026-10-14). Record again if main moves before the session. |
| Browser/version | Record at session start. Chrome is the primary target. |
| Operating system | Record the browser OS. Development was reviewed on WSL2. |
| Viewport/device | Desktop, about 1440px wide. A narrow layout is CH-007. |
| Network conditions | Online is enough. Lookup failure is in scope only as a way to reach manual entry. |
| Test data | Seed book only at the start. New symbol `ZZZNOTREAL`. Touch VTI and AAPL for oversell. Avoid SCHD unless a later probe needs a third holding. |

## Oracle

Decide from the rules in `submitTransaction`, not from a guess about what a brokerage would do.

A submit is refused, the dialog stays open, and holdings stay unchanged when any of these is true:

- The trimmed symbol is empty, or the date is empty
- Quantity is not greater than 0
- Price is less than 0
- The type is sell and there is no open holding, or the quantity is greater than that holding's quantity
- The type is sell or dividend and the symbol is not already an asset

The alert text is:

- `Enter a symbol, date, positive quantity, and valid price.`
- `You do not own enough {SYMBOL} to record this sale.`
- `A new holding must begin with a buy transaction.`

The alert has `role="alert"`.

These currently pass the checks. Treat them as findings to judge, not as automatic passes:

- Price 0, including a blank price, because a blank field becomes 0
- A dividend quantity larger than the shares owned
- A dividend for an asset that still exists after its quantity has gone to zero
- A future date
- A buy of an unknown symbol, which should add one asset and one transaction, then close the dialog

An accepted row stores the trimmed, uppercased symbol, the selected type, the date, and the numeric quantity and price. One activation adds one transaction. Cancel, Escape, and the close control add nothing.

Symbol edits clear the error. Edits to quantity, price, date, and type do not, until the next submit.

## Stop conditions

- Timebox expires
- A rejected save still changes the book, and that defect blocks further comparison
- The dev server or the dialog cannot be opened
- Each invalid group has been sampled, and each recovery path has been tried once

## Expected deliverables

- Completed session sheet
- Defect reports for any accepted input that creates an impossible holding, any rejected input that still changes totals, and any recovery path that loses the correction or saves twice
- Evidence
- Coverage-dashboard update for buy, sell, and dividend transactions
- Follow-up charters or unanswered questions, especially if zero-price buys or dividends on closed positions need a product decision
